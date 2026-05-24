import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hilal-blue': '#2b5fa8',
        'hilal-blue-dark': '#1e4a8a',
        'hilal-accent': '#4a8ef0',
        'hilal-sky': '#5b9ef5',
        'hilal-bg': '#f0f6ff',
        'hilal-text': '#1a2b4a',
        'hilal-muted': '#5a7aaa',
        'hilal-border': 'rgba(180,210,255,0.4)',
        'hilal-card': 'rgba(255,255,255,0.7)',
        'hilal-tag-chromium': '#3567b5',
        'hilal-tag-firefox': '#c04a20',
        'hilal-tag-current': '#2b5fa8',
        'hilal-gold': '#F7C948',
        'moonlight-gold': '#FFE08A',
        midnight: '#121826',
        'deep-blue': '#1F3A6B',
        'sky-cyan': '#5FD4E6',
        slate: '#64748B',
        'pure-white': '#FFFFFF',
        silver: '#B8C5D6',
        charcoal: '#0D1117',
        'private-purple': '#7847D1',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Sora', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
