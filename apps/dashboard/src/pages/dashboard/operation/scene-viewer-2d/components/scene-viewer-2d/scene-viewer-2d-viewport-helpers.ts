import type { LifLayout } from '../../types';

export interface View {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Returns a new view zoomed by `scale` around the SVG-space focal point (cx, cy). */
export function calcViewBox(
  view: View,
  cx: number,
  cy: number,
  scale: number,
): View {
  const fx = (cx - view.x) / view.w;
  const fy = (cy - view.y) / view.h;
  const nw = view.w * scale;
  const nh = view.h * scale;
  return { x: cx - fx * nw, y: cy - fy * nh, w: nw, h: nh };
}

function medianEdgeLength(layout: LifLayout): number {
  const nodeById = new Map(layout.nodes.map((n) => [n.nodeId, n]));
  const lengths: number[] = [];
  for (const edge of layout.edges) {
    const a = nodeById.get(edge.startNodeId);
    const b = nodeById.get(edge.endNodeId);
    if (a && b) {
      const dx = b.nodePosition.x - a.nodePosition.x;
      const dy = b.nodePosition.y - a.nodePosition.y;
      lengths.push(Math.sqrt(dx * dx + dy * dy));
    }
  }
  if (lengths.length === 0) return Infinity;
  lengths.sort((a, b) => a - b);
  const mid = Math.floor(lengths.length / 2);
  return lengths.length % 2 === 0
    ? (lengths[mid - 1] + lengths[mid]) / 2
    : lengths[mid];
}

export function calcNodeRadiusMax(layout: LifLayout, maxRatio: number): number {
  return medianEdgeLength(layout) * maxRatio;
}

export function fitView(layout: LifLayout, padding: number): View {
  const nodes = layout.nodes;
  if (nodes.length === 0) return { x: -5, y: -5, w: 10, h: 10 };

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.nodePosition.x);
    minY = Math.min(minY, n.nodePosition.y);
    maxX = Math.max(maxX, n.nodePosition.x);
    maxY = Math.max(maxY, n.nodePosition.y);
  }

  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const pad = Math.max(w, h) * padding;
  // Negate Y: LIF uses Y-up, SVG uses Y-down. maxY in world space becomes the top (most negative SVG y).
  return { x: minX - pad, y: -maxY - pad, w: w + pad * 2, h: h + pad * 2 };
}
