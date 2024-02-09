// import default style and colors:
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
module.exports = {
  content: [
    '_includes/**/*.html',
    '_includes/**/*.html',
    '_layouts/*.html',
    '_posts/**/*.md',
    '_pages/**/*.md',
    '_tools/**/*.html',
    'assets/**/*.js',
    '*html',
    '*.{markdown,md,html}'
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        xgray: colors.gray,
        heatmap: colors.emerald,
        grey: {
          50: "#F6F7F9",
          100: "#EDEFF2",
          200: "#DBDFE6",
          300: "#C3CAD5",
          400: "#ABB4C4",
          500: "#8D9AAF",
          600: "#677793",
          700: "#333B49",
          800: "#2A313C",
          900: "#171B21",
          950: "#171B21"
        },
        gray: {
          50: "#E8EAEE",
          100: "#D9DDE3",
          200: "#C1C8D1",
          300: "#A7B1BE",
          400: "#909CAD",
          500: "#78879B",
          600: "#627084",
          700: "#505C6D",
          800: "#3D4652",
          900: "#2B323B",
          950: "#22272E"
        },
        xgray: {
          50: "#F9FAFB",
          100: "#F0F2F4",
          200: "#E2E5E9",
          300: "#D0D5DC",
          400: "#BEC5CF",
          500: "#ADB6C2",
          600: "#95A1B1",
          700: "#78879B",
          800: "#596678",
          900: "#22272E",
          950: "#16191D"
        }
      },
      fontFamily: {
        sans: ['Atkinson Hyperlegible', ...defaultTheme.fontFamily.sans],
        display: ['Fjalla One', ...defaultTheme.fontFamily.sans],
      }
    },
  },
  darkMode: ['class', '[data-color-scheme="dark"]'],
  plugins: [
    require('@tailwindcss/typography'),
    require("@tailwindcss/forms")({
      // strategy: 'base', // only generate global styles
      strategy: 'class', // only generate classes
    }),
  ],
}
