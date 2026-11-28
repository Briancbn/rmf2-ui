import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from './utils';
import type { RTS } from '@rmf2-ui/data';
import { TaskViewer } from '@/components/task-viewer';

const TASK: RTS.Task = {
  id: 't1',
  type: 'delivery',
  description: 'Deliver to A',
  startTime: new Date('2025-01-01T08:00:00Z'),
  endTime: new Date('2025-01-01T09:00:00Z'),
  status: 'completed',
  taskDetails: { resource_zone: 'A', resource_type: 'AMR' },
};

describe('TaskViewerSummary', () => {
  it('renders Description label and value', () => {
    render(<TaskViewer.Summary task={TASK} />);
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Deliver to A')).toBeInTheDocument();
  });

  it('renders Type label and value', () => {
    render(<TaskViewer.Summary task={TASK} />);
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('delivery')).toBeInTheDocument();
  });

  it('renders "completed" status as a badge', () => {
    render(<TaskViewer.Summary task={TASK} />);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('renders "unknown" badge for empty status', () => {
    render(<TaskViewer.Summary task={{ ...TASK, status: '' }} />);
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('calls renderFieldExtra for each field and renders returned content', () => {
    const renderFieldExtra = vi.fn((label: string) => (
      <span>{`extra-${label}`}</span>
    ));
    render(
      <TaskViewer.Summary task={TASK} renderFieldExtra={renderFieldExtra} />,
    );
    expect(renderFieldExtra).toHaveBeenCalledWith('Description');
    expect(screen.getByText('extra-Description')).toBeInTheDocument();
  });

  it('renders deadline text', () => {
    const taskWithDeadline: RTS.Task = {
      ...TASK,
      deadline: new Date('2025-01-01T08:30:00Z'),
    };
    render(<TaskViewer.Summary task={taskWithDeadline} />);
    expect(screen.getByText('Deadline')).toBeInTheDocument();
  });
});

describe('TaskViewerDetails', () => {
  it('renders each key of the task as a label', () => {
    render(<TaskViewer.Details task={TASK} />);
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('type')).toBeInTheDocument();
    expect(screen.getByText('status')).toBeInTheDocument();
  });
});
