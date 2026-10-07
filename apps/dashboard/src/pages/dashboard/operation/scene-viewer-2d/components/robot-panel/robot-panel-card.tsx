import { Box, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import type { RobotState } from '../../classes/robot-client-base';
import { RobotPanelBattery } from './robot-panel-battery';
import { RobotPanelModeBadge } from './robot-panel-mode-badge';

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
}

export function RobotPanelCard({ robot }: RobotPanelCardProps) {
  const fmt = (v: number | null) => (v == null ? '—' : v.toFixed(3));
  return (
    <Stack
      gap="8px"
      px="8px"
      pt="8px"
      pb="12px"
      borderTopWidth="1px"
      borderColor="border.subtle"
    >
      <HStack gap="8px" flexWrap="wrap">
        <Text fontWeight={700} flex="1" minW={0} truncate>
          {robot.robotId}
        </Text>
        <RobotPanelBattery percent={robot.batteryPercent} />
        <RobotPanelModeBadge mode={robot.operatingMode} />
      </HStack>

      <SimpleGrid columns={3} gap="8px">
        <Stat label="x" value={fmt(robot.x)} />
        <Stat label="y" value={fmt(robot.y)} />
        <Stat label="θ" value={fmt(robot.theta)} />
      </SimpleGrid>
    </Stack>
  );
}
