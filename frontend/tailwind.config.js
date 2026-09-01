/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map titan directly to true pitch black so old references never render white in dark mode
        titan: {
          950: '#000000',
          900: '#0A0A0A',
          850: '#111111',
          800: '#171717',
          700: '#262626',
          600: '#404040',
          500: '#737373',
          400: '#A3A3A3',
          300: '#D4D4D4',
          200: '#E5E5E5',
          100: '#F5F5F5',
          50: '#FAFAFA',
        },
        pitch: {
          950: '#000000', // Canvas
          900: '#080808', // Elevated background
          850: '#0F0F0F', // Card surface
          800: '#171717', // Hover state
          700: '#262626', // Borders
          600: '#404040',
          500: '#737373',
          400: '#A3A3A3',
          300: '#D4D4D4',
          100: '#F5F5F5',
          50: '#FFFFFF',
        },
        // Electric vibrant accents from Image 1 & 2
        electric: {
          lime: '#CCFF00',      // WizardZ highlight (Image 1)
          'lime-dark': '#A3CC00',
          coral: '#FF5533',     // Reference 2 accent
          'coral-dark': '#E03D1B',
          violet: '#B026FF',
          gold: '#FFD000',
          amber: '#FF9900',
        },
        bento: {
          cream: '#FFF7ED',
          peach: '#FFEEDB',
          mint: '#E6F9EC',
          lavender: '#EFEAFF',
          sky: '#E0F2FE',
          rose: '#FFE4E6',
        },
      },
      borderRadius: {
        pill: '9999px',
        control: '12px',
        btn: '14px',
        card: '20px',
        section: '26px',
        container: '32px',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        syne: ['"Syne"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-card-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.1)',
        'glass-light': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
        'glass-pitch': '0 8px 32px 0 rgba(0, 0, 0, 0.9)',
        'glow-lime': '0 0 25px -4px rgba(204, 255, 0, 0.45)',
        'glow-coral': '0 0 25px -4px rgba(255, 85, 51, 0.45)',
        'glow-gold': '0 0 25px -4px rgba(255, 208, 0, 0.45)',
      },
    },
  },
  plugins: [],
};
