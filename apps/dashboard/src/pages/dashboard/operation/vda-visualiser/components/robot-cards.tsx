// Compact robot list + selected-robot detail panel.
// List rows are ~44px each so 50-200 robots fit in a scrollable column.
// Clicking a row selects it; the detail panel below shows all controls.
import { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Flex,
  IconButton,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';
import { LuSettings } from 'react-icons/lu';

import { Tooltip } from '@/components/ui/tooltip';
import { snapToNode } from '../graph';
import type {
  AgvState,
  MapNode,
  PickRackSelection,
  RackMap,
  RobotGoal,
  SchedulerRobotId,
} from '../types';
import { pickRackPointsForRobot, robotColor, robotImage } from './constants';
import { InstantActionsPanel } from './instant-actions-panel';
import { useVdaRobotCards } from './use-vda-visualiser';
import { v1FetchFactsheet, type AgvFactsheet } from '../master-api';
import type { PickRackPointOption } from './constants';
import type { PickRackMode } from '../scheduler-api';

export type { PickRackSelection };

const fmt = (v: number | null) => (v == null ? '—' : v.toFixed(2));

function fmtBattery(percent: number | null | undefined): string {
  if (percent == null) return '—';
  return `${Math.round(percent)}%`;
}

function batteryFillColor(percent: number | null | undefined): string {
  if (percent == null) return '#a1a1aa';
  if (percent <= 20) return '#ef4444';
  if (percent <= 50) return '#eab308';
  return '#22c55e';
}

function BatteryIndicator({ percent }: { percent: number | null | undefined }) {
  const fill = percent == null ? 0 : Math.max(0, Math.min(100, percent)) / 100;
  const fillColor = batteryFillColor(percent);
  return (
    <HStack
      gap={1}
      align="center"
      flexShrink={0}
      aria-label={`Battery ${fmtBattery(percent)}`}
    >
      <svg
        viewBox="0 0 12 20"
        width="10"
        height="16"
        style={{ flexShrink: 0 }}
        aria-hidden
      >
        <rect
          x="1.5"
          y="3"
          width="9"
          height="15"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <rect
          x="4.25"
          y="0.75"
          width="3.5"
          height="2"
          rx="0.75"
          fill="currentColor"
        />
        <rect
          x="3"
          y={16 - 12 * fill}
          width="6"
          height={12 * fill}
          rx="0.75"
          fill={fillColor}
        />
      </svg>
      <Text fontSize="2xs" fontWeight="semibold" fontFamily="mono">
        {fmtBattery(percent)}
      </Text>
    </HStack>
  );
}

function jackBadge(state: string | null) {
  if (state === 'hold')
    return (
      <Badge size="sm" colorPalette="green">
        Hold
      </Badge>
    );
  if (state === 'up')
    return (
      <Badge size="sm" colorPalette="green">
        Lifted
      </Badge>
    );
  if (state === 'jacking_up')
    return (
      <Badge size="sm" colorPalette="yellow">
        Raising…
      </Badge>
    );
  if (state === 'jacking_down')
    return (
      <Badge size="sm" colorPalette="yellow">
        Lowering…
      </Badge>
    );
  if (state === 'down')
    return (
      <Badge size="sm" colorPalette="gray">
        Down
      </Badge>
    );
  if (state === 'unknown')
    return (
      <Badge size="sm" colorPalette="gray">
        Unknown
      </Badge>
    );
  return null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fontSize="2xs" textTransform="uppercase" color="fg.subtle">
        {label}
      </Text>
      <Text fontSize="sm" fontFamily="mono">
        {value}
      </Text>
    </Box>
  );
}

function goalLabel(goal: RobotGoal | undefined, racks: RackMap): string | null {
  if (!goal) return null;
  const node = goal.node in racks ? `${goal.node}*` : goal.node;
  return `${node}${goal.applied ? ' ✓' : ''}`;
}

function forceNavigateTarget(goal: RobotGoal | undefined): string | null {
  if (!goal || goal.pickRackMode) return null;
  return goal.node;
}

