import { describe, it, expect } from 'vitest';
import {
  currentScheduleDay,
  getLevelBanner,
  hrefForItem,
  lastTouchedItem,
  resolveScheduleItems,
  titleForItem,
  TOTAL_DESIGNS,
  TOTAL_SCHEDULE_DAYS,
  TOTAL_TRACK_DAYS,
} from './journey';
import type { UserProfile } from './profile';
import type { ProgressState } from './progress';
import type { ScheduleDay } from '@/generated/types';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Local-midnight ISO yyyy-mm-dd (timezone-stable, matches `daysSinceStart`). */
function localIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysAgoIso(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return localIsoDate(d);
}

function daysFromNowIso(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return localIsoDate(d);
}

function emptyProgress(): ProgressState {
  return {
    items: {},
    touched: {},
    intervalIdx: {},
    heatmap: {},
    itemKind: {},
  };
}

function fakeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  // Default: started 7 calendar days ago, intermediate, 2h/day, no targetDate.
  return {
    name: 'Test User',
    target: 'Google',
    level: 'intermediate',
    hours: '2',
    startDate: daysAgoIso(7),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// currentScheduleDay
// ---------------------------------------------------------------------------

describe('currentScheduleDay', () => {
  it('returns 0 when there is no profile', () => {
    expect(currentScheduleDay(null)).toBe(0);
  });

  it('returns 1 on the start day', () => {
    expect(currentScheduleDay(fakeProfile({ startDate: daysAgoIso(0) }))).toBe(1);
  });

  it('counts elapsed days correctly', () => {
    // Default profile started 7 calendar days ago → Day 8 today (1-indexed).
    expect(currentScheduleDay(fakeProfile())).toBe(8);
  });

  it('honours effectiveStartDay diagnostic skip', () => {
    const profile = fakeProfile({ effectiveStartDay: 15 });
    // base = 8 (7 days ago + 1), skip = 14 → 22
    expect(currentScheduleDay(profile)).toBe(22);
  });

  it('treats undefined effectiveStartDay as start day 1 (no skip)', () => {
    const profile = fakeProfile({ effectiveStartDay: undefined });
    const baseProfile = fakeProfile();
    expect(currentScheduleDay(profile)).toBe(currentScheduleDay(baseProfile));
  });
});

// ---------------------------------------------------------------------------
// resolveScheduleItems
// ---------------------------------------------------------------------------

describe('resolveScheduleItems', () => {
  const sampleDay: ScheduleDay = {
    day: 33,
    phaseId: 'p4',
    phaseTitle: 'Starter Designs',
    modules: ['url-shortener'],
    problems: [
      {
        id: 'p4-url-shortener',
        title: 'URL Shortener',
        timeMinutes: 45,
        marker: '(P)',
        type: 'design-drill',
      },
    ],
    tasks: ['(R) Read Phase 1.3 caching review', '(V) Redo URL shortener'],
    totalTimeHours: 3,
    rawDescription: '',
  };

  it('returns design items + synthetic task items', () => {
    const items = resolveScheduleItems(sampleDay, 'mixed');
    expect(items).toHaveLength(3); // 2 tasks + 1 design
    const kinds = items.map((i) => i.kind);
    expect(kinds.filter((k) => k === 'design')).toHaveLength(1);
    expect(kinds.filter((k) => k === 'task')).toHaveLength(2);
  });

  it('generates stable synthetic task ids per (day, index)', () => {
    const items = resolveScheduleItems(sampleDay, 'mixed');
    const taskItems = items.filter((i) => i.kind === 'task');
    expect(taskItems[0].id).toBe('task-day33-0');
    expect(taskItems[1].id).toBe('task-day33-1');
  });

  it('designs-first puts design before tasks', () => {
    const items = resolveScheduleItems(sampleDay, 'designs-first');
    expect(items[0].kind).toBe('design');
  });

  it('theory-first puts tasks before design', () => {
    const items = resolveScheduleItems(sampleDay, 'theory-first');
    expect(items[0].kind).toBe('task');
    expect(items[items.length - 1].kind).toBe('design');
  });

  it('skips design problem entries with no resolved id', () => {
    const day: ScheduleDay = {
      ...sampleDay,
      problems: [
        { id: null, title: 'Unknown', timeMinutes: 45, marker: '(P)' },
        ...sampleDay.problems,
      ],
    };
    const items = resolveScheduleItems(day, 'mixed');
    expect(items.filter((i) => i.kind === 'design')).toHaveLength(1);
  });

  it('returns an empty array for an empty day', () => {
    const empty: ScheduleDay = {
      day: 99,
      phaseId: 'p6',
      phaseTitle: 'Mock Interviews',
      modules: [],
      problems: [],
      tasks: [],
      totalTimeHours: 0,
      rawDescription: '',
    };
    expect(resolveScheduleItems(empty)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// hrefForItem / titleForItem
// ---------------------------------------------------------------------------

describe('hrefForItem', () => {
  it('routes a known design id to /designs/<slug>', () => {
    const href = hrefForItem('p4-url-shortener');
    expect(href).toBe('/designs/p4-url-shortener');
  });

  it('routes a known study section id to /study/<slug>', () => {
    const href = hrefForItem('p1-caching');
    expect(href).toBe('/study/p1-caching');
  });

  it('falls back to guide-how-to-think for unknown ids', () => {
    const href = hrefForItem('nonexistent-id-xyz');
    expect(href).toBe('/study/guide-how-to-think');
  });
});

describe('titleForItem', () => {
  it('returns the design title for a known design id', () => {
    const title = titleForItem('p4-url-shortener');
    expect(title).toMatch(/url shortener/i);
  });

  it('returns the section title for a known section id', () => {
    const title = titleForItem('p1-caching');
    expect(title.toLowerCase()).toContain('cach');
  });

  it('echoes the raw id for unknown items', () => {
    expect(titleForItem('blah-blah')).toBe('blah-blah');
  });
});

// ---------------------------------------------------------------------------
// getLevelBanner
// ---------------------------------------------------------------------------

describe('getLevelBanner', () => {
  it('returns no banner for a missing profile', () => {
    expect(getLevelBanner(null).kind).toBeNull();
  });

  it('shows phase-0-essential for beginners', () => {
    const b = getLevelBanner(
      fakeProfile({ level: 'beginner', priorExperience: 'none' }),
    );
    expect(b.kind).toBe('phase-0-essential');
  });

  it('shows phase-0-essential when priorExperience is component-level', () => {
    const b = getLevelBanner(
      fakeProfile({ level: 'intermediate', priorExperience: 'component-level' }),
    );
    expect(b.kind).toBe('phase-0-essential');
  });

  it('shows diagnostic-available for advanced/led-design', () => {
    const b = getLevelBanner(
      fakeProfile({ level: 'advanced', priorExperience: 'led-design' }),
    );
    expect(b.kind).toBe('diagnostic-available');
  });

  it('shows time-pressure when targetDate is closer than days-on-track', () => {
    // ~7 days elapsed; track has ~53 days of content left; target in 10 days → tight.
    const b = getLevelBanner(
      fakeProfile({
        level: 'intermediate',
        targetDate: daysFromNowIso(10),
      }),
    );
    expect(b.kind).toBe('time-pressure');
    expect(b.message).toContain('10 days until target');
  });
});

// ---------------------------------------------------------------------------
// lastTouchedItem
// ---------------------------------------------------------------------------

describe('lastTouchedItem', () => {
  it('returns null when nothing has been touched', () => {
    expect(lastTouchedItem(emptyProgress())).toBeNull();
  });

  it('returns the item with the highest touched timestamp', () => {
    const p = emptyProgress();
    p.touched = {
      'p1-caching': 1_000_000,
      'p4-url-shortener': 2_000_000,
      'p2-replication': 1_500_000,
    };
    const result = lastTouchedItem(p);
    expect(result?.itemId).toBe('p4-url-shortener');
    expect(result?.touchedAt).toBe(2_000_000);
    expect(result?.href).toBe('/designs/p4-url-shortener');
  });
});

// ---------------------------------------------------------------------------
// Constants sanity
// ---------------------------------------------------------------------------

describe('module constants', () => {
  it('exposes a 60-day track length', () => {
    expect(TOTAL_TRACK_DAYS).toBe(60);
  });

  it('parses 20 designs from the generated json', () => {
    expect(TOTAL_DESIGNS).toBe(20);
  });

  it('parses 60 schedule days from daily-schedule.md', () => {
    expect(TOTAL_SCHEDULE_DAYS).toBe(60);
  });
});
