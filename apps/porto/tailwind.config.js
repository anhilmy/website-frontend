/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{html,js,vue}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#fdf8f3',
          100: '#f5ebe0',
          200: '#e6d5c3',
        },
        clay: {
          500: '#b07d56',
          600: '#96643e',
          700: '#7a4f2b',
        },
        bark: {
          800: '#4a3728',
          900: '#3b2c1e',
        },
        'cream-white': '#fffaf5',
      },
      fontFamily: {
        heading: ['Lora', 'Georgia', 'Playfair Display', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '768px',
      },
    },
  },
  plugins: [require('tailwindcss-primeui')],
}

