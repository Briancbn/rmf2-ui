import { createContext, useContext, useMemo, useState } from 'react';
import type { RTS } from '@rmf2-ui/data';

export interface ProcessViewerContextValue {
  processes: RTS.Process[];
  tasks: RTS.Task[];
  selectedProcessId: string | undefined;
  setSelectedProcessId: (id: string | undefined) => void;
  selectedProcess: RTS.Process | undefined;
}

export const ProcessViewerContext = createContext<
  ProcessViewerContextValue | undefined
>(undefined);

export function useProcessViewerContext(): ProcessViewerContextValue {
  const ctx = useContext(ProcessViewerContext);
  if (ctx === undefined) {
    throw new Error(
      'useProcessViewerContext must be used within a ProcessViewerRoot',
    );
  }
  return ctx;
}

export interface UseProcessViewerProps {
  processes: RTS.Process[];
  tasks: RTS.Task[];
}

export function useProcessViewer(props: UseProcessViewerProps) {
  const { processes, tasks } = props;
  const [selectedProcessId, setSelectedProcessId] = useState<
    string | undefined
  >(processes[0]?.id);
  const selectedProcess = useMemo(
    () => processes.find((p) => p.id === selectedProcessId),
    [processes, selectedProcessId],
  );

  return {
    processes,
    tasks,
    selectedProcessId,
    setSelectedProcessId,
    selectedProcess,
  };
}
