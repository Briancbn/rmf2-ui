import { Vda5050MasterConfig } from '@/clients';
import { VDA5050MasterAPI } from '@rmf2-ui/client';
import type {
  InstantActionResult,
  IRobotClient,
  RobotFactsheet,
  RobotOrder,
  RobotState,
} from './robot-client-base';

const POLL_MS = 1000;

const COLORS = ['#3182ce', '#dd6b20', '#38a169', '#d53f8c', '#805ad5'];

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

function agvToRobotState(
  raw: VDA5050MasterAPI.Generated.AgvStatus,
): RobotState {
  const state = raw.state;
  const pos = state?.agvPosition;
  const battery = state?.batteryState;

  return {
    robotId: `${raw.manufacturer}/${raw.serial_number}`,
    x: pos?.x ?? null,
    y: pos?.y ?? null,
    theta: pos?.theta ?? null,
    batteryPercent: battery?.batteryCharge ?? null,
    operatingMode: state?.operatingMode ?? null,
    connection: raw.is_online ? 'ONLINE' : 'OFFLINE',
    actionStates: (state?.actionStates ?? []).map((a) => ({
      actionId: a.actionId,
      actionType: a.actionType,
      actionStatus: a.actionStatus,
      resultDescription: a.resultDescription ?? undefined,
    })),
    lastNodeId: state?.lastNodeId ?? null,
  };
}

export class Vda5050RobotClient implements IRobotClient {
  private readonly _client: ReturnType<typeof VDA5050MasterAPI.createClient>;

  constructor(baseUrl?: string) {
    const url = (
      baseUrl ??
      Vda5050MasterConfig.BASE ??
      'http://localhost:8000'
    ).replace(/\/$/, '');
    this._client = VDA5050MasterAPI.createClient(
      VDA5050MasterAPI.createConfig({ baseUrl: url }),
    );
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
    let cancelled = false;

    const poll = () => {
      this._fetchAgvs()
        .then((robots) => {
          if (!cancelled) callback(robots);
        })
        .catch(() => {});
    };

    poll();
    const id = setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
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
