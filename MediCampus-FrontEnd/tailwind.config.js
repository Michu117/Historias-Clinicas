/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hc: {
          primary: '#475569',
          primaryHover: '#334155',
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
        },
      },
      borderRadius: {
        global: '0.375rem',
      },
    },
  },
  plugins: [],
};
