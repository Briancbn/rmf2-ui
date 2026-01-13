import { useCallback, useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Position,
  ReactFlow,
  Background,
  Controls,
  NodeChange,
  Node,
  EdgeChange,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Dagre from '@dagrejs/dagre';
import type { RTS } from '@rmf2-ui/data';

const getLayoutElements = (nodes: Node[], edges: Edge[]) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR' });
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 100,
      height: node.measured?.height ?? 100,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 100) / 2;
      const y = position.y - (node.measured?.height ?? 100) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

export interface ProcessProps {
  schedule?: RTS.Schedule;
}

export function Process(props: ProcessProps) {
  const { schedule } = props;
  const nodeDefaults = {
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };

  useEffect(() => {
    if (schedule === undefined) {
      return;
    }

    if (schedule.processes.length === 0) {
      return;
    }

    const process: RTS.Process = schedule.processes[0];

    const taskMap: Record<string, RTS.Task> = {};
    for (const task of schedule.tasks) {
      taskMap[task.id] = task;
    }

    const nodes: Node[] = process.graph.map((element) => ({
      id: element.id,
      position: { x: 0, y: 0 },
      data: { label: taskMap[element.id].description },
      type: element.needs.length === 0 ? 'input' : undefined,
      ...nodeDefaults,
    }));

    const edges: Edge[] = [];

    for (const element of process.graph) {
      element.needs.forEach((dependency) => {
        edges.push({
          id: `${dependency.id}->${element.id}`,
          type: 'bezier',
          source: dependency.id,
          target: element.id,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      });
    }

    const { nodes: layoutNodes, edges: layoutEdges } = getLayoutElements(
      nodes,
      edges,
    );
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [schedule]);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  return (
    <Box w="100%" h="600px">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
}
