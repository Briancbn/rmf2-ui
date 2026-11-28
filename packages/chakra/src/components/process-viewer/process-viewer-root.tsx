import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { RTS } from '@rmf2-ui/data';
import { ProcessViewerContext, useProcessViewer } from './use-process-viewer';

export interface ProcessViewerRootProps {
  processes?: RTS.Process[];
  tasks?: RTS.Task[];
  onNodeDoubleClick?: (taskId: string) => void;
  /** Function for Canvas to retrieve color for the node */
  getNodeColor?: (taskId: string) => string | undefined;
  children?: ReactNode;
}

export function ProcessViewerRoot(props: ProcessViewerRootProps) {
  const {
    processes = [],
    tasks = [],
    onNodeDoubleClick,
    getNodeColor,
    children,
  } = props;
  const ctx = useProcessViewer({
    processes,
    tasks,
    onNodeDoubleClick,
    getNodeColor,
  });
  const value = useMemo(() => ctx, [ctx]);

  return <ProcessViewerContext value={value}>{children}</ProcessViewerContext>;
}
