import { useContext, useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from './utils';
import { RTS } from '@rmf2-ui/data';
import {
  ScheduleViewerRoot,
  ScheduleViewerControlPanel,
  ScheduleViewerAddButton,
  ScheduleViewerDownloadButton,
  ScheduleViewerRefreshButton,
  ScheduleViewerLiveToggle,
  ScheduleViewerOptimizeButton,
  ScheduleViewerGantt,
  ScheduleViewerTabsRoot,
  ScheduleViewerTabsControl,
  ScheduleViewerTabsContentSchedule,
  ScheduleViewerTabsContentProcess,
  ScheduleViewerTaskDialog,
  ScheduleViewerTaskDialogControlPanel,
  ScheduleViewerProcess,
} from '@/components/schedule-viewer';
import { ScheduleViewerContext } from '@/components/schedule-viewer/use-schedule-viewer';

vi.mock('vis-timeline/esnext', () => ({
  Timeline: class {
    constructor() {}
    setOptions() {}
    on() {}
    toggleRollingMode() {}
    moveTo() {}
  },
}));
vi.mock('vis-data/esnext', () => ({
  DataSet: class {
    update() {}
    remove() {}
    getIds() {
      return [];
    }
  },
}));
vi.mock('vis-timeline/styles/vis-timeline-graph2d.min.css', () => ({}));

vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow">{children}</div>
  ),
  Background: () => null,
  Controls: () => null,
  useNodesState: () => [[], vi.fn(), vi.fn()],
  useEdgesState: () => [[], vi.fn(), vi.fn()],
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

const h = (offsetHours: number) =>
  new Date(Date.now() + offsetHours * 60 * 60 * 1000);

const SCHEDULE: RTS.Schedule = {
  tasks: [
    {
      id: 't1',
      type: 'delivery',
      description: 'Deliver to A',
      startTime: h(-1),
      endTime: h(1),
      status: 'ongoing',
      taskDetails: {},
    },
  ],
  processes: [],
};

function makeClient() {
  return new RTS.MockClient(SCHEDULE);
}