function RackColumn({
  racks,
  value,
  onChange,
  disabled,
  activePalette,
}: {
  racks: readonly PickRackPointOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  activePalette: 'green' | 'orange';
}) {
  return (
    <Stack gap={1} flex="1" minW={0}>
      {racks.map((r) => (
        <Button
          key={r.id}
          size="sm"
          minH="36px"
          h="auto"
          py={1}
          px={2}
          width="full"
          borderRadius="lg"
          variant="outline"
          colorPalette={value === r.id ? activePalette : 'gray'}
          borderWidth={value === r.id ? '2px' : '1px'}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onChange(r.id);
          }}
        >
          <Stack gap={0} lineHeight="1.2" align="center" width="full">
            <Text fontSize="sm" fontWeight="semibold">
              {r.label}
            </Text>
            <Text fontSize="2xs" fontFamily="mono" opacity={0.9}>
              {r.nodeId}
            </Text>
          </Stack>
        </Button>
      ))}
    </Stack>
  );
}

const RACK_ACTION_BTN = {
  size: 'sm' as const,
  minH: '36px',
  py: 1,
  borderRadius: 'lg' as const,
  variant: 'solid' as const,
};

function defaultPickupId(racks: readonly PickRackPointOption[]): string {
  return racks.find((r) => r.id === 'Rack_West')?.id ?? racks[0]?.id ?? '';
}

function defaultPutdownId(
  racks: readonly PickRackPointOption[],
  pickupId: string,
): string {
  return (
    racks.find((r) => r.id === 'Rack_FarNorth' && r.id !== pickupId)?.id ??
    racks.find((r) => r.id !== pickupId)?.id ??
    racks[0]?.id ??
    ''
  );
}

function PickRackRow({
  robotId,
  racks,
  pickRackActive,
  onPickRack,
}: {
  robotId: SchedulerRobotId;
  racks: readonly PickRackPointOption[];
  pickRackActive: boolean;
  onPickRack: (
    robotId: SchedulerRobotId,
    selection: PickRackSelection,
  ) => Promise<void>;
}) {
  const [pickup, setPickup] = useState('');
  const [putdown, setPutdown] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const busy = dispatching || pickRackActive;

  useEffect(() => {
    if (racks.length === 0) return;
    setPickup((prev) =>
      prev && racks.some((r) => r.id === prev) ? prev : defaultPickupId(racks),
    );
  }, [racks]);

  useEffect(() => {
    if (racks.length === 0 || !pickup) return;
    setPutdown((prev) =>
      prev && racks.some((r) => r.id === prev)
        ? prev
        : defaultPutdownId(racks, pickup),
    );
  }, [racks, pickup]);

  const labelFor = (id: string) => racks.find((r) => r.id === id)?.label ?? id;

  const run = async (mode: PickRackMode) => {
    setDispatching(true);
    try {
      await onPickRack(robotId, {
        mode,
        pickup,
        putdown,
        pickupLabel: labelFor(pickup),
        putdownLabel: labelFor(putdown),
      });
    } finally {
      setDispatching(false);
    }
  };

  return (
    <Stack
      gap={2}
      borderTopWidth="1px"
      borderColor="border.subtle"
      pt={2}
      onClick={(e) => e.stopPropagation()}
    >
      <Flex
        align="stretch"
        borderWidth="1px"
        borderColor="border"
        borderRadius="lg"
        overflow="hidden"
        bg="bg.subtle"
      >
        <Stack gap={1} flex="1" minW={0} p={1.5}>
          <Text
            fontSize="xs"
            fontWeight="semibold"
            textTransform="uppercase"
            color="green.600"
            letterSpacing="wider"
          >
            Pickup
          </Text>
          <RackColumn
            racks={racks}
            value={pickup}
            activePalette="green"
            onChange={setPickup}
            disabled={busy}
          />
        </Stack>
        <Box
          w="3px"
          flexShrink={0}
          alignSelf="stretch"
          bg="border"
          role="separator"
          aria-orientation="vertical"
        />
        <Stack gap={1} flex="1" minW={0} p={1.5}>
          <Text
            fontSize="xs"
            fontWeight="semibold"
            textTransform="uppercase"
            color="orange.600"
            letterSpacing="wider"
          >
            Drop off
          </Text>
          <RackColumn
            racks={racks}
            value={putdown}
            activePalette="orange"
            onChange={setPutdown}
            disabled={busy}
          />
        </Stack>
      </Flex>
      <HStack gap={2}>
        <Button
          {...RACK_ACTION_BTN}
          colorPalette="green"
          flex="1"
          loading={busy}
          onClick={(e) => {
            e.stopPropagation();
            void run('pickup');
          }}
        >
          Pick up
        </Button>
        <Button
          {...RACK_ACTION_BTN}
          colorPalette="orange"
          flex="1"
          loading={busy}
          onClick={(e) => {
            e.stopPropagation();
            void run('dropoff');
          }}
        >
          Drop off
        </Button>
      </HStack>
    </Stack>
  );
}

