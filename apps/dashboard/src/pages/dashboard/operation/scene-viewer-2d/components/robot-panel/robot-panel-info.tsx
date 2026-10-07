import { Box, HStack, Text } from '@chakra-ui/react';
import type { RobotState } from '../../classes/robot-client-base';
import { RobotPanelBattery } from './robot-panel-battery';
import { RobotPanelModeBadge } from './robot-panel-mode-badge';

export const ROBOT_COLORS = [
  '#3182ce',
  '#dd6b20',
  '#38a169',
  '#d53f8c',
  '#805ad5',
  '#e53e3e',
];

export function getRobotColor(index: number): string {
  return ROBOT_COLORS[index % ROBOT_COLORS.length]!;
}

export interface RobotPanelInfoProps {
  robot: RobotState;
  index: number;
  selected?: boolean;
  onSelect?: () => void;
}

export function RobotPanelInfo({
  robot,
  index,
  selected = false,
  onSelect,
}: RobotPanelInfoProps) {
  return (
    <HStack
      px="8px"
      py="6px"
      gap="8px"
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
      <Box
        w="10px"
        h="10px"
        borderRadius="full"
        bg={getRobotColor(index)}
        flexShrink={0}
      />
      <Text fontSize="sm" fontWeight={600} flex="1" minW={0} truncate>
        {robot.robotId}
      </Text>
      <RobotPanelModeBadge mode={robot.operatingMode} />
      <RobotPanelBattery percent={robot.batteryPercent} />
    </HStack>
  );
}
