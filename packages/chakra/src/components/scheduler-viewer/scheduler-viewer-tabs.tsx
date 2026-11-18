import { useEffect } from 'react';
import type { BoxProps } from '@chakra-ui/react';
import { Tabs, Box } from '@chakra-ui/react';
import { useSchedulerViewerTabsRoot } from './use-scheduler-viewer';

export interface SchedulerViewerTabsRootProps extends Tabs.RootProps {}

export function SchedulerViewerTabsRoot(props: Tabs.RootProps) {
  const { children, value, onValueChange, ...rest } = props;
  const { tabValue, setTabValue } = useSchedulerViewerTabsRoot();

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

export interface SchedulerViewerTabsControlProps extends BoxProps {
  tabsLayout?: ScheduleTabLayoutConfig[];
}

const DEFAULT_SCHEDULE_TABS_LAYOUT: ScheduleTabLayoutConfig[] = [
  { value: 'schedule', description: 'Schedule' },
  { value: 'process', description: 'Process' },
];

export function SchedulerViewerTabsControl(
  props: SchedulerViewerTabsControlProps,
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

export function SchedulerViewerTabsContentSchedule(
  props: Omit<Tabs.ContentProps, 'value'>,
) {
  const { children, ...rest } = props;
  return (
    <Tabs.Content value="schedule" {...rest}>
      {children}
    </Tabs.Content>
  );
}

export function SchedulerViewerTabsContentProcess(
  props: Omit<Tabs.ContentProps, 'value'>,
) {
  const { children, ...rest } = props;
  return (
    <Tabs.Content value="process" {...rest}>
      {children}
    </Tabs.Content>
  );
}
