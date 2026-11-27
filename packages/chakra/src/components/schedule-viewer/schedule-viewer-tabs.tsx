import { useEffect } from 'react';
import type { BoxProps } from '@chakra-ui/react';
import { Tabs, Box } from '@chakra-ui/react';
import { useScheduleViewerTabsRoot } from './use-schedule-viewer';

export interface ScheduleViewerTabsRootProps extends Tabs.RootProps {}

/** Override tab root to use ScheduleViewer managed state by default */
export function ScheduleViewerTabsRoot(props: Tabs.RootProps) {
  const { children, value, onValueChange, ...rest } = props;
  const { tabValue, setTabValue } = useScheduleViewerTabsRoot();

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    // TODO(Briancbn): switch to useCallback?
    setTabValue(tabValue);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Tabs.Root
      value={tabValue}
      onValueChange={(e) => {
        if (onValueChange !== undefined) {
          onValueChange(e);
          return;
        }

        setTabValue(e.value);
      }}
      size="sm"
      variant="outline"
      {...rest}
    >
      {children}
    </Tabs.Root>
  );
}

interface ScheduleTabLayoutConfig {
  value: string;
  description?: string;
}

export interface ScheduleViewerTabsControlProps extends BoxProps {
  /** Custom tab layout, default: schedule and process tab */
  tabsLayout?: ScheduleTabLayoutConfig[];
}

const DEFAULT_SCHEDULE_TABS_LAYOUT: ScheduleTabLayoutConfig[] = [
  { value: 'schedule', description: 'Schedule' },
  { value: 'process', description: 'Process' },
];

export function ScheduleViewerTabsControl(
  props: ScheduleViewerTabsControlProps,
) {
  const { tabsLayout: defaultTabsLayout, children, ...rest } = props;

  const tabsLayout: ScheduleTabLayoutConfig[] =
    defaultTabsLayout ?? DEFAULT_SCHEDULE_TABS_LAYOUT;

  return (
    <Box {...rest}>
      <Tabs.List>
        {tabsLayout.map((config) => (
          <Tabs.Trigger key={config.value} value={config.value}>
            {config.description}
          </Tabs.Trigger>
        ))}
        {children}
      </Tabs.List>
    </Box>
  );
}

export interface ScheduleViewerTabsContentScheduleProps
  extends Omit<Tabs.ContentProps, 'value'> {}

export function ScheduleViewerTabsContentSchedule(
  props: ScheduleViewerTabsContentScheduleProps,
) {
  const { children, ...rest } = props;
  return (
    <Tabs.Content value="schedule" {...rest}>
      {children}
    </Tabs.Content>
  );
}

export interface ScheduleViewerTabsContentProcessProps
  extends Omit<Tabs.ContentProps, 'value'> {}

export function ScheduleViewerTabsContentProcess(
  props: ScheduleViewerTabsContentProcessProps,
) {
  const { children, ...rest } = props;
  return (
    <Tabs.Content value="process" {...rest}>
      {children}
    </Tabs.Content>
  );
}
