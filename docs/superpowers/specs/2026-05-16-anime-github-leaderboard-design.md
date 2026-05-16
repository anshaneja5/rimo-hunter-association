# Rimo Hunter Association — Anime-Themed GitHub Leaderboard

**Author:** Ansh Aneja
**Date:** 2026-05-16
**Status:** Approved design — ready for implementation plan

## 1. Purpose

A playful, gamified leaderboard that ranks Rimo (`github.com/rimoapp`) employees by GitHub
activity using a *Solo Leveling*-inspired anime aesthetic. Built for fun, public-facing,
zero-auth. Goal: make engineering activity feel like an RPG ladder, surface weekly/monthly
MVPs, and give every contributor a hunter card to show off.

Non-goals: performance reviews, management tooling, anything that judges someone unfairly
or feels punitive. Lowest tier ("Aspirant") and the playful "Ghost" badge are the spiciest
this gets.

## 2. Scope

**In scope:**
- Pull all `rimoapp` GitHub org members + their public activity
- Compute XP and S/A/B/C/D/E tiers per time window (Daily / Weekly / Monthly / All-time)
- Display leaderboard, individual hunter profiles, MVP showcase, hall of legends archive
- Achievement badges layered on top of tiers
- Hourly auto-refresh via GitHub Action

**Out of scope:**
- Authentication / private repo data beyond what the org PAT exposes
- Mobile app (responsive web is enough)
- Live websockets / real-time push (hourly cron is fine)
- Slack / Discord notifications (could be a later add-on)
- Multi-org support — `rimoapp` only

## 3. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router, static export) | Static HTML + JSON deploy, zero backend |
| Language | TypeScript | Type safety on GraphQL response shapes |
| Styling | Tailwind CSS v4 | Fast iteration on the anime aesthetic |
| Animation | Framer Motion | Level-up pulses, MVP reveals, particle effects |
| Charts | Recharts | XP bars, radial stat charts, rank history line |
| GitHub client | `@octokit/graphql` | Batched per-user contribution queries |
| Hosting | Vercel free tier | Static site + auto-deploy on push |
| Scheduler | GitHub Actions cron | Hourly refresh, commits JSON back to repo |

## 4. Architecture & Data Flow

```
┌─────────────────────────┐
│  GitHub Action (hourly) │
│  workflows/refresh.yml  │
└──────────┬──────────────┘
           │ runs
           ▼
┌─────────────────────────┐
│  scripts/fetch-stats.ts │  ── GraphQL ──▶  GitHub API
└──────────┬──────────────┘
           │ writes
           ▼
┌─────────────────────────┐
│  public/data/*.json     │
└──────────┬──────────────┘
           │ committed to repo
           ▼
┌─────────────────────────┐
│  Vercel auto-deploy     │
└──────────┬──────────────┘
           │ serves
           ▼
┌─────────────────────────┐
│  Next.js client app     │  ── fetch ──▶  /data/*.json
└─────────────────────────┘
```

The JSON files are the database. Version-controlled, free history, zero infra.

## 5. Scoring System

### 5.1 XP per action