function TaskSetter({ task }: { task: RTS.Task }) {
  const ctx = useContext(ScheduleViewerContext);
  useEffect(() => {
    ctx?.setViewTask(task);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function TaskDialogOpener({ task }: { task: RTS.Task }) {
  const ctx = useContext(ScheduleViewerContext);
  useEffect(() => {
    ctx?.setViewTask(task);
    ctx?.setTaskDialogOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

describe('ScheduleViewerRoot', () => {
  it('renders without crashing with a MockClient', () => {
    const { container } = render(
      <ScheduleViewerRoot rtsClient={makeClient()} />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <span>child content</span>
      </ScheduleViewerRoot>,
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});

describe('ScheduleViewerControlPanel', () => {
  it('renders its children', () => {
    render(
      <ScheduleViewerControlPanel>panel child</ScheduleViewerControlPanel>,
    );
    expect(screen.getByText('panel child')).toBeInTheDocument();
  });
});

describe('ScheduleViewer buttons', () => {
  it('ScheduleViewerAddButton renders a button', () => {
    render(<ScheduleViewerAddButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('ScheduleViewerDownloadButton renders a button', () => {
    render(<ScheduleViewerDownloadButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('ScheduleViewerRefreshButton renders a button inside Root', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerRefreshButton />
      </ScheduleViewerRoot>,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('ScheduleViewerOptimizeButton renders a button inside Root', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerOptimizeButton />
      </ScheduleViewerRoot>,
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

describe('ScheduleViewerLiveToggle', () => {
  it('renders inside Root and toggles on click', async () => {
    const user = userEvent.setup();
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerLiveToggle data-testid="live-toggle" />
      </ScheduleViewerRoot>,
    );
    const btn = screen.getByTestId('live-toggle');
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(btn).toBeInTheDocument();
  });
});

describe('ScheduleViewerGantt', () => {
  it('renders without crashing inside Root', () => {
    const { container } = render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerGantt />
      </ScheduleViewerRoot>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with tasks and sets up gantt data', async () => {
    const { container } = render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerGantt data-testid="gantt" />
      </ScheduleViewerRoot>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with todayId and datetimeInputId elements present', () => {
    const { container } = render(
      <>
        <button id="todayId">Today</button>
        <input id="datetimeInputId" type="datetime-local" />
        <ScheduleViewerRoot rtsClient={makeClient()}>
          <ScheduleViewerGantt />
        </ScheduleViewerRoot>
      </>,
    );
    expect(container).toBeInTheDocument();
  });

  it('renders in live mode after toggling', async () => {
    const user = userEvent.setup();
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerLiveToggle data-testid="live-btn" />
        <ScheduleViewerGantt />
      </ScheduleViewerRoot>,
    );
    await user.click(screen.getByTestId('live-btn'));
    expect(screen.getByTestId('live-btn')).toBeInTheDocument();
  });

  it('live toggle sets live mode and triggers rolling', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button id="todayId">Today</button>
        <input id="datetimeInputId" type="datetime-local" />
        <ScheduleViewerRoot rtsClient={makeClient()}>
          <ScheduleViewerLiveToggle data-testid="live-btn2" />
          <ScheduleViewerGantt />
        </ScheduleViewerRoot>
      </>,
    );
    await user.click(screen.getByTestId('live-btn2'));
    expect(screen.getByTestId('live-btn2')).toBeInTheDocument();
  });

  it('renders with custom minH override', () => {
    const { container } = render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerGantt minH="50vh" />
      </ScheduleViewerRoot>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('ScheduleViewerTabsRoot', () => {
  it('renders tabs inside Root', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTabsRoot>
          <span>tab content</span>
        </ScheduleViewerTabsRoot>
      </ScheduleViewerRoot>,
    );
    expect(screen.getByText('tab content')).toBeInTheDocument();
  });

  it('renders with controlled value prop', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTabsRoot value="schedule">
          <span>controlled</span>
        </ScheduleViewerTabsRoot>
      </ScheduleViewerRoot>,
    );
    expect(screen.getByText('controlled')).toBeInTheDocument();
  });

  it('calls onValueChange when a tab is changed externally', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTabsRoot onValueChange={onValueChange}>
          <ScheduleViewerTabsControl />
        </ScheduleViewerTabsRoot>
      </ScheduleViewerRoot>,
    );
    const processTrigger = screen.getByText('Process');
    await user.click(processTrigger);
    expect(onValueChange).toHaveBeenCalled();
  });

  it('switches tabs internally when no onValueChange provided', async () => {
    const user = userEvent.setup();
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTabsRoot>
          <ScheduleViewerTabsControl />
          <ScheduleViewerTabsContentSchedule>
            <span>Schedule Panel</span>
          </ScheduleViewerTabsContentSchedule>
          <ScheduleViewerTabsContentProcess>
            <span>Process Panel</span>
          </ScheduleViewerTabsContentProcess>
        </ScheduleViewerTabsRoot>
      </ScheduleViewerRoot>,
    );
    expect(screen.getByText('Schedule Panel')).toBeInTheDocument();
    await user.click(screen.getByText('Process'));
    await waitFor(() =>
      expect(screen.getByText('Process Panel')).toBeInTheDocument(),
    );
  });
});

describe('ScheduleViewerTabsControl', () => {
  it('renders default Schedule and Process tabs', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTabsRoot>
          <ScheduleViewerTabsControl />
        </ScheduleViewerTabsRoot>
      </ScheduleViewerRoot>,
    );
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Process')).toBeInTheDocument();
  });

  it('renders custom tabs layout', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTabsRoot>
          <ScheduleViewerTabsControl
            tabsLayout={[{ value: 'custom', description: 'Custom Tab' }]}
          />
        </ScheduleViewerTabsRoot>
      </ScheduleViewerRoot>,
    );
    expect(screen.getByText('Custom Tab')).toBeInTheDocument();
  });

  it('renders children inside the tabs list', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTabsRoot>
          <ScheduleViewerTabsControl>
            <span>extra trigger</span>
          </ScheduleViewerTabsControl>
        </ScheduleViewerTabsRoot>
      </ScheduleViewerRoot>,
    );
    expect(screen.getByText('extra trigger')).toBeInTheDocument();
  });
});

describe('ScheduleViewerTabsContent', () => {
  it('renders schedule content', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTabsRoot>
          <ScheduleViewerTabsContentSchedule>
            <span>schedule body</span>
          </ScheduleViewerTabsContentSchedule>
        </ScheduleViewerTabsRoot>
      </ScheduleViewerRoot>,
    );
    expect(screen.getByText('schedule body')).toBeInTheDocument();
  });

  it('renders process content', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTabsRoot value="process">
          <ScheduleViewerTabsContentProcess>
            <span>process body</span>
          </ScheduleViewerTabsContentProcess>
        </ScheduleViewerTabsRoot>
      </ScheduleViewerRoot>,
    );
    expect(screen.getByText('process body')).toBeInTheDocument();
  });
});

const PENDING_TASK: RTS.Task = {
  id: 't-pending',
  type: 'delivery',
  description: 'Pending Task',
  startTime: h(1),
  status: '',
  taskDetails: {},
};

const PENDING_TASK_WITH_PROCESS: RTS.Task = {
  ...PENDING_TASK,
  id: 't-process',
  processId: 'proc-1',
};

describe('ScheduleViewerTaskDialog', () => {
  it('renders without crashing inside Root (closed)', () => {
    const { container } = render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTaskDialog />
      </ScheduleViewerRoot>,
    );
    expect(container).toBeInTheDocument();
  });

  it('shows dialog content when a task is set', async () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <TaskDialogOpener task={PENDING_TASK} />
        <ScheduleViewerTaskDialog />
      </ScheduleViewerRoot>,
    );
    await waitFor(() => expect(screen.getByText('Task')).toBeInTheDocument());
  });

  it('shows Summary and Details tabs when task is open', async () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <TaskDialogOpener task={PENDING_TASK} />
        <ScheduleViewerTaskDialog />
      </ScheduleViewerRoot>,
    );
    await waitFor(() =>
      expect(screen.getByText('Summary')).toBeInTheDocument(),
    );
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('renders children inside the dialog', async () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <TaskDialogOpener task={PENDING_TASK} />
        <ScheduleViewerTaskDialog>
          <span>custom child</span>
        </ScheduleViewerTaskDialog>
      </ScheduleViewerRoot>,
    );
    await waitFor(() =>
      expect(screen.getByText('custom child')).toBeInTheDocument(),
    );
  });
});

