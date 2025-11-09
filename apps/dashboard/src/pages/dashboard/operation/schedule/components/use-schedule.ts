import { createContext, useCallback, useContext, useState } from 'react';
import type { RTS } from '@rmf2-ui/data';

export interface UseScheduleProps {
  schedule?: RTS.Schedule;
}

export function useSchedule(props: UseScheduleProps) {
  const { schedule } = props;
  const [viewTask, setViewTask] = useState<RTS.Task | undefined>(undefined);
  const [taskViewDialogOpen, setTaskViewDialogOpen] = useState<boolean>(false);

  return {
    schedule,
    viewTask,
    setViewTask,
    taskViewDialogOpen,
    setTaskViewDialogOpen,
  };
}

export type UseScheduleReturn = ReturnType<typeof useSchedule>;

export const ScheduleContext = createContext<UseScheduleReturn | undefined>(
  undefined,
);

const useScheduleContext = () => {
  const horizonScheduleContext = useContext(ScheduleContext);
  if (horizonScheduleContext === undefined) {
    throw new Error(
      'useScheduleContext must be inside a ScheduleContext.Provider',
    );
  }
  return horizonScheduleContext;
};

export function useScheduleGantt() {
  const { schedule, setViewTask, setTaskViewDialogOpen } = useScheduleContext();

  const openTaskViewDialog = useCallback(
    (taskId: string) => {
      if (schedule === undefined) {
        return;
      }

      const currentTask = schedule.tasks.find((task) => task.id === taskId);
      if (currentTask !== undefined) {
        setViewTask(currentTask);
      }
      setTaskViewDialogOpen(true);
    },
    [schedule, setViewTask, setTaskViewDialogOpen],
  );

  return {
    tasks: schedule === undefined ? [] : schedule.tasks,
    openTaskViewDialog,
  };
}

export function useScheduleTaskViewDialog() {
  const { viewTask, taskViewDialogOpen, setTaskViewDialogOpen } =
    useScheduleContext();

  return {
    viewTask,
    open: taskViewDialogOpen,
    setOpen: setTaskViewDialogOpen,
  };
}
