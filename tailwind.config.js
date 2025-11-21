/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matsu: {
          bg: '#E6D5B8',
          text: '#4A3B2A',
          primary: '#8B9D5E',
          primaryHover: '#73824D',
          card: '#F0E6D2',
          border: '#8B7355',
        }
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
      }
    },
  },
  plugins: [],
}
