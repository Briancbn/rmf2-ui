import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { RTS } from '@rmf2-ui/data';
import {
  SchedulerViewer,
  MockRTSClient,
} from '../src/components/scheduler-viewer';

const now = new Date();
const offset = (minutes: number) =>
  new Date(now.getTime() + minutes * 60 * 1000);

const DUMMY_SCHEDULE: RTS.Schedule = {
  tasks: [
    {
      id: 'task-001',
      type: 'delivery',
      description: 'Deliver goods to Zone A',
      startTime: offset(-20),
      endTime: offset(10),
      resourceId: 'robot-1',
      processId: 'process-alpha',
      status: 'ongoing',
      progress: 0.65,
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
      progress: 0,
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
      progress: 0.2,
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
      status: 'completed',
      progress: 1,
      taskDetails: { resource_zone: 'Charging', resource_type: 'AMR' },
    },
    {
      id: 'task-005',
      type: 'inspection',
      description: 'Inspect conveyor belt',
      startTime: offset(-10),
      endTime: offset(20),
      resourceId: 'robot-3',
      status: 'ongoing',
      progress: 0.45,
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
      status: 'ongoing',
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

const EMPTY_SCHEDULE: RTS.Schedule = { tasks: [], processes: [] };

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
    const mockRTSClient = new MockRTSClient(DUMMY_SCHEDULE);
    return (
      <SchedulerViewer.Root rtsClient={mockRTSClient}>
        <SchedulerViewer.Gantt />
        <SchedulerViewer.TaskDialog placement="center">
          <SchedulerViewer.TaskDialogControlPanel />
        </SchedulerViewer.TaskDialog>
      </SchedulerViewer.Root>
    );
  },
};

class TrackingRTSClient extends MockRTSClient {
  lastRefetch: Date | null = null;
  onRefetch: (() => void) | null = null;

  async getSchedule(params: Parameters<MockRTSClient['getSchedule']>[0]) {
    const result = await super.getSchedule(params);
    this.lastRefetch = new Date();
    this.onRefetch?.();
    return result;
  }
}

export const WithLiveToggle: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const lastRefetchSpanRef = React.useRef<HTMLSpanElement>(null);
    const trackingClient = new TrackingRTSClient(DUMMY_SCHEDULE);
    trackingClient.onRefetch = () => {
      if (lastRefetchSpanRef.current && trackingClient.lastRefetch) {
        lastRefetchSpanRef.current.textContent =
          trackingClient.lastRefetch.toLocaleTimeString();
      }
    };
    return (
      <SchedulerViewer.Root rtsClient={trackingClient}>
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
    );
  },
};

export const EmptySchedule: Story = {
  render: () => {
    const emptyRTSClient = new MockRTSClient(EMPTY_SCHEDULE);
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
    const mockRTSClient = new MockRTSClient(DUMMY_SCHEDULE);
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
    const mockRTSClient = new MockRTSClient(DUMMY_SCHEDULE);
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
