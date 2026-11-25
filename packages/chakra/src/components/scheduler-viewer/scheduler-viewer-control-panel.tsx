import { useState } from 'react';
import type { FlexProps, IconButtonProps } from '@chakra-ui/react';
import { chakra, Flex, IconButton } from '@chakra-ui/react';
import { LuRefreshCw, LuDownload, LuPlay, LuPause } from 'react-icons/lu';
import { IoAdd } from 'react-icons/io5';
import { PiSpinnerBold } from 'react-icons/pi';
import type { UseSchedulerViewerLiveToggleProps } from './use-scheduler-viewer';
import {
  useSchedulerViewerLiveToggle,
  useSchedulerViewerRefreshButton,
  useSchedulerViewerOptimizeButton,
} from './use-scheduler-viewer';

export function SchedulerViewerControlPanel(props: FlexProps) {
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

export interface SchedulerViewerAddButtonProps extends IconButtonProps {
  label?: string;
}

export function SchedulerViewerAddButton(props: SchedulerViewerAddButtonProps) {
  const { children, label: _label, ...rest } = props;
  return (
    <IconButton aria-label="add-task" variant="outline" {...rest}>
      {children ?? <IoAdd />}
    </IconButton>
  );
}

export interface SchedulerViewerDownloadButtonProps extends IconButtonProps {
  label?: string;
}

export function SchedulerViewerDownloadButton(
  props: SchedulerViewerDownloadButtonProps,
) {
  const { children, label: _label, ...rest } = props;
  return (
    <IconButton aria-label="download" variant="outline" {...rest}>
      {children ?? <LuDownload />}
    </IconButton>
  );
}

export interface SchedulerViewerRefreshButtonProps extends IconButtonProps {
  label?: string;
}

export function SchedulerViewerRefreshButton(
  props: SchedulerViewerRefreshButtonProps,
) {
  const { children, loading: loadingExternal, label: _label, ...rest } = props;
  const { loading, onClick } = useSchedulerViewerRefreshButton();
  return (
    <IconButton
      aria-label="refresh"
      variant="outline"
      onClick={onClick}
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

export interface SchedulerViewerLiveToggleProps
  extends IconButtonProps,
    UseSchedulerViewerLiveToggleProps {
  onToggleLive?: (live: boolean) => void;
  label?: string | ((live: boolean) => string);
}

export function SchedulerViewerLiveToggle(
  props: SchedulerViewerLiveToggleProps,
) {
  const { children, onToggleLive, label: _label, ...rest } = props;
  const { live, setLive } = useSchedulerViewerLiveToggle(
    props as UseSchedulerViewerLiveToggleProps,
  );

  return (
    <IconButton
      aria-label="live-toggle"
      variant="outline"
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

export interface SchedulerViewerOptimizeButtonProps extends IconButtonProps {
  optimizationDuration?: number;
  label?: string;
}

export function SchedulerViewerOptimizeButton(
  props: SchedulerViewerOptimizeButtonProps,
) {
  const { children, optimizationDuration = 30, label: _label, ...rest } = props;
  const { optimize, refetchSchedule } = useSchedulerViewerOptimizeButton();
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      await optimize(optimizationDuration);
      refetchSchedule();
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton
      aria-label="optimize"
      variant="outline"
      loading={loading}
      onClick={handleOptimize}
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
