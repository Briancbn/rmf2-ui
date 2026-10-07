import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { IMapClient } from '../../classes/map-client-base';
import { FallbackMapClient } from '../../classes/fallback-map-client';
import type { ISceneClient } from '../../classes/scene-client-base';
import { FallbackSceneClient } from '../../classes/fallback-scene-client';
import type { IRobotClient, RobotState } from '../../classes/robot-client-base';
import { FallbackRobotClient } from '../../classes/fallback-robot-client';

export type LoadStatus = 'loading' | 'success' | 'error';

export interface LoadMessage {
  title: string;
  description?: string;
}

export interface UseSceneViewer2DProps {
  mapClient?: IMapClient;
  sceneClient?: ISceneClient;
  robotClient?: IRobotClient;
}

interface ZoomState {
  zoom: number;
  listeners: Set<(zoom: number) => void>;
}

const DEFAULT_MAP_CLIENT: IMapClient = new FallbackMapClient({ delay: 2000 });
const DEFAULT_SCENE_CLIENT: ISceneClient =
  FallbackSceneClient.fromColor('#f3f4f6');
const DEFAULT_ROBOT_CLIENT: IRobotClient = new FallbackRobotClient();

export function useSceneViewer2D(props: UseSceneViewer2DProps = {}) {
  const mapClient = props.mapClient ?? DEFAULT_MAP_CLIENT;
  const sceneClient = props.sceneClient ?? DEFAULT_SCENE_CLIENT;
  const robotClient = props.robotClient ?? DEFAULT_ROBOT_CLIENT;

  const [loadStatus, setLoadStatus] = useState<LoadStatus>('loading');
  const [loadMessage, setLoadMessage] = useState<LoadMessage | undefined>();

  // Single ref for live zoom state: avoids two separate refs for value and listeners.
  const zoomRef = useRef<ZoomState>({ zoom: 100, listeners: new Set() });
  // notifyZoom: called by viewport after each zoom update; propagates to all registered listeners.
  const notifyZoom = useCallback((zoom: number) => {
    zoomRef.current.zoom = zoom;
    zoomRef.current.listeners.forEach((cb) => cb(zoom));
  }, []);
  // registerZoomListener: returns a cleanup function to unregister.
  const registerZoomListener = useCallback((cb: (zoom: number) => void) => {
    zoomRef.current.listeners.add(cb);
    return () => {
      zoomRef.current.listeners.delete(cb);
    };
  }, []);

  const [robots, setRobots] = useState<RobotState[]>([]);
  useEffect(() => robotClient.subscribeRobotStates(setRobots), [robotClient]);
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);

  // targetZoom: set by controls to request a zoom change; viewport effect applies it.
  const [targetZoom, setTargetZoom] = useState(100);
  // fitMode: what to fit the view to.
  const [fitMode, setFitMode] = useState<'map' | 'robots' | 'all'>('map');
  // fitTrigger: incrementing this re-runs the fit even if fitMode hasn't changed.
  const [fitTrigger, setFitTrigger] = useState(0);
  const triggerFit = useCallback(() => setFitTrigger((n) => n + 1), []);

  // Deliberately NOT wrapped in useMemo here — packaging into a memoized
  // context value is the provider's job (SceneViewer2DRoot).
  return {
    mapClient,
    sceneClient,
    loadStatus,
    setLoadStatus,
    loadMessage,
    setLoadMessage,
    zoomRef,
    notifyZoom,
    registerZoomListener,
    targetZoom,
    setTargetZoom,
    fitMode,
    setFitMode,
    triggerFit,
    fitTrigger,
    robotClient,
    robots,
    selectedRobotId,
    setSelectedRobotId,
  };
}

export type UseSceneViewer2DReturn = ReturnType<typeof useSceneViewer2D>;

export const SceneViewer2DContext = createContext<
  UseSceneViewer2DReturn | undefined
>(undefined);

const useSceneViewer2DContext = () => {
  const ctx = useContext(SceneViewer2DContext);
  if (ctx === undefined) {
    throw new Error(
      'useSceneViewer2DContext must be inside a SceneViewer2DContext.Provider',
    );
  }
  return ctx;
};

export function useSceneViewer2DLoadingOverlay() {
  const { loadStatus, loadMessage } = useSceneViewer2DContext();
  return { loadStatus, loadMessage };
}

export function useSceneViewer2DViewport() {
  const {
    mapClient,
    sceneClient,
    setLoadStatus,
    setLoadMessage,
    notifyZoom,
    targetZoom,
    fitMode,
    fitTrigger,
    robots,
    selectedRobotId,
  } = useSceneViewer2DContext();
  return {
    mapClient,
    sceneClient,
    setLoadStatus,
    setLoadMessage,
    notifyZoom,
    targetZoom,
    fitMode,
    fitTrigger,
    robots,
    selectedRobotId,
  };
}

export function useSceneViewer2DRobots() {
  const { robots, robotClient, selectedRobotId, setSelectedRobotId } =
    useSceneViewer2DContext();
  return { robots, robotClient, selectedRobotId, setSelectedRobotId };
}

export function useSceneViewer2DControls() {
  const {
    registerZoomListener,
    setTargetZoom,
    fitMode,
    setFitMode,
    triggerFit,
  } = useSceneViewer2DContext();
  return {
    registerZoomListener,
    setTargetZoom,
    fitMode,
    setFitMode,
    triggerFit,
  };
}
