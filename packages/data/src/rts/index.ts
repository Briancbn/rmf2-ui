export type {
  Task as RTSTask,
  Process as RTSProcess,
  GraphElement as RTSGraphElement,
  Dependency as RTSDependency,
  Schedule as RTSSchedule,
  IClient as IRTSClient,
  ScheduleAction as RTSScheduleAction,
} from './classes';
export { MockClient as RTSMockClient } from './classes';

export * as RTS from './namespace';
