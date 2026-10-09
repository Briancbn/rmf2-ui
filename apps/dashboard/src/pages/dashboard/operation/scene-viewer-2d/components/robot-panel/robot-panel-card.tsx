import { useEffect, useState } from 'react';
import { Box, Card, HStack, SimpleGrid, Text } from '@chakra-ui/react';
import type {
  RobotFactsheet,
  RobotState,
} from '../../classes/robot-client-base';
import { RobotPanelBattery } from './robot-panel-battery';
import { RobotPanelModeBadge } from './robot-panel-mode-badge';
import { RobotPanelConnectionBadge } from './robot-panel-connection-badge';
import { RobotPanelInstantActions } from './robot-panel-instant-actions';
import { RobotPanelAssignShortestPath } from './robot-panel-assign-shortest-path';
import { useRobotPanelContext } from './use-robot-panel';

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

export interface RobotPanelCardProps {
  robot: RobotState;
  expanded?: boolean;
}

export function RobotPanelCard({ robot, expanded }: RobotPanelCardProps) {
  const { robotClient } = useRobotPanelContext();
  const [factsheet, setFactsheet] = useState<RobotFactsheet | null>(null);
  const fmt = (v: number | null) => (v == null ? '—' : v.toFixed(3));

  useEffect(() => {
    let cancelled = false;
    robotClient
      .getFactsheet(robot.robotId)
      .then((fs) => {
        if (!cancelled) setFactsheet(fs);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [robotClient, robot.robotId]);

  const ts = factsheet?.typeSpecification;
  const pp = factsheet?.physicalParameters;
  const hasFactsheet = ts ?? pp;

  return (
    <Card.Root
      size="sm"
      variant="outline"
      h={expanded ? '100%' : undefined}
      display={expanded ? 'flex' : undefined}
      flexDirection={expanded ? 'column' : undefined}
    >
      <Card.Body
        gap="8px"
        flex={expanded ? '1' : undefined}
        overflowY={expanded ? 'auto' : undefined}
      >
        <HStack gap="8px" flexWrap="wrap">
          <Text fontWeight={700} flex="1" minW={0} truncate>
            {robot.robotId}
          </Text>
          {robot.connection === 'OFFLINE' && (
            <RobotPanelConnectionBadge connection={robot.connection} />
          )}
          {robot.connection !== 'OFFLINE' && (
            <RobotPanelModeBadge mode={robot.operatingMode} />
          )}
          <RobotPanelBattery percent={robot.batteryPercent} />
        </HStack>

        <SimpleGrid columns={robot.lastNodeId ? 4 : 3} gap="8px">
          <Stat label="x" value={fmt(robot.x)} />
          <Stat label="y" value={fmt(robot.y)} />
          <Stat label="θ" value={fmt(robot.theta)} />
          {robot.lastNodeId && (
            <Stat label="Last node" value={robot.lastNodeId} />
          )}
        </SimpleGrid>

        {hasFactsheet && (
          <Box borderTopWidth="1px" borderColor="border.subtle" pt="8px">
            <Text
              fontSize="2xs"
              textTransform="uppercase"
              color="fg.subtle"
              mb={1}
            >
              Factsheet
            </Text>
            <SimpleGrid columns={2} gap="8px">
              {ts?.seriesName && <Stat label="Series" value={ts.seriesName} />}
              {ts?.agvKinematic && (
                <Stat label="Kinematic" value={ts.agvKinematic} />
              )}
              {ts?.agvClass && expanded && (
                <Stat label="Class" value={ts.agvClass} />
              )}
              {ts?.seriesDescription && expanded && (
                <Stat label="Description" value={ts.seriesDescription} />
              )}
              {ts?.maxLoadMass != null && expanded && (
                <Stat label="Max load" value={`${ts.maxLoadMass} kg`} />
              )}
              {pp?.speedMax != null && (
                <Stat label="Max speed" value={`${pp.speedMax} m/s`} />
              )}
              {pp?.accelerationMax != null && (
                <Stat label="Max accel" value={`${pp.accelerationMax} m/s²`} />
              )}
              {pp?.speedMin != null && expanded && (
                <Stat label="Min speed" value={`${pp.speedMin} m/s`} />
              )}
              {pp?.decelerationMax != null && expanded && (
                <Stat label="Max decel" value={`${pp.decelerationMax} m/s²`} />
              )}
              {pp?.heightMin != null && expanded && (
                <Stat label="Height min" value={`${pp.heightMin} m`} />
              )}
              {pp?.heightMax != null && expanded && (
                <Stat label="Height max" value={`${pp.heightMax} m`} />
              )}
              {pp?.widthMax != null && expanded && (
                <Stat label="Width max" value={`${pp.widthMax} m`} />
              )}
              {pp?.lengthMax != null && expanded && (
                <Stat label="Length max" value={`${pp.lengthMax} m`} />
              )}
            </SimpleGrid>
          </Box>
        )}

        {expanded && (
          <Box borderTopWidth="1px" borderColor="border.subtle" pt="8px">
            <HStack gap={2} mb={2} align="center">
              <Box flex="1" h="2px" bg="red.500" />
              <Text
                fontSize="2xs"
                textTransform="uppercase"
                color="red.500"
                flexShrink={0}
                fontWeight="bold"
              >
                The following section is for debugging only
              </Text>
              <Box flex="1" h="2px" bg="red.500" />
            </HStack>
            <Text
              fontSize="2xs"
              textTransform="uppercase"
              color="fg.subtle"
              mb={2}
            >
              Instant Actions
            </Text>
            <RobotPanelAssignShortestPath
              robotId={robot.robotId}
              defaultStartNodeId={robot.lastNodeId}
            />
            <RobotPanelInstantActions
              robotId={robot.robotId}
              factsheet={factsheet}
            />
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
}
