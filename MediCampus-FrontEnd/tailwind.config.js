/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hc: {
          bg: '#f6faf9',
          primary: '#006766',
          primaryHover: '#00504e',
          primaryText: '#ffffff',
          secondary: '#f0f4f3',
          secondaryHover: '#e5e9e8',
          secondaryText: '#565e74',
          tertiary: 'transparent',
          tertiaryHover: '#f0f4f3',
          tertiaryText: '#3e4948',
          danger: '#ba1a1a',
          dangerHover: '#93000a',
          dangerText: '#ffffff',
          success: '#006766',
          successHover: '#00504e',
          successText: '#ffffff',
        },
      },
      borderRadius: {
        global: '0.75rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
