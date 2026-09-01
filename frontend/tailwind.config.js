/** @type {import('tailwindcss').Config} */
const VOID = '#1E2328';
const PRIMARY = '#2A2F35';
const SURFACE = '#3B4046';
const ORANGE = '#F6A403';
const GOLD = '#F5B402';
const LIGHT = '#FED255';
const palette = { 50: LIGHT, 100: LIGHT, 200: LIGHT, 300: GOLD, 400: GOLD, 500: ORANGE, 600: ORANGE, 700: SURFACE, 800: PRIMARY, 900: PRIMARY, 950: VOID };

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    // Existing utility names resolve to this one restrained palette.
    colors: { transparent: 'transparent', current: 'currentColor', black: VOID, white: LIGHT, slate: palette, cyan: palette, blue: palette, emerald: palette, amber: palette, teal: palette, rose: palette, red: palette, purple: palette, violet: palette, yellow: palette },
    extend: {
      colors: { titan: { 950: VOID, 900: PRIMARY, 850: PRIMARY, 800: SURFACE, 700: SURFACE, 600: ORANGE, 500: ORANGE, 400: GOLD, 300: GOLD, 200: LIGHT, 100: LIGHT }, cyber: { cyan: ORANGE, emerald: ORANGE, gold: GOLD, crimson: GOLD, violet: GOLD, blue: ORANGE } },
      fontFamily: { sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'], display: ['"Outfit"', '"Inter"', 'system-ui', 'sans-serif'], mono: ['"JetBrains Mono"', 'monospace'] },
      boxShadow: { 'glow-cyan': '0 10px 24px -16px rgba(246, 164, 3, 0.8)', 'glow-emerald': '0 10px 24px -16px rgba(246, 164, 3, 0.8)', 'glow-gold': '0 10px 24px -16px rgba(245, 180, 2, 0.8)', 'glow-crimson': '0 10px 24px -16px rgba(245, 180, 2, 0.7)', 'glow-violet': '0 10px 24px -16px rgba(245, 180, 2, 0.7)' },
    },
  },
  plugins: [],
};
