import { Flex } from '@chakra-ui/react';
import { Horizon } from '@rmf2-ui/chakra';
import { RobotPanel } from '../scene-viewer-2d/components/robot-panel';
import { Vda5050RobotClient } from '../scene-viewer-2d/classes/vda5050-robot-client';

import HorizonCard = Horizon.Card;

const robotClient = new Vda5050RobotClient();

export function DevicePage() {
  return (
    <HorizonCard
      h={{ base: 'auto', xl: 'calc(100vh - 200px)' }}
      minH="440px"
      overflow="hidden"
    >
      <RobotPanel.Root
        robotClient={robotClient}
        initialExpanded
        autoSelectFirst
      >
        <Flex
          direction="row"
          gap={4}
          flex="1"
          minH={0}
          h="100%"
          overflow="hidden"
        >
          <Flex direction="column" flex="1" minH={0} overflowY="auto">
            <RobotPanel.InfoList alwaysVisible />
          </Flex>
          <Flex
            direction="column"
            w="400px"
            flexShrink={0}
            minH={0}
            overflowY="auto"
          >
            <RobotPanel.SelectedCard />
          </Flex>
        </Flex>
      </RobotPanel.Root>
    </HorizonCard>
  );
}

export default DevicePage;
