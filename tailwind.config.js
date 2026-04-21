/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#002D62',
        alert: '#FF8C00',
        caution: '#F6C445',
      },
      boxShadow: {
        institutional: '0 10px 25px rgba(0, 45, 98, 0.15)',
      },
    },
  },
  plugins: [],
}

