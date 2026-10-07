import type {
  ISceneClient,
  SceneBackground,
  SceneBackgroundImage,
} from './scene-client-base';

export interface FallbackSceneClientOptions {
  /** Artificial delay before getBackground resolves, in milliseconds. Default: 0 */
  delay?: number;
}

/** Returns a fixed background (or null) — useful for development and testing. */
export class FallbackSceneClient implements ISceneClient {
  private readonly _background: SceneBackground | null;
  private readonly _delay: number;

  static fromColor(
    color: string,
    options: FallbackSceneClientOptions = {},
  ): FallbackSceneClient {
    return new FallbackSceneClient({ type: 'color', color }, options);
  }

  static fromImage(
    imageUrl: string,
    meta: Omit<SceneBackgroundImage, 'type' | 'imageUrl'>,
    options: FallbackSceneClientOptions = {},
  ): FallbackSceneClient {
    return new FallbackSceneClient(
      { type: 'image', imageUrl, ...meta },
      options,
    );
  }

  private constructor(
    background: SceneBackground | null,
    options: FallbackSceneClientOptions = {},
  ) {
    this._background = background;
    this._delay = options.delay ?? 0;
  }

  async getBackground(): Promise<SceneBackground | null> {
    if (this._delay > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, this._delay));
    }
    return this._background;
  }
}
