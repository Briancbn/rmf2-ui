import { createContext, useContext, useState } from 'react';
import type { RTS } from '@rmf2-ui/data';

export interface UseProcessViewerProps {
  processes: RTS.Process[];
  tasks: RTS.Task[];
}

export function useProcessViewer({ processes, tasks }: UseProcessViewerProps) {
  const [selectedProcessId, setSelectedProcessId] = useState<
    string | undefined
  >(processes[0]?.id);

  return { processes, tasks, selectedProcessId, setSelectedProcessId };
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
  const { processes, selectedProcessId, tasks } = useProcessViewerContext();
  const selectedProcess = processes.find((p) => p.id === selectedProcessId);
  return { selectedProcess, tasks };
}

export function useProcessViewerControlPanel() {
  const { processes, selectedProcessId, setSelectedProcessId } =
    useProcessViewerContext();
  return { processes, selectedProcessId, setSelectedProcessId };
}
