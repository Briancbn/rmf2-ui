import { createContext, useContext } from 'react';
import type { RoutesType } from '@/types';

export interface UseSidebarProps {
  routes: RoutesType[];
}

export function useSidebar(props: UseSidebarProps) {
  const { routes } = props;
  return { routes };
}

export type UseSidebarReturn = ReturnType<typeof useSidebar>;

export const SidebarContext = createContext<UseSidebarReturn | undefined>(
  undefined,
);

const useSidebarContext = () => {
  const horizonSidebarContext = useContext(SidebarContext);
  if (horizonSidebarContext === undefined) {
    throw new Error(
      'useSidebarContext must be inside a SidebarContext.Provider',
    );
  }
  return horizonSidebarContext;
};

export function useSidebarItems() {
  const { routes } = useSidebarContext();
  return {
    routes,
  };
}
