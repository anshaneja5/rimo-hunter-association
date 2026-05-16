# Rimo Hunter Association

Anime-themed GitHub leaderboard for `rimoapp` — Solo-Leveling-style S/A/B/C/D/E tier ranks, weekly/monthly MVPs, achievement badges, all updated hourly.

## Required GitHub secrets

- `STATS_PAT` — a personal access token with `read:org` and `repo` scopes (classic PAT or fine-grained with org read + repo content). Used by the hourly refresh workflow.

## Local dev

```bash
cp .env.example .env  # then set GITHUB_TOKEN
npm install --legacy-peer-deps
npm run mock-data     # or `npm run fetch-stats` with a real token
npm run dev
```

## Deploy

Static site (`output: 'export'`) deploys to Vercel. The hourly GitHub Action commits fresh JSON to `public/data/` which triggers an auto-redeploy.

## Stack

Next.js 15 · React 19 · Tailwind v3 · Framer Motion · Recharts · `@octokit/graphql` · Vitest.

## Project structure

```
app/                 # Next.js routes (landing, leaderboard, hunter/[user], legends)
components/          # RankBadge, XPBar, HunterCard, etc
lib/                 # types, date, scoring, badges, github, loadData
lib/__tests__/       # unit tests
scripts/             # fetch-stats, mock-data
public/data/         # generated JSON (committed)
.github/workflows/   # hourly refresh cron
docs/superpowers/    # spec + implementation plan
```
