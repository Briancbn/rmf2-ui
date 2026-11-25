import { useCallback, useEffect, useRef } from 'react';
import { chakra, useSlotRecipe } from '@chakra-ui/react';
import { useSchedulerViewerGantt } from './use-scheduler-viewer';
import { DataSet } from 'vis-data/esnext';
import type { DataItem, DataGroup } from 'vis-timeline/esnext';
import { Timeline } from 'vis-timeline/esnext';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

const OPTIONS = { height: '680px', orientation: 'top', zoomFriction: 0 };
const DEFAULT_ZOOM_LEVEL = 30 * 60; // 30 min in seconds

function ganttPresetsCss(
  presetMap: Record<string, string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [preset, token] of Object.entries(presetMap)) {
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

const PRESET_COLORS: Record<string, string> = {
  preset_1: '{colors.schedule-viewer.gantt.preset1.bg}',
  preset_2: '{colors.schedule-viewer.gantt.preset2.bg}',
  preset_3: '{colors.schedule-viewer.gantt.preset3.bg}',
  preset_4: '{colors.schedule-viewer.gantt.preset4.bg}',
  preset_5: '{colors.schedule-viewer.gantt.preset5.bg}',
};

const PRESET_KEYS = Object.keys(PRESET_COLORS);

function assignPresets(
  types: string[],
  existing: Record<string, string>,
): Record<string, string> {
  const updated = { ...existing };
  let nextIndex = Object.keys(updated).length;
  for (const type of types) {
    if (updated[type] === undefined) {
      updated[type] =
        PRESET_KEYS[nextIndex % PRESET_KEYS.length] ?? PRESET_KEYS[0];
      nextIndex++;
    }
  }
  return updated;
}

interface VisTimelineContext {
  dataGroups: DataSet<DataGroup>;
  dataItems: DataSet<DataItem>;
  timeline: Timeline;
}

export function SchedulerViewerGantt() {
  const { tasks, typeColorMap, setTypeColorMap, openTaskViewDialog } =
    useSchedulerViewerGantt();
  const schedulerViewerRecipe = useSlotRecipe({ key: 'schedulerViewer' });
  const styles = schedulerViewerRecipe();
  const visTimelineContext = useRef<VisTimelineContext>(null);

  const containerRef = useCallback((node: HTMLDivElement) => {
    if (visTimelineContext.current !== null) {
      return;
    }

    if (node !== null) {
      const dataGroups: DataSet<DataGroup> = new DataSet();
      const dataItems: DataSet<DataItem> = new DataSet();
      node.innerHTML = '';
      visTimelineContext.current = {
        dataGroups,
        dataItems,
        timeline: new Timeline(node, dataItems, dataGroups, {
          ...OPTIONS,
          start: new Date(Date.now() - (DEFAULT_ZOOM_LEVEL / 2) * 1000),
          end: new Date(Date.now() + (DEFAULT_ZOOM_LEVEL / 2) * 1000),
        }),
      };
    }
  }, []);

  useEffect(() => {
    if (!visTimelineContext.current) {
      return;
    }

    const filteredTasks = tasks.filter(
      (task) =>
        task?.type !== 'ihi/dummy' && task?.type !== 'ihi/warehouse_task',
    );

    const types = Array.from(new Set(filteredTasks.map((t) => t.type)));
    const colorMap = assignPresets(types, typeColorMap);
    if (Object.keys(colorMap).length !== Object.keys(typeColorMap).length) {
      setTypeColorMap(colorMap);
    }

    const groupIds = new Set<string>();
    const taskIds = new Set<string>();
    for (const task of filteredTasks) {
      groupIds.add(task.resourceId ?? 'unassigned');
      taskIds.add(task.id);
    }

    const sortedGroupIds = Array.from(groupIds).sort();
    const groupMap: Record<string, number> = {};
    sortedGroupIds.reduce((acc, groupId, index) => {
      acc[groupId] = index;
      return acc;
    }, groupMap);

    const newDataGroups: DataGroup[] = sortedGroupIds.map((groupId, index) => ({
      id: index,
      content: groupId,
    }));
    const newDataItems: DataItem[] = filteredTasks.map((task) => {
      const pct = task.progress !== undefined ? task.progress * 100 : 0;
      return {
        id: task.id,
        content: task.description ?? '',
        start: task.startTime,
        end: task.endTime ?? new Date(task.startTime.getTime() + 20 * 1000),
        className: `${styles.ganttItem} ${colorMap[task.type] ?? ''}`,
        style: `background-image: linear-gradient(to right, rgba(255,255,255,0.25) ${pct}%, rgba(0,0,0,0.15) ${pct}%)`,
        group: groupMap[task.resourceId ?? 'unassigned'],
        title: `${task?.resourceId} \n@ ${task?.taskDetails?.resource_zone} zone`,
      };
    });

    visTimelineContext.current.dataGroups.update(newDataGroups);
    visTimelineContext.current.dataItems.update(newDataItems);

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
  }, [tasks, typeColorMap, setTypeColorMap]);

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
  return (
    <chakra.div
      ref={containerRef}
      minHeight="700px"
      maxHeight="900px"
      css={{
        '& .vis-time-axis .vis-text': {
          color: '{colors.schedule-viewer.gantt.axis.text}',
        },
        '& .vis-labelset .vis-label': {
          color: '{colors.schedule-viewer.gantt.label.text}',
        },
        ...ganttPresetsCss(PRESET_COLORS),
      }}
    />
  );
}
