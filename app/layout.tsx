import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rimo Hunter Association',
  description: 'Anime-themed GitHub leaderboard for Rimo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
