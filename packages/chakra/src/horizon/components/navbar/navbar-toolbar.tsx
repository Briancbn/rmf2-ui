import type { FlexProps } from '@chakra-ui/react';
import { Flex } from '@chakra-ui/react';

export interface NavbarToolbarProps extends FlexProps {}

export function NavbarToolbar(props: FlexProps) {
  const { children, ...rest } = props;
  return (
    <Flex
      ms="auto"
      mt={{ base: '10px', md: 'none' }}
      w={{ base: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      bg="navbar.menu.bg"
      flexWrap="nowrap"
      p="10px"
      borderRadius="30px"
      boxShadow="navbar.toolbar"
      {...rest}
    >
      {children}
    </Flex>
  );
}
