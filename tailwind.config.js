export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6', // Teal-500
          600: '#0d9488', // Teal-600
          700: '#0f766e',
        }
      }
    },
  },
  plugins: [],
}
