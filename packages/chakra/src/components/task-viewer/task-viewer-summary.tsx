import type { ReactNode } from 'react';
import { Badge, DataList, Flex } from '@chakra-ui/react';
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
  renderFieldExtra?: (fieldLabel: string) => ReactNode;
}

function ItemValue({
  label,
  children,
  renderFieldExtra,
}: {
  label: string;
  children: ReactNode;
  renderFieldExtra?: (fieldLabel: string) => ReactNode;
}) {
  const extra = renderFieldExtra?.(label);
  if (extra === undefined) {
    return <DataList.ItemValue>{children}</DataList.ItemValue>;
  }
  return (
    <DataList.ItemValue asChild>
      <Flex align="center" gap="2">
        {children}
        {extra}
      </Flex>
    </DataList.ItemValue>
  );
}

export function TaskViewerSummary(props: TaskViewerSummaryProps) {
  const { task, renderFieldExtra } = props;
  return (
    <DataList.Root orientation="horizontal">
      <DataList.Item>
        <DataList.ItemLabel>Description</DataList.ItemLabel>
        <ItemValue label="Description" renderFieldExtra={renderFieldExtra}>
          {task.description}
        </ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Type</DataList.ItemLabel>
        <ItemValue label="Type" renderFieldExtra={renderFieldExtra}>
          {task.type}
        </ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Start Time</DataList.ItemLabel>
        <ItemValue label="Start Time" renderFieldExtra={renderFieldExtra}>
          {formatDate(task.startTime)}
        </ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>End Time</DataList.ItemLabel>
        <ItemValue label="End Time" renderFieldExtra={renderFieldExtra}>
          {formatDate(task.endTime)}
        </ItemValue>
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
        <ItemValue label="Deadline" renderFieldExtra={renderFieldExtra}>
          {formatDate(task.deadline)}
        </ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Assigned to</DataList.ItemLabel>
        <ItemValue label="Assigned to" renderFieldExtra={renderFieldExtra}>
          {task.resourceId}
        </ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Status</DataList.ItemLabel>
        <ItemValue label="Status" renderFieldExtra={renderFieldExtra}>
          {formatStatus(task.status)}
        </ItemValue>
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
