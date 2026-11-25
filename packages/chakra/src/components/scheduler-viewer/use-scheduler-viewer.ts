import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from 'react';
import type { RTS } from '@rmf2-ui/data';

export interface ScheduleAction {
  type: string;
  id?: string;
  node_id?: string;
  source_id?: string;
  destination_id?: string;
  edge_type?: string;
}

export interface IRTSClient {
  getSchedule(params: {
    startTime?: Date;
    endTime?: Date;
  }): Promise<RTS.Schedule>;
  editScheduleBatch(actions: ScheduleAction[]): Promise<string>;
  optimize(params: { optimizationDuration: number }): Promise<string>;
}

const LOCALSTORAGE_KEY = 'rmf2.gantt.typeColorMap';

const PRESET_KEYS = [
  'preset_1',
  'preset_2',
  'preset_3',
  'preset_4',
  'preset_5',
];

function assignPresets(
  types: string[],
  existing: Record<string, string>,
): Record<string, string> {
  const updated = { ...existing };
  let nextIndex = Object.keys(updated).length;
  for (const type of types) {
    if (updated[type] === undefined) {
      updated[type] =
        PRESET_KEYS[nextIndex % PRESET_KEYS.length] ?? PRESET_KEYS[0];
      nextIndex++;
    }
  }
  return updated;
}

function loadTypeColorMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTypeColorMap(map: Record<string, string>) {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

const LIVE_POLL_INTERVAL_MS = 5000;

interface TimeViewWindow {
  start: Date;
  end: Date;
}

export interface UseSchedulerViewerProps {
  rtsClient: IRTSClient;
  schedule?: RTS.Schedule;
  live?: boolean;
  timeViewWindow?: TimeViewWindow;
  filterTask?: (task: RTS.Task) => boolean;
}

export function useSchedulerViewer(props: UseSchedulerViewerProps) {
  const {
    rtsClient,
    schedule: externalSchedule,
    live: defaultLive,
    timeViewWindow: defaultTimeViewWindow,
    filterTask,
  } = props;
  const [schedule, setSchedule] = useState<RTS.Schedule | undefined>(
    externalSchedule,
  );
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState<string | null>('schedule');
  const [live, setLive] = useState<boolean>(defaultLive ?? false);
  const [timeViewWindow, setTimeViewWindow] = useState<
    TimeViewWindow | undefined
  >(defaultTimeViewWindow);
  const [viewTask, setViewTask] = useState<RTS.Task | undefined>(undefined);
  const [viewProcess, setViewProcess] = useState<RTS.Process | undefined>(
    undefined,
  );
  const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false);
  const [typeColorMap, setTypeColorMap] =
    useState<Record<string, string>>(loadTypeColorMap);
  const [typeCustomColorMap, setTypeCustomColorMap] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    if (externalSchedule !== undefined) setSchedule(externalSchedule);
  }, [externalSchedule]);

  const fetchSchedule = useCallback(async () => {
    if (externalSchedule !== undefined) return;
    setLoading(true);
    try {
      const result = await rtsClient.getSchedule({
        startTime: timeViewWindow?.start,
        endTime: timeViewWindow?.end,
      });
      setSchedule(result);
    } catch {
      // keep previous schedule on error
    } finally {
      setLoading(false);
    }
  }, [rtsClient, timeViewWindow, externalSchedule]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(fetchSchedule, LIVE_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [live, fetchSchedule]);

  const deleteTask = useCallback(
    (taskId: string) =>
      rtsClient.editScheduleBatch([{ type: 'TASK_DELETE', id: taskId }]),
    [rtsClient],
  );

  const optimize = useCallback(
    (optimizationDuration: number) =>
      rtsClient.optimize({ optimizationDuration }),
    [rtsClient],
  );

  const saveColors = useCallback(() => {
    saveTypeColorMap(typeColorMap);
  }, [typeColorMap]);

  useEffect(() => {
    if (schedule === undefined) return;
    const tasks =
      filterTask !== undefined
        ? schedule.tasks.filter(filterTask)
        : schedule.tasks;
    const types = Array.from(new Set(tasks.map((t) => t.type)));
    setTypeColorMap((prev) => {
      const next = assignPresets(types, prev);
      return Object.keys(next).length !== Object.keys(prev).length
        ? next
        : prev;
    });
  }, [schedule, filterTask]);

  return {
    schedule,
    loading,
    fetchSchedule,
    deleteTask,
    optimize,
    filterTask,
    tabValue,
    setTabValue,
    live,
    setLive,
    timeViewWindow,
    setTimeViewWindow,
    viewTask,
    setViewTask,
    viewProcess,
    setViewProcess,
    taskDialogOpen,
    setTaskDialogOpen,
    typeColorMap,
    setTypeColorMap,
    typeCustomColorMap,
    setTypeCustomColorMap,
    saveColors,
  };
}

export type UseSchedulerViewerReturn = ReturnType<typeof useSchedulerViewer>;

export const SchedulerViewerContext = createContext<
  UseSchedulerViewerReturn | undefined
>(undefined);

