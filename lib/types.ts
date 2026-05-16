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
  actor?: string;       // GitHub login of who performed the action
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
  /** Consecutive JST-day commit streak ending today (or yesterday). Optional for backward compat. */
  currentStreak?: number;
  /** Longest commit streak observed in the trailing 12 months. Optional for backward compat. */
  longestStreak?: number;
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
