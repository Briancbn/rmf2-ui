import { useCallback, useEffect, useRef, useState } from 'react';
import { chakra } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { useScheduleViewerGantt } from './use-schedule-viewer';
import { getPresetColor } from './preset-colors-helper';
import { DataSet } from 'vis-data/esnext';
import type { DataItem, DataGroup } from 'vis-timeline/esnext';
import { Timeline } from 'vis-timeline/esnext';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

const OPTIONS = { orientation: 'top', zoomFriction: 0 };
const DEFAULT_ZOOM_LEVEL = 30 * 60; // 30 min in seconds

/**
 * Converts a colorMap of `{ colorName: colorToken }` entries into Chakra-compatible
 * CSS-in-JS rules that style vis-timeline items by their color class name.
 *
 * `colorToken` must be a resolved CSS color value (e.g. a hex `#rrggbb`, `rgb(...)`,
 * or a Chakra semantic token reference like `{colors.schedule-viewer.preset1.bg}`).
 * Chakra token references are resolved at build time; plain CSS values are used as-is
 * and are required for `color-mix()` calls which cannot accept unresolved token syntax.
 */
function generateVisItemsCss(
  colorMap: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [preset, token] of Object.entries(colorMap)) {
    result[`& .vis-item.${preset}`] = {
      bg: token,
      color: '{colors.schedule-viewer.gantt.item.text}',
      borderColor: {
        base: `color-mix(in srgb, ${token} 70%, black)!`,
        _dark: `color-mix(in srgb, ${token} 70%, white)!`,
      },
    };
    result[`& .vis-item.vis-selected.${preset}`] = {
      borderWidth: '2px',
      filter: { base: 'brightness(0.9)', _dark: 'brightness(1.3)' },
      boxShadow: {
        base: `0 0 8px 2px color-mix(in srgb, ${token} 60%, transparent)`,
        _dark: `0 0 8px 2px color-mix(in srgb, ${token} 85%, white)`,
      },
    };
    result[`& .vis-item:not(.vis-selected).${preset}:hover`] = {
      filter: { base: 'brightness(0.93)', _dark: 'brightness(1.15)' },
    };
  }
  return result;
}

// Context including data types for VisTimeline
interface VisTimelineContext {
  dataGroups: DataSet<DataGroup>;
  dataItems: DataSet<DataItem>;
  timeline: Timeline;
}

export interface ScheduleViewerGanttProps extends Omit<BoxProps, 'children'> {}

