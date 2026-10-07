import type {
  LifData,
  LifLayout,
  LifMetaInformation,
  LifNode,
  LifEdge,
} from '../types';
import type { IMapClient } from './map-client-base';

const FALLBACK_LIF_VERSION = '1.1.0';

/** A blocked cell — nodes are still created but no edges connect to them. */
export interface GridObstacle {
  row: number;
  col: number;
}

export interface GridLayout {
  layoutId: string;
  layoutName?: string;
  /** Number of grid rows. Default: 5 */
  rows?: number;
  /** Number of grid columns. Default: 5 */
  cols?: number;
  /** Distance between adjacent nodes in metres. Default: 1 */
  spacing?: number;
  obstacles?: GridObstacle[];
}

export interface FallbackMapClientOptions {
  gridLayouts?: GridLayout[];
  metaInformation?: Partial<LifMetaInformation>;
  /** Artificial delay before getMapData resolves, in milliseconds. Default: 0 */
  delay?: number;
}

const DEFAULT_GRID_LAYOUTS: GridLayout[] = [
  { layoutId: 'fallback', layoutName: 'Fallback Grid' },
];

export class FallbackMapClient implements IMapClient {
  private readonly _lifData: LifData;
  private readonly _delay: number;

  /** Create from a pre-built LIF JSON object (e.g. imported from a .json file). */
  static fromJson(
    lifData: LifData,
    options: Pick<FallbackMapClientOptions, 'delay'> = {},
  ): FallbackMapClient {
    return new FallbackMapClient({ delay: options.delay }, lifData);
  }

  constructor(options: FallbackMapClientOptions = {}, lifData?: LifData) {
    this._delay = options.delay ?? 0;

    if (lifData) {
      this._lifData = lifData;
      return;
    }

    const gridLayouts =
      options.gridLayouts && options.gridLayouts.length > 0
        ? options.gridLayouts
        : DEFAULT_GRID_LAYOUTS;

    const metaInformation: LifMetaInformation = {
      projectIdentification: 'fallback-grid',
      creator: 'FallbackMapClient',
      lifVersion: FALLBACK_LIF_VERSION,
      ...options.metaInformation,
    };

    this._lifData = {
      metaInformation,
      layouts: gridLayouts.map((l) => this._buildLayout(l)),
    };
  }

  async getMapData(): Promise<LifData> {
    if (this._delay > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, this._delay));
    }
    return this._lifData;
  }

  private _buildLayout(config: GridLayout): LifLayout {
    const rows = config.rows ?? 5;
    const cols = config.cols ?? 5;
    const spacing = config.spacing ?? 1;
    const obstacleSet = new Set(
      (config.obstacles ?? []).map(({ row, col }) => `${row}:${col}`),
    );

    return {
      layoutId: config.layoutId,
      layoutName: config.layoutName ?? config.layoutId,
      layoutVersion: '1.0.0',
      nodes: this._buildNodes(config.layoutId, rows, cols, spacing),
      edges: this._buildEdges(rows, cols, obstacleSet),
      stations: [],
    };
  }

  private _nodeId(index: number): string {
    return `P${index + 1}`;
  }

  private _edgeId(index: number): string {
    return `E${index + 1}`;
  }

  private _buildNodes(
    mapId: string,
    rows: number,
    cols: number,
    spacing: number,
  ): LifNode[] {
    const nodes: LifNode[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row * cols + col;
        nodes.push({
          nodeId: this._nodeId(index),
          nodeName: `P${index + 1}`,
          nodePosition: {
            x: col * spacing,
            y: row * spacing,
            theta: null,
            mapId,
          },
          actions: [],
        });
      }
    }
    return nodes;
  }

  private _buildEdges(
    rows: number,
    cols: number,
    obstacleSet: Set<string>,
  ): LifEdge[] {
    const edges: LifEdge[] = [];
    let edgeIndex = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (obstacleSet.has(`${row}:${col}`)) continue;

        const fromIndex = row * cols + col;

        // Horizontal: (row, col) → (row, col+1)
        if (col + 1 < cols && !obstacleSet.has(`${row}:${col + 1}`)) {
          edges.push({
            edgeId: this._edgeId(edgeIndex++),
            startNodeId: this._nodeId(fromIndex),
            endNodeId: this._nodeId(row * cols + (col + 1)),
            actions: [],
          });
        }

        // Vertical: (row, col) → (row+1, col)
        if (row + 1 < rows && !obstacleSet.has(`${row + 1}:${col}`)) {
          edges.push({
            edgeId: this._edgeId(edgeIndex++),
            startNodeId: this._nodeId(fromIndex),
            endNodeId: this._nodeId((row + 1) * cols + col),
            actions: [],
          });
        }
      }
    }

    return edges;
  }
}
