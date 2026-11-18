import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';

export interface ProcessViewerCanvasProps extends BoxProps {}

export function ProcessViewerCanvas(props: ProcessViewerCanvasProps) {
  const { children, ...rest } = props;
  return (
    <Box w="100%" h="600px" {...rest}>
      {children}
    </Box>
  );
}
