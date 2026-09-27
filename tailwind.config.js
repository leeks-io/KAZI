/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          950: '#0C0A1D',
          900: '#12102A',
          800: '#191638',
          700: '#231F4D',
        },
        terracotta: {
          DEFAULT: '#E8632C',
          hover: '#D2531F',
          light: '#F38152',
        },
        ochre: {
          DEFAULT: '#F2A03D',
          hover: '#E08F2C',
          light: '#F5B462',
        },
        offwhite: '#F5F0E8',
        kazi: {
          green: '#1A5C38',
          greenMid: '#2E7D52',
          greenLight: '#E8F5EE',
          greenHover: '#155130',
          gold: '#F5A623',
          goldLight: '#FEF3DC',
          charcoal: '#1C1C1E',
          body: '#4A4A4A',
          muted: '#8A8A8A',
          border: '#E2EDE7',
          bg: '#F7FAF8',
          bg2: '#F0F5F2'
        }
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
