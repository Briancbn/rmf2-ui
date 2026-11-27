import { useState } from 'react';
import type { FlexProps, IconButtonProps } from '@chakra-ui/react';
import { chakra, Flex, IconButton } from '@chakra-ui/react';
import { LuRefreshCw, LuDownload, LuPlay, LuPause } from 'react-icons/lu';
import { IoAdd } from 'react-icons/io5';
import { PiSpinnerBold } from 'react-icons/pi';
import type { UseScheduleViewerLiveToggleProps } from './use-schedule-viewer';
import {
  useScheduleViewerLiveToggle,
  useScheduleViewerRefreshButton,
  useScheduleViewerOptimizeButton,
} from './use-schedule-viewer';

export interface ScheduleViewerControlPanelProps extends FlexProps {}

export function ScheduleViewerControlPanel(
  props: ScheduleViewerControlPanelProps,
) {
  const { children, ...rest } = props;
  return (
    <Flex
      justify="end"
      direction={{ base: 'column', sm: 'row' }}
      gap="5px"
      mb="8px"
      {...rest}
    >
      {children}
    </Flex>
  );
}

export interface ScheduleViewerAddButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleViewerAddButton(props: ScheduleViewerAddButtonProps) {
  const { children, label: _label, ...rest } = props;
  return (
    <IconButton aria-label="add-task" variant="outline" {...rest}>
      {children ?? <IoAdd />}
    </IconButton>
  );
}

export interface ScheduleViewerDownloadButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleViewerDownloadButton(
  props: ScheduleViewerDownloadButtonProps,
) {
  const { children, label: _label, ...rest } = props;
  return (
    <IconButton aria-label="download" variant="outline" {...rest}>
      {children ?? <LuDownload />}
    </IconButton>
  );
}

export interface ScheduleViewerRefreshButtonProps extends IconButtonProps {
  label?: string;
}

export function ScheduleViewerRefreshButton(
  props: ScheduleViewerRefreshButtonProps,
) {
  const { children, loading: loadingExternal, label: _label, ...rest } = props;
  const { loading, onClick } = useScheduleViewerRefreshButton();
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

export interface ScheduleViewerLiveToggleProps
  extends IconButtonProps,
    UseScheduleViewerLiveToggleProps {
  onToggleLive?: (live: boolean) => void;
  label?: string | ((live: boolean) => string);
}

export function ScheduleViewerLiveToggle(props: ScheduleViewerLiveToggleProps) {
  const { children, onToggleLive, label: _label, ...rest } = props;
  const { live, setLive } = useScheduleViewerLiveToggle(
    props as UseScheduleViewerLiveToggleProps,
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

export interface ScheduleViewerOptimizeButtonProps extends IconButtonProps {
  optimizationDuration?: number;
  label?: string;
}

export function ScheduleViewerOptimizeButton(
  props: ScheduleViewerOptimizeButtonProps,
) {
  const { children, optimizationDuration = 30, label: _label, ...rest } = props;
  const { optimize, refetchSchedule } = useScheduleViewerOptimizeButton();
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
