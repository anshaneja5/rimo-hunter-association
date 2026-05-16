import type { Metadata } from 'next';
import { I18nProvider } from '@/components/I18nProvider';
import { NavHeader } from '@/components/NavHeader';
import { SiteFooter } from '@/components/SiteFooter';
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
        <I18nProvider>
          <ParticleBackground />
          <NavHeader />
          <main className="max-w-7xl mx-auto px-6 py-12">{children}</main>
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
