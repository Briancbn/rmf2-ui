import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RTS } from '@rmf2-ui/data';
import type { CreateToasterReturn } from '@chakra-ui/react';

// Default key used by useQuery for caching
const DEFAULT_QUERY_KEY = ['RTSSchedule'];

export interface UseRTSQueryProps {
  client: RTS.IClient;
  toast: CreateToasterReturn;
  /** Overwrite the default cache key `['RTSSchedule']` */
  queryKey?: unknown[];
}

/**
 * Manages RTS schedule data fetching and mutations via React Query.
 *
 * These add caching and toast notification to the original RTSClient
 *
 * @returns
 * - `schedule`: the latest fetched schedule, or `undefined` while loading
 * - `isPendingGetSchedule`: true on the initial fetch before data arrives
 * - `isErrorGetSchedule`: true if the last fetch failed
 * - `setRefetchInterval`: set to a ms interval to enable polling, `false` to stop
 * - `refresh`: manually trigger a refetch
 * - `refreshPending`: true while a manual refresh is in flight
 * - `editScheduleBatch`: apply a batch of schedule actions
 * - `optimize`: trigger schedule optimization
 * - `optimizePending`: true while optimization is in flight
 * - `getSchedule`: the raw client `getSchedule` method bound to the client
 * - `invalidateSchedule`: invalidate the query cache to force a refetch
 */
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
    // TODO(anyone): add pagination support (offset/limit) for large schedules
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
    mutationFn: (params: { actions: RTS.ScheduleAction[]; dryRun?: boolean }) =>
      client.editScheduleBatch(params),
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

  // TODO(anyone): investigate if this is any different from using
  // `refetchGetSchedule`.
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
