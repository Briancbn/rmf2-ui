import { Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import {
  RobotPanelContext,
  useRobotPanel,
  type UseRobotPanelProps,
} from './use-robot-panel';

export interface RobotPanelRootProps extends UseRobotPanelProps {
  children?: ReactNode;
}

export function RobotPanelRoot({
  children,
  robotClient,
  selected,
  onSelect,
}: RobotPanelRootProps) {
  const ctx = useRobotPanel({ robotClient, selected, onSelect });
  return (
    <RobotPanelContext.Provider value={ctx}>
      <Flex direction="column" flex="1" minH={0}>
        {children}
      </Flex>
    </RobotPanelContext.Provider>
  );
}
