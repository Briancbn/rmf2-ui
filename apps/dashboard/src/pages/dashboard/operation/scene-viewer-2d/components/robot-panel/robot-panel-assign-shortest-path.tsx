import { useEffect, useRef, useState } from 'react';
import { Badge, Field, HStack, Input, Stack, Text } from '@chakra-ui/react';
import { useRobotPanelContext } from './use-robot-panel';
import { RobotPanelDebugConfirmButton } from './robot-panel-debug-confirm-button';

export interface RobotPanelAssignShortestPathProps {
  robotId: string;
  defaultStartNodeId?: string | null;
}

export function RobotPanelAssignShortestPath({
  robotId,
  defaultStartNodeId,
}: RobotPanelAssignShortestPathProps) {
  const { robotClient } = useRobotPanelContext();
  const [startNodeId, setStartNodeId] = useState(defaultStartNodeId ?? '');

  const startNodeIdRef = useRef(startNodeId);
  startNodeIdRef.current = startNodeId;
  useEffect(() => {
    if (defaultStartNodeId && !startNodeIdRef.current)
      setStartNodeId(defaultStartNodeId);
  }, [defaultStartNodeId]);
  const [endNodeId, setEndNodeId] = useState('');
  const [layoutId, setLayoutId] = useState('');
  const [allowedDeviationXy, setAllowedDeviationXy] = useState('');
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState<string | null>(null);

  const doSend = async () => {
    setBusy(true);
    setDecision(null);
    try {
      const deviation = allowedDeviationXy.trim()
        ? parseFloat(allowedDeviationXy)
        : undefined;
      const result = await robotClient.sendAssignShortestPath(
        robotId,
        startNodeId.trim(),
        endNodeId.trim(),
        layoutId.trim() || undefined,
        isNaN(deviation!) ? undefined : deviation,
      );
      setDecision(result.decision);
    } catch (err) {
      setDecision(`Error: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const canSend = !!(startNodeId.trim() && endNodeId.trim());

  const decisionPalette = (d: string) => {
    const u = d.toUpperCase();
    if (u === 'ACCEPTED') return 'green';
    if (u === 'REJECTED' || u.startsWith('ERROR')) return 'red';
    return 'gray';
  };

  return (
    <Stack gap={2}>
      <HStack gap={2}>
        <Field.Root flex="1">
          <Field.Label fontSize="xs" textTransform="uppercase">
            Start node
          </Field.Label>
          <Input
            size="xs"
            fontFamily="mono"
            placeholder={defaultStartNodeId ?? 'node-id'}
            value={startNodeId}
            onChange={(e) => setStartNodeId(e.target.value)}
          />
        </Field.Root>
        <Field.Root flex="1">
          <Field.Label fontSize="xs" textTransform="uppercase">
            End node
          </Field.Label>
          <Input
            size="xs"
            fontFamily="mono"
            placeholder="node-id"
            value={endNodeId}
            onChange={(e) => setEndNodeId(e.target.value)}
          />
        </Field.Root>
      </HStack>

      <HStack gap={2}>
        <Field.Root flex="1">
          <Field.Label fontSize="xs" textTransform="uppercase">
            Layout ID
          </Field.Label>
          <Input
            size="xs"
            fontFamily="mono"
            placeholder="optional"
            value={layoutId}
            onChange={(e) => setLayoutId(e.target.value)}
          />
        </Field.Root>
        <Field.Root flex="1">
          <Field.Label fontSize="xs" textTransform="uppercase">
            Deviation XY (m)
          </Field.Label>
          <Input
            size="xs"
            fontFamily="mono"
            type="number"
            placeholder="optional"
            value={allowedDeviationXy}
            onChange={(e) => setAllowedDeviationXy(e.target.value)}
          />
        </Field.Root>
      </HStack>

      <RobotPanelDebugConfirmButton
        title="Assign shortest path?"
        description={
          <>
            Route{' '}
            <Text as="span" fontFamily="mono">
              {startNodeId}
            </Text>
            {' → '}
            <Text as="span" fontFamily="mono">
              {endNodeId}
            </Text>{' '}
            on{' '}
            <Text as="span" fontFamily="mono">
              {robotId}
            </Text>
            .
          </>
        }
        onConfirm={() => void doSend()}
        size="xs"
        variant="outline"
        colorPalette="orange"
        loading={busy}
        disabled={!canSend}
      >
        Assign shortest path
      </RobotPanelDebugConfirmButton>

      {decision && (
        <Badge
          size="sm"
          colorPalette={decisionPalette(decision)}
          alignSelf="flex-start"
        >
          {decision}
        </Badge>
      )}
    </Stack>
  );
}
