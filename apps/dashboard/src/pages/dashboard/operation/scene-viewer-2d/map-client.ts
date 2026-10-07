import type { IMapClient } from './classes/map-client-base';
import type { LifData } from './types';

export interface MapClientOptions {
  /** Ordered list of URLs to attempt. The first successful response is returned. */
  urls: string[];
}

export class MapClient implements IMapClient {
  private _urls: string[];

  constructor(options: MapClientOptions) {
    this._urls = options.urls;
  }

  async getMapData(): Promise<LifData> {
    let lastError: unknown;
    for (const url of this._urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
        return res.json() as Promise<LifData>;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError ?? new Error('MapClient: no URLs provided');
  }
}
