// The REAL Rimo India dev-team org (2026-07 reorg): 5 product squads + Rangers,
// overseen by the CTO/PdM as Product Owners. This is static, hand-maintained data
// (source: rimo/organization dev-process docs + team-roster). It is intentionally
// separate from lib/squads.ts, which is the gamified weekly-XP draft used by the
// data pipeline — that concept is no longer surfaced in the UI.
//
// When the roster changes, edit this file only.

export type Locale = 'en' | 'ja';
export interface Bilingual {
  en: string;
  ja: string;
}
export function tr(b: Bilingual, locale: Locale): string {
  return b[locale] ?? b.en;
}

export type SquadId = 'shell' | 'echo' | 'scribe' | 'pilot' | 'bridge';
export type OrgRole = 'po' | 'lead' | 'sub-lead' | 'member' | 'ranger' | 'senior';

export interface SquadMemberRef {
  login: string;
  note?: Bilingual;
}

export interface Squad {
  id: SquadId;
  codename: string; // English identity name — stays even if the domain changes
  origin: Bilingual; // why this name
  domain: Bilingual; // the owned product area (short tag)
  mission: Bilingual; // one small line
  accent: string; // hex accent color (inline-styled to survive Tailwind purge)
  leadLogin: string;
  subLeadLogin?: string;
  memberLogins: string[]; // excludes lead & sub-lead
  seniorLogin?: string; // linked JP support senior
}

export const SQUADS: Squad[] = [
  {
    id: 'shell',
    codename: 'Shell',
    origin: { en: "The CLI's shell", ja: 'CLIのシェル' },
    domain: { en: 'CLI', ja: 'CLI' },
    mission: { en: 'The command-line tooling — the shell everything runs in.', ja: 'コマンドラインツール群 — すべてが動くシェル。' },
    accent: '#22d3ee',
    leadLogin: 'anujpatel03',
    memberLogins: ['adityaghai07', 'Abhinav232004', 'Dev-the-coder'],
  },
  {
    id: 'echo',
    codename: 'Echo',
    origin: { en: 'Echo of voice/sound', ja: '声・音のエコー' },
    domain: { en: 'Diarization', ja: '話者分離' },
    mission: { en: 'Voice & speaker diarization — who said what.', ja: '音声・話者分離 — 誰が何を話したか。' },
    accent: '#ec4899',
    leadLogin: 'ChahitKolte2112',
    memberLogins: ['grvup', 'user-ank'],
  },
  {
    id: 'scribe',
    codename: 'Scribe',
    origin: { en: 'Scribe / record-keeper', ja: '記録係' },
    domain: { en: 'Report / Blog', ja: 'レポート / ブログ' },
    mission: { en: 'Turning meetings into reports, blogs, and records.', ja: '会議をレポート・ブログ・記録に変える。' },
    accent: '#fbbf24',
    leadLogin: 'prernadabi23',
    memberLogins: ['simran-261', 'Altair-05'],
  },
  {
    id: 'pilot',
    codename: 'Pilot',
    origin: { en: 'Piloting the agents', ja: 'エージェントの操縦' },
    domain: { en: 'Task Agent', ja: 'タスクエージェント' },
    mission: { en: 'The task agent — piloting AI to get work done.', ja: 'タスクエージェント — AIを操縦して仕事を進める。' },
    accent: '#a855f7',
    leadLogin: 'piyushaneja30',
    subLeadLogin: 'Anitesh2004',
    memberLogins: ['kesharibhai84', 'Atharva-Kanherkar', 'kamalgurjar7'],
  },
  {
    id: 'bridge',
    codename: 'Bridge',
    origin: { en: 'Bridge to the platforms', ja: '各プラットフォームへの橋' },
    domain: { en: 'Platform', ja: 'プラットフォーム' },
    mission: { en: 'The bridge to every platform: Desktop, Chrome extension, Mobile.', ja: '各プラットフォームへの橋渡し：デスクトップ・Chrome拡張・モバイル。' },
    accent: '#f43f5e',
    leadLogin: 'harshit1818',
    memberLogins: ['spookied'],
  },
];

export const RANGERS_ACCENT = '#34d399';

// Rangers = strong operators who run a project solo, no fixed squad.
export const RANGER_INDIANS: SquadMemberRef[] = [
  { login: 'piyushaneja30', note: { en: 'Also leads Pilot + a personal project', ja: 'Pilotリーダー兼務・個人PJ' } },
  { login: 'anshaneja5' },
  { login: 'HrxSrv' },
  { login: 'ishitasancheti29' },
];

// Japan-based senior engineers who hold no dedicated team: platform / AI-harness,
// urgent response, and shadow/escalation reviews across all squads.
export const RANGER_SENIORS: SquadMemberRef[] = [
  { login: 'koolii', note: { en: 'Kuriyama', ja: '栗山' } },
  { login: 'soliste16', note: { en: 'Miyazaki', ja: '宮崎' } },
  { login: 'mosa-rimo', note: { en: 'Moriya', ja: '森谷' } },
  { login: 'KentoMoriwaki', note: { en: 'Moriwaki', ja: '森脇' } },
];

// Product Owners + Agile Coaches (management layer).
export const PRODUCT_OWNERS: SquadMemberRef[] = [
  { login: 'yyamada12', note: { en: 'CTO', ja: 'CTO' } },
  { login: 'hosshan', note: { en: 'PdM', ja: 'PdM' } },
];

export const RANGERS_COPY: Bilingual = {
  en: 'Solo operators with no fixed squad — trusted to run a project end-to-end, and deployed wherever they are needed most.',
  ja: '固定部隊を持たない単独の精鋭。プロジェクトを最後まで単独で推進し、最も必要とされる場所に投入される。',
};