export function ScheduleViewerGantt(props: ScheduleViewerGanttProps) {
  // hooks from parent context
  const { tasks, typeColorMap, openTaskViewDialog, live } =
    useScheduleViewerGantt();

  // refs needed for visTimeline rendering
  const visTimelineContext = useRef<VisTimelineContext>(null);
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  const liveRef = useRef(live);
  const [rollingPaused, setRollingPaused] = useState(false);

  // Initialize VisTimeline on container creation
  const containerRef = useCallback((node: HTMLDivElement) => {
    containerNodeRef.current = node;
    if (visTimelineContext.current !== null) {
      return;
    }

    if (node !== null) {
      const dataGroups: DataSet<DataGroup> = new DataSet();
      const dataItems: DataSet<DataItem> = new DataSet();

      // Clear previous render if any
      node.innerHTML = '';

      visTimelineContext.current = {
        dataGroups,
        dataItems,
        timeline: new Timeline(node, dataItems, dataGroups, {
          ...OPTIONS,
          start: new Date(Date.now() - (DEFAULT_ZOOM_LEVEL / 2) * 1000),
          end: new Date(Date.now() + (DEFAULT_ZOOM_LEVEL / 2) * 1000),
          rollingMode: { follow: liveRef.current },
        }),
      };
    }
  }, []);

  // Update items in VisTimeline when tasks or colorMap gets updated
  useEffect(() => {
    if (!visTimelineContext.current) {
      return;
    }

    // Extract group info based on resourceId first
    const groupIds = new Set<string>();
    const taskIds = new Set<string>();
    for (const task of tasks) {
      groupIds.add(task.resourceId ?? 'unassigned');
      taskIds.add(task.id);
    }

    const sortedGroupIds = Array.from(groupIds).sort();
    const groupMap: Record<string, number> = {};
    sortedGroupIds.reduce((acc, groupId, index) => {
      acc[groupId] = index;
      return acc;
    }, groupMap);

    // Construct new data for VisTimeline
    const newDataGroups: DataGroup[] = sortedGroupIds.map((groupId, index) => ({
      id: index,
      content: groupId,
    }));
    const newDataItems: DataItem[] = tasks.map((task) => {
      const pct = task.progress !== undefined ? task.progress * 100 : 0;
      // TODO(anyone): remove hardcoded minimal length and use a dot instead?
      return {
        id: task.id,
        content: task.description ?? '',
        start: task.startTime,
        end: task.endTime ?? new Date(task.startTime.getTime() + 20 * 1000),
        className: typeColorMap[task.type] ?? '',
        // display progress as a background image
        style: `background-image: linear-gradient(to right, rgba(255,255,255,0.25) ${pct}%, rgba(0,0,0,0.15) ${pct}%)`,
        group: groupMap[task.resourceId ?? 'unassigned'],
        title: `${task?.resourceId} \n@ ${task?.taskDetails?.resource_zone}`,
      };
    });

    // Leverage VisTimeline DataSet to efficiently re-render items
    visTimelineContext.current.dataGroups.update(newDataGroups);
    visTimelineContext.current.dataItems.update(newDataItems);

    // Delete stale items too
    const deletedDataItems = visTimelineContext.current.dataItems
      .getIds()
      .reduce((acc: (number | string)[], cur) => {
        if (typeof cur === 'number') {
          acc.push(cur);
          return acc;
        }
        if (taskIds.has(cur)) {
          return acc;
        }
        acc.push(cur);
        return acc;
      }, []);

    visTimelineContext.current.dataItems.remove(deletedDataItems);

    // hooks for DateTimeSelector
    // TODO(anyone): switch to using react hooks instead.
    const todayButton = document.getElementById('todayId');
    if (!todayButton) {
      return;
    }
    todayButton.addEventListener('click', () => {
      if (!visTimelineContext.current) {
        return;
      }
      visTimelineContext.current.timeline.moveTo(new Date());
    });
    const datetimeInput = document.getElementById('datetimeInputId');
    if (!datetimeInput) {
      return;
    }
    datetimeInput.addEventListener('change', (event) => {
      if (!visTimelineContext.current) {
        return;
      }
      const target = event.target as HTMLInputElement;
      visTimelineContext.current.timeline.moveTo(new Date(target.value));
    });
  }, [tasks, typeColorMap]);

  // Hooks to sync rolling with live
  useEffect(() => {
    // add listener to Esc key press when rolling paused in live mode
    if (live && rollingPaused) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape')
          visTimelineContext.current?.timeline.toggleRollingMode();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }

    // from here on, only `live` changes trigger the hook
    if (liveRef.current === live) return;
    liveRef.current = live;

    // if rolling already paused, do nothing.
    // the other hook, will cleanup the rolling pause button
    if (!live && rollingPaused) {
      setRollingPaused(false);
      return;
    }
    visTimelineContext.current?.timeline.toggleRollingMode();
  }, [live, rollingPaused]);

  // Observe the `.vis-rolling-mode-btn` component to track whether rollingMode is paused.
  useEffect(() => {
    const btn = containerNodeRef.current?.querySelector(
      '.vis-rolling-mode-btn',
    ) as HTMLElement | null;
    if (!btn) return;
    const observer = new MutationObserver(() => {
      setRollingPaused(liveRef.current && btn.style.visibility === 'visible');
    });
    observer.observe(btn, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  // Open TaskViewDialog on double click
  useEffect(() => {
    if (!visTimelineContext.current) {
      return;
    }

    visTimelineContext.current.timeline.on('doubleClick', (properties) => {
      if (properties.item !== null) {
        openTaskViewDialog(properties.item);
      }
    });
  }, [openTaskViewDialog]);

  // sync height with the parent container
  const wrapperRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      if (h > 0) visTimelineContext.current?.timeline.setOptions({ height: h });
    });
    ro.observe(node);
  }, []);

  const colorMap: Record<string, string> = {};
  for (const presetKey of Object.values(typeColorMap)) {
    const color = getPresetColor(presetKey);
    if (color !== undefined) colorMap[presetKey] = color;
  }

  return (
    <chakra.div
      ref={wrapperRef}
      position="relative"
      h="100%"
      w="100%"
      minH="70vh"
      {...props}
    >
      <chakra.div
        ref={containerRef}
        h="100%"
        w="100%"
        css={{
          '& .vis-time-axis .vis-text': {
            color: '{colors.schedule-viewer.gantt.axis.text}',
          },
          '& .vis-labelset .vis-label': {
            color: '{colors.schedule-viewer.gantt.label.text}',
          },
          '& .vis-rolling-mode-btn': { display: 'none' },
          ...generateVisItemsCss(colorMap),
        }}
      />
      {live && rollingPaused && (
        /* TODO(anyone): make this a proper component */
        <chakra.div
          position="absolute"
          bottom="12px"
          right="16px"
          px="10px"
          py="4px"
          borderRadius="full"
          fontSize="xs"
          fontWeight="medium"
          bg="orange.subtle"
          color="orange.fg"
          borderWidth="1px"
          borderColor="orange.muted"
          cursor="pointer"
          onClick={() =>
            visTimelineContext.current?.timeline.toggleRollingMode()
          }
        >
          Live paused — Esc or click to resume
        </chakra.div>
      )}
    </chakra.div>
  );
}
