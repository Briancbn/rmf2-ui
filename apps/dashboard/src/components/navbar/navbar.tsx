import {
  Box,
  Breadcrumb,
  Menu,
  Flex,
  Link,
  Portal,
  Stack,
} from '@chakra-ui/react';
import { Fragment } from 'react';
import { useLocation } from 'react-router';
import { NavbarLinks } from './navbar-links';

interface RouteComponent {
  name: string;
  path: string;
}

export function Navbar(props: { routes: RoutesType[]; fixed: boolean }) {
  const location = useLocation();

  const { routes } = props;

  // Here are all the props that may change depending on navbar's type or state.(secondary, variant, scrolled)
  const mainText = { base: 'navy.700', _dark: 'white' };
  const secondaryText = { base: 'gray.700', _dark: 'white' };
  const menuBg = { base: 'white', _dark: 'navy.800' };
  const navbarPosition = 'fixed' as const;
  const navbarFilter = 'none';
  const navbarBackdrop = 'blur(20px)';
  const navbarShadow = 'none';
  const navbarBg = {
    base: 'rgba(244, 247, 254, 0.2)',
    _dark: 'rgba(11,20,55,0.5)',
  };
  const navbarBorder = 'transparent';
  const secondaryMargin = '0px';
  const paddingX = '15px';
  const gap = '0px';

  // Generate route components for breadcrumb display
  const currentRouteComponentsRecursive = (
    routes: RoutesType[],
    components: RouteComponent[],
  ): RouteComponent[] => {
    for (const route of routes) {
      if (!location.pathname.startsWith(route.path.toLowerCase())) {
        continue;
      }

      if (location.pathname === route.path.toLowerCase()) {
        components.push({ name: route.name, path: '#' });
        return components;
      }

      components.push(route);

      if (route.children) {
        return currentRouteComponentsRecursive(route.children, components);
      }

      return components;
    }

    return components;
  };

  const currentRouteComponents = (routes: RoutesType[]): RouteComponent[] => {
    const components: RouteComponent[] = [];
    return currentRouteComponentsRecursive(routes, components);
  };

  const routeComponents: RouteComponent[] = currentRouteComponents(routes);

  return (
    <Box
      position={navbarPosition}
      boxShadow={navbarShadow}
      bg={navbarBg}
      borderColor={navbarBorder}
      filter={navbarFilter}
      backdropFilter={navbarBackdrop}
      backgroundPosition="center"
      backgroundSize="cover"
      borderRadius="16px"
      borderWidth="1.5px"
      borderStyle="solid"
      transitionDelay="0s, 0s, 0s, 0s"
      transitionDuration=" 0.25s, 0.25s, 0.25s, 0s"
      transition-property="box-shadow, background-color, filter, border"
      transitionTimingFunction="linear, linear, linear, linear"
      alignItems={{ xl: 'center' }}
      display={{ xl: 'block', base: 'flex' }}
      minH="75px"
      justifyContent={{ xl: 'center' }}
      lineHeight="25.6px"
      mx="auto"
      mt={secondaryMargin}
      pb="8px"
      right={{ base: '12px', md: '30px', lg: '30px', xl: '30px' }}
      px={{
        base: paddingX,
        md: '10px',
      }}
      ps={{
        xl: '12px',
      }}
      pt="8px"
      top={{ base: '12px', md: '16px', xl: '18px' }}
      w={{
        base: 'calc(100vw - 6%)',
        md: 'calc(100vw - 8%)',
        lg: 'calc(100vw - 6%)',
        xl: 'calc(100vw - 350px)',
        '2xl': 'calc(100vw - 365px)',
      }}
    >
      <Flex
        w="100%"
        flexDirection={{
          base: 'column',
          md: 'row',
        }}
        alignItems={{ xl: 'center' }}
        mb={gap}
      >
        <Stack mb={{ base: '8px', md: '0px' }}>
          <Breadcrumb.Root size="lg" display={{ base: 'none', md: 'block' }}>
            <Breadcrumb.List>
              <Breadcrumb.Item color={secondaryText} fontSize="sm">
                <Breadcrumb.Link href="/" color={secondaryText}>
                  RMF2 Dashboard
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              {routeComponents.map(
                (component: RouteComponent, index: number) => (
                  <Fragment key={index}>
                    <Breadcrumb.Separator />

                    <Breadcrumb.Item color={secondaryText} fontSize="sm">
                      <Breadcrumb.Link
                        href={component.path}
                        color={secondaryText}
                      >
                        {component.name}
                      </Breadcrumb.Link>
                    </Breadcrumb.Item>
                  </Fragment>
                ),
              )}
            </Breadcrumb.List>
          </Breadcrumb.Root>
          <Breadcrumb.Root size="lg" display={{ base: 'flex', md: 'none' }}>
            <Breadcrumb.List>
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Breadcrumb.Ellipsis _hover={{ cursor: 'pointer' }} />
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content borderRadius="5px" bg={menuBg} border="none">
                      <Menu.Item value="main-dashboard">
                        <Link color={secondaryText} href="/">
                          Main Dashboard
                        </Link>
                      </Menu.Item>
                      {routeComponents.map(
                        (component: RouteComponent, index: number) =>
                          index < routeComponents.length - 1 && (
                            <Fragment key={index}>
                              <Menu.Separator />

                              <Menu.Item value={component.name}>
                                <Link
                                  href={component.path}
                                  color={secondaryText}
                                >
                                  {component.name}
                                </Link>
                              </Menu.Item>
                            </Fragment>
                          ),
                      )}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
              {routeComponents.length > 0 && (
                <>
                  <Breadcrumb.Separator />

                  <Breadcrumb.Item color={secondaryText} fontSize="sm">
                    <Breadcrumb.Link
                      href={routeComponents[routeComponents.length - 1].path}
                      color={secondaryText}
                    >
                      {routeComponents[routeComponents.length - 1].name}
                    </Breadcrumb.Link>
                  </Breadcrumb.Item>
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb.Root>
          {/* Here we create navbar brand, based on route name */}
          <Link
            color={mainText}
            href="#"
            bg="inherit"
            borderRadius="inherit"
            fontWeight="bold"
            fontSize="34px"
            _hover={{ color: { base: 'navy.700', _dark: 'white' } }}
            _active={{
              bg: 'inherit',
              transform: 'none',
              borderColor: 'transparent',
            }}
            _focus={{
              boxShadow: 'none',
            }}
          >
            {routeComponents.length > 0
              ? routeComponents[routeComponents.length - 1].name
              : '??'}
          </Link>
        </Stack>
        <Box
          ms="auto"
          mt={{ base: '10px', md: 'none' }}
          w={{ base: '100%', md: 'unset' }}
        >
          <NavbarLinks routes={routes} />
        </Box>
      </Flex>
    </Box>
  );
}

export default Navbar;
