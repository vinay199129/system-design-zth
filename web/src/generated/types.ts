/**
 * Types for the build-time generated content (web/scripts/extract-content.mjs).
 *
 * Keep in sync with that script. Imported via `@/generated/types`.
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface StudySection {
  id: string;
  slug: string;
  title: string;
  /** Phase id ("p0"-"p6") or one of "guide" / "templates". */
  phaseId: string;
  phaseTitle: string;
  moduleId: string | null;
  moduleTitle: string | null;
  order: number;
  markdown: string;
}

export interface ScheduleProblemRef {
  id: string | null;
  title: string;
  timeMinutes: number;
  marker: string;
  /** 'reading' | 'case-study' | 'design-drill' | 'mock-interview' | 'review' */
  type?: string;
}

export interface ScheduleDay {
  day: number;
  phaseId: string;
  phaseTitle: string;
  modules: string[];
  problems: ScheduleProblemRef[];
  tasks: string[];
  totalTimeHours: number;
  rawDescription: string;
}

export type Schedule = ScheduleDay[];

/**
 * A case-study design from Phase 4 / Phase 5 (20 designs total).
 * Replaces dsa-zth's `Problem` type — the entity is a FAANG system-design
 * case study (URL Shortener, Instagram, etc.), not a LeetCode problem.
 */
export interface Design {
  id: string;
  slug: string;
  title: string;
  phaseId: string;
  phaseTitle: string;
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  order: number;
  /** 'Easy' (Phase 4 starter), 'Medium' (Phase 4 / early 5), 'Hard' (Phase 5 advanced). */
  difficulty: Difficulty | null;
  /** Primary system-design pattern this drill exercises (e.g. "Fan-out", "Sharding"). */
  pattern: string | null;
  /** Estimated minutes for one RESHADED pass (typically 45). */
  timeLimit: number | null;
  /** Comma-separated FAANG companies known to ask this case study. */
  companies: string | null;
  /** Comma-separated concepts/building blocks this design exercises. */
  concepts: string | null;
  /** GitHub URL to the design README, if any. */
  link: string | null;
  /** problem.md content (prompt + requirements + scope). */
  problemMarkdown: string | null;
  /** solution.md content (reference architecture + trade-offs). */
  solutionMarkdown: string | null;
  /** README.md content (overview / TOC). */
  readmeMarkdown: string | null;
}

/**
 * A case study from Phase 1-3 modules' `case-studies/` directories.
 * One real-world production system (Cloudflare DNS, Memcached @ FB, etc.)
 * applying the parent module's concept.
 */
export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  /** "p1" / "p2" / "p3" */
  phaseId: string;
  phaseTitle: string;
  /** The module's slug WITHOUT the order prefix (e.g. "caching"). */
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  /** Order within the module's case-studies directory. */
  order: number;
  markdown: string;
}
