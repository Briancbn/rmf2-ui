import { useRef } from 'react';

// chakra imports
import {
  Box,
  CloseButton,
  Flex,
  Drawer,
  Icon,
  useDisclosure,
  Portal,
} from '@chakra-ui/react';
import { SidebarContent } from './sidebar-content';

// Assets
import { IoMenuOutline } from 'react-icons/io5';

export function Sidebar(props: { routes: RoutesType[] }) {
  const { routes } = props;

  const variantChange = '0.2s linear';
  const shadow = {
    base: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    _dark: 'unset',
  };
  // Chakra Color Mode
  const sidebarBg = { base: 'white', _dark: 'navy.800' };
  const sidebarMargins = '0px';

  // SIDEBAR
  return (
    <Box display={{ base: 'none', xl: 'block' }} position="fixed" minH="100%">
      <Box
        bg={sidebarBg}
        transition={variantChange}
        w="300px"
        h="100vh"
        m={sidebarMargins}
        minH="100%"
        overflowX="hidden"
        boxShadow={shadow}
      >
        <SidebarContent routes={routes} />
      </Box>
    </Box>
  );
}

// FUNCTIONS
export function SidebarResponsive(props: { routes: RoutesType[] }) {
  const sidebarBackgroundColor = { base: 'white', _dark: 'navy.800' };
  const menuColor = { base: 'gray.400', _dark: 'white' };
  // // SIDEBAR
  const { open, setOpen } = useDisclosure();
  const btnRef = useRef<HTMLInputElement | null>(null);

  const { routes } = props;
  // let isWindows = navigator.platform.startsWith("Win");
  //  BRAND

  return (
    <Flex display={{ base: 'flex', xl: 'none' }} alignItems="center">
      <Flex
        ref={btnRef}
        w="max-content"
        h="max-content"
        onClick={() => setOpen(true)}
      >
        <Icon
          color={menuColor}
          my="auto"
          w="20px"
          h="20px"
          mx="10px"
          _hover={{ cursor: 'pointer' }}
        >
          <IoMenuOutline />
        </Icon>
      </Flex>
      <Drawer.Root
        open={open}
        onOpenChange={(e) => setOpen(e.open)}
        placement={document.documentElement.dir === 'rtl' ? 'end' : 'start'}
        finalFocusEl={() => btnRef.current}
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content w="285px" maxW="285px" bg={sidebarBackgroundColor}>
              <Drawer.CloseTrigger asChild>
                <CloseButton
                  zIndex="3"
                  _focus={{ boxShadow: 'none' }}
                  _hover={{ boxShadow: 'none' }}
                />
              </Drawer.CloseTrigger>
              <Drawer.Body maxW="285px" px="0rem" pb="0">
                <SidebarContent routes={routes} />
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Flex>
  );
}
// PROPS

export default Sidebar;
