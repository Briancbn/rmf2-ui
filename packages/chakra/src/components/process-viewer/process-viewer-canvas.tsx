import { useEffect, useMemo } from 'react';
import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Dagre from '@dagrejs/dagre';
import { useTheme } from 'next-themes';
import type { RTS } from '@rmf2-ui/data';
import { useProcessViewerCanvas } from './use-process-viewer';

export type ProcessViewerCanvasProps = BoxProps;

const getLayoutElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  // TODO(anyone): default node width and height
  const defaultNodeWidth = 172;
  const defaultNodeHeight = 36;
  const isHorizontal = direction === 'LR';

  // Use dagre to generate layout
  const dagreGraph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: node.measured?.width ?? defaultNodeWidth,
      height: node.measured?.height ?? defaultNodeHeight,
    });
  });

  Dagre.layout(dagreGraph);

  const newNodes: Node[] = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    const x = dagreNode.x - (node.measured?.width ?? defaultNodeWidth) / 2;
    const y = dagreNode.y - (node.measured?.height ?? defaultNodeHeight) / 2;
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: { x, y },
    };

    const dependants = dagreGraph.inEdges(node.id) ?? [];
    const successors = dagreGraph.outEdges(node.id) ?? [];
    if (successors.length === 0) newNode.type = 'output';
    if (dependants.length === 0) newNode.type = 'input';

    return newNode;
  });

  return { nodes: newNodes, edges };
};

export function ProcessViewerCanvas(props: ProcessViewerCanvasProps) {
  const { ...rest } = props;
  const { selectedProcess, tasks, onNodeDoubleClick, getNodeColor } =
    useProcessViewerCanvas();

  // sync theme with xyflow
  const { resolvedTheme, forcedTheme } = useTheme();
  const colorMode = (forcedTheme || resolvedTheme) as 'light' | 'dark';

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const taskMap = useMemo(() => {
    const map: Record<string, RTS.Task> = {};
    for (const task of tasks) {
      map[task.id] = task;
    }
    return map;
  }, [tasks]);

  // generate nodes for display
  useEffect(() => {
    if (selectedProcess === undefined) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const rawNodes: Node[] = selectedProcess.graph.map((element) => {
      const task = taskMap[element.id];
      const pct =
        task?.progress !== undefined ? task.progress * 100 : undefined;
      return {
        id: element.id,
        position: { x: 0, y: 0 },
        data: { label: task?.description ?? element.id },
        style: {
          background: getNodeColor?.(element.id),
          // display progress as backgroundImage
          backgroundImage:
            pct !== undefined
              ? `linear-gradient(to right, rgba(255,255,255,0.25) ${pct}%, rgba(0,0,0,0.15) ${pct}%)`
              : undefined,
        },
      };
    });

    const rawEdges: Edge[] = [];
    for (const element of selectedProcess.graph) {
      element.needs.forEach((dep) => {
        rawEdges.push({
          id: `${dep.id}->${element.id}`,
          source: dep.id,
          target: element.id,
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      });
    }

    const { nodes: layoutNodes, edges: layoutEdges } = getLayoutElements(
      rawNodes,
      rawEdges,
    );
    setNodes(layoutNodes);
    setEdges(layoutEdges);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProcess, taskMap, getNodeColor]);

  return (
    <Box w="100%" h="min(600px, 70vh)" {...rest}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        colorMode={colorMode}
        fitView
        onNodeDoubleClick={
          onNodeDoubleClick
            ? (_, node) => onNodeDoubleClick(node.id)
            : undefined
        }
      >
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
}
