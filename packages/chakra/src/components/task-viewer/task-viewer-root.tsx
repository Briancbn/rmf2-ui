import type { ReactNode } from 'react';
import { Badge, DataList } from '@chakra-ui/react';
import type { RTS } from '@rmf2-ui/data';

const formatDate = (time: Date | undefined): string => {
  if (time === undefined) return '-';
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(time);
};

const formatStatus = (statusText: string): ReactNode => {
  let colorPalette = 'gray';
  if (statusText === 'completed') colorPalette = 'green';
  else if (statusText === 'failed') colorPalette = 'red';
  else if (statusText === 'ongoing') colorPalette = 'yellow';
  return (
    <Badge colorPalette={colorPalette}>
      {statusText === '' ? 'unknown' : statusText}
    </Badge>
  );
};

export interface TaskViewerSummaryProps {
  task: RTS.Task;
}

export function TaskViewerSummary(props: TaskViewerSummaryProps) {
  const { task } = props;
  return (
    <DataList.Root orientation="horizontal">
      <DataList.Item>
        <DataList.ItemLabel>Description</DataList.ItemLabel>
        <DataList.ItemValue>{task.description}</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Type</DataList.ItemLabel>
        <DataList.ItemValue>{task.type}</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Start Time</DataList.ItemLabel>
        <DataList.ItemValue>{formatDate(task.startTime)}</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>End Time</DataList.ItemLabel>
        <DataList.ItemValue>{formatDate(task.endTime)}</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item
        color={
          task.deadline === undefined ||
          task.endTime === undefined ||
          task.deadline >= task.endTime
            ? 'inherit'
            : 'red'
        }
      >
        <DataList.ItemLabel>Deadline</DataList.ItemLabel>
        <DataList.ItemValue>{formatDate(task.deadline)}</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Assigned to</DataList.ItemLabel>
        <DataList.ItemValue>{task.resourceId}</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Status</DataList.ItemLabel>
        <DataList.ItemValue>{formatStatus(task.status)}</DataList.ItemValue>
      </DataList.Item>
      {task.taskDetails.coordinates && (
        <DataList.Item>
          <DataList.ItemLabel>Target Location</DataList.ItemLabel>
          <DataList.ItemValue>
            {task.taskDetails.coordinates as string}
          </DataList.ItemValue>
        </DataList.Item>
      )}
      {task.taskDetails.resource_type && (
        <DataList.Item>
          <DataList.ItemLabel>Resource Type</DataList.ItemLabel>
          <DataList.ItemValue>
            {task.taskDetails.resource_type as string}
          </DataList.ItemValue>
        </DataList.Item>
      )}
    </DataList.Root>
  );
}

export interface TaskViewerDetailsProps {
  task: RTS.Task;
}

export function TaskViewerDetails(props: TaskViewerDetailsProps) {
  const { task } = props;
  return (
    <DataList.Root orientation="horizontal">
      {Object.keys(task).map((label) => (
        <DataList.Item key={label}>
          <DataList.ItemLabel>{label}</DataList.ItemLabel>
          <DataList.ItemValue flex="1">
            {JSON.stringify(
              Object.getOwnPropertyDescriptor(task, label)?.value,
              null,
              2,
            )}
          </DataList.ItemValue>
        </DataList.Item>
      ))}
    </DataList.Root>
  );
}
