import type { Meta, StoryObj } from '@storybook/react';
import type { RTS } from '@rmf2-ui/data';
import {
  TaskViewerSummary,
  TaskViewerDetails,
} from '../src/components/task-viewer';

const now = new Date();
const offset = (minutes: number) =>
  new Date(now.getTime() + minutes * 60 * 1000);

const DUMMY_TASK: RTS.Task = {
  id: 'task-001',
  type: 'delivery',
  description: 'Deliver goods to Zone A',
  startTime: offset(-20),
  endTime: offset(10),
  resourceId: 'robot-1',
  status: 'ongoing',
  deadline: offset(40),
  taskDetails: { resource_zone: 'A', resource_type: 'AMR' },
};

const meta = {
  title: 'RMF2-UI/TaskViewer',
  tags: ['autodocs'],
  parameters: {
    backgrounds: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Summary: Story = {
  render: () => <TaskViewerSummary task={DUMMY_TASK} />,
};

export const Details: Story = {
  render: () => <TaskViewerDetails task={DUMMY_TASK} />,
};
