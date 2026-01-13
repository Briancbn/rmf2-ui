import type { IconButtonProps } from '@chakra-ui/react';
import { chakra, Flex, IconButton } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { LuRefreshCw, LuDownload, LuPlay, LuPause } from 'react-icons/lu';
import { IoAdd } from 'react-icons/io5';
import type { UseScheduleLiveToggleProps } from './use-schedule';
import {
  useScheduleLiveToggle,
  useScheduleRefreshButton,
} from './use-schedule';
import { PiSpinnerBold } from 'react-icons/pi';

export function ScheduleControlPanel() {
  return (
    <Flex
      justify="end"
      direction={{ base: 'column', sm: 'row' }}
      gap="5px"
    ></Flex>
  );
}

export interface ScheduleAddButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleAddButton(props: ScheduleAddButtonProps) {
  const { children, label, ...rest } = props;
  return (
    <Tooltip content={label ?? 'Create New Tasks'}>
      <IconButton aria-label="add-task" variant="outline" {...rest}>
        {children ?? <IoAdd />}
      </IconButton>
    </Tooltip>
  );
}

export interface ScheduleDownloadButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleDownloadButton(props: ScheduleDownloadButtonProps) {
  const { children, label, ...rest } = props;
  return (
    <Tooltip content={label ?? 'Download Data'}>
      <IconButton aria-label="download" variant="outline" {...rest}>
        {children ?? <LuDownload />}
      </IconButton>
    </Tooltip>
  );
}

export interface ScheduleRefreshButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleRefreshButton(props: ScheduleRefreshButtonProps) {
  const { children, loading: loadingExternal, label, ...rest } = props;
  const { disabled, loading } = useScheduleRefreshButton();
  return (
    <Tooltip content={label ?? 'Refresh Schedule'}>
      <IconButton
        aria-label="download"
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
    </Tooltip>
  );
}

export interface ScheduleLiveToggleProps
  extends IconButtonProps,
    UseScheduleLiveToggleProps {
  onToggleLive?: (live: boolean) => void;
  label?: string | ((live: boolean) => string);
}

export function ScheduleLiveToggle(props: ScheduleLiveToggleProps) {
  const { children, onToggleLive, label: externalLabel, ...rest } = props;
  const { live, setLive, disabled } = useScheduleLiveToggle(
    props as UseScheduleLiveToggleProps,
  );

  const getLabel = (live: boolean): string => {
    if (externalLabel === undefined) {
      return (live ? 'Disable' : 'Enable') + ' Live Refresh';
    }

    if (typeof externalLabel === 'string') {
      return externalLabel;
    }

    return externalLabel(live);
  };

  return (
    <Tooltip content={getLabel(live)}>
      <IconButton
        aria-label="download"
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
    </Tooltip>
  );
}

export interface ScheduleOptimizeButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleOptimizeButton(props: ScheduleOptimizeButtonProps) {
  const { children, label, ...rest } = props;
  return (
    <Tooltip content={label ?? 'Optimize Schedule'}>
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
    </Tooltip>
  );
}
