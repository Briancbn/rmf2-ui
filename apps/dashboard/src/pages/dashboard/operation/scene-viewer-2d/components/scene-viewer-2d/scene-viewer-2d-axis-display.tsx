import { chakra } from '@chakra-ui/react';
import { SceneViewer2DPanel } from './scene-viewer-2d-panel';
import type { SceneViewer2DPanelProps } from './scene-viewer-2d-panel';

interface SceneViewer2DAxisDisplayProps extends SceneViewer2DPanelProps {
  size?: number;
  ox?: number;
  oy?: number;
  originRadius?: number;
  armLength?: number;
  armStroke?: number;
  arrowSize?: number;
  fontSize?: number;
}

export function SceneViewer2DAxisDisplay({
  size = 20,
  ox = 4,
  oy = 16,
  originRadius = 1,
  armLength = 10,
  armStroke = 1,
  arrowSize = 3,
  fontSize = 4,
  ...panelProps
}: SceneViewer2DAxisDisplayProps) {
  function arrowHead(tx: number, ty: number, fx: number, fy: number): string {
    const dx = tx - fx,
      dy = ty - fy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len,
      uy = dy / len;
    const px = -uy,
      py = ux;
    const bx = tx - ux * arrowSize,
      by = ty - uy * arrowSize;
    return `${tx},${ty} ${bx + px * arrowSize * 0.45},${by + py * arrowSize * 0.45} ${bx - px * arrowSize * 0.45},${by - py * arrowSize * 0.45}`;
  }

  const xTip = { x: ox + armLength, y: oy };
  const yTip = { x: ox, y: oy - armLength };

  return (
    <SceneViewer2DPanel
      variant="bottom-right"
      p={1.5}
      lineHeight={0}
      bg="transparent"
      borderWidth="0px"
      backdropFilter="none"
      {...panelProps}
    >
      <chakra.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        {/* X axis — red */}
        <line
          x1={ox}
          y1={oy}
          x2={xTip.x}
          y2={xTip.y}
          stroke="#e53e3e"
          strokeWidth={armStroke}
          strokeLinecap="round"
        />
        <polygon points={arrowHead(xTip.x, xTip.y, ox, oy)} fill="#e53e3e" />
        <text
          x={xTip.x + 2}
          y={xTip.y}
          style={{ fontSize: `${fontSize}px`, fontWeight: 800 }}
          fill="#e53e3e"
          dominantBaseline="central"
        >
          x
        </text>

        {/* Y axis — green */}
        <line
          x1={ox}
          y1={oy}
          x2={yTip.x}
          y2={yTip.y}
          stroke="#38a169"
          strokeWidth={armStroke}
          strokeLinecap="round"
        />
        <polygon points={arrowHead(yTip.x, yTip.y, ox, oy)} fill="#38a169" />
        <text
          x={yTip.x}
          y={yTip.y - 2}
          style={{ fontSize: `${fontSize}px`, fontWeight: 800 }}
          fill="#38a169"
          textAnchor="middle"
        >
          y
        </text>

        {/* Origin dot */}
        <circle
          cx={ox}
          cy={oy}
          r={originRadius}
          fill="currentColor"
          opacity={0.5}
        />
      </chakra.svg>
    </SceneViewer2DPanel>
  );
}
