import { useEffect, useMemo } from 'react';
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
import { useProcessViewerContext } from './use-process-viewer';

const getLayoutElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const defaultNodeWidth = 172;
  const defaultNodeHeight = 36;
  const isHorizontal = direction === 'LR';
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

export function ProcessViewerGraphView() {
  const { selectedProcess, tasks } = useProcessViewerContext();
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

  useEffect(() => {
    if (selectedProcess === undefined) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const rawNodes: Node[] = selectedProcess.graph.map((element) => ({
      id: element.id,
      position: { x: 0, y: 0 },
      data: { label: taskMap[element.id]?.description ?? element.id },
    }));

    const rawEdges: Edge[] = [];
    for (const element of selectedProcess.graph) {
      element.needs.forEach((dep) => {
        rawEdges.push({
          id: `${dep.id}->${element.id}`,
          type: 'bezier',
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
  }, [selectedProcess, taskMap]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      colorMode={colorMode}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
