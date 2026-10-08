import { Badge } from '@chakra-ui/react';
import type { RobotConnection } from '../../classes/robot-client-base';

export interface RobotPanelConnectionBadgeProps {
  connection: RobotConnection | null | undefined;
}

export function RobotPanelConnectionBadge({
  connection,
}: RobotPanelConnectionBadgeProps) {
  if (!connection) return null;
  const online = connection === 'ONLINE';
  return (
    <Badge
      size="sm"
      colorPalette={online ? 'green' : 'red'}
      variant="subtle"
      flexShrink={0}
    >
      {connection}
    </Badge>
  );
}
