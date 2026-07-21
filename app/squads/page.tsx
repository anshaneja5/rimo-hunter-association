'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { loadMembers } from '@/lib/loadData';
import type { MembersFile, MemberProfile } from '@/lib/types';
import { useLocale } from '@/components/I18nProvider';
import {
  SQUADS, RANGER_INDIANS, RANGER_SENIORS, PRODUCT_OWNERS,
  RANGERS_ACCENT, RANGERS_COPY, PAGE_COPY, tr,
  type Squad, type Bilingual, type Locale,
} from '@/lib/org';

export default function SquadsPage() {
  const [locale] = useLocale();
  const L = (b: Bilingual) => tr(b, locale as Locale);
  const [members, setMembers] = useState<MembersFile | null>(null);

  useEffect(() => { loadMembers().then(setMembers).catch(() => setMembers(null)); }, []);

  const find = (login: string): MemberProfile | undefined =>
    members?.members.find((m) => m.login === login);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 md:space-y-12"
    >
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="font-mono text-[10px] md:text-xs uppercase tracking-[0.35em] text-neon-cyan/70">
          {L(PAGE_COPY.eyebrow)}
        </div>
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-[0.08em] leading-none">
          <span className="text-white">{L(PAGE_COPY.title1)}</span>{' '}
          <span className="holo-text">{L(PAGE_COPY.title2)}</span>
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {L(PAGE_COPY.intro)}
        </p>
      </div>

      {/* Command-structure diagram */}
      <OrgDiagram L={L} find={find} />

      {/* Squad detail cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {SQUADS.map((sq, i) => (
          <SquadCard key={sq.id} squad={sq} find={find} L={L} delay={i * 0.05} />
        ))}
        <RangersCard find={find} L={L} delay={SQUADS.length * 0.05} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-mono text-zinc-500">
        <span><span className="text-rank-s">★</span> {L(PAGE_COPY.legendLead)}</span>
        <span><span className="text-rank-s">(★)</span> {L(PAGE_COPY.legendSub)}</span>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------- diagram */

function OrgDiagram({
  L, find,
}: {
  L: (b: Bilingual) => string;
  find: (login: string) => MemberProfile | undefined;
}) {
  return (
    <div className="glass rounded-2xl p-5 md:p-8 ring-1 ring-white/5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,0.6) 12px 13px)' }} />

      {/* PO banner */}
      <div className="relative flex flex-col items-center">
        <div className="glass rounded-full px-4 py-2 ring-1 ring-neon-cyan/30 flex items-center gap-3">
          <div className="flex -space-x-2">
            {PRODUCT_OWNERS.map((po) => {
              const m = find(po.login);
              return m ? (
                <Link key={po.login} href={`/hunter/${po.login}/`} title={m.name ?? po.login}>
                  <img src={m.avatarUrl} alt={po.login}
                    className="h-8 w-8 rounded-full ring-2 ring-base-900 hover:ring-neon-cyan transition-all" />
                </Link>
              ) : null;
            })}
          </div>
          <div className="text-[10px] md:text-xs font-display uppercase tracking-[0.15em] text-neon-cyan pr-1">
            {L(PAGE_COPY.poLabel)}
          </div>
        </div>
        <div className="h-6 w-px bg-gradient-to-b from-neon-cyan/40 to-white/10" />
      </div>

      {/* Squad rail */}
      <div className="relative flex flex-wrap items-stretch justify-center gap-2 md:gap-3">
        {SQUADS.map((sq) => (
          <a key={sq.id} href={`#squad-${sq.id}`}
            className="group flex-1 min-w-[120px] max-w-[200px] rounded-xl px-3 py-3 text-center transition-all hover:-translate-y-0.5"
            style={{ background: `${sq.accent}12`, boxShadow: `inset 0 0 0 1px ${sq.accent}44` }}>
            <div className="font-display uppercase tracking-[0.12em] text-sm md:text-base" style={{ color: sq.accent }}>
              {sq.codename}
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{L(sq.domain)}</div>
          </a>
        ))}
      </div>

      {/* Rangers band */}
      <div className="relative flex flex-col items-center mt-3">
        <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-600 mb-2"
          style={{ color: `${RANGERS_ACCENT}aa` }}>
          {L(PAGE_COPY.supportsNote)}
        </div>
        <div className="rounded-xl px-4 py-2 flex items-center gap-2 flex-wrap justify-center"
          style={{ background: `${RANGERS_ACCENT}10`, boxShadow: `inset 0 0 0 1px ${RANGERS_ACCENT}44` }}>
          <span className="font-display uppercase tracking-[0.12em] text-sm" style={{ color: RANGERS_ACCENT }}>
            {L(PAGE_COPY.rangersLabel)}
          </span>
          <div className="flex -space-x-1.5">
            {RANGER_INDIANS.map((r) => {
              const m = find(r.login);
              return m ? (
                <Link key={r.login} href={`/hunter/${r.login}/`} title={m.name ?? r.login}>
                  <img src={m.avatarUrl} alt={r.login}
                    className="h-6 w-6 rounded-full ring-2 ring-base-900 hover:ring-white transition-all" />
                </Link>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- squad card */

function MemberChip({
  login, find, accent, badge,
}: {
  login: string;
  find: (login: string) => MemberProfile | undefined;
  accent: string;
  badge?: string;
}) {
  const m = find(login);
  return (
    <Link href={`/hunter/${login}/`}
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors min-w-0">
      {m
        ? <img src={m.avatarUrl} alt={login} className="h-7 w-7 rounded-full ring-1 shrink-0" style={{ boxShadow: `0 0 0 1px ${accent}66` }} />
        : <div className="h-7 w-7 rounded-full bg-white/10 shrink-0" />}
      <span className="text-sm font-display truncate">{m?.name ?? login}</span>
      {badge && <span className="text-rank-s text-xs shrink-0">{badge}</span>}
    </Link>
  );
}

function SquadCard({
  squad, find, L, delay,
}: {
  squad: Squad;
  find: (login: string) => MemberProfile | undefined;
  L: (b: Bilingual) => string;
  delay: number;
}) {
  return (
    <motion.div
      id={`squad-${squad.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden scroll-mt-24"
      style={{ boxShadow: `inset 0 0 0 1px ${squad.accent}33` }}
    >
      <div className="absolute -top-8 -right-6 font-display font-black text-[110px] leading-none opacity-[0.05] select-none pointer-events-none uppercase"
        style={{ color: squad.accent }}>
        {squad.codename.slice(0, 1)}
      </div>

      {/* Heading */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-[0.08em]" style={{ color: squad.accent }}>
          {squad.codename}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded-md shrink-0 mt-1"
          style={{ color: squad.accent, background: `${squad.accent}14` }}>
          {L(squad.domain)}
        </span>
      </div>
      <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{L(squad.mission)}</p>

      {/* Lead + sub-lead */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <MemberChip login={squad.leadLogin} find={find} accent={squad.accent} badge="★" />
        {squad.subLeadLogin && <MemberChip login={squad.subLeadLogin} find={find} accent={squad.accent} badge="(★)" />}
      </div>

      {/* Members */}
      {squad.memberLogins.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {squad.memberLogins.map((login) => (
            <MemberChip key={login} login={login} find={find} accent={squad.accent} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------ rangers card */

function RangersCard({
  find, L, delay,
}: {
  find: (login: string) => MemberProfile | undefined;
  L: (b: Bilingual) => string;
  delay: number;
}) {
  return (
    <motion.div
      id="squad-rangers"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass rounded-2xl p-5 md:p-6 relative overflow-hidden scroll-mt-24 lg:col-span-2"
      style={{ boxShadow: `inset 0 0 0 1px ${RANGERS_ACCENT}33` }}
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-[0.08em]" style={{ color: RANGERS_ACCENT }}>
          Rangers
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded-md shrink-0 mt-1"
          style={{ color: RANGERS_ACCENT, background: `${RANGERS_ACCENT}14` }}>
          {L({ en: 'Solo', ja: '単独' })}
        </span>
      </div>
      <p className="text-zinc-400 text-sm mb-4 leading-relaxed max-w-3xl">{L(RANGERS_COPY)}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {RANGER_INDIANS.map((r) => (
          <MemberChip key={r.login} login={r.login} find={find} accent={RANGERS_ACCENT} />
        ))}
      </div>

      <div className="pt-3 border-t border-white/5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-2">
          {L(PAGE_COPY.seniorsLabel)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RANGER_SENIORS.map((s) => (
            <MemberChip key={s.login} login={s.login} find={find} accent="#94a3b8" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
