// Live map topology + AGV state from the VDA5050 master REST API.
// Map is fetched once from GET /v1/layout; AGV state is polled from GET /v1/agvs.
import { useEffect, useRef, useState } from 'react';
import { Vda5050MasterConfig } from '@/clients';

import type { AgvState, MapData, MapNode, SocketStatus } from './types';

const BASE = (Vda5050MasterConfig.BASE ?? 'http://localhost:8000').replace(
  /\/$/,
  '',
);
const AGV_POLL_MS = 1000;

// Parse a LIF layout object (camelCase) into the visualiser's MapData (snake_case).
// Station positions are derived from the first interactionNodeId when the LIF
// doesn't include an explicit stationPosition.
function lifToMapData(layout: Record<string, unknown>): MapData {
  const nodes: MapNode[] = ((layout.nodes as unknown[]) ?? []).map(
    (n: unknown) => {
      const node = n as Record<string, unknown>;
      const pos = node.nodePosition as Record<string, number> | undefined;
      return {
        node_id: node.nodeId as string,
        x: pos?.x ?? 0,
        y: pos?.y ?? 0,
      };
    },
  );

  const nodeById = new Map(nodes.map((n) => [n.node_id, n]));

  const edges = ((layout.edges as unknown[]) ?? []).map((e: unknown) => {
    const edge = e as Record<string, unknown>;
    return {
      edge_id: edge.edgeId as string,
      start_node_id: edge.startNodeId as string,
      end_node_id: edge.endNodeId as string,
    };
  });

  const stations = ((layout.stations as unknown[]) ?? []).map((s: unknown) => {
    const station = s as Record<string, unknown>;
    const interactionIds =
      (station.interactionNodeIds as string[] | undefined) ?? [];
    const stationPos = station.stationPosition as
      | Record<string, number>
      | undefined;
    const anchorNode = nodeById.get(interactionIds[0] ?? '');
    return {
      station_id: station.stationId as string,
      station_name: (station.stationName ?? station.stationId) as string,
      node_ids: interactionIds,
      x: stationPos?.x ?? anchorNode?.x ?? 0,
      y: stationPos?.y ?? anchorNode?.y ?? 0,
    };
  });

  return { nodes, edges, stations };
}

// Map a single AgvStatus (from GET /v1/agvs?show_state=true) to AgvState.
function agvStatusToState(raw: Record<string, unknown>): AgvState {
  const manufacturer = raw.manufacturer as string;
  const serialNumber = raw.serial_number as string;
  const state = raw.state as Record<string, unknown> | null | undefined;
  const pos = state?.agvPosition as Record<string, unknown> | null | undefined;
  const actionStates = state?.actionStates as
    | Record<string, unknown>[]
    | null
    | undefined;

  const jackAction = actionStates?.find((a) => {
    const t = (a.actionType as string | undefined)?.toUpperCase() ?? '';
    return t === 'JACK_UP' || t === 'JACK_DOWN' || t === 'JACK';
  });

  return {
    robot_id: `${manufacturer}/${serialNumber}`,
    manufacturer,
    serial_number: serialNumber,
    connection_status: (raw.is_online as boolean) ? 'ONLINE' : 'OFFLINE',
    last_node_id: (state?.lastNodeId as string | null | undefined) ?? null,
    x: (pos?.x as number | null | undefined) ?? null,
    y: (pos?.y as number | null | undefined) ?? null,
    theta: (pos?.theta as number | null | undefined) ?? null,
    has_pose:
      pos != null && typeof pos.x === 'number' && typeof pos.y === 'number',
    action_states:
      actionStates?.map((a) => ({
        action_id: a.actionId as string,
        action_type: a.actionType as string,
        action_status: a.actionStatus as string,
        result_description: (a.resultDescription as string | undefined) ?? '',
      })) ?? null,
    jack_state: jackAction ? (jackAction.actionStatus as string) : null,
    order_active:
      Array.isArray(state?.nodeStates) &&
      (state.nodeStates as unknown[]).length > 0,
  };
}

async function fetchLayoutMap(): Promise<MapData | null> {
  const summaryRes = await fetch(`${BASE}/v1/layout`);
  if (!summaryRes.ok) return null;
  const summary = (await summaryRes.json()) as { layout_ids?: string[] };
  const layoutId = summary.layout_ids?.[0];
  if (!layoutId) return null;
  const layoutRes = await fetch(
    `${BASE}/v1/layout/${encodeURIComponent(layoutId)}`,
  );
  if (!layoutRes.ok) return null;
  return lifToMapData((await layoutRes.json()) as Record<string, unknown>);
}

async function fetchAgvs(): Promise<AgvState[]> {
  const res = await fetch(`${BASE}/v1/agvs?show_state=true`);
  if (!res.ok) return [];
  const list = (await res.json()) as Record<string, unknown>[];
  return list.map(agvStatusToState);
}

export function useVdaState() {
  const [map, setMap] = useState<MapData | null>(null);
  const [agvs, setAgvs] = useState<AgvState[]>([]);
  const [status, setStatus] = useState<SocketStatus>('connecting');
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Fetch map topology once from the REST API on mount.
  useEffect(() => {
    let cancelled = false;
    fetchLayoutMap()
      .then((data) => {
        if (!cancelled && data) setMap(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Poll AGV state from REST API.
  useEffect(() => {
    let cancelled = false;

    const poll = () => {
      fetchAgvs()
        .then((data) => {
          if (cancelled) return;
          setAgvs(data);
          setStatus('connected');
        })
        .catch(() => {
          if (!cancelled) setStatus('disconnected');
        });
    };

    poll();
    pollRef.current = setInterval(poll, AGV_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(pollRef.current);
    };
  }, []);

  return { map, agvs, status };
}
