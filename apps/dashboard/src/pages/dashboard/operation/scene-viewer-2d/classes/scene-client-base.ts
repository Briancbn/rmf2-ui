export interface SceneBackgroundImage {
  type: 'image';
  /** URL of the background PNG (may be a blob URL or absolute URL). */
  imageUrl: string;
  /**
   * Metres per pixel. Converts the image from pixel space into the same
   * coordinate system used by LIF node positions.
   */
  scale: number;
  /** Origin offset in map coordinates (metres). */
  offset: { x: number; y: number };
  /** Clockwise rotation of the image in degrees. */
  rotation: number;
}

export interface SceneBackgroundColor {
  type: 'color';
  /** Any CSS color string. Fills the entire viewport behind the map. */
  color: string;
}

export type SceneBackground = SceneBackgroundImage | SceneBackgroundColor;

export interface ISceneClient {
  getBackground(): Promise<SceneBackground | null>;
}
