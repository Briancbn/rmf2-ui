// Bypasses MAPF — sends master-frame X/Y straight to the robot.
// Compact list of all robots; selecting one shows the input form below.
import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Field,
  HStack,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';

import { postScheduler } from '../scheduler-api';
import { robotColor } from './constants';
import { JackManualControl } from './jack-manual-control';
import { useVdaDirectControl } from './use-vda-visualiser';

const fmt2 = (v: number | null | undefined) => (v == null ? '' : v.toFixed(2));

export function DirectControl() {
  const { robots, agvs } = useVdaDirectControl();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ x: '', y: '', theta: '' });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const selectRobot = (id: string) => {
    if (selectedId === id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(id);
    setStatus(null);
    const agv = agvs.find((a) => a.robot_id === id);
    setForm({
      x: fmt2(agv?.x),
      y: fmt2(agv?.y),
      theta: fmt2(agv?.theta),
    });
  };

  const send = async () => {
    if (!selectedId) return;
    const x = Number.parseFloat(form.x);
    const y = Number.parseFloat(form.y);
    if (Number.isNaN(x) || Number.isNaN(y)) {
      setStatus('Enter numeric X and Y.');
      return;
    }
    const body: { robot_id: string; x: number; y: number; theta?: number } = {
      robot_id: selectedId,
      x,
      y,
    };
    if (form.theta.trim() !== '') {
      const theta = Number.parseFloat(form.theta);
      if (!Number.isNaN(theta)) body.theta = theta;
    }
    setBusy(true);
    setStatus('Sending…');
    try {
      await postScheduler('/demo/direct-navigate', { body });
      setStatus(
        `Sent → x=${x}, y=${y}${body.theta !== undefined ? `, θ=${body.theta}` : ''}.`,
      );
    } catch (err) {
      setStatus(`Failed — ${String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const selectedAgv = agvs.find((a) => a.robot_id === selectedId);
  const showJack = selectedId != null && !selectedId.startsWith('reeman');

  return (
    <Stack gap={2}>
      <Text fontSize="lg" fontWeight="bold">
        Direct Control
      </Text>
      <Text fontSize="sm" color="fg.subtle">
        Bypasses MAPF — sends master-frame X/Y straight to the robot.
      </Text>

      {/* Compact robot list */}
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Stack gap={0}>
          {robots.map(({ id, label }, idx) => {
            const agv = agvs.find((a) => a.robot_id === id);
            const isSelected = selectedId === id;
            const isOnline = agv?.connection_status === 'ONLINE';
            return (
              <HStack
                key={id}
                px={3}
                py={1.5}
                gap={2}
                cursor="pointer"
                bg={isSelected ? 'bg.subtle' : 'transparent'}
                borderBottomWidth="1px"
                _last={{ borderBottomWidth: 0 }}
                _hover={{ bg: 'bg.subtle' }}
                onClick={() => selectRobot(id)}
                minH="40px"
              >
                <Box
                  w={2}
                  h={2}
                  borderRadius="full"
                  bg={robotColor(
                    agv ?? {
                      robot_id: id,
                      manufacturer: '',
                      serial_number: '',
                      connection_status: null,
                      last_node_id: null,
                      x: null,
                      y: null,
                      theta: null,
                      has_pose: false,
                      action_states: null,
                      jack_state: null,
                    },
                    idx,
                  )}
                  flexShrink={0}
                />
                <Text fontSize="sm" fontWeight={600} flex="1" minW={0} truncate>
                  {label}
                </Text>
                {agv?.last_node_id && (
                  <Text
                    fontSize="xs"
                    fontFamily="mono"
                    color="fg.subtle"
                    flexShrink={0}
                  >
                    {agv.last_node_id}
                  </Text>
                )}
                <Badge
                  size="sm"
                  colorPalette={isOnline ? 'green' : 'red'}
                  variant="subtle"
                  flexShrink={0}
                >
                  {isOnline ? 'On' : 'Off'}
                </Badge>
              </HStack>
            );
          })}
        </Stack>
      </Box>

      {/* Detail form for selected robot */}
      {selectedId && (
        <Card.Root size="sm" variant="outline">
          <Card.Body gap={3} py={3}>
            <Text fontSize="sm" fontWeight="semibold">
              {selectedAgv?.robot_id ?? selectedId}
            </Text>
            <HStack gap={2} align="flex-end">
              {(['x', 'y'] as const).map((axis) => (
                <Field.Root key={axis}>
                  <Field.Label fontSize="xs" textTransform="uppercase">
                    {axis}
                  </Field.Label>
                  <Input
                    size="sm"
                    type="number"
                    step="0.1"
                    fontFamily="mono"
                    value={form[axis]}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, [axis]: e.target.value }))
                    }
                  />
                </Field.Root>
              ))}
              <Field.Root>
                <Field.Label fontSize="xs" textTransform="uppercase">
                  θ (opt)
                </Field.Label>
                <Input
                  size="sm"
                  type="number"
                  step="0.1"
                  fontFamily="mono"
                  placeholder="—"
                  value={form.theta}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, theta: e.target.value }))
                  }
                />
              </Field.Root>
            </HStack>
            <Button size="sm" colorPalette="teal" loading={busy} onClick={send}>
              Send
            </Button>
            {status && (
              <Text fontSize="xs" color="fg.subtle" wordBreak="break-word">
                {status}
              </Text>
            )}
            {showJack && (
              <Box pt={1} borderTopWidth="1px" borderColor="border.subtle">
                <JackManualControl robotId={selectedId} showLabel />
              </Box>
            )}
          </Card.Body>
        </Card.Root>
      )}
    </Stack>
  );
}
