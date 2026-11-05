import type { LinkProps } from '@chakra-ui/react';
import { Link } from '@chakra-ui/react';
import { useNavbarTitle } from './use-navbar';

export interface NavbarTitleProps extends LinkProps {}

export function NavbarTitle(props: LinkProps) {
  const { children, ...rest } = props;
  const { routeName } = useNavbarTitle();

  return (
    <Link
      color="navbar.title"
      href="#"
      bg="inherit"
      borderRadius="inherit"
      fontWeight="bold"
      fontSize="34px"
      _hover={{ color: 'navbar.title' }}
      _active={{
        bg: 'inherit',
        transform: 'none',
        borderColor: 'transparent',
      }}
      _focus={{
        boxShadow: 'none',
      }}
      {...rest}
    >
      {children ? children : routeName ? routeName : '??'}
    </Link>
  );
}