// Compact single-line row shown in the scrollable list.
function RobotRow({
  agv,
  index,
  selected,
  goal,
  racks,
  onSelect,
}: {
  agv: AgvState;
  index: number;
  selected: boolean;
  goal: RobotGoal | undefined;
  racks: RackMap;
  onSelect: () => void;
}) {
  const color = robotColor(agv, index);
  const isOnline = agv.connection_status === 'ONLINE';
  const goalText = goalLabel(goal, racks);
  const queueDepth = agv.pending_order_count ?? 0;

  return (
    <HStack
      px={2}
      py={1.5}
      gap={2}
      cursor="pointer"
      borderRadius="md"
      bg={selected ? 'bg.subtle' : 'transparent'}
      borderWidth="1px"
      borderColor={selected ? 'border' : 'transparent'}
      _hover={{ bg: 'bg.subtle' }}
      onClick={onSelect}
      flexShrink={0}
      minH="40px"
    >
      <Box w={2.5} h={2.5} borderRadius="full" bg={color} flexShrink={0} />
      <Text fontSize="sm" fontWeight={600} flex="1" minW={0} truncate>
        {agv.robot_id}
      </Text>
      {goalText && (
        <Text
          fontSize="xs"
          fontFamily="mono"
          color="teal.600"
          flexShrink={0}
          maxW="80px"
          truncate
        >
          → {goalText}
        </Text>
      )}
      {agv.last_node_id && (
        <Text fontSize="xs" fontFamily="mono" color="fg.subtle" flexShrink={0}>
          {agv.last_node_id}
        </Text>
      )}
      {queueDepth > 0 && (
        <Badge
          size="sm"
          colorPalette={queueDepth >= 2 ? 'red' : 'yellow'}
          flexShrink={0}
        >
          {queueDepth} queued
        </Badge>
      )}
      <Badge
        size="sm"
        colorPalette={!isOnline ? 'red' : agv.order_active ? 'blue' : 'green'}
        variant="subtle"
        flexShrink={0}
      >
        {!isOnline ? 'Off' : agv.order_active ? 'Active' : 'Idle'}
      </Badge>
      <BatteryIndicator percent={agv.battery_percent} />
    </HStack>
  );
}

