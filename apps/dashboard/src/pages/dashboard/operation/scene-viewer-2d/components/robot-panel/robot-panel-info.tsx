import { Box, HStack, Text } from '@chakra-ui/react';
import type { RobotState } from '../../classes/robot-client-base';
import { RobotPanelBattery } from './robot-panel-battery';
import { RobotPanelModeBadge } from './robot-panel-mode-badge';
import { RobotPanelConnectionBadge } from './robot-panel-connection-badge';
import { useRobotPanelContext } from './use-robot-panel';

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
  const { robotClient } = useRobotPanelContext();
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
        bg={robotClient.getRobotColor(robot.robotId, index)}
        flexShrink={0}
      />
      <Text fontSize="sm" fontWeight={600} flex="1" minW={0} truncate>
        {robot.robotId}
      </Text>
      {robot.lastNodeId && (
        <Text fontSize="xs" fontFamily="mono" color="fg.subtle" flexShrink={0}>
          {robot.lastNodeId}
        </Text>
      )}
      {robot.connection === 'OFFLINE' && (
        <RobotPanelConnectionBadge connection={robot.connection} />
      )}
      {robot.connection !== 'OFFLINE' && (
        <RobotPanelModeBadge mode={robot.operatingMode} />
      )}
      <RobotPanelBattery percent={robot.batteryPercent} />
    </HStack>
  );
}
