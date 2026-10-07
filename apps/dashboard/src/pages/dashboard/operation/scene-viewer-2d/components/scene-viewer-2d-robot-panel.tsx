import { Flex, HStack, Tabs } from '@chakra-ui/react';

const TABS = [
  { value: 'robots', label: 'Robots' },
  { value: 'logs', label: 'Logs' },
  { value: 'orders', label: 'Orders' },
] as const;

export function SceneViewer2DRobotPanel() {
  return (
    <Flex
      direction="column"
      w={{ base: '100%', xl: '360px' }}
      flexShrink={0}
      h="100%"
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
          px={3}
          pb={2}
          borderBottomWidth="1px"
          borderColor="border.subtle"
        >
          <Tabs.List
            border="none"
            bg="bg.muted"
            borderRadius="md"
            p="1"
            gap="1"
          >
            {TABS.map(({ value, label }) => (
              <Tabs.Trigger
                key={value}
                value={value}
                color="fg.muted"
                fontWeight="medium"
                transition="color 0.2s ease"
                _selected={{ color: 'fg' }}
              >
                {label}
              </Tabs.Trigger>
            ))}
            <Tabs.Indicator borderRadius="none" bg="bg" boxShadow="sm" />
          </Tabs.List>
        </HStack>

        <Tabs.Content
          value="robots"
          display="flex"
          flexDirection="column"
          flex="1"
          minH={0}
          overflowY="auto"
          p={3}
        />
        <Tabs.Content
          value="logs"
          display="flex"
          flexDirection="column"
          flex="1"
          minH={0}
          overflowY="auto"
          p={3}
        />
        <Tabs.Content
          value="orders"
          display="flex"
          flexDirection="column"
          flex="1"
          minH={0}
          overflowY="auto"
          p={3}
        />
      </Tabs.Root>
    </Flex>
  );
}
