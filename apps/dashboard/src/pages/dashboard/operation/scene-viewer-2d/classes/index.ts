export type { IMapClient } from './map-client-base';
export { FallbackMapClient } from './fallback-map-client';
export type {
  FallbackMapClientOptions,
  GridLayout,
  GridObstacle,
} from './fallback-map-client';

export type {
  ISceneClient,
  SceneBackground,
  SceneBackgroundImage,
  SceneBackgroundColor,
} from './scene-client-base';
export { FallbackSceneClient } from './fallback-scene-client';
export type { FallbackSceneClientOptions } from './fallback-scene-client';

export type { IRobotClient, RobotState } from './robot-client-base';
export { FallbackRobotClient } from './fallback-robot-client';
