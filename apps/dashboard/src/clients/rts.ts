import type { RTS } from '@rmf2-ui/data';
import { RTSAPI } from '@rmf2-ui/client';
import { useMemo } from 'react';

export const RTSClientOptions: RTSAPI.ClientOptions = {
  baseUrl: import.meta.env.VITE_RTS_BASE ?? '',
};

export function useRTSClient() {
  return useMemo(() => {
    if (!RTSClientOptions.baseUrl) return new FallbackRTSClient();
    return new RTSAPI.Client(RTSClientOptions);
  }, []);
}

class FallbackRTSClient extends RTSAPI.Client {
  constructor() {
    super(RTSClientOptions);
  }

  override async getSchedule(_params: {
    startTime?: Date;
    endTime?: Date;
    offset?: number;
    limit?: number;
  }): Promise<RTS.Schedule> {
    const result: RTS.Schedule = {
      tasks: [],
      processes: [],
    };
    return result;
  }

  override async optimize(_params: {
    optimizationDuration: number;
  }): Promise<string> {
    return 'Optimized!';
  }
}
