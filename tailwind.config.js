/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: '#1D9E75', 50: '#E8F7F2', 100: '#C5EBDA', 500: '#1D9E75', 600: '#178A63' },
        blue: { DEFAULT: '#378ADD', 50: '#EBF3FB', 500: '#378ADD', 600: '#2B72C4' },
        orange: { DEFAULT: '#BA7517', 50: '#FBF2E3', 500: '#BA7517' },
        red: { DEFAULT: '#E24B4A', 50: '#FDE9E9', 500: '#E24B4A' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '12px' },
    },
  },
  plugins: [],
}
