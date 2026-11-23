import { useCallback, useEffect, useRef } from 'react';
import { chakra, useSlotRecipe } from '@chakra-ui/react';
import { useSchedulerViewerGantt, GANTT_PRESETS } from './use-scheduler-viewer';
import { DataSet } from 'vis-data/esnext';
import type { DataItem, DataGroup } from 'vis-timeline/esnext';
import { Timeline } from 'vis-timeline/esnext';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import './vis-timeline-styles.css';

const OPTIONS = { height: '680px', orientation: 'top', zoomFriction: 0 };
const DEFAULT_ZOOM_LEVEL = 30 * 60; // 30 min in seconds

function assignPresets(
  types: string[],
  existing: Record<string, string>,
): Record<string, string> {
  const updated = { ...existing };
  let nextIndex = Object.keys(updated).length;
  for (const type of types) {
    if (updated[type] === undefined) {
      updated[type] = GANTT_PRESETS[nextIndex % GANTT_PRESETS.length];
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
      const pct = task.progress !== undefined ? task.progress * 100 : null;
      return {
        id: task.id,
        content: task.description ?? '',
        start: task.startTime,
        end: task.endTime ?? new Date(task.startTime.getTime() + 20 * 1000),
        className: colorMap[task.type],
        style:
          pct !== null
            ? `background-image: linear-gradient(to right, rgba(255,255,255,0.25) ${pct}%, rgba(0,0,0,0.3) ${pct}%)`
            : undefined,
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
        '--vis-text-color': {
          base: '{colors.gray.700}',
          _dark: '{colors.white}',
        },
        '--gantt-item-text-color': {
          base: '{colors.gray.800}',
          _dark: '{colors.white}',
        },
        '--gantt-item-hover-filter': {
          base: 'brightness(0.93)',
          _dark: 'brightness(1.15)',
        },
        '--vis-label-text-color': {
          base: '{colors.gray.700}',
          _dark: '{colors.white}',
        },
        '--gantt-preset-1-bg': '{colors.schedule-viewer.gantt.preset1.bg}',
        '--gantt-preset-2-bg': '{colors.schedule-viewer.gantt.preset2.bg}',
        '--gantt-preset-3-bg': '{colors.schedule-viewer.gantt.preset3.bg}',
        '--gantt-preset-4-bg': '{colors.schedule-viewer.gantt.preset4.bg}',
        '--gantt-preset-5-bg': '{colors.schedule-viewer.gantt.preset5.bg}',
        '& .vis-item.vis-selected.preset_1': styles['gantt.selected.preset_1'],
        '& .vis-item.vis-selected.preset_2': styles['gantt.selected.preset_2'],
        '& .vis-item.vis-selected.preset_3': styles['gantt.selected.preset_3'],
        '& .vis-item.vis-selected.preset_4': styles['gantt.selected.preset_4'],
        '& .vis-item.vis-selected.preset_5': styles['gantt.selected.preset_5'],
      }}
    />
  );
}
