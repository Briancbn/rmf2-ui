import { Card, Separator, Stack } from '@chakra-ui/react';
import { SceneViewer2D } from './components/scene-viewer-2d';
import { SceneInfo } from './components/scene-info';
import { RobotPanel } from './components/robot-panel';
import { PlanPanel } from './components/plan-panel';
import { MapClient } from './map-client';
import { Vda5050RobotClient } from './classes/vda5050-robot-client';
import { PlanClient } from './classes/plan-client';
import { Vda5050MasterConfig } from '@/clients';
import { Horizon } from '@rmf2-ui/chakra';
import HorizonCard = Horizon.Card;

const BASE = (
  Vda5050MasterConfig.BASE ?? 'http://localhost:8080/vda5050_master'
).replace(/\/$/, '');
const mapClient = new MapClient({ urls: [`${BASE}/v1/layout/download`] });
const robotClient = new Vda5050RobotClient();
const planClient = new PlanClient();

export function SceneViewer2DPage() {
  return (
    <HorizonCard>
      <SceneViewer2D.Root
        mapClient={mapClient}
        robotClient={robotClient}
        planClient={planClient}
      >
        <SceneViewer2D.ViewportPositioner>
          <SceneViewer2D.Viewport />
          <SceneViewer2D.Controls />
          <SceneViewer2D.AxisDisplay />
          <SceneViewer2D.LoadingOverlay />
        </SceneViewer2D.ViewportPositioner>

        <SceneInfo.Root>
          <SceneInfo.RobotContent>
            <SceneViewer2D.RobotPanel>
              <RobotPanel.InfoList />
              <RobotPanel.SelectedCard />
            </SceneViewer2D.RobotPanel>
          </SceneInfo.RobotContent>
          <SceneInfo.PlanContent>
            <SceneViewer2D.PlanPanel>
              <Stack gap={3} flex="1" minH={0}>
                <Card.Root variant="subtle" size="sm">
                  <Card.Body p={3}>
                    <PlanPanel.PlanActions />
                  </Card.Body>
                </Card.Root>
                <Separator />
                <Card.Root flex="1" minH={0} variant="subtle" size="sm">
                  <Card.Body
                    display="flex"
                    flexDirection="column"
                    gap={3}
                    overflow="hidden"
                    p={3}
                  >
                    <PlanPanel.Scrubber />
                    <PlanPanel.PlanInfo />
                  </Card.Body>
                </Card.Root>
              </Stack>
            </SceneViewer2D.PlanPanel>
          </SceneInfo.PlanContent>
        </SceneInfo.Root>
      </SceneViewer2D.Root>
    </HorizonCard>
  );
}

export default SceneViewer2DPage;
