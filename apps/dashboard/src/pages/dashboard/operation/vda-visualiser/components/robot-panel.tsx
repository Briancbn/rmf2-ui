// Tabs column: Robots / MAPF sim / Logs. Height matches the measured map row.
import { Flex, HStack, Tabs } from '@chakra-ui/react';

import { useVdaRow } from './use-vda-visualiser';
import { LogsPanel } from './logs-panel';
import { MapfSimPanel } from './mapf-sim-panel';
import { OrdersPanel } from './orders-panel';
import { NavControls } from './nav-controls';
import { RobotCards } from './robot-cards';

export function RobotPanel() {
  const { rowHeightCss } = useVdaRow();

  return (
    <Flex
      direction="column"
      w={{ base: '100%', xl: '360px' }}
      flexShrink={0}
      h={rowHeightCss ?? 'calc(100vh - 200px)'}
      minH="440px"
    >
      <Tabs.Root
        defaultValue="robots"
        variant="plain"
        lazyMount
        unmountOnExit
        display="flex"
        flexDirection="column"
        flex="1"
        minH={0}
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="lg"
        overflow="hidden"
      >
        <HStack
          flexShrink={0}
          align="center"
          px={3}
          pt={0}
          pb={2}
          borderBottomWidth="1px"
          borderColor="border.subtle"
          gap={2}
        >
          <Tabs.List
            border="none"
            position="relative"
            bg="bg.muted"
            borderRadius="md"
            p="1"
            gap="1"
          >
            <Tabs.Trigger
              value="robots"
              color="fg.muted"
              fontWeight="medium"
              transition="color 0.2s ease"
              _selected={{ color: 'fg' }}
            >
              Robots
            </Tabs.Trigger>
            <Tabs.Trigger
              value="mapf"
              color="fg.muted"
              fontWeight="medium"
              transition="color 0.2s ease"
              _selected={{ color: 'fg' }}
            >
              MAPF sim
            </Tabs.Trigger>
            <Tabs.Trigger
              value="logs"
              color="fg.muted"
              fontWeight="medium"
              transition="color 0.2s ease"
              _selected={{ color: 'fg' }}
            >
              Logs
            </Tabs.Trigger>
            <Tabs.Trigger
              value="orders"
              color="fg.muted"
              fontWeight="medium"
              transition="color 0.2s ease"
              _selected={{ color: 'fg' }}
            >
              Orders
            </Tabs.Trigger>
            <Tabs.Indicator borderRadius="none" bg="bg" boxShadow="sm" />
          </Tabs.List>
        </HStack>

        <Tabs.Content
          value="robots"
          display="flex"
          flexDirection="column"
          flex="1"
          minH={0}
          p={0}
        >
          <Flex
            flex="1"
            overflowY="auto"
            minH={0}
            px={3}
            pt={1}
            pb={3}
            direction="column"
          >
            <RobotCards />
          </Flex>
          <Flex
            flexShrink={0}
            borderTopWidth="1px"
            borderColor="border.subtle"
            px={3}
            pt={3}
            pb={0}
          >
            <NavControls />
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="mapf" flex="1" minH={0} overflowY="auto" p={3}>
          <MapfSimPanel />
        </Tabs.Content>

        <Tabs.Content
          value="logs"
          display="flex"
          flexDirection="column"
          flex="1"
          minH={0}
          p={3}
        >
          <LogsPanel />
        </Tabs.Content>

        <Tabs.Content
          value="orders"
          display="flex"
          flexDirection="column"
          flex="1"
          minH={0}
          p={3}
        >
          <OrdersPanel />
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  );
}
