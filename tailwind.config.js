// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DB2777', // Primary pink color
          light: '#EC4899',
          dark: '#BE185D',
        },
        secondary: {
          DEFAULT: '#4F46E5', // Indigo
          light: '#6366F1',
          dark: '#4338CA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
  ],
}