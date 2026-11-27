import { DataList } from '@chakra-ui/react';
import type { RTS } from '@rmf2-ui/data';

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