const useSchedulerViewerContext = () => {
  const ctx = useContext(SchedulerViewerContext);
  if (ctx === undefined) {
    throw new Error(
      'useSchedulerViewerContext must be inside a SchedulerViewerContext.Provider',
    );
  }
  return ctx;
};

export function useSchedulerViewerTabsRoot() {
  const { tabValue, setTabValue } = useSchedulerViewerContext();
  return { tabValue, setTabValue };
}

export function useSchedulerViewerGantt() {
  const { schedule, filterTask, setViewTask, setTaskDialogOpen, typeColorMap } =
    useSchedulerViewerContext();

  const openTaskViewDialog = useCallback(
    (taskId: string) => {
      if (schedule === undefined) {
        return;
      }

      const currentTask = schedule.tasks.find((task) => task.id === taskId);
      if (currentTask !== undefined) {
        setViewTask(currentTask);
      }
      setTaskDialogOpen(true);
    },
    [schedule, setViewTask, setTaskDialogOpen],
  );

  const tasks =
    schedule === undefined
      ? []
      : filterTask !== undefined
        ? schedule.tasks.filter(filterTask)
        : schedule.tasks;

  return {
    tasks,
    typeColorMap,
    openTaskViewDialog,
  };
}

export function useSchedulerViewerTaskDialog() {
  const {
    viewTask,
    taskDialogOpen,
    setTaskDialogOpen,
    typeColorMap,
    typeCustomColorMap,
    setTypeCustomColorMap,
    saveColors,
    deleteTask,
    fetchSchedule,
  } = useSchedulerViewerContext();
  return {
    viewTask,
    open: taskDialogOpen,
    setOpen: setTaskDialogOpen,
    typeColorMap,
    typeCustomColorMap,
    setTypeCustomColorMap,
    saveColors,
    deleteTask,
    refetchSchedule: fetchSchedule,
  };
}

export function useSchedulerViewerControlPanel() {
  const {
    schedule,
    loading,
    fetchSchedule,
    live,
    setLive,
    timeViewWindow,
    setTimeViewWindow,
  } = useSchedulerViewerContext();
  return {
    schedule,
    loading,
    fetchSchedule,
    live,
    setLive,
    timeViewWindow,
    setTimeViewWindow,
  };
}

export interface UseSchedulerViewerLiveToggleProps {
  live?: boolean;
}

export function useSchedulerViewerLiveToggle(
  props: UseSchedulerViewerLiveToggleProps,
) {
  const { live, setLive } = useSchedulerViewerContext();
  const { live: liveExternal } = props;

  useEffect(() => {
    if (liveExternal === undefined) {
      return;
    }

    // TODO(Briancbn): switch to useCallback?
    setLive(liveExternal);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveExternal]);

  return { live, setLive };
}

export function useSchedulerViewerRefreshButton() {
  const { loading, fetchSchedule } = useSchedulerViewerContext();
  return { loading, onClick: fetchSchedule };
}

export function useSchedulerViewerOptimizeButton() {
  const { optimize, fetchSchedule } = useSchedulerViewerContext();
  return { optimize, refetchSchedule: fetchSchedule };
}

export function useSchedulerViewerProcess() {
  const {
    schedule,
    viewProcess,
    setViewProcess,
    setViewTask,
    setTaskDialogOpen,
    typeColorMap,
  } = useSchedulerViewerContext();

  const openTaskViewDialog = useCallback(
    (taskId: string) => {
      if (schedule === undefined) return;
      const task = schedule.tasks.find((t) => t.id === taskId);
      if (task !== undefined) setViewTask(task);
      setTaskDialogOpen(true);
    },
    [schedule, setViewTask, setTaskDialogOpen],
  );

  return {
    schedule,
    viewProcess,
    setViewProcess,
    openTaskViewDialog,
    typeColorMap,
  };
}

export class MockRTSClient implements IRTSClient {
  private schedule: RTS.Schedule;

  constructor(schedule: RTS.Schedule) {
    this.schedule = { ...schedule, tasks: [...schedule.tasks] };
  }

  async getSchedule(_params: {
    startTime?: Date;
    endTime?: Date;
  }): Promise<RTS.Schedule> {
    return { ...this.schedule, tasks: [...this.schedule.tasks] };
  }

  async editScheduleBatch(actions: ScheduleAction[]): Promise<string> {
    for (const action of actions) {
      if (action.type === 'TASK_DELETE' && action.id) {
        const task = this.schedule.tasks.find((t) => t.id === action.id);
        if (!task || task.processId || task.seriesId) {
          throw new Error('Task cannot be deleted');
        }
        this.schedule = {
          ...this.schedule,
          tasks: this.schedule.tasks.filter((t) => t.id !== action.id),
        };
      }
    }
    return 'Schedule updated successfully!';
  }

  async optimize(_params: { optimizationDuration: number }): Promise<string> {
    return 'optimized';
  }

  reset(schedule?: RTS.Schedule): void {
    const src = schedule ?? this.schedule;
    this.schedule = { ...src, tasks: [...src.tasks] };
  }
}
