import type { RTS } from '@rmf2-ui/data';

export type DownloadFormat = 'json' | 'csv';

// Wraps in double quotes; inner " -> "" per the CSV spec
function escapeCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function flattenTask(task: RTS.Task): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(task)) {
    if (
      value !== null &&
      typeof value === 'object' &&
      !(value instanceof Date) &&
      !Array.isArray(value)
    ) {
      for (const [subKey, subValue] of Object.entries(value)) {
        result[`${key}.${subKey}`] = subValue;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

function collectHeaders(tasks: RTS.Task[]): string[] {
  const seen = new Set<string>();
  for (const task of tasks) {
    for (const key of Object.keys(flattenTask(task))) {
      seen.add(key);
    }
  }
  return Array.from(seen);
}

function scheduleToCsv(schedule: RTS.Schedule): string {
  if (schedule.tasks.length === 0) return '';
  const headers = collectHeaders(schedule.tasks);
  const rows = schedule.tasks.map((t) => {
    const flat = flattenTask(t);
    return headers.map((h) => escapeCell(flat[h])).join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function triggerDownload(
  schedule: RTS.Schedule,
  format: DownloadFormat,
): void {
  const isJson = format === 'json';
  const content = isJson
    ? JSON.stringify(schedule, null, 2)
    : scheduleToCsv(schedule);
  const blob = new Blob([content], {
    type: isJson ? 'application/json' : 'text/csv',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = isJson ? 'schedule.json' : 'schedule.csv';
  a.click();
  URL.revokeObjectURL(url);
}
