/**
 * Profile model for System Design Zero to Hero.
 *
 * Semantics (per .audit/learner-journey-design.md §1.1):
 *   level        = beginner / intermediate / advanced (self-reported)
 *   priorExperience overrides level when set:
 *     'none' or 'component-level' implies beginner-style guidance
 *     'system-level' implies intermediate-style guidance
 *     'led-design'  implies advanced-style guidance
 */

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type DailyHours = '1' | '2' | '4';

/**
 * Domain-specific prior experience for system design (vs dsa-zth's CS-degree
 * variants). See learner-journey-design.md §1.1.
 */
export type PriorExperience =
  | 'none'              // never designed a system end-to-end
  | 'component-level'   // built features but not full systems
  | 'system-level'      // designed services at work
  | 'led-design';       // led architecture for a team

/**
 * studyStyle controls how daily plans are reordered. See journey.ts.
 *   'designs-first'  — jump straight into Phase 4 drills; theory inline
 *   'theory-first'   — finish Phase 1-3 fully before any Phase 4 design
 *   'mixed'          — follow daily-schedule.md verbatim (default)
 */
export type StudyStyle = 'designs-first' | 'theory-first' | 'mixed';

export interface UserProfile {
  name: string;
  target: string;
  level: ExperienceLevel;
  hours: DailyHours;
  startDate: string; // ISO yyyy-mm-dd
  // Optional fields — all back-compat with profiles saved before these were added:
  priorExperience?: PriorExperience;
  targetDate?: string; // ISO yyyy-mm-dd or '' (open-ended)
  studyStyle?: StudyStyle;
  /** Diagnostic skip — defaults to 1 (no skip). See journey.ts. */
  effectiveStartDay?: number;
}

export const PROFILE_STORAGE_KEY = 'sd-zth:profile';

export const DEFAULT_PROFILE: UserProfile | null = null;

/** Local-date ISO yyyy-mm-dd (e.g. "2026-05-14"). */
function localIsoToday(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Fixes a profile saved by an older client that used `toISOString().slice(0,10)`
 * for `startDate` — that returned the UTC date, which rolls back to "yesterday"
 * for users east of UTC who set up after their local midnight.
 *
 * If `startDate` exactly matches today's UTC date, but that date is NOT today's
 * local date, we silently shift it forward to today's local date. This is a
 * one-shot heuristic: future saves use the timezone-aware `todayISO()` so the
 * condition won't trigger again.
 */
export function normaliseProfile(p: UserProfile | null): UserProfile | null {
  if (!p?.startDate) return p;
  const utcToday = new Date().toISOString().slice(0, 10);
  const localToday = localIsoToday();
  if (p.startDate === utcToday && utcToday !== localToday) {
    return { ...p, startDate: localToday };
  }
  return p;
}

export function profileInitials(profile: UserProfile | null): string {
  if (!profile?.name) return '';
  const parts = profile.name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export function daysSinceStart(profile: UserProfile | null): number {
  if (!profile?.startDate) return 0;
  const start = new Date(profile.startDate);
  if (Number.isNaN(start.getTime())) return 0;
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
  return Math.max(0, diff) + 1;
}

export function daysUntilTarget(profile: UserProfile | null): number | null {
  if (!profile?.targetDate) return null;
  const target = new Date(profile.targetDate);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - today.getTime()) / 86400000);
}

export function levelLabel(level: ExperienceLevel): string {
  switch (level) {
    case 'beginner':
      return 'Beginner — new to system design';
    case 'intermediate':
      return 'Intermediate — know basics, want practice';
    case 'advanced':
      return 'Advanced — refreshing for senior rounds';
  }
}

export function priorExperienceLabel(p: PriorExperience): string {
  switch (p) {
    case 'none':
      return "I've never designed a system end-to-end";
    case 'component-level':
      return "I've built features / endpoints but not whole systems";
    case 'system-level':
      return "I've designed services end-to-end at work";
    case 'led-design':
      return "I've led architecture reviews and trade-off calls";
  }
}

export function studyStyleLabel(s: StudyStyle): string {
  switch (s) {
    case 'designs-first':
      return 'Designs first — drill the 20 case studies, theory inline';
    case 'theory-first':
      return 'Theory first — finish Phase 1-3 fully before drills';
    case 'mixed':
      return 'Mixed — follow the 60-day schedule verbatim';
  }
}

export function hoursLabel(hours: DailyHours): string {
  switch (hours) {
    case '1':
      return '~1 hour/day (90-day track)';
    case '2':
      return '~2-3 hours/day (60-day track)';
    case '4':
      return '~4-6 hours/day (intensive, ~45 days)';
  }
}
