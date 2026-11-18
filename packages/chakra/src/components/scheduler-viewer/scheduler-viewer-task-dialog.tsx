import type { EventHandler, MouseEvent, ReactNode } from 'react';
import type { DialogRootProps } from '@chakra-ui/react';
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Tabs,
} from '@chakra-ui/react';
import type { RTS } from '@rmf2-ui/data';
import { TaskViewerSummary, TaskViewerDetails } from '../task-viewer';
import { useSchedulerViewerTaskDialog } from './use-scheduler-viewer';

export interface SchedulerViewerTaskDialogProps
  extends Omit<DialogRootProps, 'children'> {
  children?: ReactNode;
}

export function SchedulerViewerTaskDialog(
  props: SchedulerViewerTaskDialogProps,
) {
  const { children, ...rest } = props;
  const { viewTask, open, setOpen } = useSchedulerViewerTaskDialog();

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
                      <TaskViewerSummary task={viewTask} />
                    </Tabs.Content>
                    <Tabs.Content value="details" ms="3">
                      <TaskViewerDetails task={viewTask} />
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

export interface DeleteEvent extends MouseEvent<HTMLButtonElement> {
  task: RTS.Task;
}

export interface SchedulerViewerTaskDialogControlPanelProps {
  onDelete?: EventHandler<DeleteEvent>;
  isDeleting?: boolean;
  deleteDisabled?: boolean;
}

export function SchedulerViewerTaskDialogControlPanel(
  props: SchedulerViewerTaskDialogControlPanelProps,
) {
  const { onDelete, isDeleting, deleteDisabled } = props;
  const { viewTask } = useSchedulerViewerTaskDialog();

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
            onClick={(event) => {
              if (onDelete === undefined) return;
              onDelete({ task: viewTask, ...event });
            }}
            loading={isDeleting}
            disabled={deleteDisabled}
          >
            Delete
          </Button>
        </Flex>
      )}
    </>
  );
}
