# 🗡️ Rimo Hunter Association

> *"What if your GitHub activity was an anime power-ranking?"*

A **Solo-Leveling-style leaderboard** for [`rimoapp`](https://github.com/rimoapp) — every Rimo employee ranked into S / A / B / C / D / E tiers based on their GitHub contributions, with weekly + monthly MVPs, achievement badges, and a hunter profile card for every member. Built for fun. Refreshed every 6 hours.

Bilingual (English / 日本語) — toggle in the header.

---

## ✨ What it does

- **XP scoring** — PRs merged, commits, reviews, issues opened/closed, and comments each have weighted XP values. Activity on `rimoapp` repos gets a 1.5× loyalty multiplier.
- **Six tier ranks** with anime titles
  | Tier | Title | Population |
  |------|-------|-----------|
  | **S** | Shadow Monarch / 影の君主 | top 5% |
  | **A** | Awakened / 覚醒者 | next 10% |
  | **B** | Elite Hunter / 精鋭ハンター | next 20% |
  | **C** | Hunter / ハンター | next 25% |
  | **D** | Apprentice / 見習い | next 25% |
  | **E** | Aspirant / 志願者 | bottom 15% |
- **Four time windows** — Daily, Weekly, Monthly, All-time (tiers recompute per window, so the ladder is always dynamic)
- **Achievement badges** — 🩸 First Blood · 🐛 Bug Slayer · 🧘 Code Monk · 🥋 Reviewer Sensei · 🔥 Streak Lord · 👻 Ghost · ⚡ Awakening
- **Hall of Legends** — archive of every past weekly + monthly MVP
- **Hunter profile** for each member — radial stat chart, XP across all four windows, rank history line chart, earned badges

---

## 🏗️ How it works

```
┌─────────────────────┐    GraphQL    ┌──────────┐
│ GitHub Action       │ ─────────────▶│ GitHub   │
│ (cron: every 6h)    │  (repo-scoped │   API    │
│                     │   queries)    └──────────┘
│  scripts/           │
│   fetch-stats.ts    │ ───┐
└─────────────────────┘    │ writes JSON
                           ▼
                  ┌────────────────────┐
                  │  public/data/*.json│ ──▶ git commit ──▶ Vercel auto-deploy
                  └────────────────────┘
                           │
                           │ fetched at runtime
                           ▼
                  ┌────────────────────┐
                  │  Static Next.js    │
                  │  site (Vercel)     │
                  └────────────────────┘
```

The JSON files **are** the database — version-controlled, free history, no infra. Every refresh is a commit you can diff.

### Why repo-centric fetching

GitHub's `contributionsCollection` API respects each user's *"Include private contributions on my profile"* setting. Most Rimo employees have it off, which made the obvious user-side approach return zeros. The data pipeline iterates `rimoapp`'s repos directly and groups commits/PRs/reviews/issues by author — repo-level permissions apply instead of per-user privacy.

---

## 🚀 Local dev

```bash
cp .env.example .env
# edit .env, set GITHUB_TOKEN to a PAT with `read:org` + `repo` scopes

npm install        # uses .npmrc → legacy-peer-deps is preset
npm run mock-data  # or `npm run fetch-stats` to pull real Rimo data
npm run dev
# → http://localhost:3000
```

Tests:
```bash
npm test
```

Static build:
```bash
npm run build
# → out/ contains the deployable static site
```

---

## ☁️ Deploy

Static site (`output: 'export'`) deploys to Vercel.

**One-time setup:**
1. Push to GitHub
2. Set the `STATS_PAT` secret on the repo:
   ```bash
   gh secret set STATS_PAT
   ```
   Paste a PAT with `read:org` + `repo` scopes.
3. Import the repo into Vercel — framework auto-detects as Next.js, no env vars needed.

After that, the GitHub Action commits fresh JSON every 6 hours, which triggers Vercel to redeploy automatically.

### Configuring excludes

`config/members-override.json` controls which logins appear on the ladder. Bot accounts (`dependabot`, `renovate`, `github-actions`, `Copilot`, `claude`, etc.) are excluded by default. To add or remove someone, edit the `include` / `exclude` arrays and commit — next refresh applies it.

---

## 🛠️ Stack

**Next.js 15** (App Router, static export) · **React 19** · **TypeScript** · **Tailwind v3** · **Framer Motion** · **Recharts** · **`@octokit/graphql`** · **Vitest** · **GitHub Actions** · **Vercel**

---

## 📁 Project structure

```
app/                       # Next.js routes
  page.tsx                 #   /                landing
  leaderboard/page.tsx     #   /leaderboard/    full ladder
  legends/page.tsx         #   /legends/        MVP archive
  hunter/[username]/       #   /hunter/<user>/  profile (statically generated per member)
components/                # RankBadge, XPBar, HunterCard, MVPSpotlight, LeaderboardTable, ...
lib/
  types.ts                 #   shared TypeScript types
  date.ts                  #   JST week/month/day boundary helpers
  scoring.ts               #   XP formula + tier assignment
  badges.ts                #   achievement badge logic
  github.ts                #   Octokit GraphQL client (repo-centric)
  loadData.ts              #   client-side JSON loaders
  i18n.ts                  #   EN/JA translations
  __tests__/               #   33 unit tests (TDD)
scripts/
  fetch-stats.ts           #   the cron entrypoint
  mock-data.ts             #   generates fake data for UI dev
  scrub-excluded.ts        #   post-process JSON to apply override.exclude
config/
  members-override.json    #   include/exclude logins
public/data/               # generated JSON (committed each run)
.github/workflows/
  refresh.yml              # every-6h refresh cron
docs/superpowers/
  specs/                   # design spec
  plans/                   # implementation plan
```

---

## 🎨 Design notes

The visual treatment leans into *Solo Leveling* — dark navy palette, neon purple + cyan accents, gold reserved for S-tier, glassmorphic cards, animated tier-letter watermarks, floating MVP avatar. Background is a low-opacity canvas particle field that drifts slowly.

Typography: **Cinzel** for display (rank titles, headings), **Inter** for body, **Noto Sans JP** for Japanese.

---

## 🤝 Contributing

This is a side project. PRs welcome but no obligation to merge. The implementation plan in `docs/superpowers/plans/` outlines what's there and why; the spec in `docs/superpowers/specs/` covers the scoring/tier/badge design.

---

*For fun · rimoapp · 🇯🇵 Tokyo*
