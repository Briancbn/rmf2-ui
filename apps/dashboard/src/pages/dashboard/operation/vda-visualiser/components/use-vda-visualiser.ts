// Central state and handlers for the VDA5050 visualiser. All data flows from
// here — sub-components read via context sub-hooks instead of prop chains.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { MutableRefObject } from 'react';

import { logicalGraphNode, snapToNode } from '../graph';
import {
  cancelNavigation,
  demoReset,
  directNavigateToNode,
  fetchRacks,
  navigateMission,
  pollMissionUntilDone,
  pickRack,
  SCHEDULER_ROBOTS,
  SchedulerConflictError,
  toSchedulerId,
  type MissionState,
} from '../scheduler-api';
import type {
  AgvState,
  MapData,
  MapfSimFrame,
  MapImageMeta,
  PickRackSelection,
  RackMap,
  RobotGoal,
  SchedulerRobotId,
  SocketStatus,
  VdaLogEntry,
} from '../types';
import { useMapImage } from '../use-map-image';
import { useVdaLogs } from '../use-vda-logs';
import { useVdaState } from '../use-vda-state';
import {
  pickRackJackDone,
  sortPickRackPoints,
  type PickRackPointOption,
} from './constants';
import { notifyTask } from './task-toaster';

interface NavConflict {
  detail: string;
  robotId: SchedulerRobotId;
  pendingGoal?: string;
}

export interface ActivityConflict {
  detail: string;
  robotId: string;
  goalNode?: string;
  clearing: boolean;
  onClear: () => void;
  onDismiss: () => void;
}

interface VdaVisualiserValue {
  map: MapData | null;
  agvs: AgvState[];
  logs: VdaLogEntry[];
  logsStatus: SocketStatus;
  mapImage: MapImageMeta | null;
  rotated: boolean;
  setRotated: React.Dispatch<React.SetStateAction<boolean>>;
  selectedRobot: SchedulerRobotId | null;
  goals: Partial<Record<SchedulerRobotId, RobotGoal>>;
  racks: RackMap;
  mapfSimFrame: MapfSimFrame | null;
  setMapfSimFrame: (frame: MapfSimFrame | null) => void;
  applying: boolean;
  cancellingRobot: SchedulerRobotId | null;
  clearingConflict: boolean;
  conflict: NavConflict | null;
  setConflict: React.Dispatch<React.SetStateAction<NavConflict | null>>;
  demoResetting: boolean;
  pickRackPoints: readonly PickRackPointOption[];
  activeTasks: string[];
  selectRobot: (id: SchedulerRobotId) => void;
  pickNode: (nodeId: string) => void;
  clearGoals: () => void;
  applyGoals: () => Promise<void>;
  cancelNav: (robotId: SchedulerRobotId) => Promise<void>;
  runDemoReset: () => Promise<void>;
  resetToNode: (robotId: SchedulerRobotId, nodeId: string) => Promise<void>;
  runPickRack: (
    robotId: SchedulerRobotId,
    selection: PickRackSelection,
  ) => Promise<void>;
  clearConflict: () => Promise<void>;
  rowRef: MutableRefObject<HTMLDivElement | null>;
  rowHeightCss: string | undefined;
}

export const VdaVisualiserContext = createContext<VdaVisualiserValue | null>(
  null,
);

function useVdaVisualiserContext(): VdaVisualiserValue {
  const ctx = useContext(VdaVisualiserContext);
  if (!ctx) throw new Error('Must be rendered inside VdaVisualiserRoot');
  return ctx;
}

