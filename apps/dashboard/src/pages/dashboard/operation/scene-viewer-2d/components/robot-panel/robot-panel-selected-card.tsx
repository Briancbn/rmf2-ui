import { Box, IconButton } from '@chakra-ui/react';
import { LuMaximize2, LuMinimize2 } from 'react-icons/lu';
import { useRobotPanelContext } from './use-robot-panel';
import { RobotPanelCard } from './robot-panel-card';

export function RobotPanelSelectedCard() {
  const { robots, selectedId, expanded, setExpanded } = useRobotPanelContext();
  const robot = robots.find((r) => r.robotId === selectedId) ?? null;
  if (!robot) return null;

  return (
    <Box
      position="relative"
      flex={expanded ? '1' : undefined}
      minH={0}
      flexShrink={0}
      display={expanded ? 'flex' : undefined}
      flexDirection={expanded ? 'column' : undefined}
    >
      <RobotPanelCard robot={robot} expanded={expanded} />
      <IconButton
        aria-label={expanded ? 'Collapse' : 'Expand'}
        size="2xs"
        variant="ghost"
        position="absolute"
        bottom="8px"
        right="8px"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <LuMinimize2 /> : <LuMaximize2 />}
      </IconButton>
    </Box>
  );
}
