---
date: 2026-06-06
status: completed
origin: docs/brainstorms/2026-06-06-squad-mechanics-requirements.md
type: feat
---

# feat: Add weekly squad leaderboard

## Summary

Add a weekly squad system to the Hunter Association. Each Monday, active hunters are snake-drafted into balanced squads using their weekly XP ranking. Within the same ISO week every 6-hour refresh preserves squad membership and only updates scores. Each squad receives an anime guild name keyed to that week's draft. A new `/squads` page ranks squads by total member XP, and each hunter profile shows their current squad.

---

## Key Technical Decisions

**Week-stable assignment via isoWeek guard.** `fetch-stats.ts` reads the existing `squads.json` before writing. If the stored `isoWeek` matches the current ISO week, it preserves the member-to-squad mapping and only recomputes `totalXp` from current weekly scores. Re-draft fires only when the ISO week advances. This is what makes AE3 ("score updates without reassignment") possible — a pure re-sort every refresh would shift squad membership mid-week as hunters overtake each other in the weekly ranking.

**Squad count formula: `Math.max(1, Math.round(count / 4.5))`.** Targeting the midpoint of the 4–5 member range. When headcount doesn't divide evenly, the remainder goes to the last snake-draft round, producing one slightly larger squad (user preference). Example: 17 hunters → 4 squads (4, 4, 4, 5).

**Snake draft for balance.** Members sorted descending by weekly XP, then dealt into N squads in alternating direction (1→N, N→1, repeat). This distributes the high-XP members evenly and is fully deterministic given the same sorted input — no separate random seed needed for assignment.

**Guild name rotation per week.** Names are assigned by `GUILD_NAMES[(draftIndex + isoWeek) % GUILD_NAMES.length]`, cycling the list each week so squads get different names without any randomness. The list is fixed in `lib/squads.ts`.

**New `lib/squads.ts` module.** Squad logic (GUILD_NAMES constant, `computeSquadCount`, `buildSquads`) is isolated from `fetch-stats.ts` for testability. `fetch-stats.ts` calls into it; tests target `lib/squads.ts` directly.

**Hunter profile reads squads.json at build time.** The hunter profile page (`app/hunter/[username]/page.tsx`) is a server component that reads JSON files via `fs.readFile` at static-generation time. Squad data follows the same pattern — added to the existing `readData()` call. No client-side loading needed for the profile.

---

## High-Level Technical Design

```mermaid
flowchart TB
  A[fetch-stats main] --> B[Build weeklyStats]
  B --> C[Read existing squads.json]
  C --> D{isoWeek matches?}
  D -->|Yes — same week| E[Preserve member assignments]
  D -->|No — new week or missing| F[Sort members by weekly XP desc]
  F --> G[Snake-draft into N squads]
  G --> H[Assign guild names via index + isoWeek]
  E --> I[Recompute totalXp from current scores]
  H --> I
  I --> J[Re-rank squads by totalXp]
  J --> K[Write public/data/squads.json]
  K --> L[/squads page loads via loadSquads]
  K --> M[Hunter profile reads at build time]
```

---

## Requirements Trace

Covers R1–R11, F1–F2, AE1–AE3 from `docs/brainstorms/2026-06-06-squad-mechanics-requirements.md`.

---

## Implementation Units

### U1. Types — SquadsFile

**Goal:** Define the TypeScript types for squad data that the pipeline writes and the UI consumes.

**Requirements:** R7, R8.

**Dependencies:** none.

**Files:**
- `lib/types.ts` (modify)

**Approach:** Add three interfaces:
- `SquadMember { login: string; weeklyXp: number }`
- `Squad { index: number; name: string; totalXp: number; rank: number; members: SquadMember[] }`
- `SquadsFile { generatedAt: string; isoWeek: number; weekStart: string; squads: Squad[] }`

**Patterns to follow:** Existing interface shapes in `lib/types.ts` (e.g. `StatsFile`, `MVPsFile`).

**Test scenarios:**
- Test expectation: none — pure type declarations, no runtime behaviour.

**Verification:** TypeScript compilation passes with no errors touching the new types.

---

### U2. Date utility — jstIsoWeek

**Goal:** Add a `jstIsoWeek(date: Date): number` helper that returns the ISO 8601 week number for the JST calendar week containing the given date.

**Requirements:** R2 (deterministic seed).

**Dependencies:** none.

**Files:**
- `lib/date.ts` (modify)
- `lib/__tests__/date.test.ts` (modify — add scenarios)

