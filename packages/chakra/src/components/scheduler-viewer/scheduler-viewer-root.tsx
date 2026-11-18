import { useMemo } from 'react';
import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import type { UseSchedulerViewerProps } from './use-scheduler-viewer';
import {
  useSchedulerViewer,
  SchedulerViewerContext,
} from './use-scheduler-viewer';

export interface SchedulerViewerRootProps
  extends BoxProps,
    UseSchedulerViewerProps {}

export function SchedulerViewerRoot(props: SchedulerViewerRootProps) {
  const { children, ...rest } = props as BoxProps;

  const { ...context } = useSchedulerViewer(props as UseSchedulerViewerProps);
  const ctx = useMemo(() => ({ ...context }), [context]);

  return (
    <Box {...rest}>
      <SchedulerViewerContext value={ctx}>{children}</SchedulerViewerContext>
    </Box>
  );
}
