/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        meituan: {
          yellow: '#F8B500',
          red: '#E63129',
        },
      },
    },
  },
  plugins: [],
}