**Approach:** Compute from `jstWeekStart(date)`. Find the Thursday of that week (Monday + 3 days), then apply the standard ISO week formula: compare to the first Monday of the year that contains January 4. Return `Math.ceil(diffInDays / 7)`.

**Patterns to follow:** Existing JST helpers in `lib/date.ts`.

**Test scenarios:**
- A date in the middle of a week returns the same week number as Monday and Sunday of that week.
- The Monday of week N+1 returns a week number one higher than the Sunday of week N.
- A date in early January where ISO week 1 starts in the prior calendar year returns week 1 (not 53).
- A date in late December that belongs to ISO week 1 of the following year returns week 1.

**Verification:** All four scenarios pass in `lib/__tests__/date.test.ts`. `npm test` reports green.

---

### U3. Squad computation module

**Goal:** Implement the standalone `lib/squads.ts` module containing the guild name list, squad count formula, snake-draft logic, and the top-level `buildSquads` function.

**Requirements:** R1–R5, R8, F1–F2, AE1–AE3.

**Dependencies:** U1, U2.

**Files:**
- `lib/squads.ts` (create)
- `lib/__tests__/squads.test.ts` (create)

**Approach:**

`GUILD_NAMES` — curated list of 12 Solo Leveling / anime guild names (directional; implementer may adjust names):
Black Blade Guild, Shadow Monarchs, Iron Fang Corps, Crimson Gate Hunters, Silver Arrow Guild, White Tiger Guild, Blue Flame Order, Storm Breakers, Phantom Vanguard, Golden Shield Society, Twilight Hunters, Eternal Dark Guild.

`computeSquadCount(memberCount: number): number` — returns `Math.max(1, Math.round(memberCount / 4.5))`.

`buildSquads(weeklyRankings, isoWeek, existingSquads?)` — main function:
1. If `existingSquads` is provided and `existingSquads.isoWeek === isoWeek`: rebuild `members[].weeklyXp` from current rankings using a login→XP map, recompute each squad's `totalXp`, re-rank, return updated file.
2. Otherwise (new week): sort rankings descending by XP → snake-draft into N squads → assign names via `GUILD_NAMES[(draftIndex + isoWeek) % GUILD_NAMES.length]` → compute totalXp → sort squads by totalXp desc → assign `rank` 1-based.

**Patterns to follow:** `assignTiers` in `lib/scoring.ts` for the sorted-input + derived-property pattern.

**Test scenarios:**
- `computeSquadCount`: 12 → 3, 17 → 4, 20 → 4, 25 → 6 (verify with formula).
- `buildSquads` fresh draft: top-XP hunter lands in squad 0, second-highest in squad N-1, third in squad N-2 (snake direction reverses). Covers AE1.
- `buildSquads` same-isoWeek: passing the output of run 1 as `existingSquads` with modified XP values for one hunter produces identical squad membership, updated `totalXp`. Covers AE3.
- `buildSquads` new-isoWeek: passing output from week N as `existingSquads` with `isoWeek = N+1` produces a fresh draft with new membership. Covers AE1 (different week = new assignments).
- Squad score equals sum of member `weeklyXp` values. Covers R5.
- Squads are returned sorted by `totalXp` descending; `rank` values are 1-based and contiguous. Covers R6.
- Name assignment: squad at draftIndex 0 gets `GUILD_NAMES[(0 + isoWeek) % 12]`. Week N and week N+1 produce different names for the same draftIndex.
- `buildSquads` with 1 hunter: 1 squad of 1, no crash.

**Verification:** `lib/__tests__/squads.test.ts` covers all eight scenario groups. `npm test` green.

---

### U4. Pipeline integration — squads.json

**Goal:** Wire `buildSquads` into `fetch-stats.ts` so `public/data/squads.json` is written on every refresh.

**Requirements:** R7, R8, F1–F2.

**Dependencies:** U1, U2, U3.

**Files:**
- `scripts/fetch-stats.ts` (modify)

**Approach:**
1. After `weeklyStats` is built (line ~264), compute `isoWeek` via `jstIsoWeek(now)`.
2. Read existing `public/data/squads.json` with the existing `readJson` helper (fallback to `undefined`).
3. Call `buildSquads(weeklyStats.rankings, isoWeek, existing)`.
4. Write the result to `path.join(DATA_DIR, 'squads.json')` using the existing `writeJson` helper.

**Execution note:** Add the write after the rank-history update block and before the final `// Write all files` section, keeping the existing write sequence intact.

**Patterns to follow:** The `readJson` / `writeJson` pattern already used for `mvps.json` and `rank-history.json` in `fetch-stats.ts`.

