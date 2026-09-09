// Main viewport row: map canvas (left column) + robot panel tabs (right column).
// Measured height fills exactly to the viewport bottom regardless of header size.
import { Box, Flex } from '@chakra-ui/react';

import { useVdaRow } from './use-vda-visualiser';
import { MapCanvas } from './map-canvas';
import { RobotPanel } from './robot-panel';
import { TaskCallout } from './task-callout';

export function MapRow() {
  const { rowRef, rowHeightCss } = useVdaRow();

  return (
    <Flex
      ref={rowRef}
      gap={4}
      align="stretch"
      direction={{ base: 'column', xl: 'row' }}
      h={{ base: 'auto', xl: rowHeightCss ?? 'calc(100vh - 200px)' }}
      minH="440px"
    >
      {/* Column A: map on top, order queue + activity below. */}
      <Flex
        direction="column"
        gap={4}
        flex="1"
        minW={0}
        h={{ base: 'auto', xl: '100%' }}
      >
        <Box flex="1" minH={0} h={{ base: '60vh', xl: 'auto' }}>
          <MapCanvas />
        </Box>
        <Box flexShrink={0} w="100%">
          <TaskCallout />
        </Box>
      </Flex>

      {/* Column B: Robots / MAPF / Logs tabs. */}
      <RobotPanel />
    </Flex>
  );
}
