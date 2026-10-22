/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{html,js,vue}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F0E6',
        'paper-2': '#EFE7D8',
        'paper-3': '#E7DCC7',
        ink: '#1A1613',
        'ink-2': '#57503F',
        'ink-3': '#8A8071',
        line: 'rgba(26,22,19,0.14)',
        'line-strong': 'rgba(26,22,19,0.28)',
        ember: '#E4572E',
        'ember-2': '#C2441F',
        sage: '#6B7A5A',
        mustard: '#C8922A',
        teal: '#2F6F6B',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '3px',
      },
      boxShadow: {
        plate: '0 1px 0 rgba(26,22,19,0.05), 0 8px 24px -16px rgba(26,22,19,0.35)',
        lift: '0 2px 0 rgba(26,22,19,0.06), 0 18px 40px -22px rgba(26,22,19,0.45)',
      },
    },
  },
  plugins: [require('tailwindcss-primeui')],
}
