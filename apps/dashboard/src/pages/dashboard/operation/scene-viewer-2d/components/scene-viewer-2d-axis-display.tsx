import { chakra } from '@chakra-ui/react';
import { SceneViewer2DPanel } from './scene-viewer-2d-panel';

const SIZE = 20;
const OX = 4;
const OY = 16;
const OR = 1;
const ARM_LENGTH = 10;
const ARM_STROKE = 1;
const ARROW = 3;
const FONT = 4;

function arrowHead(tx: number, ty: number, fx: number, fy: number): string {
  const dx = tx - fx,
    dy = ty - fy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len,
    uy = dy / len;
  const px = -uy,
    py = ux;
  const bx = tx - ux * ARROW,
    by = ty - uy * ARROW;
  return `${tx},${ty} ${bx + px * ARROW * 0.45},${by + py * ARROW * 0.45} ${bx - px * ARROW * 0.45},${by - py * ARROW * 0.45}`;
}

const xTip = { x: OX + ARM_LENGTH, y: OY };
const yTip = { x: OX, y: OY - ARM_LENGTH };

export function SceneViewer2DAxisDisplay() {
  return (
    <SceneViewer2DPanel
      variant="bottom-right"
      p={1.5}
      lineHeight={0}
      bg="transparent"
      borderWidth="0px"
      backdropFilter="none"
    >
      <chakra.svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden
      >
        {/* X axis — red */}
        <line
          x1={OX}
          y1={OY}
          x2={xTip.x}
          y2={xTip.y}
          stroke="#e53e3e"
          strokeWidth={ARM_STROKE}
          strokeLinecap="round"
        />
        <polygon points={arrowHead(xTip.x, xTip.y, OX, OY)} fill="#e53e3e" />
        <text
          x={xTip.x + 2}
          y={xTip.y}
          style={{ fontSize: `${FONT}px`, fontWeight: 800 }}
          fill="#e53e3e"
          dominantBaseline="central"
        >
          x
        </text>

        {/* Y axis — green */}
        <line
          x1={OX}
          y1={OY}
          x2={yTip.x}
          y2={yTip.y}
          stroke="#38a169"
          strokeWidth={ARM_STROKE}
          strokeLinecap="round"
        />
        <polygon points={arrowHead(yTip.x, yTip.y, OX, OY)} fill="#38a169" />
        <text
          x={yTip.x}
          y={yTip.y - 2}
          style={{ fontSize: `${FONT}px`, fontWeight: 800 }}
          fill="#38a169"
          textAnchor="middle"
        >
          y
        </text>

        {/* Origin dot */}
        <circle cx={OX} cy={OY} r={OR} fill="currentColor" opacity={0.5} />
      </chakra.svg>
    </SceneViewer2DPanel>
  );
}
