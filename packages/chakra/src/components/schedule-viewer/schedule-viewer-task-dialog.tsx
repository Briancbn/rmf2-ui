import type { ReactNode } from 'react';
import { useState } from 'react';
import type { DialogRootProps } from '@chakra-ui/react';
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Tabs,
} from '@chakra-ui/react';
import { TaskViewer } from '@/components/task-viewer';
import { useScheduleViewerTaskDialog } from './use-schedule-viewer';

export interface ScheduleViewerTaskDialogProps
  extends Omit<DialogRootProps, 'children'> {
  children?: ReactNode;
}

export function ScheduleViewerTaskDialog(props: ScheduleViewerTaskDialogProps) {
  const { children, ...rest } = props;
  const { viewTask, open, setOpen } = useScheduleViewerTaskDialog();

  return (
    <Dialog.Root
      lazyMount
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
      {...rest}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Task</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Flex gap="20px" direction="column">
                {viewTask && (
                  <Tabs.Root
                    lazyMount
                    unmountOnExit
                    defaultValue="summary"
                    variant="subtle"
                  >
                    <Tabs.List rounded="13">
                      <Tabs.Trigger value="summary">Summary</Tabs.Trigger>
                      <Tabs.Trigger value="details">Details</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="summary" ms="3">
                      <TaskViewer.Summary task={viewTask} />
                    </Tabs.Content>
                    <Tabs.Content value="details" ms="3">
                      <TaskViewer.Details task={viewTask} />
                    </Tabs.Content>
                  </Tabs.Root>
                )}
                {children}
              </Flex>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

export interface ScheduleViewerTaskDialogControlPanelProps {}

export function ScheduleViewerTaskDialogControlPanel(
  _props: ScheduleViewerTaskDialogControlPanelProps,
) {
  const { viewTask, deleteTask, setOpen, refetchSchedule } =
    useScheduleViewerTaskDialog();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!viewTask) return;
    setLoading(true);
    try {
      await deleteTask(viewTask.id);
      setOpen(false);
      refetchSchedule();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {viewTask && viewTask.status === '' && (
        <Flex gap="5%" justify="center">
          <Button w="45%" colorPalette="blue" variant="subtle">
            Edit
          </Button>
          <Button
            w="45%"
            colorPalette="red"
            variant="subtle"
            onClick={handleDelete}
            loading={loading}
            disabled={!!(viewTask.processId || viewTask.seriesId)}
          >
            Delete
          </Button>
        </Flex>
      )}
    </>
  );
}
