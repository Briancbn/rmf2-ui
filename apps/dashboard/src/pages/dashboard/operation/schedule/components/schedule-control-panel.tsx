import type { IconButtonProps } from '@chakra-ui/react';
import { chakra, Flex, IconButton } from '@chakra-ui/react';
import { LuRefreshCw, LuDownload, LuPlay, LuPause } from 'react-icons/lu';
import { IoAdd } from 'react-icons/io5';
import type { UseScheduleLiveToggleProps } from './use-schedule';
import {
  useScheduleLiveToggle,
  useScheduleRefreshButton,
} from './use-schedule';

export function ScheduleControlPanel() {
  return (
    <Flex
      justify="end"
      direction={{ base: 'column', sm: 'row' }}
      gap="5px"
    ></Flex>
  );
}

export function ScheduleAddButton(props: IconButtonProps) {
  const { children, ...rest } = props;
  return (
    <IconButton aria-label="download" variant="outline" {...rest}>
      {children ?? <IoAdd />}
    </IconButton>
  );
}

export function ScheduleDownloadButton(props: IconButtonProps) {
  const { children, ...rest } = props;
  return (
    <IconButton aria-label="download" variant="outline" {...rest}>
      {children ?? <LuDownload />}
    </IconButton>
  );
}

export function ScheduleRefreshButton(props: IconButtonProps) {
  const { children, loading: loadingExternal, ...rest } = props;
  const { disabled, loading } = useScheduleRefreshButton();
  return (
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
  );
}

export interface ScheduleLiveToggleProps
  extends IconButtonProps,
    UseScheduleLiveToggleProps {
  onToggleLive?: (live: boolean) => void;
}

export function ScheduleLiveToggle(props: ScheduleLiveToggleProps) {
  const { children, onToggleLive, ...rest } = props;
  const { live, setLive, disabled } = useScheduleLiveToggle(
    props as UseScheduleLiveToggleProps,
  );

  return (
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
  );
}
