---
date: 2026-06-06
topic: squad-mechanics
---

# Squad Mechanics

## Summary

Add a weekly squad system to the Rimo Hunter Association. Each Monday, hunters are auto-balanced into squads via a snake draft seeded by the ISO week number — deterministic across all 6-hour refreshes in a given week. Each squad receives an auto-assigned Solo Leveling guild name. A new `/squads` page ranks squads by total member XP for the current week, with a per-member breakdown inside each squad card.

---

## Key Decisions

**Snake-draft balancing, seeded by ISO week number.** Sorting hunters by weekly XP then dealing them out snake-style (1→N, then N→1, repeat) gives each squad a comparable XP ceiling going into the week. Seeding the shuffle with the ISO week number (not a random value) means every 6-hour refresh in the same week produces identical assignments — no mid-week reshuffles on deploy.

**Total weekly XP as squad score.** Sum of all members' weekly XP. Simple to understand, consistent with how individual rankings already work, and naturally rewards the full squad staying active.

**Auto-assigned anime guild names.** A curated list of Solo Leveling / anime guild names is bundled with the app. Squads are assigned names by their draft-order index for the week. The curated list needs at least as many entries as the maximum expected squad count (planning determines the exact list).

**Dedicated `/squads` page, not a tab.** Squads are a first-class feature, not a filter on the leaderboard. Nav parity with `/leaderboard` and `/legends`.

---

## Requirements

**Squad composition**

- R1. Squads are recomputed every Monday by snake-drafting hunters in descending weekly-XP order into N squads.
- R2. The draft is seeded by the ISO week number so any refresh within the same week produces the same squad assignments.
- R3. N (squad count) is derived from active-hunter headcount to target 4–5 members per squad; the exact formula (floor vs. round) is resolved during planning.
- R4. Each squad is assigned a name from a curated list of Solo Leveling / anime guild names, indexed by squad draft order for the week.

**Squad scoring**

- R5. A squad's score is the sum of its members' weekly XP, recomputed on every data refresh.
- R6. The `/squads` page ranks squads by score, highest first.

**Data pipeline**

- R7. Squad assignments and scores are computed during the `fetch-stats` refresh cycle and written to `public/data/squads.json`.
- R8. `squads.json` includes the ISO week number so the UI can display "Week N" context alongside squad results.

**UI — `/squads` page**

- R9. A `/squads` route exists with a nav entry alongside `/leaderboard` and `/legends`.
- R10. The page displays each squad's name, total weekly XP, squad rank, and an expandable or inline member list showing each member's individual weekly XP contribution.

**UI — hunter profile**

- R11. Each hunter's `/hunter/<username>` profile shows their current week's squad name and rank as a callout.

---

## Key Flows

- F1. **Weekly reshuffle**
  - **Trigger:** ISO week number advances (each Monday).
  - **Steps:** `fetch-stats` computes weekly XP for all active hunters → sorts hunters descending by XP → snake-drafts into N squads → assigns guild names by squad index → writes `public/data/squads.json` with week number, squad names, member lists, and scores.
  - **Outcome:** `/squads` page reflects new squads; each hunter profile shows updated squad assignment.

- F2. **Mid-week refresh (steady state)**
  - **Trigger:** Any 6-hour refresh within an active week.
  - **Steps:** `fetch-stats` recomputes XP → reruns draft with same ISO-week seed → scores update, assignments unchanged.
  - **Outcome:** Squad scores update; squad membership is identical to the week's first run.

---

## Acceptance Examples

- AE1. **Determinism across refreshes**
  - **Covers:** R2.
  - **Given:** Two refreshes run on different days within the same ISO week.
  - **When:** Both compute squad assignments using the ISO-week seed.
  - **Then:** Both produce identical squad compositions.

- AE2. **Profile badge reflects current squad**
  - **Covers:** R11.
  - **Given:** A hunter is assigned to "Black Blade Guild" for the current week.
  - **When:** Their `/hunter/<username>` profile is viewed.
  - **Then:** The profile shows "Black Blade Guild" and that squad's current rank.

- AE3. **Score updates without reassignment**
  - **Covers:** R5, R7.
  - **Given:** A hunter earns XP mid-week after the initial draft.
  - **When:** The next 6-hour refresh runs.
  - **Then:** The squad's total XP increases; squad membership does not change.

---

## Scope Boundaries

Deferred for later:
- Squad Hall of Legends (archive of past weekly winning squads)
- Squad-level achievement badges
- Slack or in-app notification when squads reshuffle

Out of scope:
- Manual squad assignment or admin override
- Self-selected guilds
- Cross-squad challenges or bonus XP missions
- All-time or monthly squad windows (weekly only for v1)

---

## Dependencies / Assumptions

- Active-hunter set is already filtered by `config/members-override.json`; squad draft operates on that filtered set.
- Assumes 12–30 active hunters (Rimo headcount). Planning verifies against real headcount to confirm squad-count formula.
- The curated guild-name list must have at least N entries for the maximum expected squad count; planning assembles the list.

---

## Outstanding Questions

**Resolve before planning:**
- When headcount doesn't divide evenly into squads of 4–5, which is preferred: one smaller squad (e.g., 3 members) or one larger squad (e.g., 6 members)?

**Deferred to planning:**
- Final curated list of anime guild names (needs ~8–12 entries minimum).
- Visual treatment per squad on the `/squads` page (color accent, icon, or banner — consistent with the Solo Leveling dark-navy palette).
- Whether squad rank (1st, 2nd, 3rd…) uses a tier label or a plain ordinal on the page.
