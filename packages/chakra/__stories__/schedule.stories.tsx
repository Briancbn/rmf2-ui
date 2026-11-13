import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { RTS } from '@rmf2-ui/data';
import { Schedule } from '../src/components/schedule';

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
      status: 'ongoing',
      taskDetails: { resource_zone: 'A', resource_type: 'AMR' },
    },
    {
      id: 'task-002',
      type: 'delivery',
      description: 'Deliver goods to Zone B',
      startTime: offset(5),
      endTime: offset(35),
      resourceId: 'robot-2',
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
      status: 'completed',
      taskDetails: { resource_zone: 'Charging', resource_type: 'AMR' },
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

const meta = {
  title: 'RMF2-UI/Schedule',
  tags: ['autodocs'],
  parameters: {
    backgrounds: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const GanttView: Story = {
  render: () => (
    <Schedule.Root schedule={DUMMY_SCHEDULE}>
      <Schedule.TabsRoot>
        <Schedule.TabsControl />
        <Schedule.TabsContentSchedule>
          <Schedule.ControlPanel mb="8px">
            <Schedule.AddButton disabled />
            <Schedule.DownloadButton disabled />
            <Schedule.RefreshButton disabled />
            <Schedule.LiveToggle disabled />
            <Schedule.OptimizeButton disabled />
          </Schedule.ControlPanel>
          <Schedule.Gantt />
        </Schedule.TabsContentSchedule>
        <Schedule.TabsContentProcess>
          <Schedule.Process />
        </Schedule.TabsContentProcess>
      </Schedule.TabsRoot>
      <Schedule.TaskDialog placement="center">
        <Schedule.TaskDialogControlPanel />
      </Schedule.TaskDialog>
    </Schedule.Root>
  ),
};

export const WithLiveToggle: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [refetchInterval, setRefetchInterval] = useState<false | number>(
      false,
    );
    return (
      <Schedule.Root schedule={DUMMY_SCHEDULE}>
        <Schedule.TabsRoot>
          <Schedule.TabsControl />
          <Schedule.TabsContentSchedule>
            <Schedule.ControlPanel mb="8px">
              <Schedule.LiveToggle
                onToggleLive={(live) => setRefetchInterval(live ? 1000 : false)}
              />
            </Schedule.ControlPanel>
            <Schedule.Gantt />
          </Schedule.TabsContentSchedule>
        </Schedule.TabsRoot>
        <Schedule.TaskDialog placement="center" />
        <p style={{ marginTop: 8, fontSize: 12, color: 'gray' }}>
          Refetch interval:{' '}
          {refetchInterval === false ? 'off' : `${refetchInterval}ms`}
        </p>
      </Schedule.Root>
    );
  },
};

export const EmptySchedule: Story = {
  render: () => (
    <Schedule.Root schedule={{ tasks: [], processes: [] }}>
      <Schedule.TabsRoot>
        <Schedule.TabsControl />
        <Schedule.TabsContentSchedule>
          <Schedule.ControlPanel mb="8px">
            <Schedule.RefreshButton />
          </Schedule.ControlPanel>
          <Schedule.Gantt />
        </Schedule.TabsContentSchedule>
        <Schedule.TabsContentProcess>
          <Schedule.Process />
        </Schedule.TabsContentProcess>
      </Schedule.TabsRoot>
    </Schedule.Root>
  ),
};

export const ProcessView: Story = {
  render: () => (
    <Schedule.Root schedule={DUMMY_SCHEDULE}>
      <Schedule.TabsRoot defaultValue="process">
        <Schedule.TabsControl />
        <Schedule.TabsContentSchedule>
          <Schedule.Gantt />
        </Schedule.TabsContentSchedule>
        <Schedule.TabsContentProcess>
          <Schedule.Process />
        </Schedule.TabsContentProcess>
      </Schedule.TabsRoot>
    </Schedule.Root>
  ),
};
