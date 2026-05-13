/**
 * ISO week helpers — uses Monday as start-of-week and ISO 8601 numbering.
 */

export interface IsoWeek {
  year: number;
  week: number;
  /** ISO-formatted key, e.g. "2026-W19" */
  key: string;
  /** Monday of this week as yyyy-mm-dd */
  startDate: string;
  /** Sunday of this week as yyyy-mm-dd */
  endDate: string;
}

export function isoWeekOf(date: Date): IsoWeek {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  // Compute Monday + Sunday of this ISO week
  const inputDay = date.getDay() || 7; // Sunday=0 -> 7
  const monday = new Date(date);
  monday.setDate(date.getDate() - (inputDay - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (dt: Date) => dt.toISOString().slice(0, 10);
  return {
    year: d.getUTCFullYear(),
    week,
    key: `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`,
    startDate: fmt(monday),
    endDate: fmt(sunday),
  };
}

export function currentIsoWeek(): IsoWeek {
  return isoWeekOf(new Date());
}

/** Sortable comparator for week keys like "2026-W03". Larger = more recent. */
export function compareWeekKeys(a: string, b: string): number {
  return a.localeCompare(b);
}
