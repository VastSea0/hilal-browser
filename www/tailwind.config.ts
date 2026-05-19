import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
