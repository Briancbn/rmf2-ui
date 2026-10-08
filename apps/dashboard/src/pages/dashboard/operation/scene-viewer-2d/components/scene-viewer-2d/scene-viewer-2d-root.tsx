import { useMemo } from 'react';
import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import type { UseSceneViewer2DProps } from './use-scene-viewer-2d';
import { useSceneViewer2D, SceneViewer2DContext } from './use-scene-viewer-2d';

export interface SceneViewer2DRootProps
  extends BoxProps,
    UseSceneViewer2DProps {}

export function SceneViewer2DRoot(props: SceneViewer2DRootProps) {
  const { children, mapClient, sceneClient, robotClient, ...rest } = props;
  const context = useSceneViewer2D({ mapClient, sceneClient, robotClient });
  const ctx = useMemo(() => ({ ...context }), [context]);
  return (
    <Box
      w="100%"
      display="flex"
      flexDirection={{ base: 'column', xl: 'row' }}
      gap={4}
      h={{ base: 'auto', xl: 'calc(100vh - 200px)' }}
      minH="440px"
      pointerEvents="auto"
      {...rest}
    >
      <SceneViewer2DContext value={ctx}>{children}</SceneViewer2DContext>
    </Box>
  );
}
