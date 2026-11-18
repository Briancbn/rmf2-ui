import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from 'react';
import type { RTS } from '@rmf2-ui/data';

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
  };
}

export type UseSchedulerViewerReturn = ReturnType<typeof useSchedule>;

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
  const { schedule, setViewTask, setTaskDialogOpen } =
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

  return {
    tasks: schedule === undefined ? [] : schedule.tasks,
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
