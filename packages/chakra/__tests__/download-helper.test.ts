import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RTS } from '@rmf2-ui/data';
import { triggerDownload } from '@/components/schedule-viewer/download-helper';

const BASE_TASK: RTS.Task = {
  id: 't1',
  type: 'delivery',
  description: 'Deliver A',
  startTime: new Date('2025-01-01T08:00:00Z'),
  endTime: new Date('2025-01-01T09:00:00Z'),
  status: 'completed',
  taskDetails: { resource_zone: 'A', resource_type: 'AMR' },
};

const SCHEDULE: RTS.Schedule = {
  tasks: [BASE_TASK],
  processes: [],
};

const EMPTY_SCHEDULE: RTS.Schedule = { tasks: [], processes: [] };

function setupAnchorMock() {
  const clickSpy = vi.fn();
  // Stub with only the properties triggerDownload uses; double cast bypasses the full HTMLAnchorElement type
  const anchor = {
    href: '',
    download: '',
    click: clickSpy,
  } as unknown as HTMLAnchorElement;
  vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
  vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:fake');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  return { anchor, clickSpy };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('triggerDownload — json', () => {
  it('calls anchor.click()', () => {
    const { clickSpy } = setupAnchorMock();
    triggerDownload(SCHEDULE, 'json');
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('sets download filename to schedule.json', () => {
    const { anchor } = setupAnchorMock();
    triggerDownload(SCHEDULE, 'json');
    expect(anchor.download).toBe('schedule.json');
  });

  it('sets href to the object URL', () => {
    const { anchor } = setupAnchorMock();
    triggerDownload(SCHEDULE, 'json');
    expect(anchor.href).toBe('blob:fake');
  });

  it('revokes the object URL after clicking', () => {
    setupAnchorMock();
    triggerDownload(SCHEDULE, 'json');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake');
  });

  it('creates a Blob with application/json type', () => {
    let capturedBlob: Blob | undefined;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return 'blob:fake';
    });
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    triggerDownload(SCHEDULE, 'json');
    expect(capturedBlob?.type).toBe('application/json');
  });
});

describe('triggerDownload — csv', () => {
  it('calls anchor.click()', () => {
    const { clickSpy } = setupAnchorMock();
    triggerDownload(SCHEDULE, 'csv');
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('sets download filename to schedule.csv', () => {
    const { anchor } = setupAnchorMock();
    triggerDownload(SCHEDULE, 'csv');
    expect(anchor.download).toBe('schedule.csv');
  });

  it('creates a Blob with text/csv type', () => {
    let capturedBlob: Blob | undefined;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return 'blob:fake';
    });
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    triggerDownload(SCHEDULE, 'csv');
    expect(capturedBlob?.type).toBe('text/csv');
  });

  it('produces CSV Blob with header row and task values', async () => {
    let capturedBlob: Blob | undefined;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return 'blob:fake';
    });
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    triggerDownload(SCHEDULE, 'csv');
    const text = await capturedBlob!.text();
    expect(text).toContain('id');
    expect(text).toContain('type');
    expect(text).toContain('"t1"');
    expect(text).toContain('"delivery"');
  });

  it('flattens taskDetails into dotted keys in CSV', async () => {
    let capturedBlob: Blob | undefined;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return 'blob:fake';
    });
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    triggerDownload(SCHEDULE, 'csv');
    const text = await capturedBlob!.text();
    expect(text).toContain('taskDetails.resource_zone');
  });

  it('produces empty content for empty schedule', async () => {
    let capturedBlob: Blob | undefined;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return 'blob:fake';
    });
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    triggerDownload(EMPTY_SCHEDULE, 'csv');
    const text = await capturedBlob!.text();
    expect(text).toBe('');
  });

  it('escapes double quotes in cell values', async () => {
    const scheduleWithQuotes: RTS.Schedule = {
      tasks: [{ ...BASE_TASK, description: 'He said "hello"' }],
      processes: [],
    };
    let capturedBlob: Blob | undefined;
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob as Blob;
      return 'blob:fake';
    });
    const anchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    triggerDownload(scheduleWithQuotes, 'csv');
    const text = await capturedBlob!.text();
    expect(text).toContain('He said ""hello""');
  });
});
