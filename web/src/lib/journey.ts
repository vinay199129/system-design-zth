import {
  buildRedoQueue,
  statusOf,
  type ProgressState,
} from './progress';
import {
  daysSinceStart,
  daysUntilTarget,
  type UserProfile,
} from './profile';
import {
  designs,
  findDesignById,
  findStudySectionById,
  schedule,
  scheduleDay,
} from './content';
import type { ScheduleDay } from '@/generated/types';

// ---------------------------------------------------------------------------
// Recommendation hierarchy
// ---------------------------------------------------------------------------

export type RecommendationKind =
  | 'redo'
  | 'today-design'
  | 'today-task'
  | 'tomorrow-first'
  | 'phase-0-start'
  | 'all-done';

export interface NextRecommendation {
  kind: RecommendationKind;
  itemId: string | null;
  title: string;
  href: string;
  reason: string;
  meta?: {
    day?: number;
    timeMinutes?: number | null;
    overdueBy?: number;
  };
}

/**
 * Map an item id (case-study/design-drill or study section) to a route.
 */
export function hrefForItem(itemId: string): string {
  const design = findDesignById(itemId);
  if (design) return `/designs/${design.slug}`;
  const section = findStudySectionById(itemId);
  if (section) return `/study/${section.slug}`;
  return '/study/guide-how-to-think';
}

export function titleForItem(itemId: string): string {
  const design = findDesignById(itemId);
  if (design) return design.title;
  const section = findStudySectionById(itemId);
  if (section) return section.title;
  return itemId;
}

/**
 * 1-indexed day inside the curriculum. If the user has no profile yet, returns 0.
 * Honours `effectiveStartDay` (from the diagnostic — see design doc §2.4).
 */
export function currentScheduleDay(profile: UserProfile | null): number {
  if (!profile) return 0;
  const base = daysSinceStart(profile);
  if (base <= 0) return base;
  const skip = (profile.effectiveStartDay ?? 1) - 1;
  return base + skip;
}

export function getNextRecommendation(
  profile: UserProfile | null,
  progress: ProgressState,
  now: Date = new Date(),
): NextRecommendation {
  // 0. Onboarding — no profile or Day 0
  const day = currentScheduleDay(profile);
  if (!profile || day <= 0) {
    return {
      kind: 'phase-0-start',
      itemId: 'guide-how-to-think',
      title: 'Start: How to Think about System Design',
      href: '/study/guide-how-to-think',
      reason: profile
        ? 'Begin with the RESHADED framework'
        : 'Set up your profile to begin',
    };
  }

  // 1. Overdue / due-today redo items take priority
  const queue = buildRedoQueue(progress, now.getTime());
  const overdueFirst = queue.find((e) => e.dueIn <= 0);
  if (overdueFirst) {
    const title = titleForItem(overdueFirst.itemId);
    const overdueBy = -overdueFirst.dueIn;
    return {
      kind: 'redo',
      itemId: overdueFirst.itemId,
      title: `Redo: ${title}`,
      href: hrefForItem(overdueFirst.itemId),
      reason:
        overdueBy > 0
          ? `Review item · ${overdueBy}d overdue`
          : 'Review item · due today',
      meta: { overdueBy },
    };
  }

  // 2. Today's first unfinished assignment
  const today = scheduleDay(day);
  if (today) {
    const items = resolveScheduleItems(today, profile?.studyStyle ?? 'mixed');
    for (const item of items) {
      const status = statusOf(progress, item.id);
      if (status === 'done') continue;
      return {
        kind: item.kind === 'design' ? 'today-design' : 'today-task',
        itemId: item.id,
        title: item.title,
        href: hrefForItem(item.id),
        reason: `Day ${day}${item.timeMinutes ? ` · ${item.timeMinutes}m` : ''}`,
        meta: { day, timeMinutes: item.timeMinutes },
      };
    }
  }

  // 3. Today fully done — preview tomorrow
  const tomorrow = scheduleDay(day + 1);
  if (tomorrow) {
    const items = resolveScheduleItems(tomorrow, profile?.studyStyle ?? 'mixed');
    if (items.length > 0) {
      const first = items[0];
      return {
        kind: 'tomorrow-first',
        itemId: first.id,
        title: `Get a head start: ${first.title}`,
        href: hrefForItem(first.id),
        reason: `Day ${day} done · Day ${day + 1} starts here`,
        meta: { day: day + 1, timeMinutes: first.timeMinutes },
      };
    }
  }

  // 4. Beyond day 60
  return {
    kind: 'all-done',
    itemId: null,
    title: 'You finished the 60-day track 🎉',
    href: '/review',
    reason: 'Keep sharp with weekly mocks',
  };
}

