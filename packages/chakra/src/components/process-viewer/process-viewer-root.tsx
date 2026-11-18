import { useMemo, type ReactNode } from 'react';
import type { RTS } from '@rmf2-ui/data';
import { ProcessViewerContext, useProcessViewer } from './use-process-viewer';

export interface ProcessViewerRootProps {
  processes?: RTS.Process[];
  tasks?: RTS.Task[];
  children?: ReactNode;
}

export function ProcessViewerRoot(props: ProcessViewerRootProps) {
  const { processes = [], tasks = [], children } = props;
  const ctx = useProcessViewer({ processes, tasks });
  const value = useMemo(() => ctx, [ctx]);

  return <ProcessViewerContext value={value}>{children}</ProcessViewerContext>;
}
