import { useMemo } from 'react';
import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import type { UseScheduleViewerProps } from './use-schedule-viewer';
import {
  useScheduleViewer,
  ScheduleViewerContext,
} from './use-schedule-viewer';

export interface ScheduleViewerRootProps
  extends BoxProps,
    UseScheduleViewerProps {}

export function ScheduleViewerRoot(props: ScheduleViewerRootProps) {
  const { children, ...rest } = props as BoxProps;

  const { ...context } = useScheduleViewer(props as UseScheduleViewerProps);
  const ctx = useMemo(() => ({ ...context }), [context]);

  return (
    <Box {...rest}>
      <ScheduleViewerContext value={ctx}>{children}</ScheduleViewerContext>
    </Box>
  );
}
