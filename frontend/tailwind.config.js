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
          50: '#f3f4f6',
          100: '#e5e7eb',
          200: '#d1d5db',
          300: '#9ca3af',
          400: '#4b5563',
          500: '#1f2937',
          600: '#111827',
          700: '#030712',
        },
        brand: {
          50: '#f4f5ff',
          100: '#ebeeff',
          200: '#dbe0ff',
          300: '#b8c2ff',
          400: '#8d9cff',
          500: '#5c6cff',
          600: '#4751ff',
          700: '#373cff',
          800: '#2226cc',
          900: '#151780',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
