import type { Schedule } from './schedule';
import type { ScheduleAction } from './schedule-action';

export interface IClient {
  getSchedule(params: {
    startTime?: Date;
    endTime?: Date;
    offset?: number;
    limit?: number;
  }): Promise<Schedule>;
  editScheduleBatch(params: {
    actions: ScheduleAction[];
    dryRun?: boolean;
  }): Promise<string>;
  optimize(params: { optimizationDuration: number }): Promise<string>;
}
