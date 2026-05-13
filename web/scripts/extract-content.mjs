#!/usr/bin/env node
/**
 * Content extraction pipeline for System Design Zero to Hero.
 *
 * Walks the repo root (one level up from web/) and produces three JSON files
 * consumed at build time by Next.js pages:
 *
 *   web/src/generated/designs.json    — the 20 Phase 4-5 case-study designs
 *   web/src/generated/content.json    — study sections (framework + phase
 *                                       READMEs + module READMEs + templates)
 *   web/src/generated/schedule.json   — parsed from daily-schedule.md
 *
 * Sources (mirrors the structure described in README.md:30-91):
 *   - how-to-think.md, daily-schedule.md, setup.md, estimation-reference.md
 *     -> "guide" sections
 *   - phase-0-framework/{README,how-to-approach,estimation-cheatsheet,
 *     requirements-gathering}.md -> Phase 0 study sections
 *   - phase-{1..6}-* /<module>/README.md -> phase / module study sections
 *   - phase-{4,5}-* /<design>/{problem,solution,README}.md -> design case
 *     studies in designs.json
 *   - templates/answer-template.md -> "templates" section
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const OUT_DIR = join(__dirname, '..', 'src', 'generated');

// --------------------------------------------------------------------------
// Phase metadata — keep in sync with web/src/lib/phases.ts
// --------------------------------------------------------------------------
/** @type {Array<{id: string; folder: string; title: string; days: string}>} */
const PHASES = [
  { id: 'p0', folder: 'phase-0-framework',            title: 'Framework',              days: 'Days 1-3'   },
  { id: 'p1', folder: 'phase-1-building-blocks',      title: 'Building Blocks',        days: 'Days 4-15'  },
  { id: 'p2', folder: 'phase-2-distributed-concepts', title: 'Distributed Concepts',   days: 'Days 16-24' },
  { id: 'p3', folder: 'phase-3-design-patterns',      title: 'Design Patterns',        days: 'Days 25-32' },
  { id: 'p4', folder: 'phase-4-classic-starter',      title: 'Starter Designs',        days: 'Days 33-44' },
  { id: 'p5', folder: 'phase-5-classic-advanced',     title: 'Advanced Designs',       days: 'Days 45-54' },
  { id: 'p6', folder: 'phase-6-mock-interviews',      title: 'Mock Interviews',        days: 'Days 55-60' },
];

/** Per-task spec: Phase 4 designs are the "starter" 10; Phase 5 the "advanced" 10. */
const DESIGN_PHASES = new Set(['p4', 'p5']);

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
function read(path) {
  return readFileSync(path, 'utf8');
}

function exists(path) {
  return existsSync(path);
}