export function useVdaVisualiser(): VdaVisualiserValue {
  const { map, agvs } = useVdaState();
  const { logs, status: logsStatus } = useVdaLogs();
  const mapImage = useMapImage();
  const [rotated, setRotated] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState<SchedulerRobotId | null>(
    null,
  );
  const [goals, setGoals] = useState<
    Partial<Record<SchedulerRobotId, RobotGoal>>
  >({});
  const [racks, setRacks] = useState<RackMap>({});
  const [mapfSimFrame, setMapfSimFrame] = useState<MapfSimFrame | null>(null);
  const [applying, setApplying] = useState(false);
  const [cancellingRobot, setCancellingRobot] =
    useState<SchedulerRobotId | null>(null);
  const [clearingConflict, setClearingConflict] = useState(false);
  const [conflict, setConflict] = useState<NavConflict | null>(null);
  const [demoResetting, setDemoResetting] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = rowRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      setRowHeight(Math.max(window.innerHeight - top - 24, 440));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const rowHeightCss = rowHeight != null ? `${rowHeight}px` : undefined;

  useEffect(() => {
    fetchRacks().then(setRacks);
  }, []);

  const pickRackPoints = useMemo<readonly PickRackPointOption[]>(() => {
    const stations = map?.stations;
    if (!stations?.length) return [];
    return sortPickRackPoints(
      stations
        .filter(
          (s) => s.station_name.startsWith('Rack_') && s.node_ids.length > 0,
        )
        .map((s) => ({
          id: s.station_name,
          label: s.station_name.replace(/^Rack_/, ''),
          nodeId: s.node_ids[0],
          x: s.x,
          y: s.y,
          ori: 0,
        })),
    );
  }, [map?.stations]);

  useEffect(() => {
    setGoals((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const robot of Object.keys(prev) as SchedulerRobotId[]) {
        const goal = prev[robot];
        if (
          !goal?.applied ||
          !goal.pickRackMode ||
          goal.pickRackMode === 'full'
        )
          continue;
        const agv = agvs.find((a) => a.robot_id === robot);
        if (agv && pickRackJackDone(goal.pickRackMode, agv.jack_state)) {
          delete next[robot];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [agvs]);

  const selectRobot = (id: SchedulerRobotId) => {
    setSelectedRobot((prev) => (prev === id ? null : id));
  };

  const pickNode = (nodeId: string) => {
    if (!selectedRobot) {
      notifyTask(
        'info',
        'Pick a robot first',
        'Then click a node to set its goal.',
      );
      return;
    }
    setGoals((prev) => {
      const current = prev[selectedRobot];
      if (current?.applied) return prev;
      if (current?.node === nodeId) return prev;
      return { ...prev, [selectedRobot]: { node: nodeId, applied: false } };
    });
  };

  const clearGoals = () => {
    setGoals({});
    setSelectedRobot(null);
    setConflict(null);
  };

  useEffect(() => {
    const hasPending = (Object.keys(goals) as SchedulerRobotId[]).some(
      (r) => goals[r] != null && !goals[r]!.applied,
    );
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!selectedRobot && Object.keys(goals).length === 0 && !conflict)
          return;
        clearGoals();
      } else if (e.key === 'Enter') {
        if (!hasPending || applying) return;
        void applyGoals();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRobot, goals, conflict, applying]);

  const unapplyRobotGoal = (robotId: SchedulerRobotId) => {
    setGoals((prev) => {
      const goal = prev[robotId];
      if (!goal) return prev;
      return { ...prev, [robotId]: { ...goal, applied: false } };
    });
  };

  const notifyMissionOutcome = (
    robotId: SchedulerRobotId,
    final: MissionState,
  ) => {
    if (final.status === 'completed') {
      notifyTask(
        'success',
        'Mission complete',
        final.detail ?? `${robotId} finished`,
      );
      setGoals((prev) => {
        const next = { ...prev };
        delete next[robotId];
        return next;
      });
      return;
    }
    if (final.status === 'error') {
      const leg = final.legs.find((l) => l.status === 'error');
      const msg = final.detail ?? leg?.detail ?? `${robotId} mission failed`;
      notifyTask('error', 'Mission failed', msg);
      unapplyRobotGoal(robotId);
      return;
    }
    if (final.status === 'cancelled') {
      notifyTask('info', 'Mission cancelled', final.detail ?? robotId);
      setGoals((prev) => {
        const next = { ...prev };
        delete next[robotId];
        return next;
      });
    }
  };

  const watchMission = (robotId: SchedulerRobotId) => {
    void pollMissionUntilDone(robotId)
      .then((final) => notifyMissionOutcome(robotId, final))
      .catch((err) =>
        notifyTask(
          'error',
          'Mission status lost',
          `${robotId}: ${String(err)}`,
        ),
      );
  };

  const applyGoals = async () => {
    const pending = (Object.keys(goals) as SchedulerRobotId[]).filter(
      (r) => goals[r] != null && !goals[r]!.applied,
    );
    if (pending.length === 0) {
      notifyTask('info', 'No new goals to apply');
      return;
    }
    setApplying(true);
    setConflict(null);

    const dispatched: SchedulerRobotId[] = [];
    let firstConflict: NavConflict | null = null;

    for (const robotId of pending) {
      const goalNode = goals[robotId]!.node;
      try {
        await navigateMission(robotId, [goalNode], false);
        dispatched.push(robotId);
      } catch (err) {
        if (err instanceof SchedulerConflictError) {
          firstConflict ??= {
            detail: err.detail,
            robotId: err.robotId ?? robotId,
            pendingGoal: goalNode,
          };
        } else {
          notifyTask('error', 'Apply failed', String(err));
          setApplying(false);
          return;
        }
      }
    }

    if (dispatched.length > 0) {
      setGoals((prev) => {
        const next = { ...prev };
        for (const r of dispatched) {
          if (next[r]) next[r] = { ...next[r]!, applied: true };
        }
        return next;
      });
    }

    if (firstConflict) {
      setConflict(firstConflict);
      if (dispatched.length > 0) {
        notifyTask(
          'warning',
          'Partial apply',
          `${dispatched.join(', ')} dispatched; ${firstConflict.robotId} blocked — use Clear conflict.`,
        );
      }
    } else if (dispatched.length > 0) {
      notifyTask(
        'info',
        'Mission running',
        dispatched.map((r) => `${r} → ${goals[r]!.node}`).join('; '),
      );
    }
    for (const robotId of dispatched) {
      watchMission(robotId);
    }
    setApplying(false);
  };

  const cancelNav = async (robotId: SchedulerRobotId) => {
    setCancellingRobot(robotId);
    try {
      await cancelNavigation(robotId);
      setGoals((prev) => {
        const next = { ...prev };
        delete next[robotId];
        return next;
      });
      if (conflict?.robotId === robotId) setConflict(null);
      notifyTask(
        'info',
        'Stop & reset complete',
        `${robotId} — motion stopped, mission and MAPF state cleared`,
      );
    } catch (err) {
      notifyTask('error', 'Stop & reset failed', String(err));
    } finally {
      setCancellingRobot(null);
    }
  };

  const runDemoReset = async () => {
    setDemoResetting(true);
    try {
      const result = await demoReset();
      clearGoals();
      const stopped = result.robots.filter((r) => r.robot_stopped).length;
      notifyTask(
        'success',
        'Stop & reset all complete',
        `${result.robots.length} robot(s) cleared; ${stopped} stopped; MAPF planner reset`,
      );
    } catch (err) {
      notifyTask('error', 'Stop & reset all failed', String(err));
    } finally {
      setDemoResetting(false);
    }
  };

  const resetToNode = async (robotId: SchedulerRobotId, nodeId: string) => {
    try {
      await directNavigateToNode(robotId, nodeId);
      notifyTask(
        'success',
        'Force navigate dispatched',
        `${robotId} → ${nodeId}`,
      );
    } catch (err) {
      notifyTask('error', 'Navigate failed', String(err));
      throw err;
    }
  };

  const runPickRack = async (
    robotId: SchedulerRobotId,
    selection: PickRackSelection,
  ) => {
    if (!robotId.startsWith('autoxing')) {
      notifyTask(
        'error',
        'Pick rack not supported',
        `${robotId} has no pick row`,
      );
      return;
    }
    const routeLabel =
      selection.mode === 'pickup'
        ? `pick up @ ${selection.pickupLabel}`
        : selection.mode === 'dropoff'
          ? `drop off @ ${selection.putdownLabel}`
          : `${selection.pickupLabel} → ${selection.putdownLabel}`;
    setConflict(null);
    try {
      await pickRack(
        robotId,
        selection.mode,
        selection.mode !== 'dropoff' ? selection.pickup : undefined,
        selection.mode !== 'pickup' ? selection.putdown : undefined,
      );
      setGoals((prev) => ({
        ...prev,
        [robotId]: {
          node: routeLabel,
          applied: true,
          pickRackMode: selection.mode,
        },
      }));
      notifyTask('info', 'Pick rack running', `${robotId}: ${routeLabel}`);
      watchMission(robotId);
    } catch (err) {
      if (err instanceof SchedulerConflictError) {
        setConflict({ detail: err.detail, robotId, pendingGoal: routeLabel });
      } else {
        notifyTask('error', 'Pick rack failed', String(err));
      }
    }
  };

  const clearConflict = async () => {
    if (!conflict) return;
    setClearingConflict(true);
    try {
      await cancelNavigation(conflict.robotId);
      setGoals((prev) => {
        const next = { ...prev };
        delete next[conflict.robotId];
        return next;
      });
      const pendingGoal = conflict.pendingGoal;
      setConflict(null);
      if (pendingGoal) {
        await navigateMission(conflict.robotId, [pendingGoal], false);
        setGoals((prev) => ({
          ...prev,
          [conflict.robotId]: { node: pendingGoal, applied: true },
        }));
        notifyTask(
          'info',
          'Mission running',
          `${conflict.robotId} → ${pendingGoal}`,
        );
        watchMission(conflict.robotId);
      } else {
        notifyTask('info', 'Conflict cleared', `${conflict.robotId}`);
      }
    } catch (err) {
      if (err instanceof SchedulerConflictError) {
        setConflict({
          detail: err.detail,
          robotId: err.robotId ?? conflict.robotId,
          pendingGoal: conflict.pendingGoal,
        });
      }
      notifyTask('error', 'Clear conflict failed', String(err));
    } finally {
      setClearingConflict(false);
    }
  };

  const activeTasks = (Object.keys(goals) as SchedulerRobotId[]).flatMap(
    (robot) => {
      const goal = goals[robot];
      if (!goal?.applied) return [];
      if (goal.pickRackMode && goal.pickRackMode !== 'full') {
        const agv = agvs.find((a) => toSchedulerId(a) === robot);
        if (agv && pickRackJackDone(goal.pickRackMode, agv.jack_state))
          return [];
        return [`${robot} → ${goal.node}`];
      }
      const agv = agvs.find((a) => toSchedulerId(a) === robot);
      const current = logicalGraphNode(
        agv?.last_node_id ??
          (agv?.has_pose && agv.x != null && agv.y != null
            ? snapToNode(agv.x, agv.y, map?.nodes ?? [])
            : null),
        racks,
      );
      if (current === goal.node) return [];
      return [`${robot} → ${goal.node}`];
    },
  );

  return {
    map,
    agvs,
    logs,
    logsStatus,
    mapImage,
    rotated,
    setRotated,
    selectedRobot,
    goals,
    racks,
    mapfSimFrame,
    setMapfSimFrame,
    applying,
    cancellingRobot,
    clearingConflict,
    conflict,
    setConflict,
    demoResetting,
    pickRackPoints,
    activeTasks,
    selectRobot,
    pickNode,
    clearGoals,
    applyGoals,
    cancelNav,
    runDemoReset,
    resetToNode,
    runPickRack,
    clearConflict,
    rowRef,
    rowHeightCss,
  };
}

// --- Sub-hooks (one per consumer) ---

export function useVdaMapCanvas() {
  const {
    map,
    agvs,
    rotated,
    setRotated,
    mapImage,
    goals,
    racks,
    selectedRobot,
    selectRobot,
    pickNode,
    mapfSimFrame,
  } = useVdaVisualiserContext();
  return {
    map,
    agvs,
    rotated,
    setRotated,
    mapImage,
    goals,
    racks,
    selectedRobot,
    selectRobot,
    pickNode,
    mapfSimFrame,
  };
}

export function useVdaRobotCards() {
  const {
    agvs,
    goals,
    racks,
    map,
    selectedRobot,
    cancellingRobot,
    selectRobot,
    cancelNav,
    resetToNode,
    runPickRack,
    pickRackPoints,
  } = useVdaVisualiserContext();
  return {
    agvs,
    goals,
    racks,
    mapNodes: (map?.nodes ?? []) as readonly import('../types').MapNode[],
    selectedRobot,
    cancellingRobot,
    onSelectRobot: selectRobot,
    onCancelRobot: (id: SchedulerRobotId) => void cancelNav(id),
    onResetToNode: resetToNode,
    onPickRack: runPickRack,
    pickRackPoints,
  };
}

export function useVdaNavControls() {
  const {
    goals,
    applying,
    applyGoals,
    clearGoals,
    runDemoReset,
    demoResetting,
  } = useVdaVisualiserContext();
  return {
    goals,
    applying,
    onApply: () => void applyGoals(),
    onClear: clearGoals,
    onStopResetAll: () => void runDemoReset(),
    stopResetAllLoading: demoResetting,
  };
}

export function useVdaOrderQueue() {
  const { agvs } = useVdaVisualiserContext();
  return { agvs };
}

export function useVdaLogsPanel() {
  const { logs, logsStatus } = useVdaVisualiserContext();
  return { logs, status: logsStatus };
}

export function useVdaMapfSimPanel() {
  const { goals, setMapfSimFrame } = useVdaVisualiserContext();
  return { goals, onFrameChange: setMapfSimFrame };
}

export function useVdaTaskCallout() {
  const {
    activeTasks,
    conflict,
    clearingConflict,
    clearConflict,
    setConflict,
  } = useVdaVisualiserContext();
  const assembled: ActivityConflict | null = conflict
    ? {
        detail: conflict.detail,
        robotId: conflict.robotId,
        goalNode: conflict.pendingGoal,
        clearing: clearingConflict,
        onClear: () => void clearConflict(),
        onDismiss: () => setConflict(null),
      }
    : null;
  return { tasks: activeTasks, conflict: assembled };
}

export function useVdaDirectControl() {
  const { agvs } = useVdaVisualiserContext();
  const robots =
    agvs.length > 0
      ? agvs.map((a) => ({ id: a.robot_id, label: a.robot_id }))
      : SCHEDULER_ROBOTS.map((r) => ({ id: r as string, label: r as string }));
  return { robots, agvs };
}

export function useVdaRow() {
  const { rowRef, rowHeightCss } = useVdaVisualiserContext();
  return { rowRef, rowHeightCss };
}
