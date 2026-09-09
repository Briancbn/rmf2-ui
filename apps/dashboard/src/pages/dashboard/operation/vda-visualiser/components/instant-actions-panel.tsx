// Per-robot instant actions: quick preset buttons + a freeform custom action.
import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Field,
  HStack,
  Input,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react';

import {
  v1CustomInstantAction,
  v1FactsheetRequest,
  v1InitPosition,
  v1StateRequest,
  type InstantActionDecision,
} from '../master-api';

const BLOCKING_TYPES = ['NONE', 'SOFT', 'HARD'] as const;

function decisionPalette(decision: string) {
  const d = decision.toUpperCase();
  if (d === 'ACCEPTED' || d === 'DRY_RUN') return 'green';
  if (d === 'REJECTED') return 'red';
  return 'gray';
}

export function InstantActionsPanel({
  manufacturer,
  serialNumber,
}: {
  manufacturer: string;
  serialNumber: string;
}) {
  const [result, setResult] = useState<InstantActionDecision | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [customType, setCustomType] = useState('');
  const [blockingType, setBlockingType] = useState<string>('NONE');

  const run = async (
    label: string,
    fn: () => Promise<InstantActionDecision>,
  ) => {
    setBusy(label);
    setResult(null);
    try {
      setResult(await fn());
    } catch (err) {
      setResult({ decision: `Error: ${String(err)}`, errors: [] });
    } finally {
      setBusy(null);
    }
  };

  const presets: Array<{
    label: string;
    fn: () => Promise<InstantActionDecision>;
  }> = [
    {
      label: 'State req.',
      fn: () => v1StateRequest(manufacturer, serialNumber),
    },
    {
      label: 'Factsheet',
      fn: () => v1FactsheetRequest(manufacturer, serialNumber),
    },
    {
      label: 'Init pos.',
      fn: () => v1InitPosition(manufacturer, serialNumber),
    },
  ];

  const sendCustom = () => {
    if (!customType.trim()) return;
    void run(customType, () =>
      v1CustomInstantAction(
        manufacturer,
        serialNumber,
        customType.trim(),
        blockingType,
      ),
    );
  };

  return (
    <Stack gap={2}>
      <HStack gap={2} flexWrap="wrap">
        {presets.map(({ label, fn }) => (
          <Button
            key={label}
            size="xs"
            variant="outline"
            loading={busy === label}
            disabled={busy !== null && busy !== label}
            onClick={() => void run(label, fn)}
          >
            {label}
          </Button>
        ))}
      </HStack>

      <HStack gap={2} align="flex-end">
        <Field.Root flex="1" minW={0}>
          <Field.Label fontSize="xs" textTransform="uppercase">
            Action type
          </Field.Label>
          <Input
            size="xs"
            fontFamily="mono"
            placeholder="e.g. JACK_UP"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendCustom();
            }}
          />
        </Field.Root>
        <Box flexShrink={0}>
          <Text fontSize="xs" textTransform="uppercase" mb={1}>
            Blocking
          </Text>
          <NativeSelect.Root size="xs" w="20">
            <NativeSelect.Field
              value={blockingType}
              onChange={(e) => setBlockingType(e.target.value)}
            >
              {BLOCKING_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Box>
        <Button
          size="xs"
          colorPalette="teal"
          alignSelf="flex-end"
          disabled={!customType.trim() || busy !== null}
          loading={busy === customType}
          onClick={sendCustom}
        >
          Send
        </Button>
      </HStack>

      {result && (
        <HStack gap={2} flexWrap="wrap">
          <Badge size="sm" colorPalette={decisionPalette(result.decision)}>
            {result.decision}
          </Badge>
          {result.errors.length > 0 && (
            <Text fontSize="xs" color="fg.subtle">
              {result.errors.length} error(s)
            </Text>
          )}
        </HStack>
      )}
    </Stack>
  );
}
