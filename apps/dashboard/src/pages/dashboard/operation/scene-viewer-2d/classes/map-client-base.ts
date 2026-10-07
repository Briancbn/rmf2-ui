import type { LifData } from '../types';

export interface IMapClient {
  getMapData(): Promise<LifData>;
}
