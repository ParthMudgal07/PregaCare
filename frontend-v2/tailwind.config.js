module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#e0e7ff', // Soft lavender
          DEFAULT: '#6366f1', // Indigo/Purple
          dark: '#4f46e5',
        },
      },
      borderRadius: {
        '2xl': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
