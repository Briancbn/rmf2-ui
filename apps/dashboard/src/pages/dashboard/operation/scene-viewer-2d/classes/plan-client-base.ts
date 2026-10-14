export interface PlanWaypoint {
  name: string;
  position: [number, number];
  progress: number;
  departureAction: string | null;
}

export interface PlanTaskStatus {
  taskId: string;
  robotId: string;
  status: string;
  source: string;
  reason: string | null;
  supersededBy: string | null;
  updatedAt: string;
}

export interface PlanTaskSubmitResult {
  decision: string;
  errors: string[];
  plans: Array<{
    planId?: string;
    robotId?: string;
    waypoints: PlanWaypoint[];
  }>;
}

export interface PlanStatus {
  planId: string;
  robotId: string;
  status: string;
  reachedWaypoint: number | null;
  targetWaypoint: number | null;
  reason: string | null;
  updatedAt: string;
}

export interface PlanTaskRequest {
  taskId?: string;
  robotId: string;
  goal: string;
}

export interface IPlanClient {
  /** Returns the current plan cache: per-robot waypoint lists. */
  getPlanCache(): Promise<Record<string, PlanWaypoint[]>>;
  submitTasks(
    tasks: PlanTaskRequest[],
    opts?: { mode?: 'dry_run' | 'plan' | 'submit' },
  ): Promise<PlanTaskSubmitResult>;
  getTasks(limit?: number): Promise<PlanTaskStatus[]>;
  getTask(taskId: string): Promise<PlanTaskStatus | null>;
  getPlans(limit?: number): Promise<PlanStatus[]>;
  getPlan(planId: string): Promise<PlanStatus | null>;
}
