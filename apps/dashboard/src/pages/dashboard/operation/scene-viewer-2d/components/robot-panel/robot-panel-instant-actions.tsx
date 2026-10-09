import { useState } from 'react';
import {
  Badge,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react';
import { LuPlus, LuX } from 'react-icons/lu';
import type {
  InstantActionItem,
  InstantActionResult,
  RobotActionStatus,
  RobotFactsheet,
} from '../../classes/robot-client-base';
import { useRobotPanelContext } from './use-robot-panel';
import { RobotPanelDebugConfirmButton } from './robot-panel-debug-confirm-button';

const PRESET_ACTIONS = [
  'stateRequest',
  'factsheetRequest',
  'initPosition',
] as const;
const BLOCKING_TYPES = ['NONE', 'SOFT', 'HARD'] as const;

interface ActionParam {
  key: string;
  value: string;
}

function statusPalette(status: RobotActionStatus) {
  switch (status) {
    case 'FINISHED':
      return 'green';
    case 'RUNNING':
      return 'blue';
    case 'INITIALIZING':
      return 'cyan';
    case 'WAITING':
      return 'gray';
    case 'PAUSED':
      return 'orange';
    case 'FAILED':
      return 'red';
  }
}

export interface RobotPanelInstantActionsProps {
  robotId: string;
  factsheet?: RobotFactsheet | null;
}

export function RobotPanelInstantActions({
  robotId,
  factsheet,
}: RobotPanelInstantActionsProps) {
  const { robotClient, robots } = useRobotPanelContext();
  const agvInstantActions = (factsheet?.agvActions ?? []).filter((a) =>
    a.actionScopes.includes('INSTANT'),
  );
  const robot = robots.find((r) => r.robotId === robotId);

  const [actionType, setActionType] = useState<string>(PRESET_ACTIONS[0]);
  const [customActionType, setCustomActionType] = useState('');
  const [blockingType, setBlockingType] = useState<string>('NONE');
  const [params, setParams] = useState<ActionParam[]>([]);
  const [dispatched, setDispatched] = useState<InstantActionItem[]>([]);
  const [busy, setBusy] = useState(false);

  const addParam = () => setParams((p) => [...p, { key: '', value: '' }]);
  const removeParam = (i: number) =>
    setParams((p) => p.filter((_, idx) => idx !== i));
  const setParamField = (i: number, field: keyof ActionParam, val: string) =>
    setParams((p) =>
      p.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)),
    );

  const doSend = async () => {
    setBusy(true);
    try {
      const validParams = params.filter((p) => p.key.trim());
      const resolvedType =
        actionType === 'CUSTOM' ? customActionType.trim() : actionType;
      if (!resolvedType) return;
      let result: InstantActionResult;
      if (resolvedType === 'stateRequest')
        result = await robotClient.sendStateRequest(robotId);
      else if (resolvedType === 'factsheetRequest')
        result = await robotClient.sendFactsheetRequest(robotId);
      else if (resolvedType === 'initPosition')
        result = await robotClient.sendInitPosition(robotId);
      else
        result = await robotClient.sendCustomInstantAction(
          robotId,
          resolvedType,
          blockingType,
          validParams.map((p) => ({ key: p.key.trim(), value: p.value })),
        );
      setDispatched((prev) => [...prev, ...result.actions]);
    } catch {
      // errors surface via actionStates FAILED status
    } finally {
      setBusy(false);
    }
  };

  const tracked = dispatched.map((item) => ({
    ...item,
    actionStatus:
      robot?.actionStates.find((a) => a.actionId === item.actionId)
        ?.actionStatus ?? null,
  }));

  const resolvedLabel =
    actionType === 'CUSTOM' ? customActionType.trim() || 'Custom' : actionType;

  return (
    <Stack gap={2}>
      <Stack gap={1}>
        <Text fontSize="xs" textTransform="uppercase">
          Action type
        </Text>
        <NativeSelect.Root size="xs">
          <NativeSelect.Field
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
          >
            <optgroup label="Standard">
              {PRESET_ACTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </optgroup>
            {agvInstantActions.length > 0 && (
              <optgroup label="AGV Actions">
                {agvInstantActions.map((a) => (
                  <option
                    key={a.actionType}
                    value={a.actionType}
                    title={a.actionDescription}
                  >
                    {a.actionType}
                  </option>
                ))}
              </optgroup>
            )}
            <option value="CUSTOM">Custom…</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        {actionType === 'CUSTOM' && (
          <Input
            size="xs"
            fontFamily="mono"
            placeholder="e.g. jackUp"
            value={customActionType}
            onChange={(e) => setCustomActionType(e.target.value)}
          />
        )}
      </Stack>

      <Stack gap={1}>
        <Text fontSize="xs" textTransform="uppercase">
          Blocking type
        </Text>
        <NativeSelect.Root size="xs">
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
      </Stack>

      <Stack gap={1}>
        <HStack>
          <Text fontSize="xs" textTransform="uppercase">
            Params
          </Text>
          <IconButton
            aria-label="Add param"
            size="2xs"
            variant="ghost"
            onClick={addParam}
          >
            <LuPlus />
          </IconButton>
        </HStack>
        {params.map((p, i) => (
          <HStack key={i} gap={1}>
            <Input
              size="xs"
              fontFamily="mono"
              placeholder="key"
              flex="1"
              value={p.key}
              onChange={(e) => setParamField(i, 'key', e.target.value)}
            />
            <Input
              size="xs"
              fontFamily="mono"
              placeholder="value"
              flex="1"
              value={p.value}
              onChange={(e) => setParamField(i, 'value', e.target.value)}
            />
            <IconButton
              aria-label="Remove param"
              size="2xs"
              variant="ghost"
              colorPalette="red"
              onClick={() => removeParam(i)}
            >
              <LuX />
            </IconButton>
          </HStack>
        ))}
      </Stack>

      <RobotPanelDebugConfirmButton
        title="Send instant action?"
        description={
          <>
            This will dispatch{' '}
            <Text as="span" fontFamily="mono" fontWeight="bold">
              {resolvedLabel}
            </Text>{' '}
            to{' '}
            <Text as="span" fontFamily="mono">
              {robotId}
            </Text>
            . Instant actions execute immediately on the AGV.
          </>
        }
        onConfirm={() => void doSend()}
        size="xs"
        variant="outline"
        colorPalette="orange"
        loading={busy}
      >
        Send
      </RobotPanelDebugConfirmButton>

      {tracked.length > 0 && (
        <Stack gap="4px">
          {tracked.map((a) => (
            <HStack key={a.actionId} gap={2}>
              {a.actionStatus && (
                <Badge
                  size="sm"
                  colorPalette={statusPalette(a.actionStatus)}
                  flexShrink={0}
                >
                  {a.actionStatus}
                </Badge>
              )}
              <Text fontSize="2xs" fontFamily="mono" color="fg.muted" truncate>
                {a.actionType} · {a.actionId}
              </Text>
            </HStack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
