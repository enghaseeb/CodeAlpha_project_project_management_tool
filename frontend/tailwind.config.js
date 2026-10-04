/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14171F',
          soft: '#3A3F4B',
        },
        paper: {
          DEFAULT: '#F6F7F5',
          card: '#FFFFFF',
          line: '#E4E6E1',
        },
        brand: {
          50: '#EAF5F3',
          100: '#CEE9E4',
          200: '#9CD3C9',
          300: '#65B9AC',
          400: '#33A092',
          500: '#0D7A6E',
          600: '#0B685E',
          700: '#09564D',
          800: '#07443D',
          900: '#05332D',
        },
        amber: { DEFAULT: '#B45309' },
        coral: { DEFAULT: '#C2410C' },
        crimson: { DEFAULT: '#B91C1C' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(20 23 31 / 0.04), 0 8px 24px -12px rgb(20 23 31 / 0.12)',
        card: '0 1px 0 rgb(20 23 31 / 0.04)',
        lift: '0 12px 28px -10px rgb(20 23 31 / 0.28)',
      },
      borderRadius: {
        card: '10px',
      },
      transitionDuration: {
        120: '120ms',
        150: '150ms',
      },
    },
  },
  plugins: [],
};
