import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Button,
  Checkbox,
  HStack,
  Popover,
  Stack,
  Text,
} from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';

const DEBUG_WARN_KEY = 'rmf2.debug.showWarning';

function readDebugWarn(): boolean {
  try {
    return localStorage.getItem(DEBUG_WARN_KEY) !== 'false';
  } catch {
    return true;
  }
}

function writeDebugWarn(value: boolean) {
  try {
    localStorage.setItem(DEBUG_WARN_KEY, String(value));
  } catch {
    /* ignore */
  }
}

export interface RobotPanelDebugConfirmButtonProps extends ButtonProps {
  title: string;
  description: ReactNode;
  onConfirm: () => void;
}

export function RobotPanelDebugConfirmButton({
  title,
  description,
  onConfirm,
  onClick: _onClick,
  colorPalette,
  ...buttonProps
}: RobotPanelDebugConfirmButtonProps) {
  const [open, setOpen] = useState(false);
  const [dontWarn, setDontWarn] = useState(false);

  const handleClick = () => {
    if (!readDebugWarn()) {
      onConfirm();
    } else {
      setDontWarn(false);
      setOpen(true);
    }
  };

  const handleConfirm = () => {
    if (dontWarn) writeDebugWarn(false);
    setOpen(false);
    onConfirm();
  };

  return (
    <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Popover.Anchor asChild>
        <Button
          {...buttonProps}
          colorPalette={colorPalette}
          onClick={handleClick}
        />
      </Popover.Anchor>
      <Popover.Positioner>
        <Popover.Content maxW="260px">
          <Popover.Arrow />
          <Popover.Body>
            <Stack gap={3}>
              <Text fontSize="sm" fontWeight="medium">
                {title}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {description}
              </Text>
              <Text fontSize="xs" color="fg.warning">
                This might disrupt normal operation!
              </Text>
              <Checkbox.Root
                size="sm"
                checked={dontWarn}
                onCheckedChange={(e) => setDontWarn(!!e.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label fontSize="xs">
                  {"Don't show this warning again"}
                </Checkbox.Label>
              </Checkbox.Root>
              <HStack gap={2} justify="flex-end">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="xs" colorPalette="teal" onClick={handleConfirm}>
                  Confirm
                </Button>
              </HStack>
            </Stack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
