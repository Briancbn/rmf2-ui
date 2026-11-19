import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { useSchedulerViewerProcess } from './use-scheduler-viewer';
import { ProcessViewer } from '../process-viewer';

export interface SchedulerViewerProcessProps extends BoxProps {}

export function SchedulerViewerProcess(props: SchedulerViewerProcessProps) {
  const { ...rest } = props;
  const { schedule } = useSchedulerViewerProcess();

  return (
    <Box {...rest}>
      <ProcessViewer.Root
        processes={schedule?.processes ?? []}
        tasks={schedule?.tasks ?? []}
      >
        <ProcessViewer.ControlPanel mb="10px" />
        <ProcessViewer.Canvas />
      </ProcessViewer.Root>
    </Box>
  );
}
