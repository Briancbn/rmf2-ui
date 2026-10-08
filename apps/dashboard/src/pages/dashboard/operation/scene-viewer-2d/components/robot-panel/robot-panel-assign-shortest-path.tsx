import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  Field,
  HStack,
  Input,
  Popover,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useRobotPanelContext } from './use-robot-panel';

const WARN_KEY = 'rmf2.assignShortestPath.skipWarn';

function readSkipWarn(): boolean {
  try {
    return localStorage.getItem(WARN_KEY) === 'true';
  } catch {
    return false;
  }
}
function writeSkipWarn(v: boolean) {
  try {
    localStorage.setItem(WARN_KEY, String(v));
  } catch {
    /* ignore */
  }
}

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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [dontWarn, setDontWarn] = useState(false);

  const doSend = async () => {
    setPopoverOpen(false);
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

  const canSend = startNodeId.trim() && endNodeId.trim();

  const handleClick = () => {
    if (!canSend) return;
    if (readSkipWarn()) {
      void doSend();
    } else {
      setDontWarn(false);
      setPopoverOpen(true);
    }
  };

  const handleConfirm = () => {
    if (dontWarn) writeSkipWarn(true);
    void doSend();
  };

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

      <Popover.Root
        open={popoverOpen}
        onOpenChange={(e) => setPopoverOpen(e.open)}
      >
        <Popover.Trigger asChild>
          <Button
            size="xs"
            variant="outline"
            loading={busy}
            disabled={!canSend}
            onClick={handleClick}
          >
            Assign shortest path
          </Button>
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content maxW="260px">
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap={3}>
                <Text fontSize="sm" fontWeight="medium">
                  Assign shortest path?
                </Text>
                <Text fontSize="xs" color="fg.subtle">
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
                </Text>
                <Checkbox.Root
                  size="sm"
                  checked={dontWarn}
                  onCheckedChange={(e) => setDontWarn(!!e.checked)}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                  <Checkbox.Label fontSize="xs">
                    {"Don't show this warning again"}
                  </Checkbox.Label>
                </Checkbox.Root>
                <HStack gap={2} justify="flex-end">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setPopoverOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="xs" colorPalette="teal" onClick={handleConfirm}>
                    Confirm
                  </Button>
                </HStack>
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>

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
