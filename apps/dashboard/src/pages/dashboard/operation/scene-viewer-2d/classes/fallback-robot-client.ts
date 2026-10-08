import type {
  InstantActionResult,
  IRobotClient,
  RobotActionState,
  RobotFactsheet,
  RobotOrder,
  RobotState,
} from './robot-client-base';

const DEFAULT_ROBOTS: RobotState[] = [
  {
    robotId: 'robot-1',
    x: 0,
    y: 0,
    theta: 0,
    batteryPercent: 82,
    operatingMode: 'DRIVING',
    connection: 'ONLINE',
    actionStates: [],
    lastNodeId: 'node-1',
  },
  {
    robotId: 'robot-2',
    x: 2,
    y: 3,
    theta: Math.PI / 2,
    batteryPercent: 45,
    operatingMode: 'IDLE',
    connection: 'ONLINE',
    actionStates: [],
    lastNodeId: 'node-5',
  },
  {
    robotId: 'robot-3',
    x: -3,
    y: 1,
    theta: Math.PI,
    batteryPercent: 18,
    operatingMode: null,
    connection: 'OFFLINE',
    actionStates: [],
    lastNodeId: null,
  },
];

const FALLBACK_COLORS = ['#3182ce', '#dd6b20', '#38a169', '#d53f8c', '#805ad5'];

export class FallbackRobotClient implements IRobotClient {
  private _robots: RobotState[];
  private readonly _listeners = new Set<(robots: RobotState[]) => void>();

  constructor(robots: RobotState[] = DEFAULT_ROBOTS) {
    this._robots = robots.map((r) => ({
      ...r,
      actionStates: [...r.actionStates],
    }));
  }

  private _notify() {
    const snapshot = this._robots.map((r) => ({
      ...r,
      actionStates: [...r.actionStates],
    }));
    this._listeners.forEach((cb) => cb(snapshot));
  }

  private _updateActionState(
    robotId: string,
    actionId: string,
    patch: Partial<RobotActionState>,
  ) {
    this._robots = this._robots.map((r) => {
      if (r.robotId !== robotId) return r;
      return {
        ...r,
        actionStates: r.actionStates.map((a) =>
          a.actionId === actionId ? { ...a, ...patch } : a,
        ),
      };
    });
    this._notify();
  }

  private _addActionState(robotId: string, action: RobotActionState) {
    this._robots = this._robots.map((r) => {
      if (r.robotId !== robotId) return r;
      return { ...r, actionStates: [...r.actionStates, action] };
    });
    this._notify();
  }

  async getRobots(): Promise<RobotState[]> {
    return this._robots.map((r) => ({
      ...r,
      actionStates: [...r.actionStates],
    }));
  }

  subscribeRobotStates(callback: (robots: RobotState[]) => void): () => void {
    this._listeners.add(callback);
    callback(
      this._robots.map((r) => ({ ...r, actionStates: [...r.actionStates] })),
    );
    return () => this._listeners.delete(callback);
  }

  async getOrders(skip = 0, limit = 100): Promise<RobotOrder[]> {
    return ([] as RobotOrder[]).slice(skip, skip + limit);
  }

  async getFactsheet(robotId: string): Promise<RobotFactsheet | null> {
    const robot = this._robots.find((r) => r.robotId === robotId);
    if (!robot) return null;
    return {
      robotId: robot.robotId,
      manufacturer: 'Fallback Inc.',
      serialNumber: robot.robotId.toUpperCase(),
      typeSpecification: {
        seriesName: 'Fallback Series',
        agvKinematic: 'DIFF',
        agvClass: 'CARRIER',
      },
      physicalParameters: { speedMax: 1.5, accelerationMax: 0.5 },
      agvActions: [
        {
          actionType: 'startPause',
          actionDescription: 'Pause the AGV',
          actionScopes: ['INSTANT', 'NODE'],
        },
        {
          actionType: 'stopPause',
          actionDescription: 'Resume from pause',
          actionScopes: ['INSTANT', 'NODE'],
        },
        {
          actionType: 'startCharging',
          actionDescription: 'Start charging',
          actionScopes: ['INSTANT', 'NODE'],
        },
        {
          actionType: 'stopCharging',
          actionDescription: 'Stop charging',
          actionScopes: ['INSTANT', 'NODE'],
        },
        {
          actionType: 'pickLoad',
          actionDescription: 'Pick up load',
          actionScopes: ['NODE', 'EDGE'],
        },
        {
          actionType: 'dropLoad',
          actionDescription: 'Drop load',
          actionScopes: ['NODE', 'EDGE'],
        },
      ],
    };
  }

  private _dispatchAction(
    robotId: string,
    actionType: string,
    blockingType: 'NONE' | 'SOFT' | 'HARD',
  ): InstantActionResult {
    const actionId = crypto.randomUUID();

    this._addActionState(robotId, {
      actionId,
      actionType,
      actionStatus: 'WAITING',
    });

    setTimeout(() => {
      this._updateActionState(robotId, actionId, {
        actionStatus: 'INITIALIZING',
      });
    }, 500);

    setTimeout(() => {
      this._updateActionState(robotId, actionId, { actionStatus: 'RUNNING' });
    }, 1200);

    setTimeout(() => {
      this._updateActionState(robotId, actionId, {
        actionStatus: 'FINISHED',
        resultDescription: `${actionType} completed`,
      });
    }, 3000);

    return {
      decision: 'ACCEPTED',
      errors: [],
      actions: [{ actionId, actionType, blockingType }],
    };
  }

  async sendStateRequest(robotId: string): Promise<InstantActionResult> {
    return this._dispatchAction(robotId, 'stateRequest', 'NONE');
  }

  async sendFactsheetRequest(robotId: string): Promise<InstantActionResult> {
    return this._dispatchAction(robotId, 'factsheetRequest', 'NONE');
  }

  async sendInitPosition(robotId: string): Promise<InstantActionResult> {
    return this._dispatchAction(robotId, 'initPosition', 'SOFT');
  }

  async sendAssignShortestPath(
    _robotId: string,
    _startNodeId: string,
    _endNodeId: string,
    _layoutId?: string,
    _allowedDeviationXy?: number,
  ): Promise<InstantActionResult> {
    return { decision: 'ACCEPTED', errors: [], actions: [] };
  }

  async sendCustomInstantAction(
    robotId: string,
    actionType: string,
    blockingType = 'NONE',
    _params?: Array<{ key: string; value: string | number | boolean }>,
  ): Promise<InstantActionResult> {
    return this._dispatchAction(
      robotId,
      actionType,
      blockingType as 'NONE' | 'SOFT' | 'HARD',
    );
  }

  getRobotColor(_robotId: string, index: number): string {
    return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  }

  getRobotImage(_robotId: string): string | null {
    return null;
  }
}
