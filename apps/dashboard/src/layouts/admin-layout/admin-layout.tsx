import { Box } from '@chakra-ui/react';
// Layout components
import { Sidebar } from '@/components/sidebar';
import { routes } from './admin-routes';
import { Outlet } from 'react-router';

// Custom Chakra theme
export function AdminLayout() {
  // states and functions
  document.documentElement.dir = 'ltr';
  return (
    <Box>
      <Sidebar routes={routes} />

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
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminLayout;
