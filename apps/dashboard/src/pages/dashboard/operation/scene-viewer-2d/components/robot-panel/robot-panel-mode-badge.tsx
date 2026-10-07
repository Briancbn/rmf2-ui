import { Badge } from '@chakra-ui/react';

export interface RobotPanelModeBadgeProps {
  mode: string | null | undefined;
}

export function RobotPanelModeBadge({ mode }: RobotPanelModeBadgeProps) {
  if (!mode) return null;
  const m = mode.toUpperCase();
  const palette =
    m === 'ERROR'
      ? 'red'
      : m === 'CHARGING'
        ? 'yellow'
        : m === 'DRIVING'
          ? 'blue'
          : 'green';
  return (
    <Badge size="sm" colorPalette={palette} variant="subtle" flexShrink={0}>
      {mode}
    </Badge>
  );
}
