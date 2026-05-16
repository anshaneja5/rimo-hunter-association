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
