import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import type { UseSidebarProps } from './use-sidebar';
import { useSidebar, SidebarContext } from './use-sidebar';

export interface SidebarRootProps extends BoxProps, UseSidebarProps {}

export function SidebarRoot(props: SidebarRootProps) {
  const { children, ...rest } = props as BoxProps;

  const defaultValue = useSidebar(props);

  // Chakra Color Mode

  // SIDEBAR
  return (
    <Box {...rest}>
      <SidebarContext value={defaultValue}>{children}</SidebarContext>
    </Box>
  );
}

export default SidebarRoot;