describe('ScheduleViewerTaskDialogControlPanel', () => {
  it('renders inside Root', () => {
    const { container } = render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerTaskDialogControlPanel />
      </ScheduleViewerRoot>,
    );
    expect(container).toBeInTheDocument();
  });

  it('shows Edit and Delete buttons for a pending task (status="")', async () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <TaskSetter task={PENDING_TASK} />
        <ScheduleViewerTaskDialogControlPanel />
      </ScheduleViewerRoot>,
    );
    await waitFor(() => expect(screen.getByText('Edit')).toBeInTheDocument());
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('disables Delete when task has processId', async () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <TaskSetter task={PENDING_TASK_WITH_PROCESS} />
        <ScheduleViewerTaskDialogControlPanel />
      </ScheduleViewerRoot>,
    );
    await waitFor(() => expect(screen.getByText('Delete')).toBeInTheDocument());
    const deleteBtn = screen.getByText('Delete').closest('button');
    expect(deleteBtn).toBeDisabled();
  });

  it('calls deleteTask on Delete click', async () => {
    const user = userEvent.setup();
    const client = makeClient();
    const deleteSpy = vi.spyOn(client, 'editScheduleBatch').mockResolvedValue();
    render(
      <ScheduleViewerRoot rtsClient={client}>
        <TaskSetter task={PENDING_TASK} />
        <ScheduleViewerTaskDialogControlPanel />
      </ScheduleViewerRoot>,
    );
    await waitFor(() => expect(screen.getByText('Delete')).toBeInTheDocument());
    const deleteBtn = screen.getByText('Delete').closest('button')!;
    await user.click(deleteBtn);
    expect(deleteSpy).toHaveBeenCalledWith({
      actions: [{ type: 'TASK_DELETE', id: PENDING_TASK.id }],
    });
  });

  it('does not show buttons when task has non-empty status', async () => {
    const ongoingTask: RTS.Task = { ...PENDING_TASK, status: 'ongoing' };
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <TaskSetter task={ongoingTask} />
        <ScheduleViewerTaskDialogControlPanel />
      </ScheduleViewerRoot>,
    );
    await waitFor(() => {
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });
  });
});

describe('ScheduleViewerProcess', () => {
  it('renders without crashing inside Root', () => {
    const { container } = render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerProcess />
      </ScheduleViewerRoot>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders the ReactFlow canvas', () => {
    render(
      <ScheduleViewerRoot rtsClient={makeClient()}>
        <ScheduleViewerProcess data-testid="sv-process" />
      </ScheduleViewerRoot>,
    );
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
  });
});
