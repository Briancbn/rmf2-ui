import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { RTS } from '@rmf2-ui/data';
import { ProcessViewer } from '../src/components/process-viewer';

const now = new Date();
const offset = (minutes: number) =>
  new Date(now.getTime() + minutes * 60 * 1000);

const DUMMY_TASKS: RTS.Task[] = [
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
];

const DUMMY_PROCESSES: RTS.Process[] = [
  {
    id: 'process-alpha',
    graph: [
      { id: 'task-001', needs: [] },
      { id: 'task-002', needs: [{ id: 'task-001' }] },
      { id: 'task-003', needs: [{ id: 'task-001' }] },
      { id: 'task-004', needs: [{ id: 'task-002' }, { id: 'task-003' }] },
    ],
  },
  {
    id: 'process-beta',
    graph: [
      { id: 'task-001', needs: [] },
      { id: 'task-002', needs: [{ id: 'task-001' }] },
      { id: 'task-004', needs: [{ id: 'task-002' }] },
    ],
  },
];

const meta = {
  title: 'RMF2-UI/ProcessViewer',
  tags: ['autodocs'],
  parameters: {
    backgrounds: { disable: true },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Default ProcessViewer with dummy process. */
export const Default: Story = {
  render: () => (
    <ProcessViewer.Root processes={DUMMY_PROCESSES} tasks={DUMMY_TASKS}>
      <ProcessViewer.DefaultControls />
      <ProcessViewer.Canvas />
    </ProcessViewer.Root>
  ),
};

/** With configurable double-click hook */
export const WithDoubleClick: Story = {
  render: () => {
    const [lastClicked, setLastClicked] = useState<string | undefined>(
      undefined,
    );
    return (
      <>
        <ProcessViewer.Root
          processes={DUMMY_PROCESSES}
          tasks={DUMMY_TASKS}
          onNodeDoubleClick={setLastClicked}
        >
          <ProcessViewer.DefaultControls />
          <ProcessViewer.Canvas />
        </ProcessViewer.Root>
        <p style={{ marginTop: 8, fontSize: 12, color: 'gray' }}>
          Last double-clicked task id: {lastClicked ?? '—'}
        </p>
      </>
    );
  },
};

export const WithProcessSelector: Story = {
  render: () => (
    <>
      <ProcessViewer.Root processes={DUMMY_PROCESSES} tasks={DUMMY_TASKS}>
        <ProcessViewer.ProcessSelector
          mb="10px"
          w="500px"
          variant="flushed"
          size="lg"
          colorPalette="green"
        />
        <ProcessViewer.Canvas />
      </ProcessViewer.Root>
    </>
  ),
};