**Test scenarios:**
- Test expectation: none for this unit — integration correctness is covered by U3's unit tests and F1/F2 flow tests in U3. Manual verification via mock-data run (see Verification).

**Verification:** Run `npm run mock-data` followed by inspecting `public/data/squads.json`. Confirm: `isoWeek` is a positive integer, `squads` array is non-empty, each squad has `name`, `totalXp`, `rank`, and a `members` array. Running mock-data a second time without changing the week produces identical `members` arrays and updated `totalXp` values if XP changed.

---

### U5. Client-side data loader

**Goal:** Add `loadSquads` to `lib/loadData.ts` so the `/squads` page can fetch squad data at runtime.

**Requirements:** R9, R10.

**Dependencies:** U1.

**Files:**
- `lib/loadData.ts` (modify)

**Approach:** Add `export const loadSquads = () => loadJson<SquadsFile>('/data/squads.json');` following the exact same pattern as `loadMvps` and `loadStats`.

**Patterns to follow:** All five existing loader functions in `lib/loadData.ts`.

**Test scenarios:**
- Test expectation: none — one-liner delegating to the tested `loadJson` helper.

**Verification:** TypeScript compiles without errors; `loadSquads` is importable.

---

### U6. i18n — squad translation keys

**Goal:** Add EN and JA translation strings for the squad nav entry and squads page.

**Requirements:** R9, R10, R11.

**Dependencies:** none.

**Files:**
- `lib/i18n.ts` (modify)

**Approach:** Add the following keys to both `en` and `ja` locale objects:
- `nav.squads` — "Squads" / "部隊"
- `squads.title.1` — "Hunter" / "ハンター"
- `squads.title.2` — "Squads" / "部隊"
- `squads.loading` — "Assembling squads..." / "部隊編成中..."
- `squads.weekLabel` — "Week" / "第"  (for "Week 23" display)
- `squads.totalXp` — "Squad XP" / "部隊XP"
- `squads.member.xp` — "XP" / "XP"
- `hunter.squad` — "Squad" / "所属部隊"

**Patterns to follow:** Existing key naming and dual-locale structure in `lib/i18n.ts`.

**Test scenarios:**
- Test expectation: none — static data; TypeScript will error if a key is missing from one locale.

**Verification:** TypeScript compilation passes; `useT('squads.title.1')` resolves in component code without type errors.

---

### U7. /squads page

**Goal:** Build the `/squads` route that displays the current week's squads ranked by total XP with member breakdowns.

**Requirements:** R6, R9, R10, F1.

**Dependencies:** U1, U5, U6.

**Files:**
- `app/squads/page.tsx` (create)

