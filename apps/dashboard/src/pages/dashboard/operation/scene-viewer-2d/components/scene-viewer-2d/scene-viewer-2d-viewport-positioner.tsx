import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';

export type SceneViewer2DViewportPositionerProps = BoxProps;

export function SceneViewer2DViewportPositioner(
  props: SceneViewer2DViewportPositionerProps,
) {
  return (
    <Box
      position="relative"
      flex="1"
      minW={0}
      overflow="hidden"
      h={{ base: '60vh', xl: '100%' }}
      {...props}
    />
  );
}