// Full controls shown below the list when a robot is selected.
function RobotDetail({
  agv,
  index,
  goal,
  racks,
  mapNodes,
  cancelling,
  onCancel,
  onResetToNode,
  onPickRack,
  pickRackPoints,
}: {
  agv: AgvState;
  index: number;
  goal: RobotGoal | undefined;
  racks: RackMap;
  mapNodes: readonly MapNode[];
  cancelling: boolean;
  onCancel: () => void;
  onResetToNode: (robotId: SchedulerRobotId, nodeId: string) => Promise<void>;
  onPickRack: (
    robotId: SchedulerRobotId,
    selection: PickRackSelection,
  ) => Promise<void>;
  pickRackPoints?: readonly PickRackPointOption[];
}) {
  const img = robotImage(agv);
  const [resetting, setResetting] = useState(false);
  const [settingNearest, setSettingNearest] = useState(false);
  const resetTarget = forceNavigateTarget(goal);
  const nearestNode =
    agv.has_pose && agv.x != null && agv.y != null && mapNodes.length > 0
      ? snapToNode(agv.x, agv.y, [...mapNodes])
      : null;

  const confirmReset = async () => {
    if (!resetTarget) return;
    setResetting(true);
    try {
      await onResetToNode(agv.robot_id, resetTarget);
    } finally {
      setResetting(false);
    }
  };

  const navigateToNearest = async () => {
    if (!nearestNode) return;
    setSettingNearest(true);
    try {
      await onResetToNode(agv.robot_id, nearestNode);
    } finally {
      setSettingNearest(false);
    }
  };

  const rackPoints = pickRackPointsForRobot(agv.robot_id, pickRackPoints);
  const pickRackActive = Boolean(goal?.applied && goal.pickRackMode);

  const [factsheet, setFactsheet] = useState<AgvFactsheet | null>(null);
  useEffect(() => {
    let cancelled = false;
    v1FetchFactsheet(agv.manufacturer, agv.serial_number)
      .then((fs) => {
        if (!cancelled) setFactsheet(fs);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [agv.manufacturer, agv.serial_number]);

  return (
    <Card.Root size="sm" variant="outline">
      <Card.Body gap={3} py={3}>
        <HStack justify="space-between" align="flex-start">
          <Stack gap={1}>
            <HStack gap={2} flexWrap="wrap">
              <Box
                w={3}
                h={3}
                borderRadius="full"
                bg={robotColor(agv, index)}
              />
              <Text fontWeight={700}>{agv.robot_id}</Text>
              <BatteryIndicator percent={agv.battery_percent} />
            </HStack>
            {goal && (
              <Badge
                size="sm"
                colorPalette="teal"
                variant="subtle"
                w="fit-content"
              >
                → {goalLabel(goal, racks)}
              </Badge>
            )}
          </Stack>
          {img && (
            <Image
              src={img}
              alt={agv.robot_id}
              h="56px"
              maxW="72px"
              objectFit="contain"
              flexShrink={0}
            />
          )}
        </HStack>

        <SimpleGrid columns={3} gap={2}>
          <Stat label="x" value={fmt(agv.x)} />
          <Stat label="y" value={fmt(agv.y)} />
          <Stat label="θ" value={fmt(agv.theta)} />
        </SimpleGrid>

        {agv.jack_state && (
          <HStack gap={2} align="center">
            <Text fontSize="2xs" textTransform="uppercase" color="fg.subtle">
              Jack
            </Text>
            {jackBadge(agv.jack_state)}
          </HStack>
        )}

        {factsheet &&
          (factsheet.typeSpecification ?? factsheet.physicalParameters) && (
            <Box borderTopWidth="1px" borderColor="border.subtle" pt={2}>
              <Text
                fontSize="2xs"
                textTransform="uppercase"
                color="fg.subtle"
                mb={1}
              >
                Factsheet
              </Text>
              <SimpleGrid columns={2} gap={1}>
                {factsheet.typeSpecification?.seriesName && (
                  <Stat
                    label="Series"
                    value={factsheet.typeSpecification.seriesName}
                  />
                )}
                {factsheet.typeSpecification?.agvKinematic && (
                  <Stat
                    label="Kinematic"
                    value={factsheet.typeSpecification.agvKinematic}
                  />
                )}
                {factsheet.physicalParameters?.speedMax != null && (
                  <Stat
                    label="Max speed"
                    value={`${factsheet.physicalParameters.speedMax} m/s`}
                  />
                )}
                {factsheet.physicalParameters?.accelerationMax != null && (
                  <Stat
                    label="Max accel"
                    value={`${factsheet.physicalParameters.accelerationMax} m/s²`}
                  />
                )}
              </SimpleGrid>
            </Box>
          )}

        <HStack gap={2} flexWrap="wrap" justify="flex-end">
          <Tooltip
            positioning={{ placement: 'top' }}
            openDelay={150}
            closeDelay={50}
            showArrow
            disabled={!nearestNode}
            content={
              <Text fontSize="sm">
                Set <b>{agv.robot_id}</b> to nearest node{' '}
                <b>{nearestNode ?? '—'}</b>
              </Text>
            }
          >
            <IconButton
              aria-label="Set to nearest node"
              size="xs"
              variant="outline"
              colorPalette="gray"
              borderRadius="full"
              disabled={!nearestNode}
              loading={settingNearest}
              onClick={(e) => {
                e.stopPropagation();
                void navigateToNearest();
              }}
            >
              <LuSettings />
            </IconButton>
          </Tooltip>
          <Tooltip
            positioning={{ placement: 'top' }}
            openDelay={150}
            closeDelay={50}
            showArrow
            disabled={!resetTarget}
            content={
              <Text fontSize="sm">
                Navigate <b>{agv.robot_id}</b> to <b>{resetTarget ?? '—'}</b>
              </Text>
            }
          >
            <Button
              size="xs"
              variant="outline"
              colorPalette="blue"
              disabled={!resetTarget}
              loading={resetting}
              onClick={(e) => {
                e.stopPropagation();
                void confirmReset();
              }}
            >
              Navigate
            </Button>
          </Tooltip>
          <Button
            size="xs"
            variant="outline"
            colorPalette="red"
            loading={cancelling}
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            Stop & reset
          </Button>
        </HStack>

        <Box borderTopWidth="1px" borderColor="border.subtle" pt={2}>
          <Text
            fontSize="2xs"
            textTransform="uppercase"
            color="fg.subtle"
            mb={1}
          >
            Instant actions
          </Text>
          <InstantActionsPanel
            manufacturer={agv.manufacturer}
            serialNumber={agv.serial_number}
          />
        </Box>

        {rackPoints && rackPoints.length > 0 && (
          <PickRackRow
            robotId={agv.robot_id}
            racks={rackPoints}
            pickRackActive={pickRackActive}
            onPickRack={onPickRack}
          />
        )}
      </Card.Body>
    </Card.Root>
  );
}

export function RobotCards() {
  const {
    agvs,
    goals,
    racks,
    mapNodes,
    selectedRobot,
    cancellingRobot,
    onSelectRobot,
    onCancelRobot,
    onResetToNode,
    onPickRack,
    pickRackPoints,
  } = useVdaRobotCards();

  const selectedAgv = agvs.find((a) => a.robot_id === selectedRobot);

  if (agvs.length === 0) {
    return (
      <Card.Root size="sm" variant="outline">
        <Card.Body py={4}>
          <Text color="fg.subtle" fontSize="sm">
            No AGV state received yet.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Stack gap={2} h="full" overflow="hidden">
      <Box flex="1" overflowY="auto" minH={0}>
        <Stack gap={0.5} px={1}>
          {agvs.map((agv, i) => (
            <RobotRow
              key={agv.robot_id}
              agv={agv}
              index={i}
              selected={selectedRobot === agv.robot_id}
              goal={goals[agv.robot_id]}
              racks={racks}
              onSelect={() => onSelectRobot(agv.robot_id)}
            />
          ))}
        </Stack>
      </Box>

      {selectedAgv && (
        <Box
          flexShrink={0}
          overflowY="auto"
          maxH="50%"
          borderTopWidth="1px"
          pt={2}
        >
          <RobotDetail
            agv={selectedAgv}
            index={agvs.indexOf(selectedAgv)}
            goal={goals[selectedAgv.robot_id]}
            racks={racks}
            mapNodes={mapNodes}
            cancelling={cancellingRobot === selectedAgv.robot_id}
            onCancel={() => onCancelRobot(selectedAgv.robot_id)}
            onResetToNode={onResetToNode}
            onPickRack={onPickRack}
            pickRackPoints={pickRackPoints}
          />
        </Box>
      )}
    </Stack>
  );
}

export default RobotCards;
