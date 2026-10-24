/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          50: '#fffaf5',
          100: '#fdf3e7',
          200: '#f9e3c9',
          300: '#f4cca1',
          400: '#eb9b4a',
          500: '#d97706', // warm golden amber
          600: '#b45309',
          700: '#8c3d08',
          800: '#6d2f09',
          900: '#451a03', // rich dark bakery brown
          accent: '#e11d48' // festive strawberry/rose red
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
