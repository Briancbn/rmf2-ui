import type { Location } from 'react-router';
import { useLocation } from 'react-router';
import { createContext, useContext } from 'react';
import type { RoutesType } from '@/types';

interface RouteComponent {
  name: string;
  path: string;
}

// Generate route components for breadcrumb display
const getCurrentRouteComponentsRecursive = (
  currentLocation: Location,
  routes: RoutesType[],
  components: RouteComponent[],
): RouteComponent[] => {
  for (const route of routes) {
    if (!currentLocation.pathname.startsWith(route.path.toLowerCase())) {
      continue;
    }

    if (currentLocation.pathname === route.path.toLowerCase()) {
      components.push({ name: route.name, path: '#' });
      return components;
    }

    components.push(route);

    if (route.children) {
      return getCurrentRouteComponentsRecursive(
        currentLocation,
        route.children,
        components,
      );
    }

    return components;
  }

  return components;
};

export interface UseNavbarProps {
  routes: RoutesType[];
}

export function useNavbar(props: UseNavbarProps) {
  const { routes } = props;
  const currentLocation = useLocation();
  const routeComponents: RouteComponent[] = getCurrentRouteComponents(
    currentLocation,
    routes,
  );
  return {
    routes,
    currentLocation,
    routeComponents,
  };
}

export type UseNavbarReturn = ReturnType<typeof useNavbar>;

export const NavbarContext = createContext<UseNavbarReturn | undefined>(
  undefined,
);

const useNavbarContext = () => {
  const horizonNavbarContext = useContext(NavbarContext);
  if (horizonNavbarContext === undefined) {
    throw new Error('useNavbarContext must be inside a NavbarContext.Provider');
  }
  return horizonNavbarContext;
};

const getCurrentRouteComponents = (
  currentLocation: Location,
  routes: RoutesType[],
): RouteComponent[] => {
  const components: RouteComponent[] = [];
  return getCurrentRouteComponentsRecursive(
    currentLocation,
    routes,
    components,
  );
};

export function useNavbarBreadcrumb() {
  const { routeComponents } = useNavbarContext();

  return {
    routeComponents,
  };
}

export function useNavbarTitle() {
  const { routeComponents } = useNavbarContext();

  const routeName =
    routeComponents.length > 0
      ? routeComponents[routeComponents.length - 1].name
      : undefined;

  return { routeName };
}
