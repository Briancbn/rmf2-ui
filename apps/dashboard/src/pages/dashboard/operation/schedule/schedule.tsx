import { useEffect } from 'react';
import { LuRefreshCw } from 'react-icons/lu';
import { Box, Button, Flex, Spacer, IconButton } from '@chakra-ui/react';
import { Horizon } from '@rmf2-ui/chakra';
import Card = Horizon.Card;
import type { RTS } from '@rmf2-ui/data';
import { RTOConfig, LauncherConfig } from '@/clients';
import { LightMode } from '@/components/ui/color-mode';
import { toaster } from '@/components/ui/toaster';
import { Pending } from '@/components/pending';
import { DateTimeSelector } from './components/date-time-selector';
import { useRTSClient } from '@/clients/rts';
import { ScheduleGantt } from './components/schedule-gantt-new';
import { ScheduleTaskViewDialog } from './components/schedule-task-view-dialog';
import { ScheduleRoot } from './components/schedule-root';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

export function Schedule() {
  // Chakra Color Mode
  const currentDate = new Date();
  const rtsClient = useRTSClient();
  const queryClient = useQueryClient();
  const {
    isPending: isPendingGetSchedule,
    data: schedule,
    error: errorGetSchedule,
    isError: isErrorGetSchedule,
    refetch: refetchGetSchedule,
  } = useQuery({
    queryKey: ['RTSSchedule'],
    queryFn: async (): Promise<RTS.Schedule> => {
      const schedule = await rtsClient.getSchedule({ offset: 0, limit: 100 });
      return schedule;
    },
    staleTime: 5 * 1000,
    gcTime: 0,
  });

  const sendTaskRTS = async () => {
    // TODO(anyone): fix response header to remove the try-catch
    try {
      await fetch(LauncherConfig.BASE + '/send_task', {
        method: 'POST',
        headers: {
          Accept: '*',
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const sendTaskRTO = async () => {
    // TODO(anyone): fix response header to remove the try-catch
    try {
      await fetch(RTOConfig.BASE + '/send_task', {
        method: 'POST',
        headers: {
          Accept: '*',
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const sendTask = async () => {
    await sendTaskRTS();
    await sendTaskRTO();
    await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
  };

  const { mutateAsync: sendTaskMutation, error: errorSendTask } = useMutation({
    mutationFn: sendTask,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['RTSSchedule'],
      });
    },
  });

  function refreshSchedule() {
    refetchGetSchedule();
  }

  const convertToCSV = (tasks: RTS.Task[]) => {
    if (tasks.length === 0) {
      return '';
    }
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
    if (!schedule) {
      return;
    }

    const csv = convertToCSV(schedule.tasks);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'task-data.csv';
    link.click();
  };

  useEffect(() => {
    if (!isErrorGetSchedule) {
      return;
    }

    const toasterId = errorGetSchedule.name;

    if (toaster.isVisible(toasterId)) {
      return;
    }

    toaster.create({
      id: toasterId,
      title: 'Error Getting Schedule',
      description: `${errorGetSchedule.name}: ${errorGetSchedule.message}`,
      type: 'error',
      duration: 10 * 1000,
      closable: true,
    });
  }, [isErrorGetSchedule, errorGetSchedule]);

  return (
    <Box>
      <Card>
        <Flex direction="column">
          <Flex
            justify="end"
            direction={{ base: 'column', sm: 'row' }}
            mt="5px"
            gap="5px"
          >
            <Button
              onClick={() => {
                const promise = sendTaskMutation();
                toaster.promise(promise, {
                  success: {
                    title: 'Successfully Send Task',
                    description: 'Work Order',
                    duration: 5000,
                    closable: true,
                  },
                  error: {
                    title: 'Error Send Task',
                    description: `${errorSendTask?.name}: ${errorSendTask?.message}`,
                    duration: 5000,
                    closable: true,
                  },
                  loading: {
                    title: 'Sending Task...',
                    description: 'Work Order',
                  },
                });
              }}
              colorPalette="blue"
              disabled={isErrorGetSchedule}
            >
              Send Task
            </Button>
            <LightMode>
              <Button
                onClick={downloadCSV}
                colorPalette="orange"
                disabled={schedule === undefined}
              >
                Export to CSV
              </Button>
            </LightMode>
            <IconButton
              aria-label="refresh"
              colorPalette="gray"
              onClick={refreshSchedule}
            >
              <LuRefreshCw />
            </IconButton>
            <Spacer />

            <DateTimeSelector currentDate={currentDate} />
          </Flex>
          <ScheduleRoot schedule={schedule}>
            <ScheduleGantt />
            <ScheduleTaskViewDialog placement="center" />
          </ScheduleRoot>
          {isPendingGetSchedule && (
            <Pending.Root>
              <Pending.Overlay />
              <Pending.Spinner />
            </Pending.Root>
          )}
        </Flex>
      </Card>
    </Box>
  );
}
