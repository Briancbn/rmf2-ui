import type { ReactNode } from 'react';
import { Flex } from '@chakra-ui/react';
import {
  PlanPanelContext,
  usePlanPanel,
  type UsePlanPanelProps,
} from './use-plan-panel';

export interface PlanPanelRootProps extends UsePlanPanelProps {
  children?: ReactNode;
}

export function PlanPanelRoot({ children, ...props }: PlanPanelRootProps) {
  const ctx = usePlanPanel(props);
  return (
    <PlanPanelContext.Provider value={ctx}>
      <Flex direction="column" flex="1" minH={0}>
        {children}
      </Flex>
    </PlanPanelContext.Provider>
  );
}
