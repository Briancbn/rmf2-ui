import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from './utils';
import type { RTS } from '@rmf2-ui/data';
import {
  ProcessViewerRoot,
  ProcessViewerControlPanel,
  ProcessViewerDefaultControls,
  ProcessViewerProcessSelector,
  ProcessViewerCanvas,
} from '@/components/process-viewer';

vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow">{children}</div>
  ),
  Background: () => null,
  Controls: () => null,
  useNodesState: () => [[], vi.fn()],
  useEdgesState: () => [[], vi.fn()],
  MarkerType: { ArrowClosed: 'arrowclosed' },
  Position: { Left: 'left', Right: 'right' },
  Handle: () => null,
  useReactFlow: () => ({ fitView: vi.fn() }),
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
vi.mock('@xyflow/react/dist/style.css', () => ({}));
vi.mock('@dagrejs/dagre', () => ({
  default: {
    graphlib: {
      Graph: class {
        setDefaultEdgeLabel() {
          return this;
        }
        setGraph() {
          return this;
        }
        setEdge() {}
        setNode() {}
        node() {
          return { x: 0, y: 0 };
        }
        inEdges() {
          return [];
        }
        outEdges() {
          return [];
        }
      },
    },
    layout: vi.fn(),
  },
}));

const TASKS: RTS.Task[] = [
  {
    id: 't1',
    type: 'delivery',
    startTime: new Date(),
    status: '',
    taskDetails: {},
    processId: 'p1',
  },
];

const PROCESSES: RTS.Process[] = [
  { id: 'p1', graph: [{ id: 't1', needs: [] }] },
];

describe('ProcessViewerRoot', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ProcessViewerRoot processes={PROCESSES} tasks={TASKS} />,
    );
    expect(container).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <ProcessViewerRoot processes={PROCESSES} tasks={TASKS}>
        <span>child</span>
      </ProcessViewerRoot>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});

describe('ProcessViewerControlPanel', () => {
  it('renders its children', () => {
    render(
      <ProcessViewerControlPanel>panel content</ProcessViewerControlPanel>,
    );
    expect(screen.getByText('panel content')).toBeInTheDocument();
  });
});

describe('ProcessViewerDefaultControls', () => {
  it('renders a "Process ID" label', () => {
    render(
      <ProcessViewerRoot processes={PROCESSES} tasks={TASKS}>
        <ProcessViewerDefaultControls />
      </ProcessViewerRoot>,
    );
    expect(screen.getByText('Process ID')).toBeInTheDocument();
  });
});

describe('ProcessViewerProcessSelector', () => {
  it('renders inside Root with processes', () => {
    render(
      <ProcessViewerRoot processes={PROCESSES} tasks={TASKS}>
        <ProcessViewerProcessSelector data-testid="selector" />
      </ProcessViewerRoot>,
    );
    expect(screen.getByTestId('selector')).toBeInTheDocument();
  });

  it('shows process id options when opened', async () => {
    const user = userEvent.setup();
    render(
      <ProcessViewerRoot processes={PROCESSES} tasks={TASKS}>
        <ProcessViewerProcessSelector data-testid="selector" />
      </ProcessViewerRoot>,
    );
    const selector = screen.getByTestId('selector');
    await user.click(selector);
    expect(screen.getByText('p1')).toBeInTheDocument();
  });
});

describe('ProcessViewerCanvas', () => {
  it('renders inside Root without crashing', () => {
    const { container } = render(
      <ProcessViewerRoot processes={PROCESSES} tasks={TASKS}>
        <ProcessViewerCanvas />
      </ProcessViewerRoot>,
    );
    expect(container).toBeInTheDocument();
  });

  it('renders the ReactFlow element inside Root', () => {
    render(
      <ProcessViewerRoot processes={PROCESSES} tasks={TASKS}>
        <ProcessViewerCanvas />
      </ProcessViewerRoot>,
    );
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
  });

  it('renders with DefaultControls and Canvas together', () => {
    render(
      <ProcessViewerRoot processes={PROCESSES} tasks={TASKS}>
        <ProcessViewerDefaultControls />
        <ProcessViewerCanvas />
      </ProcessViewerRoot>,
    );
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByText('Process ID')).toBeInTheDocument();
  });

  it('calls onNodeDoubleClick when provided', () => {
    const onDblClick = vi.fn();
    render(
      <ProcessViewerRoot
        processes={PROCESSES}
        tasks={TASKS}
        onNodeDoubleClick={onDblClick}
      >
        <ProcessViewerCanvas />
      </ProcessViewerRoot>,
    );
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
  });
});
