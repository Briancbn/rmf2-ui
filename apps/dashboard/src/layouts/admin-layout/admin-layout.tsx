import { Outlet, useNavigation } from 'react-router';
import { Box, HStack } from '@chakra-ui/react';
import {
  Navbar,
  Pending,
  Searchbar,
  Sidebar,
  ThemeSwitcher,
} from '@rmf2-ui/chakra';
import { RMF2FreeLogo } from '@/components/icons';
import { ColorModeSwitch } from '@/components/ui/color-mode';
import { routes } from './admin-routes';
import { AdminAvatarMenu } from './admin-avatar-menu';

// Custom Chakra theme
export function AdminLayout() {
  const logoColor = { base: 'navy.700', _dark: 'white' };

  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <Box h="100vh">
      <Sidebar.Root routes={routes}>
        <Sidebar.Positioner>
          <Sidebar.Header>
            <RMF2FreeLogo h="70px" w="180px" my="10px" color={logoColor} />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Items />
          </Sidebar.Content>
          <Sidebar.Footer>
            {/*<Horizon.HorizonSidebarCard />*/}
            <HStack gap={2} w="full" justify="flex-start" px={3} py={2}>
              <ColorModeSwitch />
              <ThemeSwitcher.Select />
            </HStack>
          </Sidebar.Footer>
        </Sidebar.Positioner>

        <Box
          float="right"
          minHeight="100vh"
          height="100%"
          overflow="auto"
          position="relative"
          maxHeight="100%"
          w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
          transitionDuration=".2s, .2s, .35s"
          transitionProperty="top, bottom, width"
          transitionTimingFunction="linear, linear, ease"
        >
          <Navbar.Root routes={routes} zIndex="10">
            <Navbar.Header>
              <Navbar.Breadcrumb />
              <Navbar.Title />
            </Navbar.Header>
            <Navbar.Toolbar>
              {/* Searchbar */}
              <Searchbar />

              {/* Floating Sidebar */}
              <Sidebar.Responsive>
                <Sidebar.Header>
                  <RMF2FreeLogo
                    h="70px"
                    w="180px"
                    my="10px"
                    color={logoColor}
                  />
                </Sidebar.Header>
                <Sidebar.Content>
                  <Sidebar.Items />
                </Sidebar.Content>
                <Sidebar.Footer>
                  {/*<Horizon.HorizonSidebarCard />*/}
                  <HStack gap={2} w="full" justify="flex-start" px={3} py={2}>
                    <ColorModeSwitch />
                    <ThemeSwitcher.Select />
                  </HStack>
                </Sidebar.Footer>
              </Sidebar.Responsive>

              {/* Horizon Notification Button */}
              {/*<Horizon.HorizonNavbarNotification /> */}

              {/* Horizon Info Button */}
              {/*<Horizon.HorizonNavbarInfo />*/}

              {/* Avatar Button */}
              <AdminAvatarMenu />
            </Navbar.Toolbar>
          </Navbar.Root>

          <Box
            mx="auto"
            p="30px"
            minH="100vh"
            pt={{ base: '180px', md: '120px' }}
          >
            <Outlet />
            {isNavigating && (
              <Pending.Root>
                <Pending.Overlay />
                <Pending.Spinner />
              </Pending.Root>
            )}
          </Box>
        </Box>
      </Sidebar.Root>
    </Box>
  );
}

export default AdminLayout;
