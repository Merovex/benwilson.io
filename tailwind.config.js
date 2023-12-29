// import default style and colors:
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
module.exports = {
  content: [
    '_includes/**/*.html',
    '_layouts/**/*.html',
    '*.markdown'
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        gray: colors.gray
      },
      fontFamily: {
        sans: ['Atkinson Hyperlegible', ...defaultTheme.fontFamily.sans],
        display: ['Fjalla One', ...defaultTheme.fontFamily.sans],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
