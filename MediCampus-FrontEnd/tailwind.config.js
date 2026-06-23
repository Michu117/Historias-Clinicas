/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hc: {
          bg: '#f9f9ff',
          primary: '#003f87',
          primaryHover: '#004491',
          primaryText: '#ffffff',
          secondary: '#e9eefc',
          secondaryHover: '#e4e8f6',
          secondaryText: '#006a61',
          tertiary: 'transparent',
          tertiaryHover: '#f0f3ff',
          tertiaryText: '#424752',
          danger: '#ba1a1a',
          dangerHover: '#93000a',
          dangerText: '#ffffff',
          success: '#006a61',
          successHover: '#005049',
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
