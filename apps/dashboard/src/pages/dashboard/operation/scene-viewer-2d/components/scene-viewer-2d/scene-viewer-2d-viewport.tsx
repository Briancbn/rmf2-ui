import React, { useEffect, useRef, useState } from 'react';
import { Box, chakra } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import type { LifData, LifLayout } from '../types';
import type { SceneBackground } from '../../classes/scene-client-base';
import { useSceneViewer2DViewport } from './use-scene-viewer-2d';

// Fractions of viewBox width — apparent size stays constant across zoom/map scales.
const NODE_RADIUS_FRAC = 0.018;
const EDGE_WIDTH_FRAC = 0.004;
const LABEL_SIZE_FRAC = 0.021;
// Max node radius relative to median edge length; used to limit node size on dense maps.
const NODE_RADIUS_TO_EDGE_LENGTH_MAX_RATIO = 0.125;

const WHEEL_FACTOR = 1.1;
const DRAG_THRESHOLD = 4;
const FIT_PADDING = 0.02;

interface View {
  x: number;
  y: number;
  w: number;
  h: number;
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

function calcNodeRadiusCap(layout: LifLayout, maxRatio: number): number {
  return medianEdgeLength(layout) * maxRatio;
}

function fitView(layout: LifLayout, padding: number): View {
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

export interface SceneViewer2DViewportProps {
  /** Index of the initial layout to display. Defaults to 0. */
  initialLayoutIndex?: number;
  /** Node radius as a fraction of viewBox width. */
  nodeRadiusFrac?: number;
  /** Edge stroke width as a fraction of viewBox width. */
  edgeWidthFrac?: number;
  /** Label font size as a fraction of viewBox width. */
  labelSizeFrac?: number;
  /** Max node radius relative to median edge length. Limits node size on dense maps. */
  nodeRadiusToEdgeLengthMaxRatio?: number;
  /** Zoom factor per mouse wheel tick. */
  wheelFactor?: number;
  /** Pixel distance before a mouse press is treated as a pan. */
  dragThreshold?: number;
  /** Padding around the map bounds on fit, as a fraction of the larger dimension. */
  fitPadding?: number;
}

export function SceneViewer2DViewport(props: SceneViewer2DViewportProps) {
  const {
    initialLayoutIndex = 0,
    nodeRadiusFrac = NODE_RADIUS_FRAC,
    edgeWidthFrac = EDGE_WIDTH_FRAC,
    labelSizeFrac = LABEL_SIZE_FRAC,
    nodeRadiusToEdgeLengthMaxRatio = NODE_RADIUS_TO_EDGE_LENGTH_MAX_RATIO,
    wheelFactor = WHEEL_FACTOR,
    dragThreshold = DRAG_THRESHOLD,
    fitPadding = FIT_PADDING,
  } = props;
  const {
    mapClient,
    sceneClient,
    setLoadStatus,
    setLoadMessage,
    notifyZoom,
    targetZoom,
    fitMode,
    fitTrigger,
  } = useSceneViewer2DViewport();
  const imageFilter = useColorModeValue('none', 'invert(1)');

  // All layouts are cached in a ref; layout names and current selection drive re-renders.
  const lifDataRef = useRef<LifData | null>(null);
  const [layoutIds, setLayoutIds] = useState<string[]>([]);
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);

  const [background, setBackground] = useState<SceneBackground | null>(null);

  const viewRef = useRef<View>({ x: -5, y: -5, w: 10, h: 10 });
  // Reference view at 100% zoom (set on fit); zoom % is applied relative to this.
  const fitViewRef = useRef<View | null>(null);
  const nodeRadiusCapRef = useRef(Infinity);
  const lastNodeRadiusRef = useRef(-1);

  const svgRef = useRef<SVGSVGElement>(null);

  const applyView = (v: View, updateDimensions = false) => {
    viewRef.current = v;
    const svg = svgRef.current;
    if (!svg) return;
    svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    if (updateDimensions) {
      const uncappedRadius = v.w * nodeRadiusFrac;
      const nodeRadius = Math.min(uncappedRadius, nodeRadiusCapRef.current);
      // Already at the max node radius. Nothing to update.
      if (nodeRadius === lastNodeRadiusRef.current) return;
      lastNodeRadiusRef.current = nodeRadius;
      // CSS custom properties: setting them here updates all nodes, edges, and labels at once via var().
      svg.style.setProperty('--node-radius', `${nodeRadius}px`);
      if (nodeRadius === uncappedRadius) {
        // Normal: sizes scale with viewBox width.
        svg.style.setProperty('--edge-width', `${v.w * edgeWidthFrac}px`);
        svg.style.fontSize = `${v.w * labelSizeFrac}px`;
      } else {
        // Max node radius reached: derive edge and label from node radius to keep ratios consistent.
        svg.style.setProperty(
          '--edge-width',
          `${nodeRadius * (edgeWidthFrac / nodeRadiusFrac)}px`,
        );
        svg.style.fontSize = `${nodeRadius * (labelSizeFrac / nodeRadiusFrac)}px`;
      }
    }
  };
  // requestAnimationFrame handle: batches mouse wheel / scroll events so the DOM updates once per frame.
  const wheelRafRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    setLoadStatus('loading');
    let cancelled = false;

    mapClient
      .getMapData()
      .then((data) => {
        if (cancelled) return;
        lifDataRef.current = data;

        const ids = data.layouts.map((l) => l.layoutId);
        const initial =
          data.layouts[initialLayoutIndex]?.layoutId ?? ids[0] ?? null;

        setLayoutIds(ids);
        setCurrentLayoutId(initial);

        const initialLayout =
          data.layouts[initialLayoutIndex] ?? data.layouts[0] ?? null;
        if (initialLayout) {
          nodeRadiusCapRef.current = calcNodeRadiusCap(
            initialLayout,
            nodeRadiusToEdgeLengthMaxRatio,
          );
          const fv = fitView(initialLayout, fitPadding);
          fitViewRef.current = fv;
          applyView(fv, true);
          notifyZoom(100);
        }

        setLoadStatus('success');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadStatus('error');
        setLoadMessage({
          title: 'Failed to load map',
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mapClient,
    initialLayoutIndex,
    setLoadStatus,
    setLoadMessage,
    notifyZoom,
  ]);

  useEffect(() => {
    if (!sceneClient) return;
    let cancelled = false;
    sceneClient.getBackground().then((bg) => {
      if (!cancelled) setBackground(bg);
    });
    return () => {
      cancelled = true;
    };
  }, [sceneClient]);

  // Apply targetZoom change relative to the fit view.
  useEffect(() => {
    const fv = fitViewRef.current;
    if (!fv) return;
    const scale = 100 / targetZoom;
    const cx = fv.x + fv.w / 2;
    const cy = fv.y + fv.h / 2;
    const nw = fv.w * scale;
    const nh = fv.h * scale;
    notifyZoom(targetZoom);
    applyView({ x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetZoom, notifyZoom]);

  // Execute fit when fitMode or fitTrigger changes.
  useEffect(() => {
    if (!currentLayoutId || !lifDataRef.current) return;
    const layout = lifDataRef.current.layouts.find(
      (l) => l.layoutId === currentLayoutId,
    );
    if (!layout) return;
    // Only 'map' is implemented; future modes (robots, all) will fit to their respective bounds.
    if (fitMode === 'map') {
      nodeRadiusCapRef.current = calcNodeRadiusCap(
        layout,
        nodeRadiusToEdgeLengthMaxRatio,
      );
      const fv = fitView(layout, fitPadding);
      fitViewRef.current = fv;
      applyView(fv, true);
      notifyZoom(100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitMode, fitTrigger, currentLayoutId, notifyZoom]);

  // Fit view whenever the selected layout changes after initial load.
  useEffect(() => {
    if (!currentLayoutId || !lifDataRef.current) return;
    const layout = lifDataRef.current.layouts.find(
      (l) => l.layoutId === currentLayoutId,
    );
    if (layout) {
      nodeRadiusCapRef.current = calcNodeRadiusCap(
        layout,
        nodeRadiusToEdgeLengthMaxRatio,
      );
      const fv = fitView(layout, fitPadding);
      fitViewRef.current = fv;
      applyView(fv, true);
      notifyZoom(100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLayoutId, notifyZoom]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const { x, y, w, h } = viewRef.current;
      const fx = (e.clientX - rect.left) / rect.width;
      const fy = (e.clientY - rect.top) / rect.height;
      const vx = x + fx * w;
      const vy = y + fy * h;
      const factor = e.deltaY > 0 ? wheelFactor : 1 / wheelFactor;
      const nw = w * factor;
      const nh = h * factor;
      viewRef.current = { x: vx - fx * nw, y: vy - fy * nh, w: nw, h: nh };
      if (wheelRafRef.current === null) {
        wheelRafRef.current = requestAnimationFrame(() => {
          wheelRafRef.current = null;
          applyView(viewRef.current, true);
          const fv = fitViewRef.current;
          if (fv) notifyZoom((fv.w / viewRef.current.w) * 100);
        });
      }
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      svg.removeEventListener('wheel', onWheel);
      if (wheelRafRef.current !== null)
        cancelAnimationFrame(wheelRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifyZoom]);

  const onMouseDown = (e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    suppressClickRef.current = false;
    const rect = svg.getBoundingClientRect();
    const start = { cx: e.clientX, cy: e.clientY, ...viewRef.current };
    const k = Math.max(start.w / rect.width, start.h / rect.height);
    svg.style.cursor = 'grabbing';
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - start.cx;
      const dy = ev.clientY - start.cy;
      if (Math.hypot(dx, dy) > dragThreshold) suppressClickRef.current = true;
      applyView({
        x: start.x - dx * k,
        y: start.y - dy * k,
        w: start.w,
        h: start.h,
      });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      svg.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const layout =
    lifDataRef.current?.layouts.find((l) => l.layoutId === currentLayoutId) ??
    null;
  const nodeById = new Map((layout?.nodes ?? []).map((n) => [n.nodeId, n]));

  // layoutIds and setCurrentLayoutId are available for a future layout-picker UI.
  void layoutIds;
  void setCurrentLayoutId;

  const { x: vx, y: vy, w: vw, h: vh } = viewRef.current;

  return (
    <Box
      position="relative"
      w="100%"
      h="100%"
      overflow="hidden"
      borderWidth="1px"
      borderRadius="lg"
    >
      {/* Background layer — isolated so the invert filter does not affect map geometry above it */}
      <Box
        position="absolute"
        inset={0}
        bg={
          background?.type === 'color'
            ? background.color
            : { base: 'white', _dark: 'black' }
        }
        _dark={{ filter: 'invert(1)' }}
      />
      <chakra.svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={onMouseDown}
        aria-hidden
        fontWeight="semibold"
        letterSpacing="normal"
        color={{ base: 'gray.700', _dark: 'gray.300' }}
        style={{
          display: 'block',
          position: 'relative',
          touchAction: 'none',
          cursor: 'grab',
        }}
      >
        {background?.type === 'image' && (
          // Y is negated to match the Y-up coordinate system used throughout the viewport.
          <image
            href={background.imageUrl}
            x={background.offset.x}
            y={-background.offset.y}
            width={background.scale}
            height={background.scale}
            transform={`rotate(${-background.rotation}, ${background.offset.x}, ${-background.offset.y})`}
            preserveAspectRatio="none"
            style={{ filter: imageFilter }}
          />
        )}

        {(layout?.edges ?? []).map((edge) => {
          const a = nodeById.get(edge.startNodeId);
          const b = nodeById.get(edge.endNodeId);
          if (!a || !b) return null;
          return (
            <line
              key={edge.edgeId}
              x1={a.nodePosition.x}
              y1={-a.nodePosition.y}
              x2={b.nodePosition.x}
              y2={-b.nodePosition.y}
              stroke="currentColor"
              strokeOpacity={0.25}
              style={{ strokeWidth: 'var(--edge-width)' }}
            />
          );
        })}
        {(layout?.nodes ?? []).map((node) => (
          <g key={node.nodeId}>
            <circle
              cx={node.nodePosition.x}
              cy={-node.nodePosition.y}
              style={{ r: 'var(--node-radius)' } as React.CSSProperties}
              fill="currentColor"
            />
            <text
              x={node.nodePosition.x}
              y={-node.nodePosition.y}
              style={{
                transform: 'translateY(calc(-1.4 * var(--node-radius)))',
              }}
              textAnchor="middle"
              fill="currentColor"
            >
              {node.nodeId}
            </text>
          </g>
        ))}
      </chakra.svg>
    </Box>
  );
}
