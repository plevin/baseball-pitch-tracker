/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'baseball-red': '#e61b23',
        'baseball-blue': '#0f52ba',
        'baseball-green': '#00875a',
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}
