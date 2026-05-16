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
