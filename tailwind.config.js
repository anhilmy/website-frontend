/** @type {import('tailwindcss').Config} */
export default {
  purge: ['./src/**/*.{vue,js,ts,jsx,tsx}'],
  content: ["./src/**/*.{html,js,vue}"],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss-primeui')],
}

