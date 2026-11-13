import type { FlexProps, IconButtonProps } from '@chakra-ui/react';
import { chakra, Flex, IconButton } from '@chakra-ui/react';
import { LuRefreshCw, LuDownload, LuPlay, LuPause } from 'react-icons/lu';
import { IoAdd } from 'react-icons/io5';
import { PiSpinnerBold } from 'react-icons/pi';
import type { UseScheduleLiveToggleProps } from './use-schedule';
import {
  useScheduleLiveToggle,
  useScheduleRefreshButton,
} from './use-schedule';

export function ScheduleControlPanel(props: FlexProps) {
  const { children, ...rest } = props;
  return (
    <Flex
      justify="end"
      direction={{ base: 'column', sm: 'row' }}
      gap="5px"
      {...rest}
    >
      {children}
    </Flex>
  );
}

export interface ScheduleAddButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleAddButton(props: ScheduleAddButtonProps) {
  const { children, label: _label, ...rest } = props;
  return (
    <IconButton aria-label="add-task" variant="outline" {...rest}>
      {children ?? <IoAdd />}
    </IconButton>
  );
}

export interface ScheduleDownloadButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleDownloadButton(props: ScheduleDownloadButtonProps) {
  const { children, label: _label, ...rest } = props;
  return (
    <IconButton aria-label="download" variant="outline" {...rest}>
      {children ?? <LuDownload />}
    </IconButton>
  );
}

export interface ScheduleRefreshButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleRefreshButton(props: ScheduleRefreshButtonProps) {
  const { children, loading: loadingExternal, label: _label, ...rest } = props;
  const { disabled, loading } = useScheduleRefreshButton();
  return (
    <IconButton
      aria-label="refresh"
      variant="outline"
      disabled={disabled}
      loading={loading || loadingExternal}
      spinner={
        <chakra.div animation="spin 1s infinite linear">
          <LuRefreshCw />
        </chakra.div>
      }
      {...rest}
    >
      {children ?? <LuRefreshCw />}
    </IconButton>
  );
}

export interface ScheduleLiveToggleProps
  extends IconButtonProps,
    UseScheduleLiveToggleProps {
  onToggleLive?: (live: boolean) => void;
  label?: string | ((live: boolean) => string);
}

export function ScheduleLiveToggle(props: ScheduleLiveToggleProps) {
  const { children, onToggleLive, label: _label, ...rest } = props;
  const { live, setLive, disabled } = useScheduleLiveToggle(
    props as UseScheduleLiveToggleProps,
  );

  return (
    <IconButton
      aria-label="live-toggle"
      variant="outline"
      disabled={disabled}
      onClick={() => {
        if (onToggleLive) {
          onToggleLive(!live);
        }
        setLive(!live);
      }}
      {...rest}
    >
      {children ?? (live ? <LuPause /> : <LuPlay />)}
    </IconButton>
  );
}

export interface ScheduleOptimizeButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleOptimizeButton(props: ScheduleOptimizeButtonProps) {
  const { children, label: _label, ...rest } = props;
  return (
    <IconButton
      aria-label="optimize"
      variant="outline"
      spinner={
        <chakra.div animation="spin 1s infinite linear">
          <PiSpinnerBold />
        </chakra.div>
      }
      {...rest}
    >
      {children ?? <PiSpinnerBold />}
    </IconButton>
  );
}
