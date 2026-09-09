// Master-side outbound order queue, per robot.
// Compact list sorted by queue depth (highest first) so backlog is immediately
// visible without scrolling. Scales to 50-200 robots.
import { Badge, Box, HStack, Stack, Text } from '@chakra-ui/react';

import { robotColor } from './constants';
import { useVdaOrderQueue } from './use-vda-visualiser';

function QueueDepth({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <Badge
      size="sm"
      colorPalette={count >= 2 ? 'red' : 'yellow'}
      flexShrink={0}
    >
      {count}
    </Badge>
  );
}

export function OrderQueuePanel() {
  const { agvs } = useVdaOrderQueue();

  const sorted = [...agvs].sort((a, b) => {
    const qa = a.pending_order_count ?? 0;
    const qb = b.pending_order_count ?? 0;
    if (qb !== qa) return qb - qa;
    const ao = a.order_active ? 1 : 0;
    const bo = b.order_active ? 1 : 0;
    return bo - ao;
  });

  if (agvs.length === 0) {
    return (
      <Text fontSize="sm" color="fg.subtle">
        No robots onboarded.
      </Text>
    );
  }

  return (
    <Stack gap={0} w="100%" overflowY="auto">
      {sorted.map((a, idx) => {
        const count = a.pending_order_count ?? 0;
        const isOnline = a.connection_status === 'ONLINE';
        const hasBacklog = count > 0;
        return (
          <HStack
            key={a.robot_id}
            px={2}
            py={1}
            gap={2}
            borderRadius="md"
            bg={
              hasBacklog ? { base: 'red.50', _dark: 'red.950' } : 'transparent'
            }
            minH="36px"
            flexShrink={0}
          >
            <Box
              w={2}
              h={2}
              borderRadius="full"
              bg={robotColor(a, idx)}
              flexShrink={0}
            />
            <Text fontSize="sm" fontWeight={600} flex="1" minW={0} truncate>
              {a.robot_id}
            </Text>
            {a.last_node_id && (
              <Text
                fontSize="xs"
                fontFamily="mono"
                color="fg.subtle"
                flexShrink={0}
              >
                {a.last_node_id}
              </Text>
            )}
            <Badge
              size="sm"
              colorPalette={a.order_active ? 'blue' : 'gray'}
              variant="subtle"
              flexShrink={0}
            >
              {a.order_active ? 'active' : 'idle'}
            </Badge>
            <Badge
              size="sm"
              colorPalette={isOnline ? 'green' : 'red'}
              variant="subtle"
              flexShrink={0}
            >
              {isOnline ? 'On' : 'Off'}
            </Badge>
            <QueueDepth count={count} />
          </HStack>
        );
      })}
    </Stack>
  );
}
