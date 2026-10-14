import { PlanServerAPI, PlanExecutorAPI } from '@rmf2-ui/client';
import { PlanServerConfig, PlanExecutorConfig } from '@/clients';
import type {
  IPlanClient,
  PlanStatus,
  PlanTaskRequest,
  PlanTaskStatus,
  PlanTaskSubmitResult,
  PlanWaypoint,
} from './plan-client-base';

type RawServerTaskStatus = PlanServerAPI.Generated.TaskRecordStatus;
type RawServerPlanStatus = PlanServerAPI.Generated.PlanRecordStatus;
type RawSubmitPlan =
  PlanServerAPI.Generated.TaskSubmitResponse['plans'][number];

function _toTaskStatus(raw: RawServerTaskStatus): PlanTaskStatus {
  return {
    taskId: raw.task_id,
    robotId: raw.robot_id,
    status: raw.status,
    source: raw.source,
    reason: raw.reason ?? null,
    supersededBy: raw.superseded_by ?? null,
    updatedAt: raw.updated_at,
  };
}

function toPlanStatus(raw: RawServerPlanStatus): PlanStatus {
  return {
    planId: raw.plan_id,
    robotId: raw.robot_id,
    status: raw.status,
    reachedWaypoint: raw.reached_waypoint ?? null,
    targetWaypoint: raw.target_waypoint ?? null,
    reason: raw.reason ?? null,
    updatedAt: raw.updated_at,
  };
}

function toWaypoint(
  raw: NonNullable<RawSubmitPlan['waypoints']>[number],
): PlanWaypoint {
  return {
    name: raw.name,
    position: raw.position,
    progress: raw.progress,
    departureAction: raw.departure_action ?? null,
  };
}

export class PlanClient implements IPlanClient {
  private readonly _serverClient: ReturnType<typeof PlanServerAPI.createClient>;
  private readonly _executorClient: ReturnType<
    typeof PlanExecutorAPI.createClient
  >;

  constructor(opts?: { serverBaseUrl?: string; executorBaseUrl?: string }) {
    this._serverClient = PlanServerAPI.createClient(
      PlanServerAPI.createConfig({
        baseUrl:
          opts?.serverBaseUrl ??
          PlanServerConfig.BASE ??
          'http://localhost:8080/plan_server',
      }),
    );
    this._executorClient = PlanExecutorAPI.createClient(
      PlanExecutorAPI.createConfig({
        baseUrl:
          opts?.executorBaseUrl ??
          PlanExecutorConfig.BASE ??
          'http://localhost:8080/plan_executor',
      }),
    );
  }

  async getPlanCache(): Promise<Record<string, PlanWaypoint[]>> {
    const res = await PlanServerAPI.Generated.getPlanCacheV1PlansCacheGet({
      client: this._serverClient,
    });
    if (!res.data) return {};
    const result: Record<string, PlanWaypoint[]> = {};
    // Response is an array of cache entries; each entry has a `plans` map keyed by robot ID.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: any[] = Array.isArray(res.data) ? res.data : [res.data];
    for (const entry of entries) {
      for (const [robotId, plan] of Object.entries(entry.plans ?? {})) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result[robotId] = ((plan as any).waypoints ?? []).map(toWaypoint);
      }
    }
    return result;
  }

  async submitTasks(
    tasks: PlanTaskRequest[],
    opts?: { mode?: 'dry_run' | 'plan' | 'submit' },
  ): Promise<PlanTaskSubmitResult> {
    const res = await PlanServerAPI.Generated.submitTasksV1TasksPost({
      client: this._serverClient,
      body: tasks.map((t) => ({
        task_id: t.taskId ?? `task-${Date.now()}`,
        robot_id: t.robotId,
        goal: t.goal,
      })),
      query: { mode: opts?.mode ?? 'submit' },
    });
    if (!res.data) throw new Error(JSON.stringify(res.error));
    return {
      decision: res.data.decision,
      errors: res.data.errors,
      plans: res.data.plans.map((p) => ({
        planId: p.plan_id
          ? `${p.plan_id.destination_session}:${p.plan_id.plan_version}`
          : undefined,
        waypoints: (p.waypoints ?? []).map(toWaypoint),
      })),
    };
  }

  async getTasks(limit = 50): Promise<PlanTaskStatus[]> {
    const res = await PlanExecutorAPI.Generated.getTaskStatusesV1TasksGet({
      client: this._executorClient,
      query: { limit },
    });
    if (!res.data) throw new Error(JSON.stringify(res.error));
    return res.data.map((r) => ({
      taskId: r.task_id,
      robotId: r.robot_id,
      status: r.status,
      source: r.source,
      reason: r.reason ?? null,
      supersededBy: r.superseded_by ?? null,
      updatedAt: r.updated_at,
    }));
  }

  async getTask(taskId: string): Promise<PlanTaskStatus | null> {
    const res = await PlanExecutorAPI.Generated.getTaskStatusV1TasksTaskIdGet({
      client: this._executorClient,
      path: { task_id: taskId },
    });
    if (!res.data) return null;
    const r = res.data;
    return {
      taskId: r.task_id,
      robotId: r.robot_id,
      status: r.status,
      source: r.source,
      reason: r.reason ?? null,
      supersededBy: r.superseded_by ?? null,
      updatedAt: r.updated_at,
    };
  }

  async getPlans(limit = 50): Promise<PlanStatus[]> {
    const res = await PlanServerAPI.Generated.getPlanStatusesV1PlansGet({
      client: this._serverClient,
      query: { limit },
    });
    if (!res.data) throw new Error(JSON.stringify(res.error));
    return res.data.map(toPlanStatus);
  }

  async getPlan(planId: string): Promise<PlanStatus | null> {
    const res = await PlanServerAPI.Generated.getPlanStatusV1PlansPlanIdGet({
      client: this._serverClient,
      path: { plan_id: planId },
    });
    if (!res.data) return null;
    return toPlanStatus(res.data);
  }
}
