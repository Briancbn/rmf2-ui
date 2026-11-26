import { Button, Flex, Spacer, Stack, Text } from '@chakra-ui/react';
import { Card, Pending, ScheduleViewer } from '@rmf2-ui/chakra';
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

  const SEND_PRESET_TOAST_ID = 'send-preset-task';
  const { mutateAsync: sendPresetTaskMutation } = useMutation({
    mutationFn: sendPresetTask,
    onMutate: () => {
      toaster.create({
        id: SEND_PRESET_TOAST_ID,
        title: 'Sending Preset Task',
        description: 'Please wait...',
        type: 'loading',
      });
    },
    onSuccess: () => {
      toaster.update(SEND_PRESET_TOAST_ID, {
        title: 'Successfully Send Task',
        description: 'Work Order',
        type: 'success',
        duration: 5000,
        closable: true,
      });
      invalidateSchedule();
    },
    onError: (error) => {
      toaster.update(SEND_PRESET_TOAST_ID, {
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
        <ScheduleViewer.Root
          schedule={schedule}
          rtsClient={{ getSchedule, editScheduleBatch, optimize }}
          flex="1"
          minH="0"
          display="flex"
          flexDirection="column"
        >
          {/* Schedule Tabs */}
          <ScheduleViewer.TabsRoot
            flex="1"
            minH="0"
            display="flex"
            flexDirection="column"
          >
            {/* Schedule Tabs Control */}
            <ScheduleViewer.TabsControl />

            {/* Schedule Tabs Schedule Display */}
            <ScheduleViewer.TabsContentSchedule
              flex="1"
              minH="0"
              display="flex"
              flexDirection="column"
            >
              {/* Control Panel */}
              <ScheduleViewer.ControlPanel>
                <ScheduleViewer.AddButton
                  disabled={schedule === undefined || isErrorGetSchedule}
                />
                <ScheduleViewer.DownloadButton
                  onClick={downloadCSV}
                  disabled={schedule === undefined || isErrorGetSchedule}
                />
                <ScheduleViewer.RefreshButton
                  onClick={() => refresh()}
                  loading={refreshPending}
                />
                <ScheduleViewer.LiveToggle
                  onToggleLive={(live) =>
                    setRefetchInterval(live ? 1000 : false)
                  }
                  disabled={isErrorGetSchedule}
                />
                <ScheduleViewer.OptimizeButton
                  onClick={() =>
                    optimize({ optimizationDuration: 60 * 60 * 24 })
                  }
                  loading={optimizePending}
                  disabled={isErrorGetSchedule}
                />
                <Spacer />
                <DateTimeSelector currentDate={currentDate} />
              </ScheduleViewer.ControlPanel>
              <ScheduleViewer.Gantt flex="1" minH="50vh" />
            </ScheduleViewer.TabsContentSchedule>

            {/* Schedule Tabs Process Display */}
            <ScheduleViewer.TabsContentProcess>
              <ScheduleViewer.Process />
            </ScheduleViewer.TabsContentProcess>
          </ScheduleViewer.TabsRoot>

          <ScheduleViewer.TaskDialog placement="center">
            <ScheduleViewer.TaskDialogControlPanel />
          </ScheduleViewer.TaskDialog>
        </ScheduleViewer.Root>
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
