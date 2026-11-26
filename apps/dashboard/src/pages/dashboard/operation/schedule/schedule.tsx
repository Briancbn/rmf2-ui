import { Button, Flex, Spacer, Stack, Text } from '@chakra-ui/react';
import { Card, Pending, SchedulerViewer } from '@rmf2-ui/chakra';
import type { RTS } from '@rmf2-ui/data';
import { sendPresetTask } from './send-preset-task';
import { toaster } from '@/components/ui/toaster';
import { DateTimeSelector } from './components/date-time-selector';
import { useRTSClient } from '@/clients';
import { useRTSQuery } from './hooks/use-rts-query';
import { useMutation } from '@tanstack/react-query';

export function SchedulePage() {
  const currentDate = new Date();
  const rtsClient = useRTSClient();
  const {
    schedule,
    isPendingGetSchedule,
    isErrorGetSchedule,
    setRefetchInterval,
    refresh,
    refreshPending,
    optimizePending,
    optimize,
    getSchedule,
    editScheduleBatch,
    invalidateSchedule,
  } = useRTSQuery({ client: rtsClient, toast: toaster });

  const { mutateAsync: sendPresetTaskMutation } = useMutation({
    mutationFn: sendPresetTask,
    onSuccess: () => {
      invalidateSchedule();
      toaster.create({
        title: 'Successfully Send Task',
        description: 'Work Order',
        type: 'success',
        duration: 5000,
        closable: true,
      });
    },
    onError: (error) => {
      toaster.create({
        title: 'Error Send Task',
        description: `${(error as Error).name}: ${(error as Error).message}`,
        type: 'error',
        duration: 5000,
        closable: true,
      });
    },
  });

  const convertToCSV = (tasks: RTS.Task[]) => {
    if (tasks.length === 0) return '';
    const header = Object.keys(tasks[0]);
    const rows = tasks.map((task) =>
      header
        .map((field) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return JSON.stringify((task as Record<string, any>)[field]);
        })
        .join(','),
    );
    return [header.join(','), ...rows].join('\n');
  };

  const downloadCSV = () => {
    if (!schedule) return;
    const csv = convertToCSV(schedule.tasks);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'task-data.csv';
    link.click();
  };

  return (
    <Stack h="calc(100dvh - 150px)" gap="0">
      <Card
        flexDirection="column"
        gap="5px"
        p="25px"
        flex="1"
        minH="0"
        overflow="hidden"
      >
        <Flex justifyContent="space-between" align="center">
          <Flex align="center" gap="20px">
            <Text fontSize="22px" fontWeight="700" lineHeight="100%">
              Schedule Viewer
            </Text>
            <Button
              onClick={() => sendPresetTaskMutation()}
              colorPalette="blue"
              variant="solid"
              disabled={isErrorGetSchedule}
            >
              Send Preset Task
            </Button>
          </Flex>
        </Flex>
        {/* Schedule Viewer */}
        <SchedulerViewer.Root
          schedule={schedule}
          rtsClient={{ getSchedule, editScheduleBatch, optimize }}
          flex="1"
          minH="0"
          display="flex"
          flexDirection="column"
        >
          {/* Schedule Tabs */}
          <SchedulerViewer.TabsRoot
            flex="1"
            minH="0"
            display="flex"
            flexDirection="column"
          >
            {/* Schedule Tabs Control */}
            <SchedulerViewer.TabsControl />

            {/* Schedule Tabs Schedule Display */}
            <SchedulerViewer.TabsContentSchedule
              flex="1"
              minH="0"
              display="flex"
              flexDirection="column"
            >
              {/* Control Panel */}
              <SchedulerViewer.ControlPanel>
                <SchedulerViewer.AddButton
                  disabled={schedule === undefined || isErrorGetSchedule}
                />
                <SchedulerViewer.DownloadButton
                  onClick={downloadCSV}
                  disabled={schedule === undefined || isErrorGetSchedule}
                />
                <SchedulerViewer.RefreshButton
                  onClick={() => refresh()}
                  loading={refreshPending}
                />
                <SchedulerViewer.LiveToggle
                  onToggleLive={(live) =>
                    setRefetchInterval(live ? 1000 : false)
                  }
                  disabled={isErrorGetSchedule}
                />
                <SchedulerViewer.OptimizeButton
                  onClick={() =>
                    optimize({ optimizationDuration: 60 * 60 * 24 })
                  }
                  loading={optimizePending}
                  disabled={isErrorGetSchedule}
                />
                <Spacer />
                <DateTimeSelector currentDate={currentDate} />
              </SchedulerViewer.ControlPanel>
              <SchedulerViewer.Gantt flex="1" minH="50vh" />
            </SchedulerViewer.TabsContentSchedule>

            {/* Schedule Tabs Process Display */}
            <SchedulerViewer.TabsContentProcess>
              <SchedulerViewer.Process />
            </SchedulerViewer.TabsContentProcess>
          </SchedulerViewer.TabsRoot>

          <SchedulerViewer.TaskDialog placement="center">
            <SchedulerViewer.TaskDialogControlPanel />
          </SchedulerViewer.TaskDialog>
        </SchedulerViewer.Root>
        {isPendingGetSchedule && (
          <Pending.Root>
            <Pending.Overlay />
            <Pending.Spinner />
          </Pending.Root>
        )}
      </Card>
    </Stack>
  );
}
