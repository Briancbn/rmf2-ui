import { describe, it, expect } from 'vitest';
import { MockClient } from '../src/rts/classes/mock-client';
import type { Schedule } from '../src/rts/classes/schedule';
import type { Task } from '../src/rts/classes/task';

const h = (offsetHours: number) =>
  new Date(Date.now() + offsetHours * 60 * 60 * 1000);

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    type: 'delivery',
    startTime: h(-2),
    endTime: h(-1),
    status: '',
    taskDetails: {},
    ...overrides,
  };
}

function makeSchedule(tasks: Task[]): Schedule {
  return { tasks, processes: [] };
}

describe('MockClient constructor', () => {
  it('deep-clones the schedule so mutations to the original do not affect the client', () => {
    const original = makeSchedule([makeTask({ id: 't1' })]);
    const client = new MockClient(original);
    original.tasks[0].type = 'mutated';
    expect(client.schedule.tasks[0].type).toBe('delivery');
  });
});

describe('MockClient.getSchedule', () => {
  it('returns status "" and progress 0 for a future task', async () => {
    const client = new MockClient(
      makeSchedule([makeTask({ id: 't1', startTime: h(1), endTime: h(2) })]),
    );
    const result = await client.getSchedule({});
    expect(result.tasks[0].status).toBe('');
    expect(result.tasks[0].progress).toBe(0);
  });

  it('returns status "completed" and progress 1 for a past task', async () => {
    const client = new MockClient(
      makeSchedule([makeTask({ id: 't1', startTime: h(-2), endTime: h(-1) })]),
    );
    const result = await client.getSchedule({});
    expect(result.tasks[0].status).toBe('completed');
    expect(result.tasks[0].progress).toBe(1);
  });

  it('returns status "ongoing" and progress between 0 and 1 for a current task', async () => {
    const client = new MockClient(
      makeSchedule([makeTask({ id: 't1', startTime: h(-1), endTime: h(1) })]),
    );
    const result = await client.getSchedule({});
    expect(result.tasks[0].status).toBe('ongoing');
    expect(result.tasks[0].progress).toBeGreaterThan(0);
    expect(result.tasks[0].progress).toBeLessThan(1);
  });
});

describe('MockClient.editScheduleBatch', () => {
  it('removes a standalone task on TASK_DELETE', async () => {
    const client = new MockClient(
      makeSchedule([makeTask({ id: 't1' }), makeTask({ id: 't2' })]),
    );
    await client.editScheduleBatch({
      actions: [{ type: 'TASK_DELETE', id: 't1' }],
    });
    expect(client.schedule.tasks.map((t) => t.id)).toEqual(['t2']);
  });

  it('throws when deleting a task that belongs to a process', async () => {
    const client = new MockClient(
      makeSchedule([makeTask({ id: 't1', processId: 'p1' })]),
    );
    await expect(
      client.editScheduleBatch({
        actions: [{ type: 'TASK_DELETE', id: 't1' }],
      }),
    ).rejects.toThrow();
  });
});

describe('MockClient.reset', () => {
  it('restores the original schedule when called with no args', async () => {
    const client = new MockClient(makeSchedule([makeTask({ id: 't1' })]));
    await client.editScheduleBatch({
      actions: [{ type: 'TASK_DELETE', id: 't1' }],
    });
    expect(client.schedule.tasks).toHaveLength(0);
    client.reset();
    expect(client.schedule.tasks).toHaveLength(1);
    expect(client.schedule.tasks[0].id).toBe('t1');
  });

  it('replaces schedule and sets new original when called with a new schedule', () => {
    const client = new MockClient(makeSchedule([makeTask({ id: 't1' })]));
    const newSchedule = makeSchedule([
      makeTask({ id: 'new1' }),
      makeTask({ id: 'new2' }),
    ]);
    client.reset(newSchedule);
    expect(client.schedule.tasks.map((t) => t.id)).toEqual(['new1', 'new2']);
    client.reset();
    expect(client.schedule.tasks.map((t) => t.id)).toEqual(['new1', 'new2']);
  });
});
