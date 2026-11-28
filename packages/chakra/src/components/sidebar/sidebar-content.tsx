import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';

export interface SidebarContentProps extends BoxProps {}

export function SidebarContent(props: SidebarContentProps) {
  const { children, ...rest } = props;
  return (
    <Box flex="1" overflowY="auto" css={{ direction: 'rtl' }} {...rest}>
      <Box mt="8px" mb="auto" ps="20px" css={{ direction: 'ltr' }}>
        {children}
      </Box>
    </Box>
  );
}

export default SidebarContent;
