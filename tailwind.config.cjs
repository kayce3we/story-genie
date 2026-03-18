/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F0E2A',
        gold: '#F5C842',
        cream: '#FFF8E7',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Lato', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        book: '0 12px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}

