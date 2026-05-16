import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: { 900: '#0a0a0f', 800: '#0f0f1e', 700: '#161629' },
        neon: { purple: '#a855f7', cyan: '#22d3ee' },
        rank: {
          s: '#fbbf24',
          a: '#a855f7',
          b: '#22d3ee',
          c: '#7dd3fc',
          d: '#94a3b8',
          e: '#475569',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        jp: ['"Noto Sans JP"', 'sans-serif'],
      },
      boxShadow: {
        'glow-s': '0 0 20px rgba(251,191,36,0.6)',
        'glow-a': '0 0 20px rgba(168,85,247,0.6)',
        'glow-b': '0 0 20px rgba(34,211,238,0.6)',
        'glow-c': '0 0 14px rgba(125,211,252,0.5)',
        'glow-d': '0 0 10px rgba(148,163,184,0.4)',
        'glow-e': '0 0 6px rgba(71,85,105,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
