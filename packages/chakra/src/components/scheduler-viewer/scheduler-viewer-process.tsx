import { useMemo } from 'react';
import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { useSchedulerViewerProcess } from './use-scheduler-viewer';
import { ProcessViewer } from '../process-viewer';

function presetToCssVar(preset: string): string {
  return `var(--chakra-colors-schedule-viewer\\.gantt\\.${preset.replace('_', '')}\\.bg)`;
}

export interface SchedulerViewerProcessProps extends BoxProps {}

export function SchedulerViewerProcess(props: SchedulerViewerProcessProps) {
  const { ...rest } = props;
  const { schedule, openTaskViewDialog, typeColorMap } =
    useSchedulerViewerProcess();

  const taskTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const task of schedule?.tasks ?? []) {
      map[task.id] = task.type;
    }
    return map;
  }, [schedule?.tasks]);

  const getNodeColor = useMemo(
    () => (taskId: string) => {
      const preset = typeColorMap[taskTypeMap[taskId] ?? ''];
      return preset !== undefined ? presetToCssVar(preset) : undefined;
    },
    [typeColorMap, taskTypeMap],
  );

  return (
    <Box {...rest}>
      <ProcessViewer.Root
        processes={schedule?.processes ?? []}
        tasks={schedule?.tasks ?? []}
        onNodeDoubleClick={openTaskViewDialog}
        getNodeColor={getNodeColor}
      >
        <ProcessViewer.DefaultControls />
        <ProcessViewer.Canvas />
      </ProcessViewer.Root>
    </Box>
  );
}
