import type { Schedule } from './schedule';
import type { Task } from './task';
import type { IClient } from './client-base';
import type { ScheduleAction } from './schedule-action';

export class MockClient implements IClient {
  schedule: Schedule;
  private originalSchedule: Schedule;

  constructor(schedule: Schedule) {
    // keep a backup for reset
    this.originalSchedule = structuredClone(schedule);
    this.schedule = structuredClone(schedule);
  }

  async getSchedule(_params: {
    startTime?: Date;
    endTime?: Date;
    offset?: number;
    limit?: number;
  }): Promise<Schedule> {
    const now = Date.now();
    const tasks = this.schedule.tasks.map((t: Task) => {
      if (!t.startTime || !t.endTime) return t;
      const start = t.startTime.getTime();
      const end = t.endTime.getTime();

      // Update the task progress based on the current time
      if (now < start) {
        return { ...t, status: '', progress: 0 };
      } else if (now >= end) {
        return { ...t, status: 'completed', progress: 1 };
      } else {
        return {
          ...t,
          status: 'ongoing',
          progress: (now - start) / (end - start),
        };
      }
    });
    return { ...this.schedule, tasks };
  }

  async editScheduleBatch(params: {
    actions: ScheduleAction[];
    dryRun?: boolean;
  }): Promise<string> {
    const { actions } = params;
    // TODO(anyone): add support for other action types (e.g. TASK_CREATE, TASK_UPDATE)
    for (const action of actions) {
      if (action.type === 'TASK_DELETE' && action.id) {
        const task = this.schedule.tasks.find((t: Task) => t.id === action.id);
        if (!task || task.processId || task.seriesId) {
          throw new Error('Task cannot be deleted');
        }
        this.schedule.tasks = this.schedule.tasks.filter(
          (t: Task) => t.id !== action.id,
        );
      }
    }
    return 'Schedule updated successfully!';
  }

  async optimize(_params: { optimizationDuration: number }): Promise<string> {
    return 'optimized';
  }

  reset(schedule?: Schedule): void {
    const src = schedule ?? this.originalSchedule;
    this.schedule = structuredClone(src);
    if (schedule) this.originalSchedule = structuredClone(schedule);
  }
}