// ---------------------------------------------------------------------------
// Schedule item resolution
// ---------------------------------------------------------------------------

export interface ResolvedScheduleItem {
  id: string;
  title: string;
  timeMinutes: number | null;
  /** 'design' = (P) Phase 4-5 case-study drill, 'task' = (R)/(V) reading/review */
  kind: 'design' | 'task';
  marker?: string;
}

/**
 * Flatten a ScheduleDay into a list of work items, honouring studyStyle.
 * Each `tasks[]` entry becomes a synthetic study-section "task" item with a
 * stable id derived from phase + day + index so progress tracking can work.
 */
export function resolveScheduleItems(
  day: ScheduleDay,
  style: 'designs-first' | 'theory-first' | 'mixed' = 'mixed',
): ResolvedScheduleItem[] {
  const designItems: ResolvedScheduleItem[] = day.problems
    .filter((p) => p.id)
    .map((p) => ({
      id: p.id as string,
      title: p.title,
      timeMinutes: p.timeMinutes,
      kind: 'design' as const,
      marker: p.marker,
    }));

  const tasks: ResolvedScheduleItem[] = day.tasks.map((t, i) => ({
    id: `task-day${day.day}-${i}`,
    title: t,
    timeMinutes: null,
    kind: 'task' as const,
  }));

  if (style === 'designs-first') return [...designItems, ...tasks];
  if (style === 'theory-first') return [...tasks, ...designItems];
  // mixed: tasks-then-designs keeps reading context first for "intro" days
  // and design drills after.
  return [...tasks, ...designItems];
}

// ---------------------------------------------------------------------------
// Adaptive banners
// ---------------------------------------------------------------------------

export type LevelBannerKind =
  | 'phase-0-essential'
  | 'diagnostic-available'
  | 'time-pressure'
  | null;

/**
 * Decide which contextual banner (if any) to show on the home page.
 * See learner-journey-design.md §2.4.
 */
export function getLevelBanner(
  profile: UserProfile | null,
): { kind: LevelBannerKind; message: string } {
  if (!profile) return { kind: null, message: '' };

  // Time pressure?
  const remaining = daysUntilTarget(profile);
  if (remaining !== null && remaining > 0) {
    const day = currentScheduleDay(profile);
    const daysLeftOnTrack = Math.max(0, 60 - day);
    if (remaining < daysLeftOnTrack) {
      return {
        kind: 'time-pressure',
        message: `${remaining} days until target — you're on the 60-day track with ${daysLeftOnTrack} days of content left. Bump daily hours to 4/day or switch to designs-first.`,
      };
    }
  }

  if (
    profile.level === 'beginner' ||
    profile.priorExperience === 'none' ||
    profile.priorExperience === 'component-level'
  ) {
    return {
      kind: 'phase-0-essential',
      message:
        'Phase 0 is short but essential — RESHADED and back-of-the-envelope estimation are the foundation every later phase assumes.',
    };
  }

  if (
    profile.level === 'advanced' ||
    profile.priorExperience === 'system-level' ||
    profile.priorExperience === 'led-design'
  ) {
    return {
      kind: 'diagnostic-available',
      message:
        'Want to skip ahead? Try the 5-design diagnostic (~25 min). If you can sketch 4/5 confidently, jump straight to Phase 3 patterns.',
    };
  }

  return { kind: null, message: '' };
}

/**
 * Find the most-recently touched item (design or study section). Used by
 * the "Resume where you left off" CTA.
 */
export function lastTouchedItem(
  progress: ProgressState,
): { itemId: string; touchedAt: number; title: string; href: string } | null {
  let bestId: string | null = null;
  let bestT = 0;
  for (const [id, t] of Object.entries(progress.touched ?? {})) {
    if (t > bestT) {
      bestT = t;
      bestId = id;
    }
  }
  if (!bestId) return null;
  return {
    itemId: bestId,
    touchedAt: bestT,
    title: titleForItem(bestId),
    href: hrefForItem(bestId),
  };
}

export const TOTAL_TRACK_DAYS = 60;
export const TOTAL_DESIGNS = designs.length;
export const TOTAL_SCHEDULE_DAYS = schedule.length;
