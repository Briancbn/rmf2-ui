import { Vda5050MasterConfig } from '@/clients';
import { VDA5050MasterAPI } from '@rmf2-ui/client';
import type {
  InstantActionResult,
  IRobotClient,
  RobotFactsheet,
  RobotNodeState,
  RobotOrder,
  RobotState,
} from './robot-client-base';

const COLORS = ['#3182ce', '#dd6b20', '#38a169', '#d53f8c', '#805ad5'];
const WS_RETRY_MS = 2000;

function mapInstantActionResult(
  raw: VDA5050MasterAPI.Generated.InstantActionsResult,
): InstantActionResult {
  return {
    decision: raw.decision,
    errors: raw.errors.map((e) => ({
      errorType: e.errorType,
      errorLevel: e.errorLevel,
      errorDescription: e.errorDescription,
      errorReferences: e.errorReferences,
    })),
    actions: (raw.instant_actions?.actions ?? []).map((a) => ({
      actionId: a.actionId,
      actionType: a.actionType,
      blockingType: a.blockingType,
    })),
  };
}

type VdaState =
  VDA5050MasterAPI.Generated.GetStateV1StatesManufacturerSerialNumberGetResponse;
type VdaConnection = NonNullable<
  VDA5050MasterAPI.Generated.AgvStatus['connection']
>;

function vdaStateToFields(
  state: VdaState,
): Omit<RobotState, 'robotId' | 'connection'> {
  const pos = state.agvPosition;
  const battery = state.batteryState;
  return {
    x: pos?.x ?? null,
    y: pos?.y ?? null,
    theta: pos?.theta ?? null,
    batteryPercent: battery?.batteryCharge ?? null,
    operatingMode:
      state.driving || (state.nodeStates?.length ?? 0) > 0
        ? 'DRIVING'
        : (state.operatingMode ?? null),
    actionStates: (state.actionStates ?? []).map((a) => ({
      actionId: a.actionId,
      actionType: a.actionType,
      actionStatus: a.actionStatus,
      resultDescription: a.resultDescription ?? undefined,
    })),
    lastNodeId: state.lastNodeId ?? null,
    nodeStates: (state.nodeStates ?? []).map((n): RobotNodeState => ({
      nodeId: n.nodeId,
      sequenceId: n.sequenceId,
      released: n.released,
    })),
  };
}

const EMPTY_STATE_FIELDS: Omit<RobotState, 'robotId' | 'connection'> = {
  x: null,
  y: null,
  theta: null,
  batteryPercent: null,
  operatingMode: null,
  actionStates: [],
  lastNodeId: null,
  nodeStates: [],
};

function agvToRobotState(
  raw: VDA5050MasterAPI.Generated.AgvStatus,
): RobotState {
  return {
    robotId: `${raw.manufacturer}/${raw.serial_number}`,
    connection: raw.is_online ? 'ONLINE' : 'OFFLINE',
    ...(raw.state
      ? vdaStateToFields(raw.state as VdaState)
      : EMPTY_STATE_FIELDS),
  };
}

export class Vda5050RobotClient implements IRobotClient {
  private readonly _client: ReturnType<typeof VDA5050MasterAPI.createClient>;
  private readonly _wsBase: string;
  private readonly _cache = new Map<string, RobotState>();
  private readonly _listeners = new Set<(robots: RobotState[]) => void>();
  private readonly _retryTimers: ReturnType<typeof setTimeout>[] = [];

  constructor(baseUrl?: string) {
    const url = (
      baseUrl ??
      Vda5050MasterConfig.BASE ??
      'http://localhost:8080/vda5050_master'
    ).replace(/\/$/, '');
    this._client = VDA5050MasterAPI.createClient(
      VDA5050MasterAPI.createConfig({ baseUrl: url }),
    );
    this._wsBase = url.replace(/^http/, 'ws');
    this._connectStateWs();
    this._connectConnectionWs();
  }

  private _notify() {
    const robots = Array.from(this._cache.values());
    for (const cb of this._listeners) cb(robots);
  }

