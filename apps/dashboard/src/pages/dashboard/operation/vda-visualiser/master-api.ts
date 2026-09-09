// Calls to the VDA5050 master webserver's direct control endpoints.
import { Vda5050MasterConfig } from '@/clients';

import type { MapfPlansByRobot } from './types';

const MASTER_BASE = (
  Vda5050MasterConfig.BASE ?? 'http://localhost:8000'
).replace(/\/$/, '');

export async function fetchMapfPlans(): Promise<MapfPlansByRobot> {
  const resp = await fetch(`${MASTER_BASE}/plans/mapf`);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`${resp.status} ${text.slice(0, 200)}`);
  }
  return resp.json() as Promise<MapfPlansByRobot>;
}

export async function postJack(
  robotId: string,
  direction: 'up' | 'down',
): Promise<void> {
  const resp = await fetch(
    `${MASTER_BASE}/actions/jack/${robotId}/${direction}`,
    { method: 'POST' },
  );
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`${resp.status} ${text.slice(0, 200)}`);
  }
}

// Send VDA5050 instant actions to a robot. Forward-compatible: once adapter-side
// instant-action subscription is wired in C++, this will execute on the robot.
export async function postInstantActions(
  robotId: string,
  actions: Array<{
    action_type: string;
    blocking_type?: string;
    action_description?: string;
  }>,
): Promise<void> {
  const resp = await fetch(`${MASTER_BASE}/actions/instant/${robotId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actions }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`${resp.status} ${text.slice(0, 200)}`);
  }
}

// ── VDA5050 master v1 instant-actions ────────────────────────────────────────

async function v1Post(path: string, body?: unknown): Promise<unknown> {
  const resp = await fetch(`${MASTER_BASE}/v1${path}`, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`${resp.status} ${text.slice(0, 200)}`);
  }
  return resp.json();
}

export type InstantActionDecision = { decision: string; errors: unknown[] };

export async function v1StateRequest(
  manufacturer: string,
  serialNumber: string,
): Promise<InstantActionDecision> {
  return v1Post(
    `/instant_actions/${encodeURIComponent(manufacturer)}/${encodeURIComponent(serialNumber)}/state_request`,
  ) as Promise<InstantActionDecision>;
}

export async function v1FactsheetRequest(
  manufacturer: string,
  serialNumber: string,
): Promise<InstantActionDecision> {
  return v1Post(
    `/instant_actions/${encodeURIComponent(manufacturer)}/${encodeURIComponent(serialNumber)}/factsheet_request`,
  ) as Promise<InstantActionDecision>;
}

export async function v1InitPosition(
  manufacturer: string,
  serialNumber: string,
): Promise<InstantActionDecision> {
  return v1Post(
    `/instant_actions/${encodeURIComponent(manufacturer)}/${encodeURIComponent(serialNumber)}/init_position`,
  ) as Promise<InstantActionDecision>;
}

export async function v1CustomInstantAction(
  manufacturer: string,
  serialNumber: string,
  actionType: string,
  blockingType = 'NONE',
  params?: Array<{ key: string; value: string }>,
): Promise<InstantActionDecision> {
  return v1Post(
    `/instant_actions/${encodeURIComponent(manufacturer)}/${encodeURIComponent(serialNumber)}/custom`,
    { action_type: actionType, blocking_type: blockingType, params },
  ) as Promise<InstantActionDecision>;
}

// ── VDA5050 master v1 orders ──────────────────────────────────────────────────

export interface OrderStatusRecord {
  manufacturer: string;
  serial_number: string;
  order_id: string;
  order_update_id: number;
  assigned_at: string;
  completed_at?: string | null;
  rejected_at?: string | null;
}

export interface AgvFactsheet {
  typeSpecification?: {
    manufacturer?: string;
    seriesName?: string;
    agvKinematic?: string;
    agvClass?: string;
  };
  physicalParameters?: {
    speedMax?: number;
    accelerationMax?: number;
    heightMax?: number;
    widthMax?: number;
    lengthMax?: number;
  };
  [key: string]: unknown;
}

export async function v1FetchFactsheet(
  manufacturer: string,
  serialNumber: string,
): Promise<AgvFactsheet> {
  const resp = await fetch(
    `${MASTER_BASE}/v1/factsheets/${encodeURIComponent(manufacturer)}/${encodeURIComponent(serialNumber)}`,
  );
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`${resp.status} ${text.slice(0, 200)}`);
  }
  return resp.json() as Promise<AgvFactsheet>;
}

export async function v1FetchOrders(limit = 100): Promise<OrderStatusRecord[]> {
  const resp = await fetch(`${MASTER_BASE}/v1/orders?limit=${limit}`);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`${resp.status} ${text.slice(0, 200)}`);
  }
  return resp.json() as Promise<OrderStatusRecord[]>;
}
