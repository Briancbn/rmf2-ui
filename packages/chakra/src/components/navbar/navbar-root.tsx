import type { BoxProps } from '@chakra-ui/react';
import { Box, Flex, useSlotRecipe } from '@chakra-ui/react';
import type { UseNavbarProps } from './use-navbar';
import { useNavbar, NavbarContext } from './use-navbar';

export interface NavbarRootProps extends BoxProps, UseNavbarProps {}

export function NavbarRoot(props: NavbarRootProps) {
  const { children, ...rest } = props as BoxProps;

  const defaultValue = useNavbar(props);
  const recipe = useSlotRecipe({ key: 'navbar' });
  const styles = recipe();

  return (
    <Box
      position="fixed"
      backdropFilter="blue(20px)"
      backgroundPosition="center"
      backgroundSize="cover"
      css={styles.root}
      alignItems={{ xl: 'center' }}
      display={{ xl: 'block', base: 'flex' }}
      minH="75px"
      justifyContent={{ xl: 'center' }}
      lineHeight="25.6px"
      mx="auto"
      pb="8px"
      right={{ base: '12px', md: '30px', lg: '30px', xl: '30px' }}
      px={{
        base: '15px',
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
      {...rest}
    >
      <Flex
        w="100%"
        flexDirection={{
          base: 'column',
          md: 'row',
        }}
        alignItems={{ xl: 'center' }}
      >
        <NavbarContext value={defaultValue}>{children}</NavbarContext>
      </Flex>
    </Box>
  );
}

export default NavbarRoot;