  private _connectStateWs() {
    const ws = new WebSocket(`${this._wsBase}/v1/states/ws`);
    ws.onmessage = (ev) => {
      try {
        const state = JSON.parse(ev.data as string) as VdaState;
        const robotId = `${state.manufacturer}/${state.serialNumber}`;
        const prev = this._cache.get(robotId);
        this._cache.set(robotId, {
          ...vdaStateToFields(state),
          robotId,
          connection: prev?.connection ?? 'ONLINE',
        });
        this._notify();
      } catch {
        /* ignore malformed */
      }
    };
    ws.onclose = () => {
      this._retryTimers.push(
        setTimeout(() => this._connectStateWs(), WS_RETRY_MS),
      );
    };
  }

  private _connectConnectionWs() {
    const ws = new WebSocket(`${this._wsBase}/v1/connections/ws`);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as VdaConnection;
        const robotId = `${msg.manufacturer}/${msg.serialNumber}`;
        const connection: RobotState['connection'] =
          msg.connectionState === 'ONLINE' ? 'ONLINE' : 'OFFLINE';
        const prev = this._cache.get(robotId);
        this._cache.set(
          robotId,
          prev
            ? { ...prev, connection }
            : { ...EMPTY_STATE_FIELDS, robotId, connection },
        );
        this._notify();
      } catch {
        /* ignore malformed */
      }
    };
    ws.onclose = () => {
      this._retryTimers.push(
        setTimeout(() => this._connectConnectionWs(), WS_RETRY_MS),
      );
    };
  }

  private async _fetchAgvs(): Promise<RobotState[]> {
    const result = await VDA5050MasterAPI.Generated.getOnboardedAgvsV1AgvsGet({
      client: this._client,
      query: { show_state: true },
    });
    if (!result.data) return [];
    return result.data.map(agvToRobotState);
  }

  async getRobots(): Promise<RobotState[]> {
    return this._fetchAgvs();
  }

  subscribeRobotStates(callback: (robots: RobotState[]) => void): () => void {
    this._fetchAgvs()
      .then((robots) => {
        for (const r of robots) this._cache.set(r.robotId, r);
        this._notify();
      })
      .catch(() => {});
    this._listeners.add(callback);
    if (this._cache.size > 0) callback(Array.from(this._cache.values()));
    return () => {
      this._listeners.delete(callback);
    };
  }

  async getOrders(skip = 0, limit = 100): Promise<RobotOrder[]> {
    const result = await VDA5050MasterAPI.Generated.getAllOrdersV1OrdersGet({
      client: this._client,
      query: { skip, limit },
    });
    if (!result.data) return [];
    return result.data.map((o) => ({
      orderId: o.order_id,
      robotId: `${o.manufacturer}/${o.serial_number}`,
      status: o.completed_at
        ? 'COMPLETED'
        : o.rejected_at
          ? 'REJECTED'
          : 'ACTIVE',
    }));
  }

  async getFactsheet(robotId: string): Promise<RobotFactsheet | null> {
    const [manufacturer, serialNumber] = robotId.split('/');
    if (!manufacturer || !serialNumber) return null;
    const result =
      await VDA5050MasterAPI.Generated.getFactsheetV1FactsheetsManufacturerSerialNumberGet(
        {
          client: this._client,
          path: { manufacturer, serial_number: serialNumber },
        },
      );
    if (!result.data) return null;
    const d = result.data;
    return {
      robotId,
      manufacturer: d.manufacturer,
      serialNumber: d.serialNumber,
      typeSpecification: d.typeSpecification
        ? {
            seriesName: d.typeSpecification.seriesName,
            seriesDescription: d.typeSpecification.seriesDescription,
            agvKinematic: d.typeSpecification.agvKinematic,
            agvClass: d.typeSpecification.agvClass,
            maxLoadMass: d.typeSpecification.maxLoadMass,
          }
        : undefined,
      physicalParameters: d.physicalParameters
        ? {
            speedMin: d.physicalParameters.speedMin,
            speedMax: d.physicalParameters.speedMax,
            accelerationMax: d.physicalParameters.accelerationMax,
            decelerationMax: d.physicalParameters.decelerationMax,
            heightMin: d.physicalParameters.heightMin,
            heightMax: d.physicalParameters.heightMax,
            widthMax: d.physicalParameters.widthMax,
            lengthMax: d.physicalParameters.lengthMax,
          }
        : undefined,
      agvActions: d.actions?.agvActions?.map((a) => ({
        actionType: a.actionType,
        actionDescription: a.actionDescription,
        actionScopes: a.actionScopes,
      })),
    };
  }

  private _splitId(
    robotId: string,
  ): { manufacturer: string; serial_number: string } | null {
    const slash = robotId.indexOf('/');
    if (slash < 1) return null;
    return {
      manufacturer: robotId.slice(0, slash),
      serial_number: robotId.slice(slash + 1),
    };
  }

  async sendStateRequest(robotId: string): Promise<InstantActionResult> {
    const path = this._splitId(robotId);
    if (!path) throw new Error(`Invalid robotId: ${robotId}`);
    const result =
      await VDA5050MasterAPI.Generated.stateRequestV1InstantActionsManufacturerSerialNumberStateRequestPost(
        {
          client: this._client,
          path,
        },
      );
    if (!result.data) throw new Error('No data returned');
    return mapInstantActionResult(result.data);
  }

  async sendFactsheetRequest(robotId: string): Promise<InstantActionResult> {
    const path = this._splitId(robotId);
    if (!path) throw new Error(`Invalid robotId: ${robotId}`);
    const result =
      await VDA5050MasterAPI.Generated.factsheetRequestV1InstantActionsManufacturerSerialNumberFactsheetRequestPost(
        {
          client: this._client,
          path,
        },
      );
    if (!result.data) throw new Error('No data returned');
    return mapInstantActionResult(result.data);
  }

  async sendAssignShortestPath(
    robotId: string,
    startNodeId: string,
    endNodeId: string,
    layoutId?: string,
    allowedDeviationXy?: number,
  ): Promise<InstantActionResult> {
    const path = this._splitId(robotId);
    if (!path) throw new Error(`Invalid robotId: ${robotId}`);
    const result =
      await VDA5050MasterAPI.Generated.assignOrderByShortestRouteV1OrdersManufacturerSerialNumberAssignShortestRoutePost(
        {
          client: this._client,
          path,
          body: {
            start_node_id: startNodeId,
            end_node_id: endNodeId,
            layout_id: layoutId ?? null,
            allowed_deviation_xy: allowedDeviationXy ?? null,
          },
        },
      );
    if (!result.data) throw new Error('No data returned');
    return {
      decision: result.data.decision,
      errors: result.data.errors.map((e) => ({
        errorType: e.errorType,
        errorLevel: e.errorLevel,
        errorDescription: e.errorDescription,
        errorReferences: e.errorReferences,
      })),
      actions: [],
    };
  }

  async sendInitPosition(robotId: string): Promise<InstantActionResult> {
    const path = this._splitId(robotId);
    if (!path) throw new Error(`Invalid robotId: ${robotId}`);
    const result =
      await VDA5050MasterAPI.Generated.initPositionV1InstantActionsManufacturerSerialNumberInitPositionPost(
        {
          client: this._client,
          path,
        },
      );
    if (!result.data) throw new Error('No data returned');
    return mapInstantActionResult(result.data);
  }

  async sendCustomInstantAction(
    robotId: string,
    actionType: string,
    blockingType = 'NONE',
    params?: Array<{ key: string; value: string | number | boolean }>,
  ): Promise<InstantActionResult> {
    const path = this._splitId(robotId);
    if (!path) throw new Error(`Invalid robotId: ${robotId}`);
    const result =
      await VDA5050MasterAPI.Generated.customInstantActionV1InstantActionsManufacturerSerialNumberCustomPost(
        {
          client: this._client,
          path,
          body: {
            action_type: actionType,
            blocking_type: blockingType,
            params,
          },
        },
      );
    if (!result.data) throw new Error('No data returned');
    return mapInstantActionResult(result.data);
  }

  getRobotColor(_robotId: string, index: number): string {
    return COLORS[index % COLORS.length];
  }

  getRobotImage(_robotId: string): string | null {
    return null;
  }
}
