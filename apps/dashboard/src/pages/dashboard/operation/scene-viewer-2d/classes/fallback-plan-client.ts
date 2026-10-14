import type {
  IPlanClient,
  PlanStatus,
  PlanTaskRequest,
  PlanTaskStatus,
  PlanTaskSubmitResult,
  PlanWaypoint,
} from './plan-client-base';

const DEMO_TASKS: PlanTaskStatus[] = [
  {
    taskId: 'task-001',
    robotId: 'robot-1',
    status: 'COMPLETED',
    source: 'demo',
    reason: null,
    supersededBy: null,
    updatedAt: new Date(Date.now() - 60_000).toISOString(),
  },
  {
    taskId: 'task-002',
    robotId: 'robot-2',
    status: 'RUNNING',
    source: 'demo',
    reason: null,
    supersededBy: null,
    updatedAt: new Date(Date.now() - 10_000).toISOString(),
  },
  {
    taskId: 'task-003',
    robotId: 'robot-1',
    status: 'FAILED',
    source: 'demo',
    reason: 'No path found',
    supersededBy: null,
    updatedAt: new Date(Date.now() - 300_000).toISOString(),
  },
];

const DEMO_PLANS: PlanStatus[] = [
  {
    planId: 'plan-001',
    robotId: 'robot-1',
    status: 'COMPLETED',
    reachedWaypoint: 3,
    targetWaypoint: 3,
    reason: null,
    updatedAt: new Date(Date.now() - 60_000).toISOString(),
  },
  {
    planId: 'plan-002',
    robotId: 'robot-2',
    status: 'RUNNING',
    reachedWaypoint: 1,
    targetWaypoint: 4,
    reason: null,
    updatedAt: new Date(Date.now() - 10_000).toISOString(),
  },
];

const DEMO_WAYPOINTS: Record<string, PlanWaypoint[]> = {
  'robot-1': [
    { name: 'node-1', position: [0, 0], progress: 0, departureAction: null },
    { name: 'node-2', position: [2, 0], progress: 1, departureAction: null },
    { name: 'node-3', position: [2, 2], progress: 2, departureAction: null },
    { name: 'node-4', position: [4, 2], progress: 3, departureAction: null },
  ],
  'robot-2': [
    { name: 'node-5', position: [2, 3], progress: 0, departureAction: null },
    { name: 'node-6', position: [4, 3], progress: 1, departureAction: null },
    { name: 'node-7', position: [4, 5], progress: 2, departureAction: null },
  ],
};

export class FallbackPlanClient implements IPlanClient {
  private _planCache: Record<string, PlanWaypoint[]> = {};

  async getPlanCache(): Promise<Record<string, PlanWaypoint[]>> {
    return this._planCache;
  }

  async submitTasks(
    tasks: PlanTaskRequest[],
    opts?: { mode?: 'dry_run' | 'plan' | 'submit' },
  ): Promise<PlanTaskSubmitResult> {
    const waypointsFor = (task: PlanTaskRequest): PlanWaypoint[] =>
      DEMO_WAYPOINTS[task.robotId] ?? [
        {
          name: task.goal,
          position: [0, 0],
          progress: 0,
          departureAction: null,
        },
      ];

    if (opts?.mode === 'submit') {
      for (const task of tasks) {
        this._planCache[task.robotId] = waypointsFor(task);
      }
    }
    return {
      decision: opts?.mode === 'dry_run' ? 'DRY_RUN' : 'ACCEPTED',
      errors: [],
      plans: tasks.map((task, i) => ({
        planId: `demo-plan-${Date.now()}-${i}`,
        robotId: task.robotId,
        waypoints: waypointsFor(task),
      })),
    };
  }

  async getTasks(limit = 50): Promise<PlanTaskStatus[]> {
    return DEMO_TASKS.slice(0, limit);
  }

  async getTask(taskId: string): Promise<PlanTaskStatus | null> {
    return DEMO_TASKS.find((t) => t.taskId === taskId) ?? null;
  }

  async getPlans(limit = 50): Promise<PlanStatus[]> {
    return DEMO_PLANS.slice(0, limit);
  }

  async getPlan(planId: string): Promise<PlanStatus | null> {
    return DEMO_PLANS.find((p) => p.planId === planId) ?? null;
  }
}
