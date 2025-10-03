import {
  Avatar,
  Button,
  Flex,
  Icon,
  Link,
  Menu,
  Stack,
  Portal,
  Text,
} from '@chakra-ui/react';
// Custom Components
// import { ItemContent } from 'components/menu/ItemContent';
import { Searchbar } from '@/components/searchbar';
import { SidebarResponsive } from '@/components/sidebar';
import { ColorModeButton } from '@/components/ui/color-mode';
// Assets
// import navImage from 'assets/img/layout/Navbar.png';
import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';

export function NavbarLinks(props: { routes: RoutesType[] }) {
  const { routes } = props;
  // Chakra Color Mode
  const navbarIcon = { base: 'gray.400', _dark: 'white' };
  const menuBg = { base: 'white', _dark: 'navy.800' };
  const textColor = { base: 'secondaryGray.900', _dark: 'white' };
  const textColorBrand = { base: 'brand.700', _dark: 'brand.400' };
  const borderColor = { base: '#E6ECFA', _dark: 'rgba(135, 140, 189, 0.3)' };
  const shadow = {
    base: '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    _dark: '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  };
  const borderButton = { base: 'secondaryGray.500', _dark: 'whiteAlpha.200' };
  return (
    <Flex
      w={{ base: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap="nowrap"
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <Searchbar me="10px" borderRadius="30px" />
      <SidebarResponsive routes={routes} />
      <Menu.Root>
        <Menu.Trigger p="0px" asChild>
          <Icon
            _hover={{ cursor: 'pointer' }}
            p="0px"
            color={navbarIcon}
            w="18px"
            h="18px"
            mx="11px"
          >
            <MdNotificationsNone />
          </Icon>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              boxShadow={shadow}
              p="20px"
              borderRadius="20px"
              bg={menuBg}
              border="none"
              mt="22px"
              me={{ base: '30px', md: 'unset' }}
              minW={{ base: 'unset', md: '400px', xl: '450px' }}
              maxW={{ base: '360px', md: 'unset' }}
            >
              <Flex w="100%" mb="20px">
                <Text fontSize="md" fontWeight="600" color={textColor}>
                  Notifications
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color={textColorBrand}
                  ms="auto"
                  cursor="pointer"
                >
                  Mark all read
                </Text>
              </Flex>
              <Flex flexDirection="column">
                <Menu.Item
                  value="hui-dashboard-pro"
                  _hover={{ bg: 'none' }}
                  _focus={{ bg: 'none' }}
                  px="0"
                  borderRadius="8px"
                  mb="10px"
                >
                  {/*<ItemContent info='Horizon UI Dashboard PRO' />*/}
                  Horizon UI Dashboard PRO
                </Menu.Item>
                <Menu.Item
                  value="hui-design-sys-free"
                  _hover={{ bg: 'none' }}
                  _focus={{ bg: 'none' }}
                  px="0"
                  borderRadius="8px"
                  mb="10px"
                >
                  {/*<ItemContent info='Horizon Design System Free' />*/}
                  Horizon Design System Free
                </Menu.Item>
              </Flex>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <Menu.Root>
        <Menu.Trigger p="0px">
          <Icon mb="2px" color={navbarIcon} w="18px" h="18px" mx="10px">
            <MdInfoOutline />
          </Icon>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              boxShadow={shadow}
              p="20px"
              me={{ base: '30px', md: 'unset' }}
              borderRadius="20px"
              bg={menuBg}
              mt="22px"
              minW={{ base: 'unset' }}
              maxW={{ base: '360px', md: 'unset' }}
            >
              {/*<Image src={navImage} borderRadius='16px' mb='28px' />*/}
              <Stack>
                <Link w="100%" href="https://horizon-ui.com/pro">
                  <Button w="100%" h="44px" variant="brand">
                    Buy Horizon UI PRO
                  </Button>
                </Link>
                <Link
                  w="100%"
                  href="https://horizon-ui.com/documentation/docs/introduction"
                >
                  <Button
                    w="100%"
                    h="44px"
                    border="1px solid"
                    bg="transparent"
                    variant="ghost"
                    borderColor={borderButton}
                  >
                    See Documentation
                  </Button>
                </Link>
                <Link
                  w="100%"
                  href="https://github.com/horizon-ui/horizon-ui-chakra-ts"
                >
                  <Button
                    w="100%"
                    h="44px"
                    variant="outline"
                    color={textColor}
                    bg="transparent"
                  >
                    Try Horizon Free
                  </Button>
                </Link>
              </Stack>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <ColorModeButton h="10px" w="10px" p="0px" me="10px" color={navbarIcon} />
      <Menu.Root>
        <Menu.Trigger>
          <Avatar.Root
            _hover={{ cursor: 'pointer' }}
            color="white"
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
          >
            <Avatar.Fallback name="Adela Parkson" />
          </Avatar.Root>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              boxShadow={shadow}
              p="0px"
              mt="10px"
              borderRadius="20px"
              bg={menuBg}
              border="none"
            >
              <Flex w="100%" mb="0px">
                <Text
                  ps="20px"
                  pt="16px"
                  pb="10px"
                  w="100%"
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  fontSize="sm"
                  fontWeight="700"
                  color={textColor}
                >
                  👋&nbsp; Hey, Adela
                </Text>
              </Flex>
              <Flex flexDirection="column" p="10px">
                <Menu.Item
                  value="profile-settings"
                  _hover={{ bg: 'none' }}
                  _focus={{ bg: 'none' }}
                  borderRadius="8px"
                  px="14px"
                >
                  <Text fontSize="sm">Profile Settings</Text>
                </Menu.Item>
                <Menu.Item
                  value="newsletter-settings"
                  _hover={{ bg: 'none' }}
                  _focus={{ bg: 'none' }}
                  borderRadius="8px"
                  px="14px"
                >
                  <Text fontSize="sm">Newsletter Settings</Text>
                </Menu.Item>
                <Menu.Item
                  value="logout"
                  _hover={{ bg: 'none' }}
                  _focus={{ bg: 'none' }}
                  color="red.400"
                  borderRadius="8px"
                  px="14px"
                >
                  <Text fontSize="sm">Log out</Text>
                </Menu.Item>
              </Flex>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Flex>
  );
}

export default NavbarLinks;
