import { Box, Flex, Stack } from '@chakra-ui/react';
//   Custom components
import { SidebarBrand } from './sidebar-brand';
import { SidebarLinks } from './sidebar-links';
// import { HorizonSidebarCard } from './horizon-sidebar-card';

// FUNCTIONS

export function SidebarContent(props: { routes: RoutesType[] }) {
  const { routes } = props;
  // SIDEBAR
  return (
    <Flex direction="column" height="100%" pt="25px" borderRadius="30px">
      <SidebarBrand />
      <Stack direction="column" mt="8px" mb="auto">
        <Box ps="20px">
          <SidebarLinks routes={routes} />
        </Box>
      </Stack>

      <Box
        ps="20px"
        pe={{ lg: '16px', '2xl': '20px' }}
        mt="60px"
        mb="40px"
        borderRadius="30px"
      >
        {/* <HorizonSidebarCard /> */}
      </Box>
    </Flex>
  );
}

export default SidebarContent;
