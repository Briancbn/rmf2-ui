export type { MapData } from '../vda-visualiser/types';

// LIF (Layout Interchange Format) — VDA5050 standard layout exchange schema.

export interface LifNodePosition {
  x: number;
  y: number;
  theta: number | null;
  allowedDeviationXY?: number;
  allowedDeviationTheta?: number;
  mapId: string;
}

export interface LifNodeAction {
  actionType: string;
  actionId: string;
  blockingType: string;
  actionParameters?: Record<string, unknown>[];
}

export interface LifNode {
  nodeId: string;
  nodeName?: string;
  nodeDescription?: string;
  nodePosition: LifNodePosition;
  actions: LifNodeAction[];
}

export interface LifEdgeAction {
  actionType: string;
  actionId: string;
  blockingType: string;
  actionParameters?: Record<string, unknown>[];
}

export interface LifEdgeVehicleTypeProperty {
  vehicleTypeId: string;
  vehicleOrientation?: number | null;
  rotationAllowed?: boolean;
  maxSpeed?: number;
  maxHeight?: number;
  minHeight?: number;
  loadRestriction?: { loaded: boolean; unloaded: boolean };
}

export interface LifEdge {
  edgeId: string;
  edgeName?: string;
  edgeDescription?: string;
  startNodeId: string;
  endNodeId: string;
  actions: LifEdgeAction[];
  vehicleTypeEdgeProperties?: LifEdgeVehicleTypeProperty[];
}

export interface LifStationPosition {
  x: number;
  y: number;
  theta: number | null;
  allowedDeviationXY?: number;
  allowedDeviationTheta?: number;
  mapId: string;
}

export interface LifStation {
  stationId: string;
  stationName?: string;
  stationDescription?: string;
  stationHeight?: number;
  interactionNodeIds: string[];
  stationPosition: LifStationPosition;
}

export interface LifLayout {
  layoutId: string;
  layoutName?: string;
  layoutVersion?: string;
  layoutLevelId?: string;
  layoutDescription?: string;
  nodes: LifNode[];
  edges: LifEdge[];
  stations: LifStation[];
}

export interface LifMetaInformation {
  projectIdentification?: string;
  creator?: string;
  exportTimestamp?: string;
  lifVersion: string;
}

export interface LifData {
  metaInformation: LifMetaInformation;
  layouts: LifLayout[];
}
