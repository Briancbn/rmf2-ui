import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router';
import type { AccordionRootProps } from '@chakra-ui/react';
import { Accordion, Box, Flex, HStack, Text } from '@chakra-ui/react';

import type { RoutesType } from '@/types';
import { useSidebarItems } from './use-sidebar';

interface SidebarItemProps {
  route: RoutesType;
  active: boolean;
  dropdown?: boolean;
  children?: ReactNode;
}

function SidebarItem(props: SidebarItemProps) {
  const { route, active, dropdown } = props;

  const activeColor = { base: 'gray.700', _dark: 'white' };
  const activeIcon = { base: 'brand.500', _dark: 'white' };
  const textColor = { base: 'secondaryGray.500', _dark: 'secondaryGray.600' };
  const brandColor = { base: 'brand.500', _dark: 'brand.400' };

  return (
    <HStack w="100%" gap={active ? '22px' : '26px'} py="5px" ps="10px">
      <NavLink style={{ width: '100%' }} to={route.path}>
        <Flex alignItems="center" justifyContent="center">
          <Box color={active ? activeIcon : textColor} me="18px">
            {route.icon ? route.icon : <Box width="20px" height="20px" />}
          </Box>
          <Text
            me="auto"
            color={active ? activeColor : textColor}
            fontWeight={active ? 'bold' : 'normal'}
          >
            {route.name}
          </Text>
        </Flex>
      </NavLink>
      {dropdown && <Accordion.ItemIndicator _hover={{ cursor: 'pointer' }} />}
      <Box
        h="36px"
        w="4px"
        bg={active ? brandColor : 'transparent'}
        borderRadius="5px"
      />
    </HStack>
  );
}

export interface SidebarItemsProps extends AccordionRootProps {}

export function SidebarItems(props: SidebarItemsProps) {
  const location = useLocation();
  const { routes } = useSidebarItems();

  const { ...rest } = props;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (route: RoutesType) => {
    const activeChildrenRoute = route.children?.some((x: RoutesType) =>
      location.pathname.startsWith(x.path.toLowerCase()),
    );
    return (
      location.pathname.startsWith(route.path.toLowerCase()) &&
      !activeChildrenRoute
    );
  };

  const getDefaultUncollapseItems = (routes: RoutesType[]) => {
    for (const route of routes) {
      if (
        route.children &&
        location.pathname.startsWith(route.path.toLowerCase())
      ) {
        return [route.path];
      }
    }
    return [];
  };

  const createNestedLinks = (routes: RoutesType[]) => {
    return (
      <Accordion.Root
        multiple
        defaultValue={getDefaultUncollapseItems(routes)}
        {...rest}
      >
        {routes.map((route: RoutesType, index: number) => (
          <Box key={index}>
            {route.children ? (
              <Accordion.Item
                key={route.path}
                value={route.path}
                borderBottomWidth="0px"
              >
                <Accordion.ItemTrigger py="0px" fontSize="inherit">
                  <SidebarItem
                    route={route}
                    dropdown
                    active={activeRoute(route)}
                  />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody py="0px" ms="20px">
                    {route.children.map((route: RoutesType) => (
                      <SidebarItem
                        key={route.name}
                        route={route}
                        active={activeRoute(route)}
                      />
                    ))}
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ) : (
              <SidebarItem route={route} active={activeRoute(route)} />
            )}
          </Box>
        ))}
      </Accordion.Root>
    );
  };

  return <>{createNestedLinks(routes)}</>;
}

export default SidebarItems;
