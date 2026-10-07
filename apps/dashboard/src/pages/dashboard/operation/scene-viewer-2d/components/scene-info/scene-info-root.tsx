import { Flex, Tabs } from '@chakra-ui/react';
import type { ReactNode } from 'react';

const TABS = [
  { value: 'robots', label: 'Robots' },
  { value: 'orders', label: 'Orders' },
  { value: 'logs', label: 'Logs' },
] as const;

export function SceneInfoRoot({ children }: { children?: ReactNode }) {
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
        <Tabs.List flexShrink={0}>
          {TABS.map(({ value, label }) => (
            <Tabs.Trigger key={value} value={value}>
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {children}
      </Tabs.Root>
    </Flex>
  );
}