export const PAGE_COPY = {
  eyebrow: { en: 'India Dev · Command Structure', ja: 'インド開発 · 編成表' } as Bilingual,
  title1: { en: 'Dev', ja: '開発' } as Bilingual,
  title2: { en: 'Squads', ja: '部隊' } as Bilingual,
  intro: {
    en: 'Five product squads own the codebase; a Rangers unit runs solo projects and backs up whoever is behind. The CTO & PdM oversee all of them as Product Owners. One-week sprints, AI does the busywork.',
    ja: '5つのプロダクト部隊がコードベースを担当し、遊軍（Rangers）が単独プロジェクトを進めつつ遅れている部隊を支援する。CTOとPdMがプロダクトオーナーとして全体を統括。1週間スプリント、雑務はAIが担う。',
  } as Bilingual,
  poLabel: { en: 'Product Owners · Agile Coaches', ja: 'プロダクトオーナー・アジャイルコーチ' } as Bilingual,
  rangersLabel: { en: 'Rangers · solo projects', ja: '遊軍 · 単独プロジェクト' } as Bilingual,
  supportsNote: { en: 'Rangers support every squad ↑', ja: '遊軍は全部隊を支援 ↑' } as Bilingual,
  seniorsLabel: { en: 'JP support seniors — platform · reviews', ja: '日本の支援シニア — 基盤・レビュー' } as Bilingual,
  legendLead: { en: '★ leader', ja: '★ リーダー' } as Bilingual,
  legendSub: { en: '(★) sub-leader', ja: '(★) サブリーダー' } as Bilingual,
};

// Role definitions (what each role actually does), from the scrum playbook.
export const ROLE_INFO: Record<OrgRole, { title: Bilingual; blurb: Bilingual }> = {
  po: {
    title: { en: 'Product Owner · Coach', ja: 'プロダクトオーナー・コーチ' },
    blurb: {
      en: 'Owns backlog priority and sprint goals, accepts work at Sprint Review, and coaches the leaders.',
      ja: 'バックログの優先順位とスプリントゴールを管理し、スプリントレビューで成果物を受け入れ、リーダーを指導する。',
    },
  },
  lead: {
    title: { en: 'Team Leader ★', ja: 'チームリーダー ★' },
    blurb: {
      en: 'Runs the squad — facilitates Planning & Retro, approves PRs, unblocks members, reports async, and joins the weekly Dev Sync.',
      ja: 'スプリント計画・振り返りの進行、PR承認、メンバーのブロッカー解消、非同期報告、週次Dev Syncへの参加を担う。',
    },
  },
  'sub-lead': {
    title: { en: 'Sub-leader ★', ja: 'サブリーダー ★' },
    blurb: {
      en: "Shares the leader's load — facilitation and reporting — so the lead can also carry other work.",
      ja: 'リーダーの負荷を分担し、進行や報告を引き受けることで、リーダーが他の仕事も持てるようにする。',
    },
  },
  member: {
    title: { en: 'Squad Member', ja: '部隊メンバー' },
    blurb: {
      en: 'Builds with AI agents, writes tasks with clear acceptance criteria, responds to every AI review finding, and demos their own work.',
      ja: 'AIエージェントと共に開発し、受け入れ基準の明確なタスクを書き、AIレビュー指摘にすべて対応し、自分の成果をデモする。',
    },
  },
  ranger: {
    title: { en: 'Ranger (solo)', ja: '遊軍（単独）' },
    blurb: {
      en: 'Runs a project end-to-end with minimal management, reports async, and can be deployed to back up a squad that is behind.',
      ja: '最小限の管理でプロジェクトを最後まで単独推進し、非同期で報告。遅れている部隊の支援に投入されることもある。',
    },
  },
  senior: {
    title: { en: 'Support Senior', ja: '支援シニア' },
    blurb: {
      en: 'Japan-based platform owner: escalation & shadow reviews, architecture advice, and AI-harness / platform work across squads.',
      ja: '日本のプラットフォーム担当：エスカレーション・シャドーレビュー、アーキテクチャ助言、AIハーネス／基盤整備を横断的に担う。',
    },
  },
};

export interface Assignment {
  role: OrgRole;
  squadId?: SquadId;
  note?: Bilingual;
}

// login -> every assignment they hold (usually one; Piyush holds two: Pilot lead + Ranger).
const ASSIGNMENTS: Map<string, Assignment[]> = (() => {
  const map = new Map<string, Assignment[]>();
  const add = (login: string, a: Assignment) => {
    const list = map.get(login) ?? [];
    list.push(a);
    map.set(login, list);
  };
  for (const po of PRODUCT_OWNERS) add(po.login, { role: 'po', note: po.note });
  for (const sq of SQUADS) {
    add(sq.leadLogin, { role: 'lead', squadId: sq.id });
    if (sq.subLeadLogin) add(sq.subLeadLogin, { role: 'sub-lead', squadId: sq.id });
    for (const login of sq.memberLogins) add(login, { role: 'member', squadId: sq.id });
  }
  for (const r of RANGER_INDIANS) add(r.login, { role: 'ranger', note: r.note });
  for (const s of RANGER_SENIORS) add(s.login, { role: 'senior', note: s.note });
  return map;
})();

export function getAssignments(login: string): Assignment[] {
  return ASSIGNMENTS.get(login) ?? [];
}

export function getSquad(id: SquadId): Squad {
  return SQUADS.find((s) => s.id === id)!;
}
