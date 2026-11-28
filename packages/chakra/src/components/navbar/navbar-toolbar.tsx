import type { FlexProps } from '@chakra-ui/react';
import { Flex, useSlotRecipe } from '@chakra-ui/react';

export interface NavbarToolbarProps extends FlexProps {}

export function NavbarToolbar(props: FlexProps) {
  const { children, ...rest } = props;
  const recipe = useSlotRecipe({ key: 'navbar' });
  const styles = recipe();

  return (
    <Flex
      ms="auto"
      mt={{ base: '10px', md: 'none' }}
      w={{ base: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      flexWrap="nowrap"
      p="10px"
      css={styles.toolbar}
      {...rest}
    >
      {children}
    </Flex>
  );
}
