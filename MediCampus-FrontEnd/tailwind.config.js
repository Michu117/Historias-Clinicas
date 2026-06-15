/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hc: {
          primary: '#0056b3',
          primaryHover: '#003f87',
          primaryText: '#ffffff',
          secondary: '#e2e8f0',
          secondaryHover: '#cbd5e1',
          secondaryText: '#334155',
          tertiary: 'transparent',
          tertiaryHover: '#f1f5f9',
          tertiaryText: '#475569',
          danger: '#ef4444',
          dangerHover: '#dc2626',
          dangerText: '#ffffff',
          success: '#22c55e',
          successHover: '#16a34a',
          successText: '#ffffff',
          bg: '#faf9ff',
          text: '#141b2b',
          muted: '#424752',
          border: '#c2c6d4',
          sidebar: '#f1f3ff',
          accent: '#003f87',
        },
      },
      borderRadius: {
        global: '0.375rem',
      },
    },
  },
  plugins: [],
};
