# Rimo Hunter Association — Anime-Themed GitHub Leaderboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public, anime-themed (Solo-Leveling-style) leaderboard that ranks `rimoapp` GitHub org members into S/A/B/C/D/E tiers across Daily/Weekly/Monthly/All-time windows, with weekly+monthly MVPs, a Hall of Legends archive, and an hourly auto-refresh pipeline.

**Architecture:** Next.js 15 (App Router, static export) reads JSON files committed under `public/data/`. A GitHub Action runs `scripts/fetch-stats.ts` hourly, hits GitHub's GraphQL API, computes XP + tiers + badges, and commits new JSON. No backend, no DB. Vercel free tier hosts the static site.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, `@octokit/graphql`, Vitest, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-05-16-anime-github-leaderboard-design.md`

---

## File Structure

```
package.json
tsconfig.json
next.config.ts
tailwind.config.ts
postcss.config.mjs
vitest.config.ts
.gitignore
.env.example
.eslintrc.json

app/
  layout.tsx                        # Root layout, fonts, particles
  globals.css                       # Tailwind + custom CSS variables
  page.tsx                          # Landing
  leaderboard/page.tsx
  hunter/[username]/page.tsx
  legends/page.tsx

components/
  RankBadge.tsx                     # Glowing S/A/B/C/D/E badge
  XPBar.tsx                         # Animated XP progress bar
  BadgeChip.tsx                     # Achievement badge pill
  HunterCard.tsx                    # Anime-style profile card
  LeaderboardTable.tsx              # Sortable table
  ParticleBackground.tsx            # Animated star/shadow backdrop
  PeriodToggle.tsx                  # Daily/Weekly/Monthly/All-time switcher
  MVPSpotlight.tsx                  # Hero MVP card for landing
  StatRadial.tsx                    # Stat breakdown radial chart
  RankHistoryChart.tsx              # Tier-over-time line chart
  ActivityFeed.tsx                  # Recent events list

lib/
  types.ts                          # Shared TypeScript types
  date.ts                           # JST week/month boundary math
  scoring.ts                        # XP formula + tier assignment
  badges.ts                         # Badge condition logic
  github.ts                         # GraphQL queries + types
  loadData.ts                       # Client-side JSON loaders

lib/__tests__/
  date.test.ts
  scoring.test.ts
  badges.test.ts

scripts/
  fetch-stats.ts                    # Cron entrypoint

config/
  members-override.json             # Optional include/exclude list

public/data/                        # Generated, committed to repo
  members.json
  stats-all.json
  stats-monthly.json
  stats-weekly.json
  stats-daily.json
  mvps.json
  rank-history.json

.github/workflows/
  refresh.yml                       # Hourly cron
```

---

## Task 1: Initialize Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Initialize git repo and Node project**

```bash
cd "/Users/piyushaneja/Desktop/Rimo Employee Stats"
git init
git branch -m main
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "rimo-hunter-association",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "fetch-stats": "tsx scripts/fetch-stats.ts"
  },
  "dependencies": {
    "@octokit/graphql": "^8.1.1",
    "framer-motion": "^11.11.17",
    "next": "15.0.3",
    "react": "19.0.0-rc-66855b96-20241106",
    "react-dom": "19.0.0-rc-66855b96-20241106",
    "recharts": "^2.13.3"
  },
  "devDependencies": {
    "@types/node": "^22.9.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.15.0",
    "eslint-config-next": "15.0.3",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3",
    "vitest": "^2.1.5"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `next.config.ts`**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules/
.next/
out/
.env
.env.local
*.log
.DS_Store
```

- [ ] **Step 6: Create `.env.example`**

```
GITHUB_TOKEN=ghp_replace_me_with_a_PAT_with_read_org_and_repo_scopes
GITHUB_ORG=rimoapp
```

- [ ] **Step 7: Create `app/layout.tsx` (minimal placeholder, will be expanded in Task 10)**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rimo Hunter Association',
  description: 'Anime-themed GitHub leaderboard for Rimo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Create `app/page.tsx` (placeholder, will be replaced in Task 18)**

```tsx
export default function Home() {
  return <main className="p-8 text-white">Rimo Hunter Association — coming soon.</main>;
}
```

- [ ] **Step 9: Create `app/globals.css` (placeholder, will be expanded in Task 10)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #0a0a0f;
  color: #f5f5f5;
}
```

- [ ] **Step 10: Install dependencies**

Run: `npm install`
Expected: completes without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 11: Verify dev server starts**

Run: `npm run dev`
Expected: server starts on http://localhost:3000, page shows "Rimo Hunter Association — coming soon." Stop server with Ctrl-C.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts .gitignore .env.example app/
git commit -m "chore: scaffold Next.js 15 project"
```

---

## Task 2: Configure Tailwind CSS v3 with Anime Palette

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Modify: `app/globals.css`

- [ ] **Step 1: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: { 900: '#0a0a0f', 800: '#0f0f1e', 700: '#161629' },
        neon: { purple: '#a855f7', cyan: '#22d3ee' },
        rank: {
          s: '#fbbf24',
          a: '#a855f7',
          b: '#22d3ee',
          c: '#7dd3fc',
          d: '#94a3b8',
          e: '#475569',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        jp: ['"Noto Sans JP"', 'sans-serif'],
      },
      boxShadow: {
        'glow-s': '0 0 20px rgba(251,191,36,0.6)',
        'glow-a': '0 0 20px rgba(168,85,247,0.6)',
        'glow-b': '0 0 20px rgba(34,211,238,0.6)',
        'glow-c': '0 0 14px rgba(125,211,252,0.5)',
        'glow-d': '0 0 10px rgba(148,163,184,0.4)',
        'glow-e': '0 0 6px rgba(71,85,105,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Create `postcss.config.mjs`**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 3: Replace `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;700&display=swap');

:root {
  --color-base-900: #0a0a0f;
  --color-base-800: #0f0f1e;
}

