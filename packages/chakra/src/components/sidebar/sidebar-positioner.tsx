import type { BoxProps } from '@chakra-ui/react';
import { Box, Flex, useSlotRecipe } from '@chakra-ui/react';

export interface SidebarPositionerProps extends BoxProps {}

export function SidebarPositioner(props: SidebarPositionerProps) {
  const { children, ...rest } = props;
  const recipe = useSlotRecipe({ key: 'sidebar' });
  const styles = recipe();

  return (
    <Box
      display={{ base: 'none', xl: 'block' }}
      position="fixed"
      m="0px"
      css={styles.positioner}
      transition="0.2s linear"
      w="300px"
      h="100%"
      overflowX="hidden"
      {...rest}
    >
      <Flex direction="column" height="100%">
        {children}
      </Flex>
    </Box>
  );
}
