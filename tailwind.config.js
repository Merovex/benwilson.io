// import default style and colors:
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
module.exports = {
  content: [
    '_includes/**/*.html',
    '_includes/**/*.html',
    '_layouts/**/*.html',
    '_posts/**/*.md',
    '_pages/**/*.md',
    '_tools/**/*.html',
    '*.{markdown,md,html}'
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        gray: colors.gray,
        heatmap: colors.emerald,
      },
      fontFamily: {
        sans: ['Atkinson Hyperlegible', ...defaultTheme.fontFamily.sans],
        display: ['Fjalla One', ...defaultTheme.fontFamily.sans],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("@tailwindcss/forms")({
      // strategy: 'base', // only generate global styles
      strategy: 'class', // only generate classes
    }),
  ],
}
