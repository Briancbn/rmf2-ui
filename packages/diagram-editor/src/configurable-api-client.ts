import { from, type Observable } from 'rxjs';
import type {
  BaseApiClient,
  CompatibilityRequest,
  CompatibilityResponse,
  Diagram,
  DiagramElementMetadata,
  PostRunRequest,
} from 'crossflow-diagram-editor/lib';
import { getSchema, InteractionSession } from 'crossflow-diagram-editor/lib';

const validateRegistry = getSchema<DiagramElementMetadata>(
  'DiagramElementMetadata',
);

async function getErrorMessage(response: Response): Promise<string> {
  const text = await response.text();
  return text || `${response.status} ${response.statusText}`;
}

export class ConfigurableApiClient implements BaseApiClient {
  constructor(private readonly baseUrl: string = '') {}

  private url(path: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}${path}`;
  }

  getRegistry(): Observable<DiagramElementMetadata> {
    return from(
      (async () => {
        const response = await fetch(this.url('/api/registry'));
        if (!response.ok) throw new Error(await getErrorMessage(response));
        const data = await response.json();
        if (!validateRegistry(data)) throw validateRegistry.errors;
        return data;
      })(),
    );
  }

  postRunWorkflow(diagram: Diagram, request: unknown): Observable<unknown> {
    return from(
      (async () => {
        const body: PostRunRequest = { diagram, request };
        const response = await fetch(this.url('/api/executor/run'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(await getErrorMessage(response));
        return response.json();
      })(),
    );
  }

  checkCompatibility(
    request: CompatibilityRequest,
  ): Observable<CompatibilityResponse> {
    return from(
      (async () => {
        const response = await fetch(this.url('/api/executor/compatibility'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });
        if (!response.ok) throw new Error(await getErrorMessage(response));
        return response.json();
      })(),
    );
  }

  async wsInteractWithWorkflow(
    diagram: Diagram,
    request: unknown,
  ): Promise<InteractionSession> {
    const base = this.baseUrl.replace(/\/$/, '');
    const wsBase = base
      ? base.replace(/^https?:\/\//, (m) =>
          m === 'https://' ? 'wss://' : 'ws://',
        )
      : (() => {
          const u = new URL('/api/executor/interaction', window.location.href);
          u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
          return u.origin;
        })();

    const ws = new WebSocket(`${wsBase}/api/executor/interaction`);
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        const session = new InteractionSession(ws);
        const body: PostRunRequest = { diagram, request };
        ws.send(JSON.stringify(body));
        resolve(session);
      };
      ws.onerror = () => reject(new Error('interaction websocket error'));
    });
  }
}
