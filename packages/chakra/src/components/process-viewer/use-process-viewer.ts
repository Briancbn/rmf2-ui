import { createContext, useContext, useEffect, useState } from 'react';
import type { RTS } from '@rmf2-ui/data';

export interface UseProcessViewerProps {
  processes: RTS.Process[];
  tasks: RTS.Task[];
  onNodeDoubleClick?: (taskId: string) => void;
  getNodeColor?: (taskId: string) => string | undefined;
}

export function useProcessViewer({
  processes,
  tasks,
  onNodeDoubleClick,
  getNodeColor,
}: UseProcessViewerProps) {
  const [selectedProcessId, setSelectedProcessId] = useState<
    string | undefined
  >(processes[0]?.id);

  useEffect(() => {
    if (selectedProcessId === undefined && processes.length > 0) {
      setSelectedProcessId(processes[0].id);
    }
  }, [processes, selectedProcessId]);

  return {
    processes,
    tasks,
    selectedProcessId,
    setSelectedProcessId,
    onNodeDoubleClick,
    getNodeColor,
  };
}

export type UseProcessViewerReturn = ReturnType<typeof useProcessViewer>;

export const ProcessViewerContext = createContext<
  UseProcessViewerReturn | undefined
>(undefined);

const useProcessViewerContext = (): UseProcessViewerReturn => {
  const ctx = useContext(ProcessViewerContext);
  if (!ctx) {
    throw new Error(
      'useProcessViewerContext must be used inside ProcessViewer.Root',
    );
  }
  return ctx;
};

export function useProcessViewerCanvas() {
  const {
    processes,
    selectedProcessId,
    tasks,
    onNodeDoubleClick,
    getNodeColor,
  } = useProcessViewerContext();
  const selectedProcess = processes.find((p) => p.id === selectedProcessId);
  return { selectedProcess, tasks, onNodeDoubleClick, getNodeColor };
}

export function useProcessViewerControlPanel() {
  const { processes, selectedProcessId, setSelectedProcessId } =
    useProcessViewerContext();
  return { processes, selectedProcessId, setSelectedProcessId };
}