| Action | XP |
|---|---|
| PR merged (this user is the author) | 10 |
| PR opened (author only, scored once when opened) | 2 |
| Code review submitted (any state: approved / changes-requested / commented) | 3 |
| Issue closed (where this user is the `closed_by` actor) | 5 |
| Issue opened (this user is the author) | 1 |
| Commit (authored by this user, on the repo's default branch, no merge commits) | 1 |
| Comment on a PR or issue (excluding self-comments) | 0.5 |

**Rimo loyalty multiplier:** Base XP for any action above × 1.5 if the target repo is owned
by `rimoapp`. The multiplier replaces the base value (so a merged PR on a rimoapp repo is
worth 15 XP total, not 10 + 15).

Activity is counted strictly within the chosen time window. PR opened in week N but
merged in week N+1 contributes "opened" XP to week N and "merged" XP to week N+1.

### 5.2 Tier assignment

After XP is summed for every member in a time window, sort descending and assign tiers by
percentile rank:

| Tier | Title | Percentile |
|---|---|---|
| **S** | Shadow Monarch | top 5% |
| **A** | Awakened | next 10% |
| **B** | Elite Hunter | next 20% |
| **C** | Hunter | next 25% |
| **D** | Apprentice | next 25% |
| **E** | Aspirant | bottom 15% |

Each time window has independent tiers. Someone can be S-rank weekly and B-rank all-time —
that's fine, it keeps the ladder dynamic.

Edge cases:
- If a member has zero XP in the window, they are E-tier by default
- If the org has fewer than 20 members, fall back to fixed XP thresholds (S ≥ 500,
  A ≥ 250, B ≥ 100, C ≥ 40, D ≥ 10, else E — calibrate after first live data run)
- Ties are broken by total commits, then alphabetically by username

### 5.3 MVP selection

For each completed week (Mon–Sun, JST since Rimo is Japan-based) and each completed month,
the top XP-earner is recorded as that period's MVP and frozen into `mvps.json`.

## 6. Achievement Badges

Earned in addition to tier rank. Computed in the same pipeline:

| Badge | Condition |
|---|---|
| 🩸 First Blood | First merged PR of the current week |
| 🐛 Bug Slayer | Closed ≥10 issues labeled `bug` (all-time) |
| 🧘 Code Monk | ≥100 commits in a calendar month |
| 🥋 Reviewer Sensei | ≥50 reviews submitted (all-time) |
| 🔥 Streak Lord | Commits on ≥7 consecutive days |
| 👻 Ghost | Zero activity in the last 14 days |
| ⚡ Awakening | Jumped ≥2 tiers week-over-week |

Each user can hold multiple badges. Badges are computed fresh on every refresh run
(no need to persist earned-state separately).

## 7. Pages

### 7.1 `/` — Landing

- Full-bleed hero: dark navy gradient, animated particle/star/shadow background
- Big animated "MVP of the week" hunter card front and center
- Top 10 leaderboard preview (current week by default)
- Time-window pill toggle: Daily / Weekly / Monthly / All-time
- Links to `/leaderboard`, `/legends`

### 7.2 `/leaderboard` — Full ranking

- Table view, all org members, sortable by XP / PRs / commits / reviews
- Each row: avatar with tier-colored glow ring, rank badge, XP bar, mini activity sparkline (last 14 days)
- Filter by time window (URL param: `?period=weekly`)
- Hover row → tooltip with stat breakdown
- Click row → goes to `/hunter/[username]`

### 7.3 `/hunter/[username]` — Profile

- Anime-style hunter card layout
- Big avatar with rank-colored glow + tier badge overlay
- XP / level display (level = floor(XP / 100), purely cosmetic)
- Stat breakdown: radial chart showing PRs vs commits vs reviews vs issues
- Recent activity feed (last 30 events)
- Earned badges grid
- Rank history line chart (last 12 weeks of tier transitions)

### 7.4 `/legends` — Hall of Legends

- Archive wall: grid of past Weekly + Monthly MVP cards
- Filterable by year, by period type
- Hover → snapshot of that week/month's stats for the MVP

## 8. Visual Design

- **Palette:** Black `#0A0A0F` / deep-navy `#0F0F1E` base, neon purple `#A855F7` + cyan `#22D3EE` accents, gold `#FBBF24` reserved for S-tier
- **Typography:** *Cinzel* (display, for rank titles), *Inter* (body), *Noto Sans JP* fallback for any Japanese names
- **Cards:** Glassmorphism — semi-transparent backgrounds, subtle backdrop blur, glowing tier-colored borders
- **Tier colors:**
  - S: gold + animated shimmer
  - A: neon purple
  - B: cyan
  - C: blue-white
  - D: gray-blue
  - E: dim gray
- **Motion:** Framer Motion entrance animations on cards, "level up" pulse when a user changes tier, animated rank badge glow, particle backdrop
- **Tone:** Playful, never mean. Light Japanese flavor (kanji accents on tier badges optional)

## 9. Data Schemas

All in `public/data/`. Generated by `fetch-stats.ts`.

### `members.json`
```ts
{
  generatedAt: string;            // ISO timestamp
  members: Array<{
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    htmlUrl: string;
  }>;
}
```

### `stats-{period}.json` (one each for `all` | `monthly` | `weekly` | `daily`)
```ts
{
  generatedAt: string;
  period: 'all' | 'monthly' | 'weekly' | 'daily';
  windowStart: string;            // ISO timestamp, null for 'all'
  windowEnd: string;
  rankings: Array<{
    login: string;
    xp: number;
    tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'E';
    rankNumber: number;           // 1-indexed
    breakdown: {
      prsMerged: number;
      prsOpened: number;
      reviews: number;
      issuesClosed: number;
      issuesOpened: number;
      commits: number;
      comments: number;
    };
    badges: string[];             // badge IDs
    sparkline: number[];          // daily XP, length depends on period
  }>;
}
```

### `mvps.json`
```ts
{
  weekly: Array<{ weekStart: string; login: string; xp: number; snapshot: BreakdownObject }>;
  monthly: Array<{ month: string; login: string; xp: number; snapshot: BreakdownObject }>;
}
```

### `rank-history.json`
```ts
{
  byLogin: Record<string, Array<{ weekStart: string; tier: TierLetter; xp: number }>>;
}
```

## 10. Repository Structure

```
/app
  /(root)/page.tsx              # landing
  /leaderboard/page.tsx
  /hunter/[username]/page.tsx
  /legends/page.tsx
  /layout.tsx
/components
  HunterCard.tsx
  RankBadge.tsx
  XPBar.tsx
  LeaderboardTable.tsx
  ParticleBackground.tsx
  PeriodToggle.tsx
  BadgeChip.tsx
/lib
  scoring.ts                    # XP formula + tier assignment
  github.ts                     # GraphQL queries + types
  badges.ts                     # badge computation
  date.ts                       # JST week/month boundaries
/scripts
  fetch-stats.ts                # the cron entrypoint
/public/data/*.json
/.github/workflows/refresh.yml
/docs/superpowers/specs/        # this file
```

## 11. GitHub Action — Refresh Workflow

`.github/workflows/refresh.yml` schedule: `0 * * * *` (hourly, top of every hour UTC).

Steps:
1. Checkout repo
2. Setup Node 20
3. `npm ci`
4. `npm run fetch-stats` — uses `GITHUB_TOKEN` repo secret (a PAT with `read:org` + `repo` scopes)
5. If `public/data/*.json` changed, commit with message `chore(data): refresh stats <ISO>`
6. Push to `main` → Vercel deploys automatically

Also support manual trigger via `workflow_dispatch` for testing.

## 12. Configuration

- `GITHUB_ORG=rimoapp` — hard-coded; can be moved to env var later if needed
- `GITHUB_TOKEN` — repo secret, used only in the Action
- Optional: a `config/members-override.json` to add/exclude specific usernames (for cases
  where org membership doesn't perfectly match "Rimo employees")

## 13. Error Handling

- If GitHub API call fails: log error, exit non-zero, do NOT overwrite stale JSON. Site
  keeps showing the previous good data.
- If a single member's contribution query fails: skip that member with a warning, continue
  with the rest. Note the partial failure in `generatedAt` metadata.
- If JSON write fails or schema validation fails: abort entire run, no commit.

## 14. Testing Strategy

- Unit tests (Vitest) for:
  - `lib/scoring.ts` — XP formula, tier percentile assignment, tie-breaking
  - `lib/badges.ts` — each badge condition
  - `lib/date.ts` — JST week/month boundary math, DST edge cases
- Snapshot tests for key components (HunterCard, RankBadge, LeaderboardTable)
- Manual smoke test: run `fetch-stats.ts` locally with a real token, eyeball the JSON,
  then `npm run dev` and click around

No E2E tests — overkill for a side project.

## 15. Build Sequence (preview — full plan written in next step)

1. Scaffold Next.js project, Tailwind, base layout
2. Implement `lib/scoring.ts` + `lib/date.ts` + `lib/badges.ts` with full unit tests
3. Implement `lib/github.ts` GraphQL queries
4. Implement `scripts/fetch-stats.ts` end-to-end, run locally against `rimoapp`
5. Build static UI components (RankBadge, XPBar, HunterCard) with mock data
6. Wire up `/` landing page
7. Wire up `/leaderboard`, `/hunter/[username]`, `/legends`
8. Polish: particles background, animations, tier-colored glows
9. Set up GitHub Action refresh workflow + Vercel deploy
10. First live deploy + tweak tier thresholds based on real Rimo data

## 16. Open Questions (for implementation phase)

- Exact org headcount → confirms whether percentile or fixed-threshold tiering applies
- Whether bots / non-human accounts in `rimoapp` should be filtered (likely yes — exclude
  any account ending in `[bot]`)
- Whether to surface anything from private repos via the PAT (the org token will see them;
  we should likely show counts but not titles/content — confirm during implementation)