**Approach:** `'use client'` page following the legends page pattern. `useEffect` loads `loadSquads()` and `loadMembers()`. Renders:
- Page header with decorative dividers and title (matching the legends/leaderboard aesthetic — dark-navy, font-display, holo-text accent).
- ISO week label ("Week {isoWeek}") in subdued mono.
- Squad cards sorted by `rank` ascending (rank 1 first). Each card is a `glass rounded-2xl` panel with:
  - Rank ordinal (#1, #2…) — large font-display, neon-purple for #1, neon-cyan for others.
  - Squad name — font-display, holo-text for rank 1.
  - Total XP — prominent mono number.
  - Member list — each row shows avatar, name/login link to `/hunter/<login>/`, and individual `weeklyXp`.
- Loading state: single animate-pulse line matching the legends pattern.

**Patterns to follow:**
- Page structure and loading state: `app/legends/page.tsx`.
- Glass card style: `glass rounded-2xl p-5 md:p-6` used throughout existing pages.
- Avatar + link pattern: same as legend cards.
- Framer Motion `motion.div` stagger: same delay formula as `app/legends/page.tsx`.

**Test scenarios:**
- Squads render in rank order (rank 1 first).
- Each squad displays name, totalXp, rank, and member rows.
- Member rows link to `/hunter/<login>/`.
- Loading state renders while data is null.
- Page renders without crash when `squads.squads` is empty.

**Verification:** `npm run dev` → navigate to `/squads/`. Squads appear in rank order. Member names link correctly to profile pages. Responsive layout works on mobile viewport (375px) and desktop.

---

### U8. NavHeader — Squads link

**Goal:** Add "Squads" to the main navigation alongside Ladder, Rising, VS, and Legends.

**Requirements:** R9.

**Dependencies:** U6.

**Files:**
- `components/NavHeader.tsx` (modify)

**Approach:** Add a `<Link href="/squads/">` entry between the Rising and VS links (or between VS and Legends — position that feels balanced). Use `{t('nav.squads')}` for the label. Apply the same `hover:text-neon-purple transition-colors whitespace-nowrap` classes as adjacent links.

**Patterns to follow:** Existing nav links in `components/NavHeader.tsx`.

**Test scenarios:**
- Test expectation: none — static markup change, no logic.

**Verification:** Nav renders "Squads" / "部隊" in both locales. Link navigates to `/squads/`. No layout overflow on mobile (nav scrolls or wraps gracefully).

---

### U9. Hunter profile squad callout

**Goal:** Show the hunter's current squad name and rank on their `/hunter/<username>/` profile page.

**Requirements:** R11, AE2.

**Dependencies:** U1, U3, U6.

**Files:**
- `app/hunter/[username]/page.tsx` (modify)
- `components/HunterProfileView.tsx` (modify)

**Approach:**

**Page (`app/hunter/[username]/page.tsx`):**
- Add `squads.json` to the `readData()` `Promise.all` using the same `fs.readFile` + `JSON.parse` pattern as the other files. Wrap in a try/catch fallback to `null` so a missing file during initial setup doesn't break builds.
- After loading, find the squad containing `username`: `squads?.squads.find(sq => sq.members.some(m => m.login === username))`.
- Pass `currentSquad?: { name: string; rank: number }` as a new optional prop to `HunterProfileView`.

**Component (`components/HunterProfileView.tsx`):**
- Add `currentSquad?: { name: string; rank: number }` to the `Props` interface.
- When `currentSquad` is present, render a small callout panel below the period-stats grid inside the hero card. Use `glass rounded-xl p-3` matching the `PeriodStat` style. Display:
  - Label: `t('hunter.squad')` in subdued display text.
  - Value: squad name and rank ordinal (`#1`, `#2`…) — neon-cyan accent for the rank.
- When `currentSquad` is absent, render nothing (no empty placeholder).

**Patterns to follow:**
- `PeriodStat` sub-component inside `HunterProfileView` for the callout visual style.
- `readData()` extension pattern: follow how `history` is loaded in the same `Promise.all`.

**Test scenarios:**
- Covers AE2: when `currentSquad = { name: 'Black Blade Guild', rank: 1 }`, the profile renders "Black Blade Guild" and "#1".
- When `currentSquad` is undefined, no callout element is rendered.
- Squad callout appears in both EN and JA locale (label changes, values remain the same).
- Page builds without error when `squads.json` is missing (try/catch fallback).

**Verification:** `npm run build` succeeds (static generation reads squads.json). Navigate to `/hunter/<username>/` in dev server — squad callout visible in the hero card. Switching locale toggles the "Squad" / "所属部隊" label.

---

## Scope Boundaries

### Deferred for later (from brainstorm)
- Squad Hall of Legends — archive of past weekly winning squads
- Squad-level achievement badges
- Slack or in-app notification on squad reshuffle

### Out of scope (from brainstorm)
- Manual squad assignment or admin override
- Self-selected guilds
- Cross-squad challenges or bonus XP missions
- Monthly or all-time squad windows

### Deferred to follow-up work
- Unit tests for the fetch-stats integration path (U4) — end-to-end pipeline testing is outside the current test harness (Vitest covers lib/ modules only)
- Accessibility audit of the `/squads` page (keyboard nav, ARIA roles on squad cards)

---

## Open Questions

**Deferred to implementation:**
- Exact visual color accent per squad rank on the `/squads` page (e.g., rank 1 = gold ring matching the legends crown, rank 2 = neon-purple, rank 3 = neon-cyan, others = zinc). Implementer decides based on what looks good against the dark-navy palette.
- Whether the squad rank ordinal on the page uses `#1 / #2` or `1st / 2nd` format. Both are readable; choose at implementation time.
- Whether the member list in each squad card is always expanded or collapses on mobile. Match what renders well given real squad sizes.

---

## Sources & Research

- `scripts/fetch-stats.ts` — `readJson` / `writeJson` helpers and the `buildStatsFile` → write sequence that this plan extends.
- `lib/scoring.ts` — `assignTiers` pattern: sorted-input + derived-rank, used as the model for `buildSquads`.
- `lib/date.ts` — existing JST helpers; `jstWeekStart` is the anchor for `jstIsoWeek`.
- `app/legends/page.tsx` — client-side load + glass card UI pattern for the `/squads` page.
- `app/hunter/[username]/page.tsx` — server component `readData()` pattern extended for squad callout.
- `config/members-override.json` — active-hunter set is already filtered here; squad draft operates on the post-filter `members` array.
