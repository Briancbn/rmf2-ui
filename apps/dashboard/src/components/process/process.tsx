import { useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Dagre from '@dagrejs/dagre';
import type { RTS } from '@rmf2-ui/data';

const getLayoutElements = (
  nodes: Node[],
  edges: Edge[],
  direction: string = 'LR',
) => {
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
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: { x, y },
    };

    // override type
    const dependants = dagreGraph.inEdges(node.id) ?? [];
    const successors = dagreGraph.outEdges(node.id) ?? [];
    if (successors.length === 0) {
      newNode.type = 'output';
    }

    if (dependants.length === 0) {
      newNode.type = 'input';
    }

    return newNode;
  });

  return {
    nodes: newNodes,
    edges,
  };
};

export interface ProcessProps {
  schedule?: RTS.Schedule;
}

export function Process(props: ProcessProps) {
  const { schedule } = props;
  const nodeDefaults = {}; // unused

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

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
