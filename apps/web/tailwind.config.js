/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        ink: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#1f2a44',
          900: '#0f172a',
          950: '#0b1220',
        },
        sand: {
          50: '#fbf8f3',
          100: '#f5efe6',
          200: '#e8ddcf',
          300: '#d6c7b4',
          400: '#c0ab92',
          500: '#a68f72',
          600: '#8a745a',
          700: '#6f5b46',
          800: '#594a3a',
          900: '#4a3f32',
        },
      },
    },
  },
  plugins: [],
}
