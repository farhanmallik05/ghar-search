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
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#c7d7fe',
          300: '#a3bdfc',
          400: '#7a9bf8',
          500: '#5375f1',
          600: '#3b58e6',
          700: '#2f42cf',
          800: '#2837a7',
          900: '#263384',
          950: '#171e4f',
        },
        trust: {
          high: '#059669',      // Emerald 600
          moderate: '#d97706',  // Amber 600
          risk: '#ea580c',      // Orange 600
          alert: '#dc2626',     // Red 600
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'premium': '0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 8px 24px -4px rgba(15, 23, 42, 0.06)',
        'elevated': '0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 20px 30px -10px rgba(15, 23, 42, 0.08)',
        'glow-brand': '0 0 24px -4px rgba(59, 88, 230, 0.2)',
        'glow-emerald': '0 0 24px -4px rgba(5, 150, 105, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};

export default config;
