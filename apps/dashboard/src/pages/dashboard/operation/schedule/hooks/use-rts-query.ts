import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RTS } from '@rmf2-ui/data';
import type { CreateToasterReturn } from '@chakra-ui/react';

const DEFAULT_QUERY_KEY = ['RTSSchedule'];

export interface UseRTSQueryProps {
  client: RTS.IClient;
  toast: CreateToasterReturn;
  queryKey?: unknown[];
}

export function useRTSQuery({
  client,
  toast,
  queryKey = DEFAULT_QUERY_KEY,
}: UseRTSQueryProps) {
  const queryClient = useQueryClient();
  const [refetchInterval, setRefetchInterval] = useState<false | number>(false);

  const {
    isPending: isPendingGetSchedule,
    data: schedule,
    error: errorGetSchedule,
    isError: isErrorGetSchedule,
    refetch: refetchGetSchedule,
  } = useQuery({
    queryKey,
    queryFn: () => client.getSchedule({ offset: 0, limit: 100 }),
    staleTime: 5 * 1000,
    gcTime: 0,
    refetchInterval,
  });

  useEffect(() => {
    if (!isErrorGetSchedule) return;
    const toasterId = errorGetSchedule.name;
    if (toast.isVisible(toasterId)) return;
    toast.create({
      id: toasterId,
      title: 'Error Getting Schedule',
      description: `${errorGetSchedule.name}: ${errorGetSchedule.message}`,
      type: 'error',
      duration: 10 * 1000,
      closable: true,
    });
  }, [isErrorGetSchedule, errorGetSchedule, toast]);

  const { mutateAsync: refresh, isPending: refreshPending } = useMutation({
    mutationFn: () => refetchGetSchedule().then(() => {}),
  });

  const { mutateAsync: editScheduleBatch } = useMutation({
    mutationFn: (actions: RTS.ScheduleAction[]) =>
      client.editScheduleBatch(actions),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (error) =>
      toast.create({
        title: 'Error',
        description: `${error}`,
        type: 'error',
        duration: 10 * 1000,
        closable: true,
      }),
  });

  const { mutateAsync: optimize, isPending: optimizePending } = useMutation({
    mutationFn: (params: { optimizationDuration: number }) =>
      client.optimize(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast.create({
        title: 'Success Optimize Schedule',
        description: `${data}`,
        type: 'success',
        duration: 10 * 1000,
        closable: true,
      });
    },
    onError: (error) =>
      toast.create({
        title: 'Failed Optimize Schedule',
        description: `${(error as Error).message}`,
        type: 'error',
        duration: 10 * 1000,
        closable: true,
      }),
  });

  const invalidateSchedule = () => queryClient.invalidateQueries({ queryKey });

  return {
    schedule,
    isPendingGetSchedule,
    isErrorGetSchedule,
    setRefetchInterval,
    refresh,
    refreshPending,
    optimizePending,
    getSchedule: client.getSchedule.bind(client),
    editScheduleBatch,
    optimize,
    invalidateSchedule,
  };
}
