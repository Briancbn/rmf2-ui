export type RobotConnection = 'ONLINE' | 'OFFLINE';

export type RobotActionStatus =
  | 'WAITING'
  | 'INITIALIZING'
  | 'RUNNING'
  | 'PAUSED'
  | 'FINISHED'
  | 'FAILED';

export interface RobotActionState {
  actionId: string;
  actionType?: string;
  actionStatus: RobotActionStatus;
  resultDescription?: string;
}

export interface RobotState {
  robotId: string;
  x: number | null;
  y: number | null;
  /** Heading in radians, 0 = +X, CCW positive (LIF/VDA5050 convention). */
  theta: number | null;
  batteryPercent: number | null;
  operatingMode: string | null;
  connection: RobotConnection | null;
  actionStates: RobotActionState[];
  lastNodeId: string | null;
}

export interface RobotOrder {
  orderId: string;
  robotId: string;
  status: string;
}

export interface RobotFactsheetTypeSpec {
  seriesName?: string;
  seriesDescription?: string;
  agvKinematic?: string;
  agvClass?: string;
  maxLoadMass?: number;
}

export interface RobotFactsheetPhysical {
  speedMin?: number;
  speedMax?: number;
  accelerationMax?: number;
  decelerationMax?: number;
  heightMin?: number;
  heightMax?: number;
  widthMax?: number;
  lengthMax?: number;
}

export interface RobotFactsheetAction {
  actionType: string;
  actionDescription?: string;
  actionScopes: Array<'INSTANT' | 'NODE' | 'EDGE'>;
}

export interface RobotFactsheet {
  robotId: string;
  manufacturer: string;
  serialNumber: string;
  typeSpecification?: RobotFactsheetTypeSpec;
  physicalParameters?: RobotFactsheetPhysical;
  agvActions?: RobotFactsheetAction[];
  [key: string]: unknown;
}

export interface InstantActionError {
  errorType: string;
  errorLevel: 'WARNING' | 'FATAL';
  errorDescription?: string;
  errorReferences?: Array<{ referenceKey: string; referenceValue: string }>;
}

export interface InstantActionItem {
  actionId: string;
  actionType: string;
  blockingType: 'NONE' | 'SOFT' | 'HARD';
}

export interface InstantActionResult {
  decision: string;
  errors: InstantActionError[];
  actions: InstantActionItem[];
}

export interface IRobotClient {
  getRobots(): Promise<RobotState[]>;
  subscribeRobotStates(callback: (robots: RobotState[]) => void): () => void;
  getOrders(skip?: number, limit?: number): Promise<RobotOrder[]>;
  getFactsheet(robotId: string): Promise<RobotFactsheet | null>;
  sendStateRequest(robotId: string): Promise<InstantActionResult>;
  sendFactsheetRequest(robotId: string): Promise<InstantActionResult>;
  sendInitPosition(robotId: string): Promise<InstantActionResult>;
  sendAssignShortestPath(
    robotId: string,
    startNodeId: string,
    endNodeId: string,
    layoutId?: string,
    allowedDeviationXy?: number,
  ): Promise<InstantActionResult>;
  sendCustomInstantAction(
    robotId: string,
    actionType: string,
    blockingType?: string,
    params?: Array<{ key: string; value: string | number | boolean }>,
  ): Promise<InstantActionResult>;
  /** Deterministic display color for a robot. `index` is the robot's position in the list as a palette fallback. */
  getRobotColor(robotId: string, index: number): string;
  /** Optional image URL for a robot's avatar, or null if none. */
  getRobotImage(robotId: string): string | null;
}
