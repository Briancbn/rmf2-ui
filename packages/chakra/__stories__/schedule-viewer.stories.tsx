import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { RTS } from '@rmf2-ui/data';
import { SchedulerViewer } from '../src/components/scheduler-viewer';

const createDummySchedule = (): RTS.Schedule => {
  const base = new Date();
  const offset = (minutes: number) =>
    new Date(base.getTime() + minutes * 60 * 1000);
  return {
    tasks: [
      {
        id: 'task-001',
        type: 'delivery',
        description: 'Deliver goods to Zone A',
        startTime: offset(-20),
        endTime: offset(10),
        resourceId: 'robot-1',
        processId: 'process-alpha',
        status: '',
        taskDetails: { resource_zone: 'A', resource_type: 'AMR' },
      },
      {
        id: 'task-002',
        type: 'delivery',
        description: 'Deliver goods to Zone B',
        startTime: offset(5),
        endTime: offset(35),
        resourceId: 'robot-2',
        processId: 'process-alpha',
        status: '',
        deadline: offset(40),
        taskDetails: { resource_zone: 'B', resource_type: 'AMR' },
      },
      {
        id: 'task-003',
        type: 'pickup',
        description: 'Pick up from Dock 2',
        startTime: offset(15),
        endTime: offset(45),
        resourceId: 'robot-1',
        processId: 'process-alpha',
        status: '',
        taskDetails: { resource_zone: 'Dock', resource_type: 'AMR' },
      },
      {
        id: 'task-004',
        type: 'charging',
        description: 'Charge robot',
        startTime: offset(50),
        endTime: offset(80),
        resourceId: 'robot-2',
        processId: 'process-alpha',
        status: '',
        taskDetails: { resource_zone: 'Charging', resource_type: 'AMR' },
      },
      {
        id: 'task-005',
        type: 'inspection',
        description: 'Inspect conveyor belt',
        startTime: offset(-10),
        endTime: offset(20),
        resourceId: 'robot-3',
        status: '',
        taskDetails: { resource_zone: 'C', resource_type: 'AMR' },
      },
      {
        id: 'task-006',
        type: 'maintenance',
        description: 'Routine maintenance check',
        startTime: offset(30),
        endTime: offset(60),
        resourceId: 'robot-3',
        status: '',
        taskDetails: { resource_zone: 'Workshop', resource_type: 'AMR' },
      },
      {
        id: 'task-007',
        type: 'patrol',
        description: 'Security patrol route 1',
        startTime: offset(-5),
        endTime: offset(25),
        resourceId: 'robot-4',
        status: '',
        taskDetails: { resource_zone: 'D', resource_type: 'AMR' },
      },
    ],
    processes: [
      {
        id: 'process-alpha',
        graph: [
          { id: 'task-001', needs: [] },
          { id: 'task-002', needs: [{ id: 'task-001' }] },
          { id: 'task-003', needs: [{ id: 'task-001' }] },
          { id: 'task-004', needs: [{ id: 'task-002' }, { id: 'task-003' }] },
        ],
      },
    ],
  };
};

const EMPTY_SCHEDULE: RTS.Schedule = { tasks: [], processes: [] };

const ResetButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      padding: '4px 12px',
      fontSize: 12,
      cursor: 'pointer',
      borderRadius: 4,
      border: '1px solid #aaa',
    }}
  >
    Reset to Now
  </button>
);

