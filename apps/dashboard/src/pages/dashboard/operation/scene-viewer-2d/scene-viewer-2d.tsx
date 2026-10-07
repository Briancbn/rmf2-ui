import { SceneViewer2D } from './components';
import { SceneViewer2DRobotPanel } from './components/scene-viewer-2d-robot-panel';
import { MapClient } from './map-client';
import { Vda5050MasterConfig } from '@/clients';
import { Horizon } from '@rmf2-ui/chakra';
import Card = Horizon.Card;

const BASE = (Vda5050MasterConfig.BASE ?? 'http://localhost:8000').replace(
  /\/$/,
  '',
);
const mapClient = new MapClient({ urls: [`${BASE}/v1/layout/download`] });

export function SceneViewer2DPage() {
  return (
    <Card>
      <SceneViewer2D.Root mapClient={mapClient}>
        <SceneViewer2D.ViewportPositioner>
          <SceneViewer2D.Viewport />
          <SceneViewer2D.Controls />
          <SceneViewer2D.AxisDisplay />
          <SceneViewer2D.LoadingOverlay />
        </SceneViewer2D.ViewportPositioner>

        <SceneViewer2DRobotPanel />
      </SceneViewer2D.Root>
    </Card>
  );
}

export default SceneViewer2DPage;
