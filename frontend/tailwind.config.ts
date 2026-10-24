import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        background: '#050505',
        surface: {
          DEFAULT: '#0d0d0e',
          subtle: '#121214',
          border: '#1f1f23',
          hover: '#26262b',
          elevated: '#161619',
        },
        luxury: {
          gold: '#D4AF37',
          bronze: '#B38B59',
          platinum: '#E5E5EA',
          emerald: '#10B981',
          cyan: '#06B6D4',
        },
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        trust: {
          high: '#10B981',
          moderate: '#F59E0B',
          risk: '#F97316',
          alert: '#EF4444',
        },
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        widest: '0.2em',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        'glow-brand': '0 0 24px -2px rgba(16, 185, 129, 0.35)',
        'glow-emerald': '0 0 28px -4px rgba(16, 185, 129, 0.4)',
        'glow-cyan': '0 0 28px -4px rgba(6, 182, 212, 0.35)',
        'glow-gold': '0 0 28px -4px rgba(212, 175, 55, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
