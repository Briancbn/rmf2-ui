import React, { useEffect, useRef, useState } from 'react';
import { Box, chakra } from '@chakra-ui/react';
import { useColorModeValue } from '@/components/ui/color-mode';
import type { LifData } from '../../types';
import type { SceneBackground } from '../../classes/scene-client-base';
import { useSceneViewer2DViewport } from './use-scene-viewer-2d';
import {
  calcViewBox,
  calcNodeRadiusMax,
  fitView,
} from './scene-viewer-2d-viewport-helpers';
import type { View } from './scene-viewer-2d-viewport-helpers';

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
  /** Node label horizontal offset as a multiple of node radius. */
  labelOffsetXFactor?: number;
  /** Node label vertical offset as a multiple of node radius. */
  labelOffsetYFactor?: number;
  /** Robot body radius as a multiple of the node radius. */
  robotBaseSizeFactor?: number;
  /** Robot label horizontal offset as a multiple of robot radius. */
  robotLabelOffsetXFactor?: number;
  /** Robot label vertical offset as a multiple of robot radius. */
  robotLabelOffsetYFactor?: number;
}

export function SceneViewer2DViewport(props: SceneViewer2DViewportProps) {
  const {
    initialLayoutIndex = 0,
    nodeRadiusFrac = 0.018,
    edgeWidthFrac = 0.004,
    labelSizeFrac = 0.021,
    nodeRadiusToEdgeLengthMaxRatio = 0.125,
    wheelFactor = 1.1,
    dragThreshold = 4,
    fitPadding = 0.02,
    labelOffsetXFactor = 0,
    labelOffsetYFactor = 1.4,
    robotBaseSizeFactor = 2,
    robotLabelOffsetXFactor = 0,
    robotLabelOffsetYFactor = 2.2,
  } = props;
  const {
    mapClient,
    sceneClient,
    robotClient,
    setLoadStatus,
    setLoadMessage,
    notifyZoom,
    targetZoom,
    fitMode,
    fitTrigger,
    robots,
    selectedRobotId,
    setSelectedRobotId,
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
  const nodeRadiusMaxRef = useRef(Infinity);
  const lastNodeRadiusRef = useRef(-1);

  const svgRef = useRef<SVGSVGElement>(null);

  const applyView = (v: View, updateDimensions = false) => {
    viewRef.current = v;
    const svg = svgRef.current;
    if (!svg) return;
    svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
    if (updateDimensions) {
      const scaledRadius = v.w * nodeRadiusFrac;
      const nodeRadius = Math.min(scaledRadius, nodeRadiusMaxRef.current);
      // Already at the max node radius. Nothing to update.
      if (nodeRadius === lastNodeRadiusRef.current) return;
      lastNodeRadiusRef.current = nodeRadius;
      // CSS custom properties: setting them here updates all nodes, edges, and labels at once via var().
      svg.style.setProperty('--node-radius', `${nodeRadius}px`);
      // Robot vars derived from nodeRadius so they always stay in the same ratio.
      const robotRadius = nodeRadius * robotBaseSizeFactor;
      svg.style.setProperty('--robot-radius', `${robotRadius}px`);
      svg.style.setProperty('--robot-scale', `${robotRadius}`);
      if (nodeRadius === scaledRadius) {
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

    async function load() {
      try {
        const data = await mapClient.getMapData();
        if (cancelled) return;

        if (data.layouts.length === 0) {
          setLoadStatus('error');
          setLoadMessage({
            title: 'No layouts',
            description: 'The map contains no layouts.',
          });
          return;
        }

        lifDataRef.current = data;

        // TODO(anyone): allow controls of multiple layouts
        const ids = data.layouts.map((l) => l.layoutId);
        const initial =
          data.layouts[initialLayoutIndex]?.layoutId ?? ids[0] ?? null;

        setLayoutIds(ids);
        setCurrentLayoutId(initial);

        const initialLayout =
          data.layouts[initialLayoutIndex] ?? data.layouts[0] ?? null;
        if (initialLayout) {
          nodeRadiusMaxRef.current = calcNodeRadiusMax(
            initialLayout,
            nodeRadiusToEdgeLengthMaxRatio,
          );
          const fv = fitView(initialLayout, fitPadding);
          fitViewRef.current = fv;
          applyView(fv, true);
          notifyZoom(100);
        }

        setLoadStatus('success');
      } catch (err) {
        if (cancelled) return;
        setLoadStatus('error');
        setLoadMessage({
          title: 'Failed to load map',
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    load();
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

    async function load() {
      const bg = await sceneClient.getBackground();
      if (!cancelled) setBackground(bg);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sceneClient]);

  // Apply targetZoom change relative to the fit view.
  useEffect(() => {
    const fv = fitViewRef.current;
    if (!fv) return;
    const cx = fv.x + fv.w / 2;
    const cy = fv.y + fv.h / 2;
    const scale = 100 / targetZoom;
    const newView = calcViewBox(fv, cx, cy, scale);
    applyView(newView, true);
    notifyZoom((fv.w / newView.w) * 100);
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
      nodeRadiusMaxRef.current = calcNodeRadiusMax(
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
      nodeRadiusMaxRef.current = calcNodeRadiusMax(
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
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
      const factor = e.deltaY > 0 ? wheelFactor : 1 / wheelFactor;
      viewRef.current = calcViewBox(viewRef.current, svgPt.x, svgPt.y, factor);
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
    const svgUnitsPerPx = Math.max(start.w / rect.width, start.h / rect.height);
    svg.style.cursor = 'grabbing';
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - start.cx;
      const dy = ev.clientY - start.cy;
      if (Math.hypot(dx, dy) > dragThreshold) suppressClickRef.current = true;
      applyView({
        x: start.x - dx * svgUnitsPerPx,
        y: start.y - dy * svgUnitsPerPx,
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
        }}
      >
        {/* Image Background */}
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

        {/* Edges */}
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

        {/* Nodes */}
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
                transform: `translate(calc(${labelOffsetXFactor} * var(--node-radius)), calc(${-labelOffsetYFactor} * var(--node-radius)))`,
              }}
              textAnchor="middle"
              fill="currentColor"
            >
              {node.nodeId}
            </text>
          </g>
        ))}

        {currentLayoutId != null &&
          robots.map((robot, i) => {
            if (robot.x == null || robot.y == null) return null;
            const color = robotClient.getRobotColor(robot.robotId, i);
            const isSelected = robot.robotId === selectedRobotId;
            // Negate theta: LIF is Y-up CCW, SVG is Y-down so CCW becomes CW.
            const headingDeg = -((robot.theta ?? 0) * 180) / Math.PI;
            return (
              <g
                key={robot.robotId}
                transform={`translate(${robot.x}, ${-robot.y})`}
                onClick={() =>
                  !suppressClickRef.current &&
                  setSelectedRobotId(isSelected ? null : robot.robotId)
                }
                style={{ cursor: 'pointer' }}
              >
                {isSelected && (
                  <circle
                    style={
                      {
                        r: 'var(--robot-radius)',
                        strokeWidth: 'calc(0.12 * var(--robot-radius))',
                      } as React.CSSProperties
                    }
                    fill="none"
                    stroke={color}
                  />
                )}
                <circle
                  style={{ r: 'var(--robot-radius)' } as React.CSSProperties}
                  fill={color}
                  opacity={0.25}
                />
                {/* Heading arrow: CSS transform drives scale via --robot-scale so it
                  updates with zoom without a React re-render. transform-origin is
                  the robot's SVG position so rotate/scale pivot at the robot centre. */}
                <g
                  style={{
                    transform: `rotate(${headingDeg}deg) scale(var(--robot-scale))`,
                  }}
                >
                  <polygon points="1,0 -0.5,0.4 -0.5,-0.4" fill={color} />
                </g>
                <text
                  textAnchor="middle"
                  fill={color}
                  fontWeight={700}
                  style={{
                    transform: `translate(calc(${robotLabelOffsetXFactor} * var(--robot-radius)), calc(${-robotLabelOffsetYFactor} * var(--robot-radius)))`,
                  }}
                >
                  {robot.robotId}
                </text>
              </g>
            );
          })}
      </chakra.svg>
    </Box>
  );
}
