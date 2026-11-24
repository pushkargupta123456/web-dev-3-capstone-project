/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        krmu: {
          navy: '#082B5C',
          deep: '#061F45',
          blue: '#1261D5',
          light: '#EAF2FF',
          bg: '#F5F8FD',
          text: '#102B52',
          muted: '#72819A',
        },
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bbfc',
          400: '#8196f8',
          500: '#6271f1',
          600: '#4f56e5',
          700: '#4044ca',
          800: '#3639a3',
          900: '#082B5C',
          950: '#061F45',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
