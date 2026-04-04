/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#7ff1ff',
          DEFAULT: '#00e2ff',
          dark: '#00a8bf',
          deeper: '#008fa3',
        },
        accent: {
          DEFAULT: '#0099ff',
          dark: '#0077cc',
        },
        arc: {
          background: '#ffffff',
          surface: '#ffffff',
          muted: '#f0f9fc',
          border: '#cfe8f0',
          text: '#0a1628',
          subtext: '#4a6578',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        // Align site container with Tailwind `max-w-7xl` (1280px) for consistent enterprise layouts
        layout: '80rem',
      },
      boxShadow: {
        soft: '0 10px 40px -20px rgba(0, 34, 51, 0.12)',
        card: '0 14px 40px -24px rgba(0, 34, 51, 0.14)',
        lift: '0 24px 48px -28px rgba(0, 120, 140, 0.22)',
        glow: '0 0 40px -8px rgba(0, 226, 255, 0.45)',
      },
      spacing: {
        section: '5.5rem',
      },
      transitionDuration: {
        400: '400ms',
      },
      keyframes: {
        'fade-slide-in': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal-up': {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-slide-in': 'fade-slide-in 0.65s ease-out both',
        'reveal-up': 'reveal-up 0.75s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
