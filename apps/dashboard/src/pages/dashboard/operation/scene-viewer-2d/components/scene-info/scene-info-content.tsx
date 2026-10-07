import { Tabs } from '@chakra-ui/react';
import type { ReactNode } from 'react';

const tabContentProps = {
  display: 'flex',
  flexDirection: 'column' as const,
  flex: '1',
  minH: 0,
  overflowY: 'auto' as const,
  p: 3,
};

export function SceneInfoRobotContent({ children }: { children?: ReactNode }) {
  return (
    <Tabs.Content value="robots" {...tabContentProps}>
      {children}
    </Tabs.Content>
  );
}

export function SceneInfoOrderContent({ children }: { children?: ReactNode }) {
  return (
    <Tabs.Content value="orders" {...tabContentProps}>
      {children}
    </Tabs.Content>
  );
}

export function SceneInfoLogContent({ children }: { children?: ReactNode }) {
  return (
    <Tabs.Content value="logs" {...tabContentProps}>
      {children}
    </Tabs.Content>
  );
}
