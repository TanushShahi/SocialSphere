/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sphere: {
          pink: '#E1306C',
          purple: '#C13584',
          yellow: '#FCAF45',
          orange: '#F56040',
          blue: '#3897F0',
          darkBg: '#000000',
          darkSurface: '#121212',
          darkBorder: '#262626',
          darkHover: '#1c1c1c',
          lightBg: '#FFFFFF',
          lightSurface: '#FAFAFA',
          lightBorder: '#DBDBDB',
          lightHover: '#F2F2F2'
        }
      },
      keyframes: {
        'heart-burst': {
          '0%': { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
          '50%': { transform: 'scale(1.25) rotate(0deg)', opacity: '1' },
          '80%': { transform: 'scale(0.95)', opacity: '0.9' },
          '100%': { transform: 'scale(0)', opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      },
      animation: {
        'heart-burst': 'heart-burst 0.85s ease-out forwards',
        'fade-in': 'fade-in 0.25s ease-out forwards',
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