const meta = {
  title: 'RMF2-UI/SchedulerViewer',
  tags: ['autodocs'],
  parameters: {
    backgrounds: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const GanttView: Story = {
  render: () => {
    const client = new RTS.MockClient(createDummySchedule());
    return (
      <>
        <SchedulerViewer.Root rtsClient={client}>
          <SchedulerViewer.ControlPanel mb="8px">
            <SchedulerViewer.RefreshButton />
          </SchedulerViewer.ControlPanel>
          <SchedulerViewer.Gantt />
          <SchedulerViewer.TaskDialog placement="center">
            <SchedulerViewer.TaskDialogControlPanel />
          </SchedulerViewer.TaskDialog>
        </SchedulerViewer.Root>
        <ResetButton onClick={() => client.reset(createDummySchedule())} />
      </>
    );
  },
};

class TrackingRTSClient extends RTS.MockClient {
  lastRefetch: Date | null = null;
  onRefetch: (() => void) | null = null;

  async getSchedule(params: Parameters<RTS.MockClient['getSchedule']>[0]) {
    const result = await super.getSchedule(params);
    this.lastRefetch = new Date();
    this.onRefetch?.();
    return result;
  }
}

export const WithLiveToggle: Story = {
  render: () => {
    const lastRefetchSpanRef = React.useRef<HTMLSpanElement>(null);
    const client = new TrackingRTSClient(createDummySchedule());
    client.onRefetch = () => {
      if (lastRefetchSpanRef.current && client.lastRefetch) {
        lastRefetchSpanRef.current.textContent =
          client.lastRefetch.toLocaleTimeString();
      }
    };
    return (
      <>
        <SchedulerViewer.Root rtsClient={client}>
          <SchedulerViewer.ControlPanel mb="8px">
            <SchedulerViewer.RefreshButton />
            <SchedulerViewer.LiveToggle />
          </SchedulerViewer.ControlPanel>
          <SchedulerViewer.Gantt />
          <SchedulerViewer.TaskDialog placement="center">
            <SchedulerViewer.TaskDialogControlPanel />
          </SchedulerViewer.TaskDialog>
          <p style={{ marginTop: 8, fontSize: 12, color: 'gray' }}>
            Last refetch: <span ref={lastRefetchSpanRef}>never</span>
          </p>
        </SchedulerViewer.Root>
        <ResetButton onClick={() => client.reset(createDummySchedule())} />
      </>
    );
  },
};

export const DownloadView: Story = {
  render: () => {
    const mockRTSClient = new RTS.MockClient(createDummySchedule());
    return (
      <SchedulerViewer.Root rtsClient={mockRTSClient}>
        <SchedulerViewer.ControlPanel mb="8px">
          <SchedulerViewer.DownloadButton />
        </SchedulerViewer.ControlPanel>
        <SchedulerViewer.Gantt />
      </SchedulerViewer.Root>
    );
  },
};

export const EmptySchedule: Story = {
  render: () => {
    const emptyRTSClient = new RTS.MockClient(EMPTY_SCHEDULE);
    return (
      <SchedulerViewer.Root rtsClient={emptyRTSClient}>
        <SchedulerViewer.ControlPanel mb="8px">
          <SchedulerViewer.RefreshButton />
        </SchedulerViewer.ControlPanel>
        <SchedulerViewer.Gantt />
      </SchedulerViewer.Root>
    );
  },
};

export const ProcessView: Story = {
  render: () => {
    const mockRTSClient = new RTS.MockClient(createDummySchedule());
    return (
      <SchedulerViewer.Root rtsClient={mockRTSClient}>
        <SchedulerViewer.Process />
        <SchedulerViewer.TaskDialog placement="center">
          <SchedulerViewer.TaskDialogControlPanel />
        </SchedulerViewer.TaskDialog>
      </SchedulerViewer.Root>
    );
  },
};

export const WithTabs: Story = {
  render: () => {
    const mockRTSClient = new RTS.MockClient(createDummySchedule());
    return (
      <SchedulerViewer.Root rtsClient={mockRTSClient}>
        <SchedulerViewer.TabsRoot>
          <SchedulerViewer.TabsControl />
          <SchedulerViewer.TabsContentSchedule>
            <SchedulerViewer.ControlPanel mb="8px">
              <SchedulerViewer.AddButton disabled />
              <SchedulerViewer.DownloadButton disabled />
              <SchedulerViewer.RefreshButton disabled />
              <SchedulerViewer.LiveToggle disabled />
              <SchedulerViewer.OptimizeButton disabled />
            </SchedulerViewer.ControlPanel>
            <SchedulerViewer.Gantt />
          </SchedulerViewer.TabsContentSchedule>
          <SchedulerViewer.TabsContentProcess>
            <SchedulerViewer.Process />
          </SchedulerViewer.TabsContentProcess>
        </SchedulerViewer.TabsRoot>
        <SchedulerViewer.TaskDialog placement="center">
          <SchedulerViewer.TaskDialogControlPanel />
        </SchedulerViewer.TaskDialog>
      </SchedulerViewer.Root>
    );
  },
};
