import { HStack, Text } from '@chakra-ui/react';

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

export interface RobotPanelBatteryProps {
  percent: number | null | undefined;
}

export function RobotPanelBattery({ percent }: RobotPanelBatteryProps) {
  const fill = percent == null ? 0 : Math.max(0, Math.min(100, percent)) / 100;
  return (
    <HStack
      gap="4px"
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
          fill={batteryFillColor(percent)}
        />
      </svg>
      <Text fontSize="2xs" fontWeight="semibold" fontFamily="mono">
        {fmtBattery(percent)}
      </Text>
    </HStack>
  );
}
