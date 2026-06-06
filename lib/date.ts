const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toJst(date: Date): Date {
  return new Date(date.getTime() + JST_OFFSET_MS);
}

function fromJstParts(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, ms = 0): Date {
  return new Date(Date.UTC(year, month, day, hour, minute, second, ms) - JST_OFFSET_MS);
}

export function jstDayStart(date: Date): Date {
  const j = toJst(date);
  return fromJstParts(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate());
}

export function jstDayEnd(date: Date): Date {
  const start = jstDayStart(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function jstWeekStart(date: Date): Date {
  const j = toJst(date);
  // getUTCDay: 0=Sun,1=Mon,...,6=Sat. We want previous Mon.
  const dow = j.getUTCDay();
  const daysSinceMonday = (dow + 6) % 7;
  const dayStart = fromJstParts(j.getUTCFullYear(), j.getUTCMonth(), j.getUTCDate());
  return new Date(dayStart.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
}

export function jstWeekEnd(date: Date): Date {
  const start = jstWeekStart(date);
  return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
}

export function jstMonthStart(date: Date): Date {
  const j = toJst(date);
  return fromJstParts(j.getUTCFullYear(), j.getUTCMonth(), 1);
}

export function jstMonthEnd(date: Date): Date {
  const j = toJst(date);
  const nextMonth = fromJstParts(j.getUTCFullYear(), j.getUTCMonth() + 1, 1);
  return new Date(nextMonth.getTime() - 1);
}

export function daysBetweenInclusive(start: Date, end: Date): number {
  const sJst = new Date(start.getTime() + JST_OFFSET_MS);
  const eJst = new Date(end.getTime() + JST_OFFSET_MS);
  const sDay = Date.UTC(sJst.getUTCFullYear(), sJst.getUTCMonth(), sJst.getUTCDate());
  const eDay = Date.UTC(eJst.getUTCFullYear(), eJst.getUTCMonth(), eJst.getUTCDate());
  return (eDay - sDay) / 86400000 + 1;
}

export function isWithinWindow(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export function jstIsoWeek(date: Date): number {
  const weekMon = jstWeekStart(date);
  // Thursday of this ISO week (Mon + 3 days) determines the ISO year
  const thursday = new Date(weekMon.getTime() + 3 * 24 * 60 * 60 * 1000);
  // Interpret the Thursday in JST to get the correct calendar year
  const thursdayJst = new Date(thursday.getTime() + JST_OFFSET_MS);
  const year = thursdayJst.getUTCFullYear();
  // Find the Monday of ISO week 1: Jan 4 of the ISO year is always in week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Dow = jan4.getUTCDay(); // day-of-week is timezone-invariant for a calendar date
  const week1MonUtc = new Date(jan4.getTime() - ((jan4Dow + 6) % 7) * 24 * 60 * 60 * 1000);
  // weekMon is Mon 00:00 JST; week1MonUtc is Mon 00:00 UTC — 9h apart at most, safe for Math.round
  return Math.round((weekMon.getTime() - week1MonUtc.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
}
