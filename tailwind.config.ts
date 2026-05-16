import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: { 950: '#050509', 900: '#0a0a0f', 800: '#0f0f1e', 700: '#161629' },
        neon: { purple: '#a855f7', cyan: '#22d3ee', pink: '#ec4899', rose: '#f43f5e' },
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
        display: ['Orbitron', 'Cinzel', 'serif'],
        heavy: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        jp: ['"Noto Sans JP"', 'sans-serif'],
        'jp-display': ['"Reggae One"', '"Noto Sans JP"', 'sans-serif'],
      },
      boxShadow: {
        'glow-s': '0 0 28px rgba(251,191,36,0.55), 0 0 60px rgba(251,191,36,0.25)',
        'glow-a': '0 0 28px rgba(168,85,247,0.55), 0 0 60px rgba(168,85,247,0.25)',
        'glow-b': '0 0 28px rgba(34,211,238,0.55), 0 0 60px rgba(34,211,238,0.2)',
        'glow-c': '0 0 18px rgba(125,211,252,0.5)',
        'glow-d': '0 0 10px rgba(148,163,184,0.4)',
        'glow-e': '0 0 6px rgba(71,85,105,0.3)',
        'inner-glow': 'inset 0 0 40px rgba(168,85,247,0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 28s linear infinite',
        'spin-reverse': 'spin-reverse 38s linear infinite',
        aurora: 'aurora 20s ease-in-out infinite alternate',
        float: 'float 6s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        aurora: {
          '0%':   { transform: 'translate3d(-10%, -8%, 0) scale(1.0) rotate(0deg)' },
          '50%':  { transform: 'translate3d(8%, 6%, 0) scale(1.12) rotate(8deg)' },
          '100%': { transform: 'translate3d(-6%, 10%, 0) scale(0.95) rotate(-6deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'scan-line': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
