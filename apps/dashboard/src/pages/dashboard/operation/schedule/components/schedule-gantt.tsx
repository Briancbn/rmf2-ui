import { Box } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { DataSet } from 'vis-data/esnext';
import { Timeline } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import './vis-timeline-styles.css';

const COLOR_CLASSES = ['red', 'green', 'magenta', 'yellow', 'orange'];
const OPTIONS = { height: '680px', orientation: 'top' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ScheduleGantt(props: { tasks: any[] }) {
  const timelineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let usedColorCounter = 0;
    const colorAssignment: Record<string, string> = {};

    const filteredTasks = props.tasks.filter(
      (task) =>
        task?.type !== 'ihi/dummy' && task?.type !== 'ihi/warehouse_task',
    );

    const taskList = [];
    for (const task of filteredTasks) {
      if (!(task?.description in colorAssignment)) {
        colorAssignment[task?.type] =
          COLOR_CLASSES[usedColorCounter % COLOR_CLASSES.length];
        usedColorCounter++; // Increment color counter
      }
      const taskWithColor = { ...task, color: colorAssignment[task?.type] };
      taskList.push(taskWithColor);
    }

    // Prep data for visualisation
    const resourceIdList: string[] = [
      ...new Set(taskList.map((task) => task?.resource_id)),
    ];
    resourceIdList.sort();
    const groups = new DataSet(
      resourceIdList.map((resourceId, index) => {
        return { id: index, content: resourceId };
      }),
    );
    const itemList = parseTaskList(taskList, resourceIdList);
    const items = new DataSet(itemList);

    // RESET
    if (!timelineRef.current) {
      return;
    }

    // GENERATE NEW TIMELINE
    timelineRef.current.innerHTML = '';
    const newTimeline = new Timeline(timelineRef.current, items);
    newTimeline.setOptions(OPTIONS);
    newTimeline.setGroups(groups);

    // TODAY
    const todayButton = document.getElementById('todayId');
    if (!todayButton) {
      return;
    }
    todayButton.addEventListener('click', () => {
      const options = { timeZone: 'Asia/Singapore' };
      const now = new Intl.DateTimeFormat('en-US', options).format(new Date());
      newTimeline.moveTo(now);
    });

    // DATETIME
    const datetimeInput = document.getElementById('datetimeInputId');
    if (!datetimeInput) {
      return;
    }
    datetimeInput.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      const selectedTime = new Date(target.value);
      newTimeline.moveTo(selectedTime);
    });

    // return () => timelineRef.current = null
  }, [props.tasks]);

  return (
    <Box
      minHeight="700px"
      maxHeight="900px"
      ref={timelineRef}
      css={{
        '--vis-text-color': {
          base: 'colors.gray.700',
          _dark: 'colors.white',
        },
        '--vis-label-text-color': {
          base: 'colors.gray.700',
          _dark: 'colors.white',
        },
      }}
    ></Box>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTaskList(taskList: any[], resourceIdList: string[]): any[] {
  return taskList.map((task) => parseTaskItem(task, resourceIdList));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTaskItem(task: any, resourceIdList: string[]): any {
  const coordinates = task?.task_details?.coordinates;
  const coordinatesString = Array.isArray(coordinates)
    ? coordinates.join(', ')
    : coordinates;

  const parsedItem = {
    id: task?.id,
    content: task?.description || '',
    start: new Date(task?.start_time),
    end: new Date(task?.end_time),
    className: task?.color, // change colors in COLOR_CLASSES
    group: resourceIdList.indexOf(task?.resource_id),
    title: `${task?.resource_id} \n@ ${task?.task_details?.resource_zone} zone [${coordinatesString}]`,
  };
  console.debug(parsedItem);
  return parsedItem;
}

export default ScheduleGantt;
