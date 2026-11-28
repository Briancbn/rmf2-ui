import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import type { RTS } from '@rmf2-ui/data';
import { assignPresets } from './preset-colors-helper';

const LOCALSTORAGE_KEY = 'rmf2.gantt.typeColorMap';

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

export interface UseScheduleViewerProps {
  rtsClient: RTS.IClient;
  schedule?: RTS.Schedule;
  live?: boolean;
  timeViewWindow?: TimeViewWindow;
  filterTask?: (task: RTS.Task) => boolean;
}

export function useScheduleViewer(props: UseScheduleViewerProps) {
  const {
    rtsClient,
    schedule: externalSchedule,
    live: defaultLive,
    timeViewWindow: defaultTimeViewWindow,
    filterTask,
  } = props;
  const rtsClientRef = useRef(rtsClient);
  rtsClientRef.current = rtsClient;
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
  useEffect(() => {
    if (externalSchedule !== undefined) setSchedule(externalSchedule);
  }, [externalSchedule]);

  const fetchSchedule = useCallback(async () => {
    if (externalSchedule !== undefined) return;
    setLoading(true);
    try {
      // TODO(anyone): add pagination support (offset/limit) for large schedules
      const result = await rtsClientRef.current.getSchedule({
        startTime: timeViewWindow?.start,
        endTime: timeViewWindow?.end,
      });
      setSchedule(result);
    } catch {
      // keep previous schedule on error
    } finally {
      setLoading(false);
    }
  }, [timeViewWindow, externalSchedule]);

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
      rtsClientRef.current.editScheduleBatch({
        actions: [{ type: 'TASK_DELETE', id: taskId }],
      }),
    [],
  );

  const optimize = useCallback(
    (optimizationDuration: number) =>
      rtsClientRef.current.optimize({ optimizationDuration }),
    [],
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
    saveColors,
  };
}

export type UseScheduleViewerReturn = ReturnType<typeof useScheduleViewer>;

export const ScheduleViewerContext = createContext<
  UseScheduleViewerReturn | undefined
>(undefined);

const useScheduleViewerContext = () => {
  const ctx = useContext(ScheduleViewerContext);
  if (ctx === undefined) {
    throw new Error(
      'useScheduleViewerContext must be inside a ScheduleViewerContext.Provider',
    );
  }
  return ctx;
};

export function useScheduleViewerTabsRoot() {
  const { tabValue, setTabValue } = useScheduleViewerContext();
  return { tabValue, setTabValue };
}

export function useScheduleViewerGantt() {
  const {
    schedule,
    filterTask,
    setViewTask,
    setTaskDialogOpen,
    typeColorMap,
    live,
  } = useScheduleViewerContext();

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
    live,
  };
}

export function useScheduleViewerTaskDialog() {
  const {
    viewTask,
    taskDialogOpen,
    setTaskDialogOpen,
    typeColorMap,
    saveColors,
    deleteTask,
    fetchSchedule,
  } = useScheduleViewerContext();
  return {
    viewTask,
    open: taskDialogOpen,
    setOpen: setTaskDialogOpen,
    typeColorMap,
    saveColors,
    deleteTask,
    refetchSchedule: fetchSchedule,
  };
}

export function useScheduleViewerControlPanel() {
  const {
    schedule,
    loading,
    fetchSchedule,
    live,
    setLive,
    timeViewWindow,
    setTimeViewWindow,
  } = useScheduleViewerContext();
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

export interface UseScheduleViewerLiveToggleProps {
  live?: boolean;
}

export function useScheduleViewerLiveToggle(
  props: UseScheduleViewerLiveToggleProps,
) {
  const { live, setLive } = useScheduleViewerContext();
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

export function useScheduleViewerRefreshButton() {
  const { loading, fetchSchedule, live } = useScheduleViewerContext();
  return { loading: loading || live, onClick: fetchSchedule };
}

export function useScheduleViewerOptimizeButton() {
  const { optimize, fetchSchedule } = useScheduleViewerContext();
  return { optimize, refetchSchedule: fetchSchedule };
}

export function useScheduleViewerProcess() {
  const {
    schedule,
    viewProcess,
    setViewProcess,
    setViewTask,
    setTaskDialogOpen,
    typeColorMap,
  } = useScheduleViewerContext();

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