body {
  background: radial-gradient(ellipse at top, #161629 0%, #0a0a0f 70%);
  background-attachment: fixed;
  color: #e5e7eb;
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
}

.font-display {
  font-family: 'Cinzel', serif;
  letter-spacing: 0.05em;
}

.glass {
  background: rgba(15, 15, 30, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(168, 85, 247, 0.15);
}
```

- [ ] **Step 4: Smoke test Tailwind**

Edit `app/page.tsx` temporarily to verify classes work:

```tsx
export default function Home() {
  return (
    <main className="p-8">
      <h1 className="font-display text-4xl text-neon-purple drop-shadow-glow-a">
        Rimo Hunter Association
      </h1>
      <p className="text-rank-s">Coming soon.</p>
    </main>
  );
}
```

Run: `npm run dev`
Expected: page shows purple title with glow, gold subtitle.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts postcss.config.mjs app/globals.css app/page.tsx
git commit -m "chore: configure Tailwind v3 with anime palette"
```

---

## Task 3: Set Up Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/__tests__/smoke.test.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 2: Create smoke test `lib/__tests__/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('vitest smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npm test`
Expected: 1 test passed.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts lib/__tests__/smoke.test.ts
git commit -m "chore: set up Vitest"
```

---

## Task 4: Define Shared Types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create `lib/types.ts`**

```ts
export type TierLetter = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

export type Period = 'all' | 'monthly' | 'weekly' | 'daily';

export type BadgeId =
  | 'first-blood'
  | 'bug-slayer'
  | 'code-monk'
  | 'reviewer-sensei'
  | 'streak-lord'
  | 'ghost'
  | 'awakening';

export interface Breakdown {
  prsMerged: number;
  prsOpened: number;
  reviews: number;
  issuesClosed: number;
  issuesOpened: number;
  commits: number;
  comments: number;
}

export interface RawActivityEvent {
  type: keyof Breakdown | 'badge-source';
  repoOwner: string;
  repoName: string;
  occurredAt: string; // ISO 8601
  meta?: Record<string, unknown>;
}

export interface MemberProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  htmlUrl: string;
}

export interface MembersFile {
  generatedAt: string;
  members: MemberProfile[];
}

export interface RankingEntry {
  login: string;
  xp: number;
  tier: TierLetter;
  rankNumber: number;
  breakdown: Breakdown;
  badges: BadgeId[];
  sparkline: number[];
}

export interface StatsFile {
  generatedAt: string;
  period: Period;
  windowStart: string | null;
  windowEnd: string;
  rankings: RankingEntry[];
}

export interface MVPEntry {
  weekStart?: string;
  month?: string;
  login: string;
  xp: number;
  snapshot: Breakdown;
}

export interface MVPsFile {
  weekly: MVPEntry[];
  monthly: MVPEntry[];
}

export interface RankHistoryFile {
  byLogin: Record<string, Array<{ weekStart: string; tier: TierLetter; xp: number }>>;
}

export const EMPTY_BREAKDOWN: Breakdown = {
  prsMerged: 0,
  prsOpened: 0,
  reviews: 0,
  issuesClosed: 0,
  issuesOpened: 0,
  commits: 0,
  comments: 0,
};
```

- [ ] **Step 2: Verify no compile errors**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat(types): define shared domain types"
```

---

## Task 5: Date Utilities (TDD)

**Files:**
- Create: `lib/__tests__/date.test.ts`
- Create: `lib/date.ts`

JST = UTC+9 (no DST). Week boundary: Monday 00:00 JST. Month boundary: 1st of month 00:00 JST.

- [ ] **Step 1: Write failing tests `lib/__tests__/date.test.ts`**

```ts
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
  it('returns the number of JST calendar days between two dates inclusive', () => {
    const start = new Date('2026-05-10T15:00:00Z'); // Mon JST
    const end = new Date('2026-05-16T14:59:59.999Z'); // Sun JST
    expect(daysBetweenInclusive(start, end)).toBe(7);
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: all tests in `date.test.ts` fail with "Cannot find module '../date'" or similar.

- [ ] **Step 3: Implement `lib/date.ts`**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all `date.test.ts` tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/date.ts lib/__tests__/date.test.ts
git commit -m "feat(date): JST week/month/day boundary helpers"
```

---

## Task 6: Scoring Module (TDD)

**Files:**
- Create: `lib/__tests__/scoring.test.ts`
- Create: `lib/scoring.ts`

- [ ] **Step 1: Write failing tests `lib/__tests__/scoring.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { xpForEvent, computeXp, assignTiers, ACTION_XP, RIMO_MULTIPLIER } from '../scoring';
import type { RawActivityEvent } from '../types';

const RIMO = 'rimoapp';

function ev(type: RawActivityEvent['type'], repoOwner = 'someone-else'): RawActivityEvent {
  return { type, repoOwner, repoName: 'repo', occurredAt: '2026-05-16T00:00:00Z' };
}

describe('xpForEvent', () => {
  it('returns the base XP for non-Rimo repos', () => {
    expect(xpForEvent(ev('prsMerged'))).toBe(ACTION_XP.prsMerged);
    expect(xpForEvent(ev('commits'))).toBe(ACTION_XP.commits);
  });

  it('applies the Rimo multiplier for rimoapp repos', () => {
    expect(xpForEvent(ev('prsMerged', RIMO))).toBe(ACTION_XP.prsMerged * RIMO_MULTIPLIER);
    expect(xpForEvent(ev('commits', RIMO))).toBe(ACTION_XP.commits * RIMO_MULTIPLIER);
  });

  it('returns 0 for non-XP event types', () => {
    expect(xpForEvent(ev('badge-source'))).toBe(0);
  });
});

describe('computeXp', () => {
  it('sums XP across a list of events', () => {
    const events: RawActivityEvent[] = [
      ev('prsMerged', RIMO), // 15
      ev('commits'),         // 1
      ev('reviews', RIMO),   // 4.5
    ];
    expect(computeXp(events)).toBeCloseTo(20.5);
  });

  it('returns 0 for an empty list', () => {
    expect(computeXp([])).toBe(0);
  });
});

describe('assignTiers — percentile mode (>= 20 members)', () => {
  it('assigns S to top 5%, A to next 10%, etc.', () => {
    const entries = Array.from({ length: 100 }, (_, i) => ({ login: `u${i}`, xp: 100 - i }));
    const ranked = assignTiers(entries);
    // Top 5 → S (5%)
    for (let i = 0; i < 5; i++) expect(ranked[i].tier).toBe('S');
    // Next 10 → A (5-14)
    for (let i = 5; i < 15; i++) expect(ranked[i].tier).toBe('A');
    // Next 20 → B (15-34)
    for (let i = 15; i < 35; i++) expect(ranked[i].tier).toBe('B');
    // Next 25 → C (35-59)
    for (let i = 35; i < 60; i++) expect(ranked[i].tier).toBe('C');
    // Next 25 → D (60-84)
    for (let i = 60; i < 85; i++) expect(ranked[i].tier).toBe('D');
    // Bottom 15 → E (85-99)
    for (let i = 85; i < 100; i++) expect(ranked[i].tier).toBe('E');
  });

  it('breaks ties using totalCommits then login ascending', () => {
    const entries = [
      { login: 'zed', xp: 50, totalCommits: 10 },
      { login: 'amy', xp: 50, totalCommits: 10 },
      { login: 'bob', xp: 50, totalCommits: 20 },
    ];
    const ranked = assignTiers(entries);
    expect(ranked.map((r) => r.login)).toEqual(['bob', 'amy', 'zed']);
  });

  it('assigns rankNumber 1-indexed from the top', () => {
    const entries = Array.from({ length: 30 }, (_, i) => ({ login: `u${i}`, xp: 30 - i }));
    const ranked = assignTiers(entries);
    expect(ranked[0].rankNumber).toBe(1);
    expect(ranked[29].rankNumber).toBe(30);
  });

  it('assigns E to anyone with 0 XP', () => {
    const entries = [
      { login: 'a', xp: 100 },
      { login: 'b', xp: 0 },
      { login: 'c', xp: 0 },
    ];
    const ranked = assignTiers(entries);
    expect(ranked.find((r) => r.login === 'b')?.tier).toBe('E');
    expect(ranked.find((r) => r.login === 'c')?.tier).toBe('E');
  });
});

describe('assignTiers — fixed thresholds mode (< 20 members)', () => {
  it('uses fixed XP thresholds when fewer than 20 members', () => {
    const entries = [
      { login: 's-tier', xp: 600 },
      { login: 'a-tier', xp: 300 },
      { login: 'b-tier', xp: 150 },
      { login: 'c-tier', xp: 50 },
      { login: 'd-tier', xp: 20 },
      { login: 'e-tier', xp: 5 },
    ];
    const ranked = assignTiers(entries);
    expect(ranked.find((r) => r.login === 's-tier')?.tier).toBe('S');
    expect(ranked.find((r) => r.login === 'a-tier')?.tier).toBe('A');
    expect(ranked.find((r) => r.login === 'b-tier')?.tier).toBe('B');
    expect(ranked.find((r) => r.login === 'c-tier')?.tier).toBe('C');
    expect(ranked.find((r) => r.login === 'd-tier')?.tier).toBe('D');
    expect(ranked.find((r) => r.login === 'e-tier')?.tier).toBe('E');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: scoring tests fail with module-not-found.

- [ ] **Step 3: Implement `lib/scoring.ts`**

```ts
import type { RawActivityEvent, TierLetter, Breakdown } from './types';

export const ACTION_XP: Record<keyof Breakdown, number> = {
  prsMerged: 10,
  prsOpened: 2,
  reviews: 3,
  issuesClosed: 5,
  issuesOpened: 1,
  commits: 1,
  comments: 0.5,
};

export const RIMO_MULTIPLIER = 1.5;
const RIMO_ORG = 'rimoapp';

export function xpForEvent(event: RawActivityEvent): number {
  if (!(event.type in ACTION_XP)) return 0;
  const base = ACTION_XP[event.type as keyof Breakdown];
  return event.repoOwner === RIMO_ORG ? base * RIMO_MULTIPLIER : base;
}

export function computeXp(events: RawActivityEvent[]): number {
  return events.reduce((sum, e) => sum + xpForEvent(e), 0);
}

interface TierableEntry {
  login: string;
  xp: number;
  totalCommits?: number;
}

interface RankedEntry extends TierableEntry {
  tier: TierLetter;
  rankNumber: number;
}

const PERCENTILE_CUTOFFS: Array<{ tier: TierLetter; cumulative: number }> = [
  { tier: 'S', cumulative: 0.05 },
  { tier: 'A', cumulative: 0.15 },
  { tier: 'B', cumulative: 0.35 },
  { tier: 'C', cumulative: 0.6 },
  { tier: 'D', cumulative: 0.85 },
  { tier: 'E', cumulative: 1.0 },
];

const FIXED_THRESHOLDS: Array<{ tier: TierLetter; min: number }> = [
  { tier: 'S', min: 500 },
  { tier: 'A', min: 250 },
  { tier: 'B', min: 100 },
  { tier: 'C', min: 40 },
  { tier: 'D', min: 10 },
  { tier: 'E', min: 0 },
];

export function assignTiers(entries: TierableEntry[]): RankedEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    const ac = a.totalCommits ?? 0;
    const bc = b.totalCommits ?? 0;
    if (bc !== ac) return bc - ac;
    return a.login.localeCompare(b.login);
  });

  const usePercentile = sorted.length >= 20;
  return sorted.map((entry, idx) => {
    let tier: TierLetter;
    if (entry.xp <= 0) {
      tier = 'E';
    } else if (usePercentile) {
      const percentile = (idx + 1) / sorted.length;
      tier = PERCENTILE_CUTOFFS.find((c) => percentile <= c.cumulative)!.tier;
    } else {
      tier = FIXED_THRESHOLDS.find((t) => entry.xp >= t.min)!.tier;
    }
    return { ...entry, tier, rankNumber: idx + 1 };
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all scoring tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts lib/__tests__/scoring.test.ts
git commit -m "feat(scoring): XP formula and tier assignment"
```

---

## Task 7: Badges Module (TDD)

**Files:**
- Create: `lib/__tests__/badges.test.ts`
- Create: `lib/badges.ts`

- [ ] **Step 1: Write failing tests `lib/__tests__/badges.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { computeBadges } from '../badges';
import type { RawActivityEvent } from '../types';

function mkEvent(
  type: RawActivityEvent['type'],
  occurredAt: string,
  meta?: Record<string, unknown>,
): RawActivityEvent {
  return { type, repoOwner: 'rimoapp', repoName: 'app', occurredAt, meta };
}

describe('computeBadges', () => {
  const now = new Date('2026-05-16T05:00:00Z'); // Sat in JST

  it('awards first-blood if user is first to merge a PR this week', () => {
    const events = [mkEvent('prsMerged', '2026-05-12T03:00:00Z')];
    const allOrgMergesThisWeek = [
      { login: 'me', occurredAt: '2026-05-12T03:00:00Z' },
      { login: 'other', occurredAt: '2026-05-13T03:00:00Z' },
    ];
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: allOrgMergesThisWeek, now });
    expect(result).toContain('first-blood');
  });

  it('does not award first-blood if another user merged first this week', () => {
    const allOrgMergesThisWeek = [
      { login: 'other', occurredAt: '2026-05-12T03:00:00Z' },
      { login: 'me', occurredAt: '2026-05-13T03:00:00Z' },
    ];
    const result = computeBadges({ login: 'me', allTimeEvents: [], allOrgWeeklyMerges: allOrgMergesThisWeek, now });
    expect(result).not.toContain('first-blood');
  });

  it('awards bug-slayer for 10+ closed bug-labeled issues', () => {
    const events: RawActivityEvent[] = Array.from({ length: 10 }, (_, i) =>
      mkEvent('issuesClosed', '2026-01-01T00:00:00Z', { labels: ['bug'] }),
    );
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).toContain('bug-slayer');
  });

  it('does not award bug-slayer at 9 closed bug issues', () => {
    const events: RawActivityEvent[] = Array.from({ length: 9 }, () =>
      mkEvent('issuesClosed', '2026-01-01T00:00:00Z', { labels: ['bug'] }),
    );
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).not.toContain('bug-slayer');
  });

  it('awards code-monk for 100+ commits in a calendar month', () => {
    const events = Array.from({ length: 100 }, (_, i) =>
      mkEvent('commits', `2026-04-${String(((i % 28) + 1)).padStart(2, '0')}T05:00:00Z`),
    );
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).toContain('code-monk');
  });

  it('awards reviewer-sensei for 50+ reviews lifetime', () => {
    const events = Array.from({ length: 50 }, () => mkEvent('reviews', '2026-01-01T00:00:00Z'));
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).toContain('reviewer-sensei');
  });

  it('awards streak-lord for 7+ consecutive commit days', () => {
    const events = [
      mkEvent('commits', '2026-05-10T03:00:00Z'),
      mkEvent('commits', '2026-05-11T03:00:00Z'),
      mkEvent('commits', '2026-05-12T03:00:00Z'),
      mkEvent('commits', '2026-05-13T03:00:00Z'),
      mkEvent('commits', '2026-05-14T03:00:00Z'),
      mkEvent('commits', '2026-05-15T03:00:00Z'),
      mkEvent('commits', '2026-05-16T03:00:00Z'),
    ];
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).toContain('streak-lord');
  });

  it('awards ghost for zero activity in last 14 days', () => {
    const events = [mkEvent('commits', '2026-01-01T00:00:00Z')];
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).toContain('ghost');
  });

  it('does not award ghost if user has activity in last 14 days', () => {
    const events = [mkEvent('commits', '2026-05-10T03:00:00Z')];
    const result = computeBadges({ login: 'me', allTimeEvents: events, allOrgWeeklyMerges: [], now });
    expect(result).not.toContain('ghost');
  });

  it('awards awakening when previousWeekTier→currentWeekTier jumps ≥2 tiers', () => {
    const result = computeBadges({
      login: 'me',
      allTimeEvents: [],
      allOrgWeeklyMerges: [],
      now,
      previousWeekTier: 'D',
      currentWeekTier: 'B',
    });
    expect(result).toContain('awakening');
  });

  it('does not award awakening for a 1-tier jump', () => {
    const result = computeBadges({
      login: 'me',
      allTimeEvents: [],
      allOrgWeeklyMerges: [],
      now,
      previousWeekTier: 'C',
      currentWeekTier: 'B',
    });
    expect(result).not.toContain('awakening');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: badge tests fail with module-not-found.

- [ ] **Step 3: Implement `lib/badges.ts`**

```ts
import type { BadgeId, RawActivityEvent, TierLetter } from './types';
import { jstDayStart, jstMonthStart, jstMonthEnd, jstWeekStart, jstWeekEnd, isWithinWindow } from './date';

const TIER_ORDER: TierLetter[] = ['E', 'D', 'C', 'B', 'A', 'S'];

interface BadgeInput {
  login: string;
  allTimeEvents: RawActivityEvent[];
  allOrgWeeklyMerges: Array<{ login: string; occurredAt: string }>;
  now: Date;
  previousWeekTier?: TierLetter;
  currentWeekTier?: TierLetter;
}

export function computeBadges(input: BadgeInput): BadgeId[] {
  const badges: BadgeId[] = [];
  const { login, allTimeEvents, allOrgWeeklyMerges, now } = input;

  // first-blood: earliest merger in current JST week
  const weekStart = jstWeekStart(now);
  const weekEnd = jstWeekEnd(now);
  const mergesThisWeek = allOrgWeeklyMerges
    .filter((m) => isWithinWindow(m.occurredAt, weekStart, weekEnd))
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  if (mergesThisWeek.length && mergesThisWeek[0].login === login) {
    badges.push('first-blood');
  }

  // bug-slayer: ≥10 issuesClosed events with labels containing 'bug'
  const bugClosures = allTimeEvents.filter(
    (e) =>
      e.type === 'issuesClosed' &&
      Array.isArray((e.meta as { labels?: string[] } | undefined)?.labels) &&
      ((e.meta as { labels: string[] }).labels.includes('bug')),
  );
  if (bugClosures.length >= 10) badges.push('bug-slayer');

  // code-monk: 100+ commits in any single calendar month
  const commitsByMonth = new Map<string, number>();
  for (const e of allTimeEvents) {
    if (e.type !== 'commits') continue;
    const monthKey = jstMonthStart(new Date(e.occurredAt)).toISOString();
    commitsByMonth.set(monthKey, (commitsByMonth.get(monthKey) ?? 0) + 1);
  }
  if ([...commitsByMonth.values()].some((c) => c >= 100)) badges.push('code-monk');

  // reviewer-sensei: ≥50 reviews lifetime
  const totalReviews = allTimeEvents.filter((e) => e.type === 'reviews').length;
  if (totalReviews >= 50) badges.push('reviewer-sensei');

  // streak-lord: 7+ consecutive JST days with commits
  const commitDays = new Set<string>();
  for (const e of allTimeEvents) {
    if (e.type !== 'commits') continue;
    commitDays.add(jstDayStart(new Date(e.occurredAt)).toISOString());
  }
  const sortedDays = [...commitDays].sort();
  let longest = 0;
  let current = 0;
  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) current = 1;
    else {
      const prev = new Date(sortedDays[i - 1]).getTime();
      const cur = new Date(sortedDays[i]).getTime();
      current = cur - prev === 24 * 60 * 60 * 1000 ? current + 1 : 1;
    }
    longest = Math.max(longest, current);
  }
  if (longest >= 7) badges.push('streak-lord');

  // ghost: zero activity in last 14 days
  const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const hasRecent = allTimeEvents.some((e) => new Date(e.occurredAt) >= cutoff);
  if (!hasRecent) badges.push('ghost');

  // awakening: ≥2 tier jump week-over-week (only S/A/B/C/D/E, treated ordinally)
  if (input.previousWeekTier && input.currentWeekTier) {
    const prevIdx = TIER_ORDER.indexOf(input.previousWeekTier);
    const curIdx = TIER_ORDER.indexOf(input.currentWeekTier);
    if (curIdx - prevIdx >= 2) badges.push('awakening');
  }

  return badges;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: all badge tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/badges.ts lib/__tests__/badges.test.ts
git commit -m "feat(badges): achievement badge computation"
```

---

## Task 8: GitHub GraphQL Client

**Files:**
- Create: `lib/github.ts`

This is integration code — no unit tests (would require mocking the entire GraphQL surface). Will be exercised live in Task 9.

- [ ] **Step 1: Create `lib/github.ts`**

```ts
import { graphql } from '@octokit/graphql';
import type { RawActivityEvent, MemberProfile } from './types';

interface GhClient {
  fetchOrgMembers(org: string): Promise<MemberProfile[]>;
  fetchContributions(login: string, fromIso: string, toIso: string): Promise<RawActivityEvent[]>;
}

export function createGithubClient(token: string): GhClient {
  const gql = graphql.defaults({
    headers: { authorization: `token ${token}` },
  });

  async function fetchOrgMembers(org: string): Promise<MemberProfile[]> {
    const members: MemberProfile[] = [];
    let cursor: string | null = null;
    do {
      const data: any = await gql(
        `query($org: String!, $cursor: String) {
           organization(login: $org) {
             membersWithRole(first: 100, after: $cursor) {
               pageInfo { hasNextPage endCursor }
               nodes { login name avatarUrl bio url }
             }
           }
         }`,
        { org, cursor },
      );
      const conn = data.organization.membersWithRole;
      for (const m of conn.nodes) {
        if (m.login.endsWith('[bot]')) continue;
        members.push({
          login: m.login,
          name: m.name,
          avatarUrl: m.avatarUrl,
          bio: m.bio,
          htmlUrl: m.url,
        });
      }
      cursor = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (cursor);
    return members;
  }

  async function fetchContributions(login: string, fromIso: string, toIso: string): Promise<RawActivityEvent[]> {
    const events: RawActivityEvent[] = [];
    const data: any = await gql(
      `query($login: String!, $from: DateTime!, $to: DateTime!) {
         user(login: $login) {
           contributionsCollection(from: $from, to: $to) {
             commitContributionsByRepository(maxRepositories: 100) {
               repository { owner { login } name }
               contributions(first: 100) { nodes { occurredAt commitCount } }
             }
             pullRequestContributions(first: 100) {
               nodes {
                 occurredAt
                 pullRequest { merged mergedAt repository { owner { login } name } }
               }
             }
             pullRequestReviewContributions(first: 100) {
               nodes { occurredAt pullRequestReview { state pullRequest { repository { owner { login } name } } } }
             }
             issueContributions(first: 100) {
               nodes { occurredAt issue { repository { owner { login } name } } }
             }
           }
         }
       }`,
      { login, from: fromIso, to: toIso },
    );

    const cc = data.user.contributionsCollection;

    for (const repo of cc.commitContributionsByRepository) {
      for (const node of repo.contributions.nodes) {
        for (let i = 0; i < node.commitCount; i++) {
          events.push({
            type: 'commits',
            repoOwner: repo.repository.owner.login,
            repoName: repo.repository.name,
            occurredAt: node.occurredAt,
          });
        }
      }
    }

    for (const node of cc.pullRequestContributions.nodes) {
      const pr = node.pullRequest;
      events.push({
        type: 'prsOpened',
        repoOwner: pr.repository.owner.login,
        repoName: pr.repository.name,
        occurredAt: node.occurredAt,
      });
      if (pr.merged && pr.mergedAt && pr.mergedAt >= fromIso && pr.mergedAt <= toIso) {
        events.push({
          type: 'prsMerged',
          repoOwner: pr.repository.owner.login,
          repoName: pr.repository.name,
          occurredAt: pr.mergedAt,
        });
      }
    }

    for (const node of cc.pullRequestReviewContributions.nodes) {
      const r = node.pullRequestReview;
      events.push({
        type: 'reviews',
        repoOwner: r.pullRequest.repository.owner.login,
        repoName: r.pullRequest.repository.name,
        occurredAt: node.occurredAt,
      });
    }

    for (const node of cc.issueContributions.nodes) {
      events.push({
        type: 'issuesOpened',
        repoOwner: node.issue.repository.owner.login,
        repoName: node.issue.repository.name,
        occurredAt: node.occurredAt,
      });
    }

    return events;
  }

  return { fetchOrgMembers, fetchContributions };
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/github.ts
git commit -m "feat(github): GraphQL client for org members and contributions"
```

---

## Task 9: Fetch-Stats Script

**Files:**
- Create: `scripts/fetch-stats.ts`
- Create: `config/members-override.json`
- Create: `public/data/.gitkeep`

- [ ] **Step 1: Create `config/members-override.json`**

```json
{
  "include": [],
  "exclude": []
}
```

- [ ] **Step 2: Create `public/data/.gitkeep`**

Run: `mkdir -p public/data && touch public/data/.gitkeep`

- [ ] **Step 3: Create `scripts/fetch-stats.ts`**

```ts
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createGithubClient } from '../lib/github';
import { computeXp, assignTiers } from '../lib/scoring';
import { computeBadges } from '../lib/badges';
import {
  jstDayStart, jstDayEnd,
  jstWeekStart, jstWeekEnd,
  jstMonthStart, jstMonthEnd,
  isWithinWindow,
} from '../lib/date';
import type {
  Period, RawActivityEvent, MembersFile, StatsFile, MVPsFile, RankHistoryFile,
  Breakdown, RankingEntry, MemberProfile,
} from '../lib/types';
import { EMPTY_BREAKDOWN } from '../lib/types';

const ORG = process.env.GITHUB_ORG ?? 'rimoapp';
const TOKEN = process.env.GITHUB_TOKEN;
const DATA_DIR = path.resolve(process.cwd(), 'public/data');
const OVERRIDE_PATH = path.resolve(process.cwd(), 'config/members-override.json');

if (!TOKEN) {
  console.error('GITHUB_TOKEN env var required');
  process.exit(1);
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function breakdownFromEvents(events: RawActivityEvent[]): Breakdown {
  const b: Breakdown = { ...EMPTY_BREAKDOWN };
  for (const e of events) {
    if (e.type in b) b[e.type as keyof Breakdown]++;
  }
  return b;
}

function sparkline(events: RawActivityEvent[], windowStart: Date, windowEnd: Date, dayCount: number): number[] {
  const buckets = new Array(dayCount).fill(0);
  const startMs = windowStart.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  for (const e of events) {
    const idx = Math.floor((new Date(e.occurredAt).getTime() - startMs) / dayMs);
    if (idx >= 0 && idx < dayCount) buckets[idx]++;
  }
  return buckets;
}

async function buildStatsFile(
  period: Period,
  windowStart: Date | null,
  windowEnd: Date,
  members: MemberProfile[],
  eventsByLogin: Map<string, RawActivityEvent[]>,
  allOrgMergesThisWeek: Array<{ login: string; occurredAt: string }>,
  previousWeekTiers: Map<string, RankingEntry['tier']>,
  now: Date,
): Promise<StatsFile> {
  const dayCount = windowStart
    ? Math.max(1, Math.round((windowEnd.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000)))
    : 14;
  const sparklineStart = windowStart ?? new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const tierables = members.map((m) => {
    const all = eventsByLogin.get(m.login) ?? [];
    const windowed = windowStart
      ? all.filter((e) => isWithinWindow(e.occurredAt, windowStart, windowEnd))
      : all;
    return {
      login: m.login,
      xp: computeXp(windowed),
      totalCommits: windowed.filter((e) => e.type === 'commits').length,
      windowed,
      all,
    };
  });

  const ranked = assignTiers(tierables);

  const currentWeekTiersForBadges = new Map<string, RankingEntry['tier']>();
  if (period === 'weekly') for (const r of ranked) currentWeekTiersForBadges.set(r.login, r.tier);

  const rankings: RankingEntry[] = ranked.map((r) => {
    const ev = tierables.find((t) => t.login === r.login)!;
    const breakdown = breakdownFromEvents(ev.windowed);
    const badges = computeBadges({
      login: r.login,
      allTimeEvents: ev.all,
      allOrgWeeklyMerges: allOrgMergesThisWeek,
      now,
      previousWeekTier: previousWeekTiers.get(r.login),
      currentWeekTier: period === 'weekly' ? r.tier : currentWeekTiersForBadges.get(r.login),
    });
    return {
      login: r.login,
      xp: r.xp,
      tier: r.tier,
      rankNumber: r.rankNumber,
      breakdown,
      badges,
      sparkline: sparkline(ev.windowed, sparklineStart, windowEnd, dayCount),
    };
  });

  return {
    generatedAt: now.toISOString(),
    period,
    windowStart: windowStart?.toISOString() ?? null,
    windowEnd: windowEnd.toISOString(),
    rankings,
  };
}

async function main() {
  const now = new Date();
  console.log(`[fetch-stats] Starting at ${now.toISOString()} for org=${ORG}`);

  const gh = createGithubClient(TOKEN!);
  const override = await readJson<{ include: string[]; exclude: string[] }>(OVERRIDE_PATH, { include: [], exclude: [] });

  const orgMembers = await gh.fetchOrgMembers(ORG);
  const memberMap = new Map<string, MemberProfile>();
  for (const m of orgMembers) memberMap.set(m.login, m);
  for (const login of override.include) {
    if (!memberMap.has(login)) {
      memberMap.set(login, { login, name: null, avatarUrl: `https://github.com/${login}.png`, bio: null, htmlUrl: `https://github.com/${login}` });
    }
  }
  for (const login of override.exclude) memberMap.delete(login);
  const members = [...memberMap.values()];
  console.log(`[fetch-stats] ${members.length} members after overrides`);

  // Fetch 1 year of events per member (covers all/monthly/weekly/daily windows).
  // For this side project, "all-time" badges are approximated from the trailing 12 months —
  // GitHub's contributionsCollection caps at 1 year per query, and the extra API cost of
  // multi-year pagination isn't worth it.
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const eventsByLogin = new Map<string, RawActivityEvent[]>();
  let fetchFailures = 0;

  for (const m of members) {
    try {
      const events = await gh.fetchContributions(m.login, yearAgo.toISOString(), now.toISOString());
      eventsByLogin.set(m.login, events);
      console.log(`[fetch-stats] ${m.login}: ${events.length} events`);
    } catch (err) {
      fetchFailures++;
      console.error(`[fetch-stats] failed for ${m.login}, skipping:`, err);
    }
  }

  if (eventsByLogin.size === 0 && members.length > 0) {
    console.error(`[fetch-stats] ALL ${members.length} member fetches failed — refusing to overwrite stale JSON`);
    process.exit(1);
  }
  if (fetchFailures > 0) {
    console.warn(`[fetch-stats] continuing with ${eventsByLogin.size}/${members.length} successful fetches`);
  }

  // Compute "all org merges this week" for first-blood badge
  const weekStart = jstWeekStart(now);
  const weekEnd = jstWeekEnd(now);
  const allOrgMergesThisWeek: Array<{ login: string; occurredAt: string }> = [];
  for (const [login, events] of eventsByLogin) {
    for (const e of events) {
      if (e.type === 'prsMerged' && e.repoOwner === ORG && isWithinWindow(e.occurredAt, weekStart, weekEnd)) {
        allOrgMergesThisWeek.push({ login, occurredAt: e.occurredAt });
      }
    }
  }

  // Read previous rank history for awakening badge
  const rankHistory = await readJson<RankHistoryFile>(path.join(DATA_DIR, 'rank-history.json'), { byLogin: {} });
  const previousWeekTiers = new Map<string, RankingEntry['tier']>();
  const previousWeekKey = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  for (const [login, history] of Object.entries(rankHistory.byLogin)) {
    const prev = history.find((h) => h.weekStart === previousWeekKey);
    if (prev) previousWeekTiers.set(login, prev.tier);
  }

  // Build stats files
  const allStats = await buildStatsFile('all', null, now, members, eventsByLogin, allOrgMergesThisWeek, previousWeekTiers, now);
  const monthlyStats = await buildStatsFile('monthly', jstMonthStart(now), jstMonthEnd(now), members, eventsByLogin, allOrgMergesThisWeek, previousWeekTiers, now);
  const weeklyStats = await buildStatsFile('weekly', weekStart, weekEnd, members, eventsByLogin, allOrgMergesThisWeek, previousWeekTiers, now);
  const dailyStats = await buildStatsFile('daily', jstDayStart(now), jstDayEnd(now), members, eventsByLogin, allOrgMergesThisWeek, previousWeekTiers, now);

  // Update rank history (append current week if not present)
  const currentWeekKey = weekStart.toISOString();
  for (const r of weeklyStats.rankings) {
    if (!rankHistory.byLogin[r.login]) rankHistory.byLogin[r.login] = [];
    const existing = rankHistory.byLogin[r.login].find((h) => h.weekStart === currentWeekKey);
    if (existing) {
      existing.tier = r.tier;
      existing.xp = r.xp;
    } else {
      rankHistory.byLogin[r.login].push({ weekStart: currentWeekKey, tier: r.tier, xp: r.xp });
    }
    rankHistory.byLogin[r.login] = rankHistory.byLogin[r.login].slice(-52); // keep last 52 weeks
  }

  // Update MVPs file: snapshot at week boundary completion
  const mvps = await readJson<MVPsFile>(path.join(DATA_DIR, 'mvps.json'), { weekly: [], monthly: [] });
  // We snapshot the previous completed week's MVP if not already present
  const completedWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  if (!mvps.weekly.find((m) => m.weekStart === completedWeekStart)) {
    const prevWeekData = rankHistory.byLogin;
    let bestLogin: string | null = null;
    let bestXp = -1;
    for (const [login, hist] of Object.entries(prevWeekData)) {
      const h = hist.find((x) => x.weekStart === completedWeekStart);
      if (h && h.xp > bestXp) {
        bestXp = h.xp;
        bestLogin = login;
      }
    }
    if (bestLogin) {
      mvps.weekly.unshift({ weekStart: completedWeekStart, login: bestLogin, xp: bestXp, snapshot: EMPTY_BREAKDOWN });
    }
  }
  // Monthly MVP: capture when month rolls over (we just store current monthly leader; replaced each run within the month)
  const currentMonthKey = jstMonthStart(now).toISOString().slice(0, 7);
  const top = monthlyStats.rankings[0];
  if (top) {
    const existing = mvps.monthly.find((m) => m.month === currentMonthKey);
    if (existing) {
      existing.login = top.login;
      existing.xp = top.xp;
      existing.snapshot = top.breakdown;
    } else {
      mvps.monthly.unshift({ month: currentMonthKey, login: top.login, xp: top.xp, snapshot: top.breakdown });
    }
  }

  // Write all files
  const membersFile: MembersFile = { generatedAt: now.toISOString(), members };
  await writeJson(path.join(DATA_DIR, 'members.json'), membersFile);
  await writeJson(path.join(DATA_DIR, 'stats-all.json'), allStats);
  await writeJson(path.join(DATA_DIR, 'stats-monthly.json'), monthlyStats);
  await writeJson(path.join(DATA_DIR, 'stats-weekly.json'), weeklyStats);
  await writeJson(path.join(DATA_DIR, 'stats-daily.json'), dailyStats);
  await writeJson(path.join(DATA_DIR, 'mvps.json'), mvps);
  await writeJson(path.join(DATA_DIR, 'rank-history.json'), rankHistory);

  console.log('[fetch-stats] Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 4: Compile-check the script**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-stats.ts config/members-override.json public/data/.gitkeep
git commit -m "feat(scripts): fetch-stats pipeline writing JSON data"
```

---

## Task 10: Generate Mock Data for UI Development

**Files:**
- Create: `scripts/mock-data.ts`
- Modify: `package.json` (add script)
- Will populate `public/data/*.json` with fake content

- [ ] **Step 1: Add npm script to `package.json`**

Modify the `"scripts"` block by adding:

```json
"mock-data": "tsx scripts/mock-data.ts"
```

- [ ] **Step 2: Create `scripts/mock-data.ts`**

```ts
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { assignTiers } from '../lib/scoring';
import { jstWeekStart, jstWeekEnd, jstMonthStart, jstMonthEnd, jstDayStart, jstDayEnd } from '../lib/date';
import type {
  MembersFile, StatsFile, MVPsFile, RankHistoryFile, MemberProfile, Period, RankingEntry, BadgeId, Breakdown,
} from '../lib/types';
import { EMPTY_BREAKDOWN } from '../lib/types';

const NAMES = [
  'akari', 'haruto', 'yuki', 'sora', 'ren', 'hina', 'kaito', 'miyu',
  'shun', 'asuka', 'kenji', 'naoko', 'taro', 'rumi', 'daichi', 'sakura',
  'ryu', 'mei', 'jin', 'aoi', 'kazuki', 'nami', 'shogo', 'yuna',
  'kei', 'ami', 'tsubasa', 'rina', 'goro', 'satomi',
];
const ALL_BADGES: BadgeId[] = ['first-blood', 'bug-slayer', 'code-monk', 'reviewer-sensei', 'streak-lord', 'ghost', 'awakening'];

function rand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function buildPeriod(period: Period, members: MemberProfile[], windowStart: Date | null, windowEnd: Date, seed: number): StatsFile {
  const r = rand(seed);
  const scale = period === 'daily' ? 5 : period === 'weekly' ? 30 : period === 'monthly' ? 120 : 500;
  const entries = members.map((m) => ({
    login: m.login,
    xp: Math.round(r() * scale + r() * (scale / 2)),
    totalCommits: Math.round(r() * scale),
  }));
  const ranked = assignTiers(entries);
  const dayCount = period === 'daily' ? 1 : period === 'weekly' ? 7 : period === 'monthly' ? 30 : 14;
  const rankings: RankingEntry[] = ranked.map((re) => {
    const xp = re.xp;
    const breakdown: Breakdown = {
      prsMerged: Math.round(xp * 0.05),
      prsOpened: Math.round(xp * 0.04),
      reviews: Math.round(xp * 0.08),
      issuesClosed: Math.round(xp * 0.03),
      issuesOpened: Math.round(xp * 0.04),
      commits: Math.round(xp * 0.4),
      comments: Math.round(xp * 0.1),
    };
    const badges = ALL_BADGES.filter(() => r() < 0.15);
    return {
      login: re.login,
      xp,
      tier: re.tier,
      rankNumber: re.rankNumber,
      breakdown,
      badges,
      sparkline: Array.from({ length: dayCount }, () => Math.round(r() * 10)),
    };
  });
  return {
    generatedAt: new Date().toISOString(),
    period,
    windowStart: windowStart?.toISOString() ?? null,
    windowEnd: windowEnd.toISOString(),
    rankings,
  };
}

async function main() {
  const now = new Date();
  const members: MemberProfile[] = NAMES.map((n, i) => ({
    login: n,
    name: n.charAt(0).toUpperCase() + n.slice(1),
    avatarUrl: `https://api.dicebear.com/9.x/adventurer/svg?seed=${n}`,
    bio: i % 3 === 0 ? `Engineer @ Rimo · loves ${['ramen', 'gundam', 'kdramas', 'pixel art'][i % 4]}` : null,
    htmlUrl: `https://github.com/${n}`,
  }));

  const DATA_DIR = path.resolve(process.cwd(), 'public/data');
  await mkdir(DATA_DIR, { recursive: true });

  const membersFile: MembersFile = { generatedAt: now.toISOString(), members };
  await writeFile(path.join(DATA_DIR, 'members.json'), JSON.stringify(membersFile, null, 2));

  await writeFile(path.join(DATA_DIR, 'stats-all.json'), JSON.stringify(buildPeriod('all', members, null, now, 1), null, 2));
  await writeFile(path.join(DATA_DIR, 'stats-monthly.json'), JSON.stringify(buildPeriod('monthly', members, jstMonthStart(now), jstMonthEnd(now), 2), null, 2));
  await writeFile(path.join(DATA_DIR, 'stats-weekly.json'), JSON.stringify(buildPeriod('weekly', members, jstWeekStart(now), jstWeekEnd(now), 3), null, 2));
  await writeFile(path.join(DATA_DIR, 'stats-daily.json'), JSON.stringify(buildPeriod('daily', members, jstDayStart(now), jstDayEnd(now), 4), null, 2));

  const weeklyTop = JSON.parse(await (await import('node:fs/promises')).readFile(path.join(DATA_DIR, 'stats-weekly.json'), 'utf8')) as StatsFile;
  const monthlyTop = JSON.parse(await (await import('node:fs/promises')).readFile(path.join(DATA_DIR, 'stats-monthly.json'), 'utf8')) as StatsFile;

  const mvps: MVPsFile = {
    weekly: Array.from({ length: 8 }, (_, i) => {
      const ws = new Date(jstWeekStart(now).getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const r = weeklyTop.rankings[i % weeklyTop.rankings.length];
      return { weekStart: ws.toISOString(), login: r.login, xp: r.xp, snapshot: r.breakdown };
    }),
    monthly: Array.from({ length: 6 }, (_, i) => {
      const m = new Date(jstMonthStart(now));
      m.setUTCMonth(m.getUTCMonth() - (i + 1));
      const r = monthlyTop.rankings[i % monthlyTop.rankings.length];
      return { month: m.toISOString().slice(0, 7), login: r.login, xp: r.xp, snapshot: r.breakdown };
    }),
  };
  await writeFile(path.join(DATA_DIR, 'mvps.json'), JSON.stringify(mvps, null, 2));

  const rankHistory: RankHistoryFile = { byLogin: {} };
  const tiers: Array<'S' | 'A' | 'B' | 'C' | 'D' | 'E'> = ['S', 'A', 'B', 'C', 'D', 'E'];
  for (const m of members) {
    rankHistory.byLogin[m.login] = Array.from({ length: 12 }, (_, i) => {
      const ws = new Date(jstWeekStart(now).getTime() - (11 - i) * 7 * 24 * 60 * 60 * 1000);
      return { weekStart: ws.toISOString(), tier: tiers[Math.floor(Math.random() * tiers.length)], xp: Math.round(Math.random() * 200) };
    });
  }
  await writeFile(path.join(DATA_DIR, 'rank-history.json'), JSON.stringify(rankHistory, null, 2));

  console.log('[mock-data] wrote', DATA_DIR);
}

main().catch((err) => { console.error(err); process.exit(1); });
```

- [ ] **Step 3: Generate the mock data**

Run: `npm run mock-data`
Expected: writes all 7 JSON files to `public/data/`.

- [ ] **Step 4: Commit**

```bash
git add scripts/mock-data.ts package.json public/data/*.json
git commit -m "chore: mock data generator for UI dev"
```

---

## Task 11: Client Data Loader

**Files:**
- Create: `lib/loadData.ts`

- [ ] **Step 1: Create `lib/loadData.ts`**

```ts
import type {
  MembersFile, StatsFile, MVPsFile, RankHistoryFile, Period, MemberProfile, RankingEntry,
} from './types';

async function loadJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return (await res.json()) as T;
}

export const loadMembers = () => loadJson<MembersFile>('/data/members.json');
export const loadStats = (period: Period) => loadJson<StatsFile>(`/data/stats-${period}.json`);
export const loadMvps = () => loadJson<MVPsFile>('/data/mvps.json');
export const loadRankHistory = () => loadJson<RankHistoryFile>('/data/rank-history.json');

export function findMember(members: MemberProfile[], login: string): MemberProfile | undefined {
  return members.find((m) => m.login === login);
}

export function findRanking(stats: StatsFile, login: string): RankingEntry | undefined {
  return stats.rankings.find((r) => r.login === login);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/loadData.ts
git commit -m "feat(data): client-side JSON loaders"
```

---

## Task 12: RankBadge Component

**Files:**
- Create: `components/RankBadge.tsx`

- [ ] **Step 1: Create `components/RankBadge.tsx`**

```tsx
import type { TierLetter } from '@/lib/types';

const TIER_LABEL: Record<TierLetter, string> = {
  S: 'Shadow Monarch',
  A: 'Awakened',
  B: 'Elite Hunter',
  C: 'Hunter',
  D: 'Apprentice',
  E: 'Aspirant',
};

const TIER_STYLES: Record<TierLetter, string> = {
  S: 'bg-rank-s/20 text-rank-s shadow-glow-s ring-1 ring-rank-s/60 bg-[linear-gradient(110deg,transparent_30%,rgba(251,191,36,0.4)_50%,transparent_70%)] bg-[length:200%_100%] animate-shimmer',
  A: 'bg-rank-a/20 text-rank-a shadow-glow-a ring-1 ring-rank-a/60',
  B: 'bg-rank-b/20 text-rank-b shadow-glow-b ring-1 ring-rank-b/60',
  C: 'bg-rank-c/20 text-rank-c shadow-glow-c ring-1 ring-rank-c/40',
  D: 'bg-rank-d/15 text-rank-d shadow-glow-d ring-1 ring-rank-d/40',
  E: 'bg-rank-e/15 text-rank-e shadow-glow-e ring-1 ring-rank-e/40',
};

export function RankBadge({ tier, size = 'md', showLabel = false }: {
  tier: TierLetter;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}) {
  const sizes = {
    sm: 'h-7 w-7 text-sm',
    md: 'h-10 w-10 text-lg',
    lg: 'h-16 w-16 text-3xl',
  };
  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`font-display font-bold rounded-md flex items-center justify-center ${sizes[size]} ${TIER_STYLES[tier]}`}
      >
        {tier}
      </div>
      {showLabel && (
        <span className="font-display uppercase tracking-wider text-sm text-zinc-300">{TIER_LABEL[tier]}</span>
      )}
    </div>
  );
}

export { TIER_LABEL };
```

- [ ] **Step 2: Commit**

```bash
git add components/RankBadge.tsx
git commit -m "feat(ui): RankBadge component"
```

---

## Task 13: XPBar Component

**Files:**
- Create: `components/XPBar.tsx`

- [ ] **Step 1: Create `components/XPBar.tsx`**

```tsx
'use client';
import { motion } from 'framer-motion';
import type { TierLetter } from '@/lib/types';

const TIER_GRADIENT: Record<TierLetter, string> = {
  S: 'from-amber-300 via-yellow-400 to-amber-500',
  A: 'from-purple-400 via-fuchsia-500 to-purple-600',
  B: 'from-cyan-300 via-cyan-400 to-sky-500',
  C: 'from-sky-200 via-sky-300 to-cyan-400',
  D: 'from-slate-400 via-slate-500 to-slate-600',
  E: 'from-zinc-600 via-zinc-700 to-zinc-800',
};

export function XPBar({ xp, max, tier }: { xp: number; max: number; tier: TierLetter }) {
  const pct = Math.min(100, Math.max(0, max > 0 ? (xp / max) * 100 : 0));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-display tracking-wider text-zinc-400 mb-1">
        <span>XP</span>
        <span>{Math.round(xp)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-base-700 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${TIER_GRADIENT[tier]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/XPBar.tsx
git commit -m "feat(ui): XPBar component"
```

---

## Task 14: BadgeChip Component

**Files:**
- Create: `components/BadgeChip.tsx`

- [ ] **Step 1: Create `components/BadgeChip.tsx`**

```tsx
import type { BadgeId } from '@/lib/types';

const BADGE_META: Record<BadgeId, { emoji: string; label: string; desc: string }> = {
  'first-blood':     { emoji: '🩸', label: 'First Blood',     desc: 'First merged PR of the week' },
  'bug-slayer':      { emoji: '🐛', label: 'Bug Slayer',      desc: '10+ bug issues closed' },
  'code-monk':       { emoji: '🧘', label: 'Code Monk',       desc: '100+ commits in a month' },
  'reviewer-sensei': { emoji: '🥋', label: 'Reviewer Sensei', desc: '50+ reviews submitted' },
  'streak-lord':     { emoji: '🔥', label: 'Streak Lord',     desc: '7+ day commit streak' },
  'ghost':           { emoji: '👻', label: 'Ghost',           desc: 'No activity in 14 days' },
  'awakening':       { emoji: '⚡', label: 'Awakening',       desc: 'Jumped 2+ tiers this week' },
};

export function BadgeChip({ id, size = 'md' }: { id: BadgeId; size?: 'sm' | 'md' }) {
  const meta = BADGE_META[id];
  const sizes = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
  return (
    <span
      title={meta.desc}
      className={`inline-flex items-center gap-1 rounded-full glass border border-neon-purple/30 ${sizes}`}
    >
      <span>{meta.emoji}</span>
      <span className="font-display tracking-wider uppercase">{meta.label}</span>
    </span>
  );
}

export { BADGE_META };
```

- [ ] **Step 2: Commit**

```bash
git add components/BadgeChip.tsx
git commit -m "feat(ui): BadgeChip component"
```

---

## Task 15: HunterCard Component

**Files:**
- Create: `components/HunterCard.tsx`

- [ ] **Step 1: Create `components/HunterCard.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MemberProfile, RankingEntry } from '@/lib/types';
import { RankBadge, TIER_LABEL } from './RankBadge';
import { XPBar } from './XPBar';
import { BadgeChip } from './BadgeChip';

const TIER_RING: Record<RankingEntry['tier'], string> = {
  S: 'ring-rank-s shadow-glow-s',
  A: 'ring-rank-a shadow-glow-a',
  B: 'ring-rank-b shadow-glow-b',
  C: 'ring-rank-c shadow-glow-c',
  D: 'ring-rank-d shadow-glow-d',
  E: 'ring-rank-e shadow-glow-e',
};

export function HunterCard({ member, ranking, maxXp, size = 'md' }: {
  member: MemberProfile;
  ranking: RankingEntry;
  maxXp: number;
  size?: 'md' | 'lg';
}) {
  const avatarSize = size === 'lg' ? 'h-32 w-32' : 'h-20 w-20';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6 relative overflow-hidden"
    >
      <div className="absolute -top-4 -right-4 opacity-20 font-display text-[180px] leading-none text-neon-purple select-none">
        {ranking.tier}
      </div>
      <div className="flex items-start gap-5 relative">
        <Link href={`/hunter/${member.login}/`} className="shrink-0">
          <img
            src={member.avatarUrl}
            alt={member.login}
            className={`${avatarSize} rounded-full ring-2 ${TIER_RING[ranking.tier]}`}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <Link href={`/hunter/${member.login}/`}>
              <h3 className="font-display text-2xl font-bold tracking-wide hover:text-neon-purple transition-colors">
                {member.name ?? member.login}
              </h3>
            </Link>
            <RankBadge tier={ranking.tier} size="sm" />
          </div>
          <div className="text-xs uppercase tracking-widest text-zinc-500 mb-3">
            #{ranking.rankNumber} · {TIER_LABEL[ranking.tier]}
          </div>
          <XPBar xp={ranking.xp} max={maxXp} tier={ranking.tier} />
          {ranking.badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {ranking.badges.map((b) => <BadgeChip key={b} id={b} size="sm" />)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/HunterCard.tsx
git commit -m "feat(ui): HunterCard component"
```

---

## Task 16: ParticleBackground Component

**Files:**
- Create: `components/ParticleBackground.tsx`

- [ ] **Step 1: Create `components/ParticleBackground.tsx`**

```tsx
'use client';
import { useEffect, useRef } from 'react';

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      a: Math.random() * 0.6 + 0.2,
    }));

    function tick() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        const hue = Math.random() > 0.5 ? '168,85,247' : '34,211,238';
        ctx.fillStyle = `rgba(${hue},${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none opacity-50"
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ParticleBackground.tsx
git commit -m "feat(ui): animated particle background"
```

---

## Task 17: PeriodToggle Component

**Files:**
- Create: `components/PeriodToggle.tsx`

- [ ] **Step 1: Create `components/PeriodToggle.tsx`**

```tsx
'use client';
import type { Period } from '@/lib/types';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all', label: 'All-Time' },
];

export function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="inline-flex gap-1 p-1 rounded-full glass">
      {PERIODS.map((p) => {
        const active = value === p.key;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            className={`px-4 py-1.5 rounded-full font-display text-xs uppercase tracking-widest transition-all ${
              active
                ? 'bg-neon-purple text-white shadow-glow-a'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/PeriodToggle.tsx
git commit -m "feat(ui): PeriodToggle"
```

---

## Task 18: LeaderboardTable Component

**Files:**
- Create: `components/LeaderboardTable.tsx`

- [ ] **Step 1: Create `components/LeaderboardTable.tsx`**

```tsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { MemberProfile, RankingEntry } from '@/lib/types';
import { RankBadge } from './RankBadge';
import { XPBar } from './XPBar';
import { BadgeChip } from './BadgeChip';

interface Row {
  member: MemberProfile;
  ranking: RankingEntry;
}

export function LeaderboardTable({ rows, maxXp }: { rows: Row[]; maxXp: number }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead className="text-xs uppercase tracking-widest text-zinc-500 border-b border-neon-purple/10">
          <tr>
            <th className="text-left px-4 py-3 w-12">#</th>
            <th className="text-left px-4 py-3">Hunter</th>
            <th className="text-left px-4 py-3 w-24">Tier</th>
            <th className="text-left px-4 py-3 w-64">XP</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">Activity</th>
            <th className="text-left px-4 py-3 hidden lg:table-cell">Badges</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <motion.tr
              key={r.member.login}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.4) }}
              className="border-b border-neon-purple/5 hover:bg-neon-purple/5 transition-colors"
            >
              <td className="px-4 py-3 font-display text-zinc-500">#{r.ranking.rankNumber}</td>
              <td className="px-4 py-3">
                <Link href={`/hunter/${r.member.login}/`} className="flex items-center gap-3 group">
                  <img src={r.member.avatarUrl} alt={r.member.login} className="h-8 w-8 rounded-full ring-1 ring-neon-purple/40" />
                  <span className="font-display tracking-wide group-hover:text-neon-purple transition-colors">
                    {r.member.name ?? r.member.login}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3"><RankBadge tier={r.ranking.tier} size="sm" /></td>
              <td className="px-4 py-3"><XPBar xp={r.ranking.xp} max={maxXp} tier={r.ranking.tier} /></td>
              <td className="px-4 py-3 hidden md:table-cell">
                <Sparkline data={r.ranking.sparkline} />
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <div className="flex flex-wrap gap-1">
                  {r.ranking.badges.slice(0, 3).map((b) => <BadgeChip key={b} id={b} size="sm" />)}
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data);
  const w = 80, h = 24;
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="text-neon-cyan">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/LeaderboardTable.tsx
git commit -m "feat(ui): LeaderboardTable with sparkline"
```

---

## Task 19: MVPSpotlight Component

**Files:**
- Create: `components/MVPSpotlight.tsx`

- [ ] **Step 1: Create `components/MVPSpotlight.tsx`**

```tsx
'use client';
import { motion } from 'framer-motion';
import type { MemberProfile, RankingEntry } from '@/lib/types';
import { RankBadge } from './RankBadge';

export function MVPSpotlight({ member, ranking, label }: {
  member: MemberProfile;
  ranking: RankingEntry;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative glass rounded-3xl p-8 md:p-12 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-cyan/20 pointer-events-none" />
      <div className="absolute -top-8 -right-8 font-display text-[280px] leading-none opacity-10 select-none">
        {ranking.tier}
      </div>
      <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
        <motion.img
          src={member.avatarUrl}
          alt={member.login}
          className="h-40 w-40 rounded-full ring-4 ring-neon-purple shadow-glow-a"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-neon-cyan mb-2">{label}</div>
          <h2 className="font-display text-5xl md:text-6xl font-bold mb-2">{member.name ?? member.login}</h2>
          <div className="text-zinc-400 mb-4">@{member.login}</div>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <RankBadge tier={ranking.tier} size="lg" showLabel />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Stat label="PRs merged" value={ranking.breakdown.prsMerged} />
            <Stat label="Commits" value={ranking.breakdown.commits} />
            <Stat label="Reviews" value={ranking.breakdown.reviews} />
            <Stat label="XP" value={Math.round(ranking.xp)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-3xl">{value}</div>
      <div className="text-xs uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/MVPSpotlight.tsx
git commit -m "feat(ui): MVPSpotlight for weekly hero card"
```

---

## Task 20: Root Layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { ParticleBackground } from '@/components/ParticleBackground';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rimo Hunter Association',
  description: 'Anime-themed GitHub leaderboard for Rimo employees',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ParticleBackground />
        <header className="border-b border-neon-purple/10 backdrop-blur-md sticky top-0 z-50 bg-base-900/60">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-display text-xl tracking-[0.2em] uppercase">
              <span className="text-neon-purple">Rimo</span>{' '}
              <span className="text-neon-cyan">Hunter</span>{' '}
              <span>Assoc.</span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-display uppercase tracking-widest">
              <Link href="/leaderboard/" className="hover:text-neon-purple transition-colors">Ladder</Link>
              <Link href="/legends/" className="hover:text-neon-purple transition-colors">Legends</Link>
            </div>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-12">{children}</main>
        <footer className="border-t border-neon-purple/10 mt-24 py-8 text-center text-xs text-zinc-500 tracking-widest uppercase">
          For fun · rimoapp · stats refresh hourly
        </footer>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Smoke-test**

Run: `npm run dev`
Expected: top nav appears with anime-styled logo and links. Stop with Ctrl-C.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(ui): root layout with nav and particles"
```

---

## Task 21: Landing Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadMembers, loadStats, findMember } from '@/lib/loadData';
import type { MembersFile, StatsFile, Period } from '@/lib/types';
import { PeriodToggle } from '@/components/PeriodToggle';
import { MVPSpotlight } from '@/components/MVPSpotlight';
import { HunterCard } from '@/components/HunterCard';

export default function Home() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [stats, setStats] = useState<StatsFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => { loadStats(period).then(setStats); }, [period]);

  if (!members || !stats) {
    return <div className="text-center py-24 font-display tracking-widest text-zinc-500">Summoning hunters...</div>;
  }

  const mvp = stats.rankings[0];
  const mvpMember = mvp ? findMember(members.members, mvp.login) : undefined;
  const top10 = stats.rankings.slice(0, 10);
  const maxXp = stats.rankings[0]?.xp ?? 1;

  return (
    <div className="space-y-12">
      <section className="text-center pt-8">
        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-[0.1em] mb-3">
          <span className="text-white">RIMO</span>{' '}
          <span className="text-neon-purple drop-shadow-glow-a">HUNTER</span>{' '}
          <span className="text-neon-cyan drop-shadow-glow-b">ASSOCIATION</span>
        </h1>
        <p className="text-zinc-400 tracking-widest text-sm uppercase">
          The official ranking of Rimo's GitHub hunters · updated hourly
        </p>
      </section>

      <section className="flex justify-center">
        <PeriodToggle value={period} onChange={setPeriod} />
      </section>

      {mvp && mvpMember && (
        <section>
          <MVPSpotlight member={mvpMember} ranking={mvp} label={`#1 · ${labelForPeriod(period)}`} />
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl uppercase tracking-widest">Top 10</h2>
          <Link href="/leaderboard/" className="text-sm font-display uppercase tracking-widest text-neon-cyan hover:text-neon-purple">
            View full ladder →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {top10.map((r) => {
            const m = findMember(members.members, r.login);
            if (!m) return null;
            return <HunterCard key={r.login} member={m} ranking={r} maxXp={maxXp} />;
          })}
        </div>
      </section>
    </div>
  );
}

function labelForPeriod(p: Period): string {
  return p === 'daily' ? 'Today' : p === 'weekly' ? 'This week' : p === 'monthly' ? 'This month' : 'All-time';
}
```

- [ ] **Step 2: Smoke-test**

Run: `npm run dev` → open http://localhost:3000
Expected: title with glow, period toggle, MVP spotlight card animated in, 10 hunter cards in a grid.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(ui): landing page"
```

---

## Task 22: Leaderboard Page

**Files:**
- Create: `app/leaderboard/page.tsx`

- [ ] **Step 1: Create `app/leaderboard/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import { loadMembers, loadStats, findMember } from '@/lib/loadData';
import type { MembersFile, StatsFile, Period } from '@/lib/types';
import { PeriodToggle } from '@/components/PeriodToggle';
import { LeaderboardTable } from '@/components/LeaderboardTable';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [stats, setStats] = useState<StatsFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => { loadStats(period).then(setStats); }, [period]);

  if (!members || !stats) {
    return <div className="text-center py-24 font-display tracking-widest text-zinc-500">Loading the ladder...</div>;
  }

  const maxXp = stats.rankings[0]?.xp ?? 1;
  const rows = stats.rankings
    .map((r) => ({ member: findMember(members.members, r.login)!, ranking: r }))
    .filter((r) => r.member);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="font-display text-4xl uppercase tracking-[0.1em]">
          <span className="text-neon-purple">Full</span> Ladder
        </h1>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>
      <LeaderboardTable rows={rows} maxXp={maxXp} />
    </div>
  );
}
```

- [ ] **Step 2: Smoke-test**

Run: `npm run dev` → http://localhost:3000/leaderboard/
Expected: full table, all 30 mock members, sparklines, badges visible.

- [ ] **Step 3: Commit**

```bash
git add app/leaderboard/page.tsx
git commit -m "feat(ui): leaderboard page"
```

---

## Task 23: Hunter Profile Page

**Files:**
- Create: `app/hunter/[username]/page.tsx`
- Create: `components/StatRadial.tsx`
- Create: `components/RankHistoryChart.tsx`

- [ ] **Step 1: Create `components/StatRadial.tsx`**

```tsx
'use client';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { Breakdown } from '@/lib/types';

export function StatRadial({ breakdown }: { breakdown: Breakdown }) {
  const data = [
    { name: 'PRs merged', value: breakdown.prsMerged, fill: '#fbbf24' },
    { name: 'Commits', value: breakdown.commits, fill: '#a855f7' },
    { name: 'Reviews', value: breakdown.reviews, fill: '#22d3ee' },
    { name: 'Issues closed', value: breakdown.issuesClosed, fill: '#7dd3fc' },
  ];
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadialBarChart innerRadius="30%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, max]} tick={false} />
        <RadialBar background dataKey="value" cornerRadius={6} />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: Create `components/RankHistoryChart.tsx`**

```tsx
'use client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { TierLetter } from '@/lib/types';

const TIER_INDEX: Record<TierLetter, number> = { E: 1, D: 2, C: 3, B: 4, A: 5, S: 6 };
const TIER_FROM_INDEX: Record<number, TierLetter> = { 1: 'E', 2: 'D', 3: 'C', 4: 'B', 5: 'A', 6: 'S' };

export function RankHistoryChart({ history }: {
  history: Array<{ weekStart: string; tier: TierLetter; xp: number }>;
}) {
  const data = history.map((h) => ({
    week: h.weekStart.slice(5, 10),
    tier: TIER_INDEX[h.tier],
    xp: h.xp,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="week" stroke="#52525b" fontSize={11} />
        <YAxis
          domain={[1, 6]}
          ticks={[1, 2, 3, 4, 5, 6]}
          tickFormatter={(v) => TIER_FROM_INDEX[v] ?? ''}
          stroke="#52525b"
          fontSize={11}
        />
        <Tooltip
          contentStyle={{ background: '#0f0f1e', border: '1px solid rgba(168,85,247,0.3)' }}
          labelStyle={{ color: '#a855f7' }}
        />
        <Line type="monotone" dataKey="tier" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#22d3ee' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 3: Create `app/hunter/[username]/page.tsx`**

Since we use static export, every hunter URL must be pre-generated.

```tsx
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { RankBadge, TIER_LABEL } from '@/components/RankBadge';
import { BadgeChip } from '@/components/BadgeChip';
import { XPBar } from '@/components/XPBar';
import { StatRadial } from '@/components/StatRadial';
import { RankHistoryChart } from '@/components/RankHistoryChart';
import type { MembersFile, StatsFile, RankHistoryFile, TierLetter } from '@/lib/types';

async function readData() {
  const dir = path.resolve(process.cwd(), 'public/data');
  const [members, all, weekly, monthly, daily, history] = await Promise.all([
    fs.readFile(path.join(dir, 'members.json'), 'utf8').then((s) => JSON.parse(s) as MembersFile),
    fs.readFile(path.join(dir, 'stats-all.json'), 'utf8').then((s) => JSON.parse(s) as StatsFile),
    fs.readFile(path.join(dir, 'stats-weekly.json'), 'utf8').then((s) => JSON.parse(s) as StatsFile),
    fs.readFile(path.join(dir, 'stats-monthly.json'), 'utf8').then((s) => JSON.parse(s) as StatsFile),
    fs.readFile(path.join(dir, 'stats-daily.json'), 'utf8').then((s) => JSON.parse(s) as StatsFile),
    fs.readFile(path.join(dir, 'rank-history.json'), 'utf8').then((s) => JSON.parse(s) as RankHistoryFile),
  ]);
  return { members, all, weekly, monthly, daily, history };
}

export async function generateStaticParams() {
  const dir = path.resolve(process.cwd(), 'public/data');
  const file = await fs.readFile(path.join(dir, 'members.json'), 'utf8');
  const data = JSON.parse(file) as MembersFile;
  return data.members.map((m) => ({ username: m.login }));
}

export default async function HunterPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { members, all, weekly, monthly, daily, history } = await readData();
  const member = members.members.find((m) => m.login === username);
  if (!member) notFound();

  const allTime = all.rankings.find((r) => r.login === username);
  const w = weekly.rankings.find((r) => r.login === username);
  const m = monthly.rankings.find((r) => r.login === username);
  const d = daily.rankings.find((r) => r.login === username);
  const tier = allTime?.tier ?? 'E';
  const userHistory = history.byLogin[username] ?? [];

  return (
    <div className="space-y-8">
      <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 font-display text-[320px] leading-none opacity-10 select-none">{tier}</div>
        <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
          <img src={member.avatarUrl} alt={member.login} className="h-40 w-40 rounded-full ring-4 ring-neon-purple shadow-glow-a" />
          <div className="flex-1">
            <h1 className="font-display text-5xl font-bold tracking-wide mb-1">{member.name ?? member.login}</h1>
            <div className="text-zinc-400 mb-3">@{member.login}</div>
            {member.bio && <p className="text-zinc-300 mb-4">{member.bio}</p>}
            <div className="flex items-center gap-4 mb-4">
              <RankBadge tier={tier} size="lg" />
              <div>
                <div className="font-display uppercase tracking-widest text-sm">{TIER_LABEL[tier]}</div>
                <div className="text-zinc-500 text-xs">All-time rank #{allTime?.rankNumber ?? '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <PeriodStat label="Today" xp={d?.xp ?? 0} tier={d?.tier ?? 'E'} max={daily.rankings[0]?.xp ?? 1} />
              <PeriodStat label="This week" xp={w?.xp ?? 0} tier={w?.tier ?? 'E'} max={weekly.rankings[0]?.xp ?? 1} />
              <PeriodStat label="This month" xp={m?.xp ?? 0} tier={m?.tier ?? 'E'} max={monthly.rankings[0]?.xp ?? 1} />
              <PeriodStat label="All-time" xp={allTime?.xp ?? 0} tier={tier} max={all.rankings[0]?.xp ?? 1} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">Stat breakdown (all-time)</h2>
          {allTime && <StatRadial breakdown={allTime.breakdown} />}
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">Rank history</h2>
          <RankHistoryChart history={userHistory} />
        </div>
      </div>

      {allTime && allTime.badges.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">Badges earned</h2>
          <div className="flex flex-wrap gap-2">
            {allTime.badges.map((b) => <BadgeChip key={b} id={b} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function PeriodStat({ label, xp, tier, max }: { label: string; xp: number; tier: TierLetter; max: number }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-xs uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
      <XPBar xp={xp} max={max} tier={tier} />
    </div>
  );
}
```

- [ ] **Step 4: Smoke-test**

Run: `npm run dev` → http://localhost:3000/hunter/akari/
Expected: profile page with avatar, glowing rank, 4 period XP bars, radial chart, rank history line, badges.

- [ ] **Step 5: Commit**

```bash
git add app/hunter components/StatRadial.tsx components/RankHistoryChart.tsx
git commit -m "feat(ui): hunter profile page"
```

---

## Task 24: Legends Page

**Files:**
- Create: `app/legends/page.tsx`

- [ ] **Step 1: Create `app/legends/page.tsx`**

```tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadMembers, loadMvps } from '@/lib/loadData';
import type { MembersFile, MVPsFile } from '@/lib/types';

export default function LegendsPage() {
  const [members, setMembers] = useState<MembersFile | null>(null);
  const [mvps, setMvps] = useState<MVPsFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers); }, []);
  useEffect(() => { loadMvps().then(setMvps); }, []);

  if (!members || !mvps) {
    return <div className="text-center py-24 font-display tracking-widest text-zinc-500">Recalling legends...</div>;
  }

  return (
    <div className="space-y-12">
      <h1 className="font-display text-4xl uppercase tracking-[0.1em] text-center">
        <span className="text-neon-purple">Hall of</span>{' '}
        <span className="text-neon-cyan">Legends</span>
      </h1>

      <section>
        <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">Monthly MVPs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mvps.monthly.map((m) => {
            const member = members.members.find((mem) => mem.login === m.login);
            if (!member) return null;
            return (
              <Link
                href={`/hunter/${member.login}/`}
                key={m.month}
                className="glass rounded-xl p-4 text-center hover:ring-1 hover:ring-neon-purple transition-all group"
              >
                <img
                  src={member.avatarUrl}
                  alt={member.login}
                  className="h-20 w-20 rounded-full mx-auto ring-2 ring-rank-s shadow-glow-s mb-3 group-hover:scale-105 transition-transform"
                />
                <div className="font-display text-lg">{member.name ?? member.login}</div>
                <div className="text-xs uppercase tracking-widest text-neon-cyan mt-1">{m.month}</div>
                <div className="text-xs text-zinc-500 mt-1">{Math.round(m.xp)} XP</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display uppercase tracking-widest text-sm text-zinc-400 mb-4">Weekly MVPs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {mvps.weekly.map((w) => {
            const member = members.members.find((mem) => mem.login === w.login);
            if (!member) return null;
            return (
              <Link
                href={`/hunter/${member.login}/`}
                key={w.weekStart}
                className="glass rounded-lg p-3 text-center hover:ring-1 hover:ring-neon-purple transition-all"
              >
                <img src={member.avatarUrl} alt={member.login} className="h-14 w-14 rounded-full mx-auto ring-1 ring-rank-a mb-2" />
                <div className="text-xs font-display truncate">{member.name ?? member.login}</div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Wk of {w.weekStart?.slice(5, 10)}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Smoke-test**

Run: `npm run dev` → http://localhost:3000/legends/
Expected: hall of monthly + weekly MVPs with avatars and shimmer rings.

- [ ] **Step 3: Commit**

```bash
git add app/legends/page.tsx
git commit -m "feat(ui): legends archive page"
```

---

## Task 25: Verify Static Export Builds

**Files:** none modified

- [ ] **Step 1: Run a full build**

Run: `npm run build`
Expected: build completes without errors, generates `out/` directory with HTML for `/`, `/leaderboard/`, `/legends/`, and 30 `/hunter/<username>/` pages.

- [ ] **Step 2: Inspect output**

Run: `ls out/hunter/`
Expected: directory per mock member (akari, haruto, …).

- [ ] **Step 3: Serve and click around (optional but recommended)**

Run: `npx serve out -l 4000`
Expected: site loads at http://localhost:4000, all pages work statically.

- [ ] **Step 4: Commit any tweaks if needed**

If the build surfaced a fix, commit it. Otherwise skip.

---

## Task 26: GitHub Action Refresh Workflow

**Files:**
- Create: `.github/workflows/refresh.yml`

- [ ] **Step 1: Create `.github/workflows/refresh.yml`**

```yaml
name: Refresh stats

on:
  schedule:
    - cron: '0 * * * *'   # hourly, top of every hour UTC
  workflow_dispatch:

permissions:
  contents: write

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Fetch stats
        env:
          GITHUB_TOKEN: ${{ secrets.STATS_PAT }}
          GITHUB_ORG: rimoapp
        run: npm run fetch-stats

      - name: Commit refreshed data
        run: |
          if [[ -z "$(git status --porcelain public/data/)" ]]; then
            echo "No changes to commit"
            exit 0
          fi
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add public/data/
          git commit -m "chore(data): refresh stats $(date -u +%Y-%m-%dT%H:%M:%SZ)"
          git push
```

- [ ] **Step 2: Document the required secret**

Create or append to `README.md`:

```md
# Rimo Hunter Association

Anime-themed GitHub leaderboard for `rimoapp`.

## Required GitHub secrets

- `STATS_PAT` — a personal access token with `read:org` and `repo` scopes (classic PAT or fine-grained with org read + repo content). Used by the hourly refresh workflow.

## Local dev

1. `cp .env.example .env` and set `GITHUB_TOKEN`
2. `npm install`
3. `npm run mock-data` (or `npm run fetch-stats` with a real token)
4. `npm run dev`

Deploys to Vercel as a static site (`output: 'export'`).
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/refresh.yml README.md
git commit -m "ci: hourly refresh workflow + README"
```

---

## Task 27: First Live Pipeline Run

**Files:** none modified, manual verification

- [ ] **Step 1: Create the GitHub repo (if not already)**

```bash
gh repo create rimo-hunter-association --public --source=. --remote=origin
git push -u origin main
```

(Skip if Ansh wants to do this manually.)

- [ ] **Step 2: Add `STATS_PAT` secret**

Run: `gh secret set STATS_PAT` and paste a PAT with `read:org` + `repo` scopes.
Expected: secret saved.

- [ ] **Step 3: Trigger the workflow manually**

Run: `gh workflow run "Refresh stats"`
Then: `gh run watch`
Expected: green run, `public/data/*.json` updated and committed by the bot.

- [ ] **Step 4: Connect Vercel**

This is a manual step (Ansh in the browser):
- `vercel.com/new` → import the GitHub repo → framework auto-detected as Next.js
- No env vars needed for the site itself (token is only used in the Action)
- Confirm deploy succeeds

- [ ] **Step 5: Eyeball the live site**

Open the Vercel URL. Click through `/`, `/leaderboard/`, `/legends/`, and a couple of `/hunter/<username>/` pages.

- [ ] **Step 6: Tier-threshold calibration**

Look at the live tier distribution. If most of Rimo is bunched into one tier because of the fixed-threshold fallback (small org case) or because the percentile cutoffs feel off, adjust `PERCENTILE_CUTOFFS` or `FIXED_THRESHOLDS` in `lib/scoring.ts` and re-run.

Run: `npm test && npm run build`
Commit any changes.

---

## Done.

The leaderboard is live, refreshing hourly, and you have a fully version-controlled history of every stat snapshot in git.
