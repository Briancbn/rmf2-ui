import { RTS } from '@rmf2-ui/data';
import { RTSAPI } from '@rmf2-ui/client';

export const RTSClientOptions: RTSAPI.ClientOptions = {
  baseUrl: import.meta.env.VITE_RTS_BASE,
};

const now = new Date();
const h = (offset: number) => new Date(now.getTime() + offset * 60 * 60 * 1000);

const DUMMY_SCHEDULE: RTS.Schedule = {
  tasks: [
    // proc-001: delivery chain
    {
      id: 'task-001',
      type: 'delivery',
      description: 'Deliver to Zone A',
      startTime: h(-2),
      endTime: h(-1),
      resourceId: 'robot-01',
      processId: 'proc-001',
      status: '',
      taskDetails: { resource_zone: 'A', resource_type: 'AMR' },
    },
    {
      id: 'task-002',
      type: 'delivery',
      description: 'Deliver to Zone B',
      startTime: h(-0.5),
      endTime: h(0.5),
      resourceId: 'robot-02',
      processId: 'proc-001',
      status: '',
      deadline: h(1),
      taskDetails: { resource_zone: 'B', resource_type: 'AMR' },
    },
    {
      id: 'task-003',
      type: 'pickup',
      description: 'Pick up from Dock 1',
      startTime: h(0.25),
      endTime: h(1),
      resourceId: 'robot-01',
      processId: 'proc-001',
      status: '',
      taskDetails: { resource_zone: 'Dock', resource_type: 'AMR' },
    },
    {
      id: 'task-004',
      type: 'delivery',
      description: 'Final delivery to Warehouse',
      startTime: h(1),
      endTime: h(2),
      resourceId: 'robot-01',
      processId: 'proc-001',
      status: '',
      taskDetails: { resource_zone: 'Warehouse', resource_type: 'AMR' },
    },
    // proc-002: inspection + maintenance
    {
      id: 'task-005',
      type: 'inspection',
      description: 'Inspect Line 1',
      startTime: h(-1),
      endTime: h(0),
      resourceId: 'robot-03',
      processId: 'proc-002',
      status: '',
      taskDetails: { resource_zone: 'Line1', resource_type: 'AMR' },
    },
    {
      id: 'task-006',
      type: 'inspection',
      description: 'Inspect Line 2',
      startTime: h(-0.75),
      endTime: h(0.25),
      resourceId: 'robot-04',
      processId: 'proc-002',
      status: '',
      taskDetails: { resource_zone: 'Line2', resource_type: 'AMR' },
    },
    {
      id: 'task-007',
      type: 'maintenance',
      description: 'Maintenance on Line 1',
      startTime: h(0.25),
      endTime: h(1.5),
      resourceId: 'robot-03',
      processId: 'proc-002',
      status: '',
      taskDetails: { resource_zone: 'Workshop', resource_type: 'AMR' },
    },
    {
      id: 'task-008',
      type: 'charging',
      description: 'Charge robot-03',
      startTime: h(1.5),
      endTime: h(2.5),
      resourceId: 'robot-03',
      processId: 'proc-002',
      status: '',
      taskDetails: { resource_zone: 'Charging', resource_type: 'AMR' },
    },
    // proc-003: patrol loop
    {
      id: 'task-009',
      type: 'patrol',
      description: 'Patrol Route North',
      startTime: h(-0.5),
      endTime: h(0.5),
      resourceId: 'robot-05',
      processId: 'proc-003',
      status: '',
      taskDetails: { resource_zone: 'North', resource_type: 'AMR' },
    },
    {
      id: 'task-010',
      type: 'patrol',
      description: 'Patrol Route South',
      startTime: h(0.5),
      endTime: h(1.5),
      resourceId: 'robot-05',
      processId: 'proc-003',
      status: '',
      taskDetails: { resource_zone: 'South', resource_type: 'AMR' },
    },
    {
      id: 'task-011',
      type: 'patrol',
      description: 'Patrol Route East',
      startTime: h(1.5),
      endTime: h(2.5),
      resourceId: 'robot-05',
      processId: 'proc-003',
      status: '',
      taskDetails: { resource_zone: 'East', resource_type: 'AMR' },
    },
    // standalone tasks
    {
      id: 'task-012',
      type: 'cleaning',
      description: 'Clean Zone D',
      startTime: h(0.5),
      endTime: h(2),
      resourceId: 'robot-02',
      status: '',
      taskDetails: { resource_zone: 'D', resource_type: 'Cleaner' },
    },
    {
      id: 'task-013',
      type: 'pickup',
      description: 'Emergency pickup Gate 3',
      startTime: h(0.1),
      endTime: h(0.6),
      resourceId: 'robot-04',
      status: '',
      deadline: h(0.75),
      taskDetails: { resource_zone: 'Gate3', resource_type: 'AMR' },
    },
  ],
  processes: [
    {
      id: 'proc-001',
      graph: [
        { id: 'task-001', needs: [] },
        { id: 'task-002', needs: [{ id: 'task-001' }] },
        { id: 'task-003', needs: [{ id: 'task-001' }] },
        { id: 'task-004', needs: [{ id: 'task-002' }, { id: 'task-003' }] },
      ],
    },
    {
      id: 'proc-002',
      graph: [
        { id: 'task-005', needs: [] },
        { id: 'task-006', needs: [] },
        { id: 'task-007', needs: [{ id: 'task-005' }, { id: 'task-006' }] },
        { id: 'task-008', needs: [{ id: 'task-007' }] },
      ],
    },
    {
      id: 'proc-003',
      graph: [
        { id: 'task-009', needs: [] },
        { id: 'task-010', needs: [{ id: 'task-009' }] },
        { id: 'task-011', needs: [{ id: 'task-010' }] },
      ],
    },
  ],
};

export function useRTSClient(): RTS.IClient {
  if (import.meta.env.VITE_RTS_MOCK === 'true') {
    return new RTS.MockClient(DUMMY_SCHEDULE);
  }
  return new RTSAPI.Client(RTSClientOptions);
}
