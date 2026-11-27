import { useMemo } from 'react';
import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import { useScheduleViewerProcess } from './use-schedule-viewer';
import { getPresetColor } from './preset-colors-helper';
import { ProcessViewer } from '@/components/process-viewer';

export interface ScheduleViewerProcessProps extends BoxProps {}

export function ScheduleViewerProcess(props: ScheduleViewerProcessProps) {
  const { ...rest } = props;
  const { schedule, openTaskViewDialog, typeColorMap } =
    useScheduleViewerProcess();

  // Avoid rebuilding the taskId->type lookup on every render; only recompute
  // when the tasks array reference changes (i.e. a new schedule is fetched).
  const taskTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const task of schedule?.tasks ?? []) {
      map[task.id] = task.type;
    }
    return map;
  }, [schedule?.tasks]);

  // getNodeColor is passed as a prop to ProcessViewer.Root, which forwards it
  // to every React Flow node.
  const getNodeColor = useMemo(
    () => (taskId: string) => {
      const preset = typeColorMap[taskTypeMap[taskId] ?? ''];
      return preset !== undefined ? getPresetColor(preset) : undefined;
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
