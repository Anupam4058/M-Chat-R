/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.4' }],
        'sm': ['0.8125rem', { lineHeight: '1.5' }],
        'base': ['0.9375rem', { lineHeight: '1.5' }],
        'lg': ['1rem', { lineHeight: '1.5' }],
        'xl': ['1.125rem', { lineHeight: '1.4' }],
        '2xl': ['1.25rem', { lineHeight: '1.4' }],
        '3xl': ['1.5rem', { lineHeight: '1.3' }],
        '4xl': ['1.75rem', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
}