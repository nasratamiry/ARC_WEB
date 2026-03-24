/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#7ff1ff',
          DEFAULT: '#00e2ff',
          dark: '#00b4cc',
        },
        arc: {
          background: '#f7fafc',
          surface: '#ffffff',
          muted: '#eef4f7',
          border: '#d8e3ea',
          text: '#0f172a',
          subtext: '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        layout: '1200px',
      },
      boxShadow: {
        soft: '0 10px 30px -18px rgba(15, 23, 42, 0.22)',
        card: '0 12px 30px -20px rgba(15, 23, 42, 0.2)',
      },
      spacing: {
        section: '5rem',
      },
    },
  },
  plugins: [],
}

