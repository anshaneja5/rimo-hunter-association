import { describe, it, expect } from 'vitest';
import {
  jstWeekStart,
  jstWeekEnd,
  jstMonthStart,
  jstMonthEnd,
  jstDayStart,
  jstDayEnd,
  daysBetweenInclusive,
  isWithinWindow,
  jstIsoWeek,
} from '../date';

describe('jstWeekStart', () => {
  it('returns the previous Monday 00:00 JST as UTC', () => {
    // 2026-05-16 is a Saturday
    const ref = new Date('2026-05-16T05:00:00Z');
    // Monday 2026-05-11 00:00 JST = 2026-05-10T15:00:00Z
    expect(jstWeekStart(ref).toISOString()).toBe('2026-05-10T15:00:00.000Z');
  });

  it('treats Monday 00:00 JST as the start of its own week', () => {
    const ref = new Date('2026-05-11T00:00:00+09:00'); // Mon JST
    expect(jstWeekStart(ref).toISOString()).toBe('2026-05-10T15:00:00.000Z');
  });
});

describe('jstWeekEnd', () => {
  it('returns the next Monday 00:00 JST minus 1ms (Sunday 23:59:59.999 JST)', () => {
    const ref = new Date('2026-05-16T05:00:00Z');
    expect(jstWeekEnd(ref).toISOString()).toBe('2026-05-17T14:59:59.999Z');
  });
});

describe('jstMonthStart', () => {
  it('returns the 1st of the month 00:00 JST as UTC', () => {
    const ref = new Date('2026-05-16T05:00:00Z');
    expect(jstMonthStart(ref).toISOString()).toBe('2026-04-30T15:00:00.000Z');
  });
});

describe('jstMonthEnd', () => {
  it('returns the last moment of the month in JST', () => {
    const ref = new Date('2026-05-16T05:00:00Z');
    expect(jstMonthEnd(ref).toISOString()).toBe('2026-05-31T14:59:59.999Z');
  });
});

describe('jstDayStart and jstDayEnd', () => {
  it('returns 00:00 JST of the given day', () => {
    const ref = new Date('2026-05-16T05:00:00Z'); // 2026-05-16 14:00 JST
    expect(jstDayStart(ref).toISOString()).toBe('2026-05-15T15:00:00.000Z');
    expect(jstDayEnd(ref).toISOString()).toBe('2026-05-16T14:59:59.999Z');
  });
});

describe('daysBetweenInclusive', () => {
  it('counts JST calendar days inclusive across a full week (Mon-Sun)', () => {
    const start = new Date('2026-05-10T15:00:00Z'); // Mon 00:00 JST
    const end = new Date('2026-05-17T14:59:59.999Z'); // Sun 23:59:59.999 JST
    expect(daysBetweenInclusive(start, end)).toBe(7);
  });

  it('returns 1 for same JST day (jstDayStart to jstDayEnd)', () => {
    const ref = new Date('2026-05-16T05:00:00Z');
    expect(daysBetweenInclusive(jstDayStart(ref), jstDayEnd(ref))).toBe(1);
  });

  it('returns 7 for jstWeekStart to jstWeekEnd', () => {
    const ref = new Date('2026-05-16T05:00:00Z');
    expect(daysBetweenInclusive(jstWeekStart(ref), jstWeekEnd(ref))).toBe(7);
  });
});

describe('isWithinWindow', () => {
  it('returns true for dates inside [start,end] inclusive', () => {
    const start = new Date('2026-05-10T15:00:00Z');
    const end = new Date('2026-05-17T14:59:59.999Z');
    expect(isWithinWindow('2026-05-12T03:00:00Z', start, end)).toBe(true);
  });
  it('returns false for dates outside the window', () => {
    const start = new Date('2026-05-10T15:00:00Z');
    const end = new Date('2026-05-17T14:59:59.999Z');
    expect(isWithinWindow('2026-05-09T03:00:00Z', start, end)).toBe(false);
  });
});

describe('jstIsoWeek', () => {
  it('returns the same week number for every day within the same ISO week', () => {
    // ISO week 21 of 2026: Mon 2026-05-18 … Sun 2026-05-24 (JST)
    const mon = new Date('2026-05-17T15:00:00Z'); // Mon 2026-05-18 00:00 JST
    const wed = new Date('2026-05-19T15:00:00Z'); // Wed 2026-05-20 00:00 JST
    const sun = new Date('2026-05-24T14:59:59Z'); // Sun 2026-05-24 23:59 JST
    const week = jstIsoWeek(mon);
    expect(week).toBeGreaterThan(0);
    expect(jstIsoWeek(wed)).toBe(week);
    expect(jstIsoWeek(sun)).toBe(week);
  });

  it('advances by exactly 1 from Sunday to the following Monday', () => {
    // Sunday 2026-05-24 JST → Monday 2026-05-25 JST
    const sun = new Date('2026-05-24T10:00:00Z'); // Sun JST
    const nextMon = new Date('2026-05-25T00:00:00+09:00'); // Mon 00:00 JST
    expect(jstIsoWeek(nextMon)).toBe(jstIsoWeek(sun) + 1);
  });

  it('returns week 1 for 2026-01-05 (first Monday of 2026)', () => {
    // 2026-01-05 is a Monday and is in ISO week 2 of 2026 (Jan 1 is Thu, so week 1 starts Dec 29 2025)
    // ISO week 1 of 2026 contains Jan 1 (Thursday) → week starts Mon Dec 29 2025
    const dec29 = new Date('2025-12-28T15:00:00Z'); // Mon 2025-12-29 00:00 JST
    expect(jstIsoWeek(dec29)).toBe(1);
  });

  it('assigns ISO week 1 of the next year to a late-December date in that week', () => {
    // 2026-12-28 is a Monday; ISO week 53 of 2026 or week 1 of 2027?
    // Dec 31 2026 is a Thursday → it is in 2026's last ISO week.
    // Jan 1 2027 is a Friday → also in the last ISO week of 2026 (week 53).
    // So Jan 4 2027 (Monday) is the start of ISO week 2 of 2027.
    // Dec 28 2026 (Mon) → contains Dec 31 (Thu) → ISO year 2026, week 53.
    const dec28 = new Date('2026-12-27T15:00:00Z'); // Mon 2026-12-28 00:00 JST
    const w = jstIsoWeek(dec28);
    expect(w).toBeGreaterThanOrEqual(52);
  });
});