function listDirs(path) {
  if (!exists(path)) return [];
  return readdirSync(path)
    .filter((name) => {
      try {
        return statSync(join(path, name)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

/** Strip a numeric prefix like "01-" or "12-" from a filename or folder. */
function stripOrderPrefix(name) {
  return name.replace(/^\d+[-_]/, '');
}

/** Extract a leading order number from "01-foo" → 1. */
function orderOf(name) {
  const m = name.match(/^(\d+)[-_]/);
  return m ? parseInt(m[1], 10) : 999;
}

/** "url-shortener" -> "Url Shortener" (cosmetic fallback when no header). */
function humanize(slug) {
  return stripOrderPrefix(slug)
    .split(/[-_]/)
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
    .replace(/\bApi\b/g, 'API')
    .replace(/\bCdn\b/g, 'CDN')
    .replace(/\bDns\b/g, 'DNS')
    .replace(/\bSql\b/g, 'SQL')
    .replace(/\bNosql\b/g, 'NoSQL')
    .replace(/\bUrl\b/g, 'URL')
    .replace(/\bUuid\b/g, 'UUID')
    .replace(/\bCqrs\b/g, 'CQRS')
    .replace(/\bLb\b/g, 'LB');
}

function readMd(relativePath) {
  const p = join(REPO_ROOT, relativePath);
  if (!exists(p)) return null;
  return read(p);
}

function stripNavBreadcrumb(md) {
  return md.replace(/^>\s*\*\*Navigation:\*\*[^\n]*\n+/, '');
}

function firstHeading(md) {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

// --------------------------------------------------------------------------
// Study sections
// --------------------------------------------------------------------------
/** @type {Array<any>} */
const studySections = [];

function addSection(section) {
  studySections.push(section);
}

// Root-level guides (live alongside README.md at repo root)
const GUIDES = [
  { id: 'guide-how-to-think',     title: 'How to Think — System Design Mental Models', file: 'how-to-think.md',          order: 1 },
  { id: 'guide-daily-schedule',   title: 'Daily Schedule — Day-by-Day Plan',           file: 'daily-schedule.md',        order: 2 },
  { id: 'guide-estimation-ref',   title: 'Estimation Reference',                       file: 'estimation-reference.md',  order: 3 },
  { id: 'guide-setup',            title: 'Setup — Environment & Tools',                file: 'setup.md',                 order: 4 },
  { id: 'guide-plan',             title: 'Plan — Course Roadmap',                      file: 'plan.md',                  order: 5 },
];

for (const g of GUIDES) {
  const md = readMd(g.file);
  if (!md) continue;
  addSection({
    id: g.id,
    slug: g.id,
    title: g.title,
    phaseId: 'guide',
    phaseTitle: 'Guides',
    moduleId: null,
    moduleTitle: null,
    order: g.order,
    markdown: stripNavBreadcrumb(md),
  });
}

// Phase 0 is "flat" — 4 files at phase-0-framework/*.md
const PHASE_0_FILES = [
  { suffix: 'README.md',                  baseTitle: 'Phase 0 — Framework Overview',         order: 0 },
  { suffix: 'how-to-approach.md',         baseTitle: 'How to Approach a Design (RESHADED)',  order: 1 },
  { suffix: 'estimation-cheatsheet.md',   baseTitle: 'Estimation Cheatsheet',                order: 2 },
  { suffix: 'requirements-gathering.md',  baseTitle: 'Requirements Gathering',               order: 3 },
];

const phase0 = PHASES.find((p) => p.id === 'p0');
if (phase0) {
  for (const f of PHASE_0_FILES) {
    const md = readMd(join(phase0.folder, f.suffix));
    if (!md) continue;
    const heading = firstHeading(md) ?? f.baseTitle;
    const slug = `p0-${f.suffix.replace(/\.md$/, '')}`;
    addSection({
      id: slug,
      slug,
      title: heading,
      phaseId: 'p0',
      phaseTitle: phase0.title,
      moduleId: f.suffix.replace(/\.md$/, ''),
      moduleTitle: heading,
      order: f.order,
      markdown: stripNavBreadcrumb(md),
    });
  }
}

// Phases 1-3 — each phase has zero-or-one phase README plus one module
// README per subdirectory.
for (const phase of PHASES) {
  if (phase.id === 'p0') continue;

  const phaseReadme = readMd(join(phase.folder, 'README.md'));
  if (phaseReadme) {
    addSection({
      id: `${phase.id}-intro`,
      slug: `${phase.id}-intro`,
      title: `${phase.title} — Overview`,
      phaseId: phase.id,
      phaseTitle: phase.title,
      moduleId: null,
      moduleTitle: null,
      order: 0,
      markdown: stripNavBreadcrumb(phaseReadme),
    });
  }

  const moduleDirs = listDirs(join(REPO_ROOT, phase.folder));
  for (const moduleDir of moduleDirs) {
    const md = readMd(join(phase.folder, moduleDir, 'README.md'));
    if (!md) continue;
    const moduleId = stripOrderPrefix(moduleDir);
    const moduleOrder = orderOf(moduleDir);
    const heading = firstHeading(md);
    const title = heading
      ? heading.replace(/\(Days?\s+\d.*\)$/i, '').trim()
      : humanize(moduleDir);
    addSection({
      id: `${phase.id}-${moduleId}`,
      slug: `${phase.id}-${moduleId}`,
      title,
      phaseId: phase.id,
      phaseTitle: phase.title,
      moduleId,
      moduleTitle: title,
      order: moduleOrder,
      markdown: stripNavBreadcrumb(md),
    });
  }
}

// templates/answer-template.md (and any other top-level template files)
const TEMPLATE_FILES = [
  { file: 'templates/answer-template.md', title: 'RESHADED Answer Template', order: 1 },
];

for (const t of TEMPLATE_FILES) {
  const md = readMd(t.file);
  if (!md) continue;
  const heading = firstHeading(md) ?? t.title;
  const slug = `template-${t.order}-${heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)}`;
  addSection({
    id: slug,
    slug,
    title: `Template: ${heading}`,
    phaseId: 'templates',
    phaseTitle: 'Templates',
    moduleId: null,
    moduleTitle: null,
    order: t.order,
    markdown: stripNavBreadcrumb(md),
  });
}

// --------------------------------------------------------------------------
// Designs — Phase 4 (10 starter) + Phase 5 (10 advanced)
// --------------------------------------------------------------------------
/** @type {Array<any>} */
const designs = [];

function parseFrontmatter(md) {
  // Very small YAML-ish parser for the bits we care about: lines like
  //   - **Difficulty**: Medium
  //   - **Companies**: Google, Meta
  //   - **Concepts**: Sharding, Consistent Hashing
  const out = { difficulty: null, companies: null, concepts: null, pattern: null, timeLimit: null };
  const lines = md.split(/\r?\n/).slice(0, 60);
  for (const line of lines) {
    let m;
    if ((m = line.match(/\*\*Difficulty\*\*\s*:?\s*([A-Za-z]+)/i))) {
      const d = m[1].trim();
      const norm = d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
      if (norm === 'Easy' || norm === 'Medium' || norm === 'Hard') {
        out.difficulty = norm;
      } else if (/^Med$/i.test(d)) {
        out.difficulty = 'Medium';
      }
    }
    if ((m = line.match(/\*\*Companies?\*\*\s*:?\s*(.+)/i))) {
      out.companies = m[1].replace(/[.*]+\s*$/, '').trim();
    }
    if ((m = line.match(/\*\*Concepts?\*\*\s*:?\s*(.+)/i))) {
      out.concepts = m[1].replace(/[.*]+\s*$/, '').trim();
    }
    if ((m = line.match(/\*\*Pattern\*\*\s*:?\s*(.+)/i))) {
      out.pattern = m[1].replace(/[.*]+\s*$/, '').trim();
    }
    if ((m = line.match(/\*\*(?:Time(?:\s*limit)?|Duration)\*\*\s*:?\s*(\d+)\s*m/i))) {
      out.timeLimit = parseInt(m[1], 10);
    }
  }
  return out;
}

for (const phase of PHASES) {
  if (!DESIGN_PHASES.has(phase.id)) continue;
  const moduleDirs = listDirs(join(REPO_ROOT, phase.folder));
  for (const moduleDir of moduleDirs) {
    const moduleAbs = join(REPO_ROOT, phase.folder, moduleDir);
    const readmePath = join(phase.folder, moduleDir, 'README.md');
    const problemPath = join(phase.folder, moduleDir, 'problem.md');
    const solutionPath = join(phase.folder, moduleDir, 'solution.md');

    const readmeMd = readMd(readmePath);
    const problemMd = readMd(problemPath);
    const solutionMd = readMd(solutionPath);
    if (!readmeMd && !problemMd && !solutionMd) continue;
    void moduleAbs;

    const moduleId = stripOrderPrefix(moduleDir);
    const moduleOrder = orderOf(moduleDir);
    const titleSource = readmeMd || problemMd || solutionMd || '';
    const heading = firstHeading(titleSource);
    const title = heading
      ? heading.replace(/\(Days?\s+\d.*\)$/i, '').trim()
      : humanize(moduleDir);

    const meta = parseFrontmatter([readmeMd, problemMd, solutionMd].filter(Boolean).join('\n\n'));

    const slug = `${phase.id}-${moduleId}`;
    designs.push({
      id: slug,
      slug,
      title,
      phaseId: phase.id,
      phaseTitle: phase.title,
      moduleId,
      moduleTitle: title,
      moduleOrder,
      order: moduleOrder,
      difficulty: meta.difficulty,
      pattern: meta.pattern,
      timeLimit: meta.timeLimit ?? 45,
      companies: meta.companies,
      concepts: meta.concepts,
      link: `https://github.com/vinay199129/system-design-zth/tree/main/${phase.folder}/${moduleDir}`,
      problemMarkdown: problemMd,
      solutionMarkdown: solutionMd,
      readmeMarkdown: readmeMd,
    });
  }
}

// --------------------------------------------------------------------------
// Sort & emit
// --------------------------------------------------------------------------
const phaseRank = Object.fromEntries(PHASES.map((p, i) => [p.id, i]));
phaseRank.guide = -2;
phaseRank.templates = 99;

studySections.sort((a, b) => {
  const pa = phaseRank[a.phaseId] ?? 50;
  const pb = phaseRank[b.phaseId] ?? 50;
  if (pa !== pb) return pa - pb;
  return a.order - b.order;
});

designs.sort((a, b) => {
  if (phaseRank[a.phaseId] !== phaseRank[b.phaseId]) {
    return phaseRank[a.phaseId] - phaseRank[b.phaseId];
  }
  return a.moduleOrder - b.moduleOrder;
});

if (!exists(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

writeFileSync(
  join(OUT_DIR, 'content.json'),
  JSON.stringify(studySections, null, 0),
  'utf8',
);
writeFileSync(
  join(OUT_DIR, 'designs.json'),
  JSON.stringify(designs, null, 0),
  'utf8',
);

// --------------------------------------------------------------------------
// Daily schedule — parse daily-schedule.md
// --------------------------------------------------------------------------
//
// The system-design schedule layout is per-week (## Week N: <theme> (Days a-b))
// not per-phase as dsa-zth had. Columns: | Day | Phase | Topics | Tasks | Time |
// Tasks contain (R)/(P)/(V) prefix tokens that we classify into:
//   - reading     ((R) markdown file or "Module README")
//   - case-study  ((P) sub-section inside a Phase 1-3 module)
//   - design-drill ((P) full Phase 4-5 design — the 45-min RESHADED drill)
//   - mock-interview ((P) Phase 6 timed full round)
//   - review      ((V) revisit / weekly retro)

/** @type {Array<any>} */
const schedule = [];

const scheduleSource = readMd('daily-schedule.md');
if (scheduleSource) {
  const lines = scheduleSource.split(/\r?\n/);

  for (const raw of lines) {
    if (!raw.startsWith('|')) continue;
    const trimmed = raw.trim();
    if (/^\|[-:|\s]+\|$/.test(trimmed)) continue;
    const cells = trimmed.split('|').slice(1, -1).map((c) => c.trim());

    // Header row?
    if (/^day$/i.test(cells[0])) continue;
    if (!/^\d+$/.test(cells[0])) continue;
    const day = parseInt(cells[0], 10);
    if (!Number.isFinite(day) || day < 1 || day > 60) continue;
    if (cells.length < 5) continue;

    const [, phaseCell, topicsCell, tasksCell, timeCell] = cells;
    const phaseId = phaseCell.toLowerCase().trim(); // "p0".."p6"
    const phase = PHASES.find((p) => p.id === phaseId);
    if (!phase) continue;

    const totalTimeHours = parseTimeHours(timeCell);
    const { items: parsedItems, leftover } = parseTasksCell(tasksCell, phaseId, topicsCell);

    schedule.push({
      day,
      phaseId,
      phaseTitle: phase.title,
      modules: resolveModulesForDay(phaseId, topicsCell, parsedItems),
      problems: parsedItems,
      tasks: leftover,
      totalTimeHours,
      rawDescription: tasksCell,
    });
  }

  schedule.sort((a, b) => a.day - b.day);
}

function parseTimeHours(cell) {
  if (!cell) return 0;
  const m = cell.match(/(\d+(?:\.\d+)?)\s*h/i);
  return m ? parseFloat(m[1]) : 0;
}

/**
 * Split "(R) ..., (P) ..., (V) ..." into discrete tagged items.
 * We intentionally split on the LOOKBEHIND for a marker so commas *inside*
 * a single task description don't fragment the row.
 */
function splitTaggedTasks(text) {
  const parts = [];
  // Find all marker positions
  const re = /\((R|P|V)\)/g;
  const indices = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    indices.push({ idx: m.index, marker: m[1] });
  }
  if (indices.length === 0) return [];
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].idx;
    const end = i + 1 < indices.length ? indices[i + 1].idx : text.length;
    const body = text
      .slice(start + 3, end)
      .replace(/^[,\s]+|[,\s]+$/g, '')
      .replace(/,\s*$/, '')
      .trim();
    parts.push({ marker: `(${indices[i].marker})`, kind: indices[i].marker, body });
  }
  return parts;
}

/**
 * Build the items list for a schedule row. Phase 4-5 (P) entries that match
 * a design get a stable design-drill id; everything else is shoved into the
 * `tasks` array so the existing TodayPlan UI can still render them.
 *
 * Cross-reference resolution uses three tiers (per spec):
 *   1. primary: exact moduleId match (slugify body, drop common verbs)
 *   2. title-substring across the phase's designs
 *   3. fuzzy word-overlap (≥50% of meaningful words match)
 */
function parseTasksCell(tasksCell, phaseId, topicsCell) {
  if (!tasksCell) return { items: [], leftover: [] };
  const tagged = splitTaggedTasks(tasksCell);
  if (tagged.length === 0) {
    return { items: [], leftover: [tasksCell] };
  }

  const items = [];
  const leftover = [];

  for (const t of tagged) {
    if (t.kind === 'P' && DESIGN_PHASES.has(phaseId)) {
      const target = `${topicsCell} ${t.body}`;
      const design = resolveDesignRef(phaseId, target);
      if (design) {
        items.push({
          id: design.id,
          title: design.title,
          timeMinutes: 45,
          marker: t.marker,
          type: 'design-drill',
        });
        continue;
      }
    }
    if (t.kind === 'P' && phaseId === 'p6') {
      items.push({
        id: `mock-day-${tasksCell.length}-${t.body.slice(0, 16)}`,
        title: t.body.split('.')[0] || 'Mock interview',
        timeMinutes: 45,
        marker: t.marker,
        type: 'mock-interview',
      });
      continue;
    }
    // Phase 1-3 (P) = case-study practice. Phase 0 (R)/(V) = reading.
    // (V) anywhere = review.
    const type =
      t.kind === 'V'
        ? 'review'
        : t.kind === 'R'
          ? 'reading'
          : 'case-study';
    leftover.push(`${t.marker} ${t.body}`);
    void type;
  }

  return { items, leftover };
}

function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Three-tier fuzzy resolution mirroring dsa-zth's resolveProblemRef:
 *   1. moduleId substring match
 *   2. title substring match
 *   3. word-overlap ≥ 50% with module-id boost
 */
function resolveDesignRef(phaseId, query) {
  const q = norm(query);
  const candidates = designs.filter((d) => d.phaseId === phaseId);
  if (candidates.length === 0) return null;

  // Tier 1: module slug in query
  let hit = candidates.find((d) => q.includes(norm(d.moduleId)));
  if (hit) return hit;

  // Tier 2: title substring
  hit = candidates.find((d) => q.includes(norm(d.title)));
  if (hit) return hit;
  hit = candidates.find((d) => norm(d.title).includes(q.slice(0, 24)));
  if (hit) return hit;

  // Tier 3: fuzzy word-overlap
  const qWords = q.split(/\s+/).filter((w) => w.length >= 3);
  let best = null;
  let bestScore = 0;
  for (const d of candidates) {
    const titleWords = norm(d.title).split(/\s+/);
    const moduleWords = norm(d.moduleId).split(/\s+/);
    const dictionary = new Set([...titleWords, ...moduleWords]);
    let score = 0;
    for (const w of qWords) {
      for (const dw of dictionary) {
        if (dw === w || dw.startsWith(w) || w.startsWith(dw)) {
          score++;
          break;
        }
      }
    }
    if (q.includes(norm(d.moduleId))) score += 1.5;
    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }
  if (best && bestScore >= Math.max(1, qWords.length * 0.5)) return best;
  return null;
}

function resolveModulesForDay(phaseId, topicsCell, items) {
  // Pull module ids referenced by topics text (best-effort).
  const out = new Set();
  for (const it of items) {
    if (it.id && it.id.startsWith(`${phaseId}-`)) {
      out.add(it.id.slice(phaseId.length + 1));
    }
  }
  if (out.size > 0) return [...out];
  // Look for a known module slug substring inside the topics text.
  const moduleDirs = listDirs(join(REPO_ROOT, PHASES.find((p) => p.id === phaseId)?.folder ?? ''));
  const tNorm = norm(topicsCell);
  for (const dir of moduleDirs) {
    const slug = stripOrderPrefix(dir);
    if (tNorm.includes(norm(slug))) out.add(slug);
  }
  return [...out];
}

writeFileSync(
  join(OUT_DIR, 'schedule.json'),
  JSON.stringify(schedule, null, 0),
  'utf8',
);

// --------------------------------------------------------------------------
// Summary
// --------------------------------------------------------------------------
const byPhase = designs.reduce((acc, d) => {
  acc[d.phaseId] = (acc[d.phaseId] || 0) + 1;
  return acc;
}, {});

const unresolvedSchedule = schedule.flatMap((d) =>
  (d.problems || []).filter((p) => !p.id).map((p) => ({ day: d.day, title: p.title })),
);

console.log('');
console.log('-- Content extraction summary -----------------------------------');
console.log(`Study sections: ${studySections.length}`);
console.log(`Designs:        ${designs.length}`);
console.log(`Schedule days:  ${schedule.length}`);
for (const phase of PHASES) {
  const c = byPhase[phase.id] || 0;
  console.log(`  ${phase.id.padEnd(3)} ${phase.title.padEnd(28)} ${c} designs`);
}
if (unresolvedSchedule.length) {
  console.log('');
  console.log(`!  ${unresolvedSchedule.length} schedule design references couldn't be resolved:`);
  for (const u of unresolvedSchedule.slice(0, 10)) {
    console.log(`     Day ${u.day}: "${u.title}"`);
  }
  if (unresolvedSchedule.length > 10) console.log(`     ...and ${unresolvedSchedule.length - 10} more`);
}
console.log(`Output: ${relative(REPO_ROOT, OUT_DIR)}/`);
console.log('-----------------------------------------------------------------');
