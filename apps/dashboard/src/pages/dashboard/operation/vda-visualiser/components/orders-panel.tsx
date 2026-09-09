// Historic order list from GET /v1/orders. Auto-refreshes every 5 s.
import { useEffect, useState } from 'react';
import { Badge, Box, Button, HStack, Stack, Text } from '@chakra-ui/react';

import { v1FetchOrders, type OrderStatusRecord } from '../master-api';

function orderStatus(o: OrderStatusRecord): { label: string; palette: string } {
  if (o.rejected_at) return { label: 'Rejected', palette: 'red' };
  if (o.completed_at) return { label: 'Done', palette: 'green' };
  return { label: 'Active', palette: 'blue' };
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<OrderStatusRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await v1FetchOrders(100);
      setOrders(data.slice().reverse()); // newest first
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <Stack gap={2} h="full">
      <HStack justify="space-between" flexShrink={0}>
        <Text fontSize="sm" fontWeight="semibold">
          Orders
        </Text>
        <Button
          size="xs"
          variant="ghost"
          loading={loading}
          onClick={() => void load()}
        >
          Refresh
        </Button>
      </HStack>

      {error && (
        <Text fontSize="xs" color="red.500">
          {error}
        </Text>
      )}

      <Box flex="1" overflowY="auto" minH={0}>
        <Stack gap={0.5}>
          {orders.length === 0 && !loading && (
            <Text fontSize="sm" color="fg.subtle">
              No orders found.
            </Text>
          )}
          {orders.map((o, i) => {
            const { label, palette } = orderStatus(o);
            return (
              <HStack
                key={`${o.order_id}-${o.order_update_id}-${i}`}
                px={2}
                py={1.5}
                gap={2}
                borderRadius="md"
                _hover={{ bg: 'bg.subtle' }}
                minH="36px"
              >
                <Text fontSize="xs" fontWeight={600} flex="1" minW={0} truncate>
                  {o.manufacturer}/{o.serial_number}
                </Text>
                <Text
                  fontSize="2xs"
                  fontFamily="mono"
                  color="fg.subtle"
                  flexShrink={0}
                  maxW="80px"
                  truncate
                >
                  {o.order_id}
                </Text>
                <Text fontSize="2xs" color="fg.subtle" flexShrink={0}>
                  {relTime(o.assigned_at)}
                </Text>
                <Badge
                  size="sm"
                  colorPalette={palette}
                  variant="subtle"
                  flexShrink={0}
                >
                  {label}
                </Badge>
              </HStack>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}
