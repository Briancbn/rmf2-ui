import type {
  IRobotClient,
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
  },
  {
    robotId: 'robot-2',
    x: 2,
    y: 3,
    theta: Math.PI / 2,
    batteryPercent: 45,
    operatingMode: 'IDLE',
  },
  {
    robotId: 'robot-3',
    x: -3,
    y: 1,
    theta: Math.PI,
    batteryPercent: 18,
    operatingMode: 'CHARGING',
  },
];

export class FallbackRobotClient implements IRobotClient {
  private readonly _robots: RobotState[];

  constructor(robots: RobotState[] = DEFAULT_ROBOTS) {
    this._robots = robots;
  }

  async getRobots(): Promise<RobotState[]> {
    return this._robots;
  }

  subscribeRobotStates(callback: (robots: RobotState[]) => void): () => void {
    callback(this._robots);
    return () => {};
  }

  async getOrders(skip = 0, limit = 100): Promise<RobotOrder[]> {
    return ([] as RobotOrder[]).slice(skip, skip + limit);
  }

  async getFactsheets(skip = 0, limit = 100): Promise<RobotFactsheet[]> {
    const sheets: RobotFactsheet[] = this._robots.map((r) => ({
      robotId: r.robotId,
      manufacturer: 'Fallback Inc.',
      serialNumber: r.robotId.toUpperCase(),
    }));
    return sheets.slice(skip, skip + limit);
  }
}
