/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#09090b',
          card: '#18181b',
          text: '#f4f4f5',
          accent: '#d4af37',
        }
      }
    },
  },
  plugins: [],
}
