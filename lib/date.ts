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
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000) + 1);
}

export function isWithinWindow(iso: string, start: Date, end: Date): boolean {
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
}
