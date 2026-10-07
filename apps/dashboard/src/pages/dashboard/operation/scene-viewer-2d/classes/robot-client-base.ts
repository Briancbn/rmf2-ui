export interface RobotState {
  robotId: string;
  x: number | null;
  y: number | null;
  /** Heading in radians, 0 = +X, CCW positive (LIF/VDA5050 convention). */
  theta: number | null;
  batteryPercent: number | null;
  operatingMode: string | null;
}

export interface RobotOrder {
  orderId: string;
  robotId: string;
  status: string;
}

export interface RobotFactsheet {
  robotId: string;
  manufacturer: string;
  serialNumber: string;
  [key: string]: unknown;
}

export interface IRobotClient {
  getRobots(): Promise<RobotState[]>;
  subscribeRobotStates(callback: (robots: RobotState[]) => void): () => void;
  getOrders(skip?: number, limit?: number): Promise<RobotOrder[]>;
  getFactsheets(skip?: number, limit?: number): Promise<RobotFactsheet[]>;
}
