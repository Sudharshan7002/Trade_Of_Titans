/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        titan: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          850: '#172033',
          900: '#0F172A',
          950: '#0A0D14',
        },
        bento: {
          peach: {
            bg: '#FFF3E8',
            border: '#FFD9B3',
            text: '#C25E00',
            darkBg: '#2D1B10',
            darkBorder: '#542E15',
          },
          mint: {
            bg: '#EDFAF2',
            border: '#B8ECCB',
            text: '#0D7A3E',
            darkBg: '#0F2618',
            darkBorder: '#184D2C',
          },
          sky: {
            bg: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1D4ED8',
            darkBg: '#112240',
            darkBorder: '#1E3A8A',
          },
          lavender: {
            bg: '#F5F3FF',
            border: '#DDD6FE',
            text: '#6D28D9',
            darkBg: '#21183E',
            darkBorder: '#432C7A',
          },
          rose: {
            bg: '#FFF1F2',
            border: '#FECDD3',
            text: '#BE123C',
            darkBg: '#2E1218',
            darkBorder: '#5C1D2A',
          },
          lime: {
            bg: '#F7FEE7',
            border: '#D9F99D',
            text: '#4D7C0F',
            darkBg: '#1C260D',
            darkBorder: '#365314',
          },
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-card-hover': '0 10px 25px -4px rgba(0, 0, 0, 0.08)',
        'dark-card': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'glow-cyan': '0 10px 24px -12px rgba(6, 182, 212, 0.5)',
        'glow-emerald': '0 10px 24px -12px rgba(16, 185, 129, 0.5)',
        'glow-gold': '0 10px 24px -12px rgba(245, 158, 11, 0.5)',
        'glow-rose': '0 10px 24px -12px rgba(244, 63, 94, 0.5)',
      },
    },
  },
  plugins: [],
};
