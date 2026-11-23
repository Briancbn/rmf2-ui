import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from 'react';
import type { RTS } from '@rmf2-ui/data';

export const GANTT_PRESETS = [
  'preset_1',
  'preset_2',
  'preset_3',
  'preset_4',
  'preset_5',
];

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

interface TimeViewWindow {
  start: Date;
  end: Date;
}

export interface UseSchedulerViewerProps {
  schedule?: RTS.Schedule;
  live?: boolean;
  timeViewWindow?: TimeViewWindow;
}

export function useSchedulerViewer(props: UseSchedulerViewerProps) {
  const {
    schedule,
    live: defaultLive,
    timeViewWindow: defaultTimeViewWindow,
  } = props;
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
    saveTypeColorMap(typeColorMap);
  }, [typeColorMap]);

  return {
    schedule,
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
  const {
    schedule,
    setViewTask,
    setTaskDialogOpen,
    typeColorMap,
    setTypeColorMap,
  } = useSchedulerViewerContext();

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

  return {
    tasks: schedule === undefined ? [] : schedule.tasks,
    typeColorMap,
    setTypeColorMap,
    openTaskViewDialog,
  };
}

export function useSchedulerViewerTaskDialog() {
  const { viewTask, taskDialogOpen, setTaskDialogOpen } =
    useSchedulerViewerContext();
  return { viewTask, open: taskDialogOpen, setOpen: setTaskDialogOpen };
}

export function useSchedulerViewerControlPanel() {
  const { schedule, live, setLive, timeViewWindow, setTimeViewWindow } =
    useSchedulerViewerContext();
  return { schedule, live, setLive, timeViewWindow, setTimeViewWindow };
}

export interface UseSchedulerViewerLiveToggleProps {
  live?: boolean;
}

export function useSchedulerViewerLiveToggle(
  props: UseSchedulerViewerLiveToggleProps,
) {
  const { schedule, live, setLive } = useSchedulerViewerContext();
  const { live: liveExternal } = props;

  useEffect(() => {
    if (liveExternal === undefined) {
      return;
    }

    // TODO(Briancbn): switch to useCallback?
    setLive(liveExternal);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveExternal]);

  return { disabled: schedule === undefined, live, setLive };
}

export function useSchedulerViewerRefreshButton() {
  const { schedule, live } = useSchedulerViewerContext();
  return { disabled: schedule === undefined, loading: live };
}

export function useSchedulerViewerProcess() {
  const { schedule, viewProcess, setViewProcess } = useSchedulerViewerContext();
  return { schedule, viewProcess, setViewProcess };
}
