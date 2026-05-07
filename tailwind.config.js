/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#002D62',
          50: '#E6EDF7',
          100: '#C0D0EA',
          200: '#8AACD9',
          300: '#5488C8',
          400: '#2864B7',
          500: '#002D62',
          600: '#002554',
          700: '#001D43',
          800: '#001432',
          900: '#000C21',
        },
        gold: {
          DEFAULT: '#E6B400',
          50: '#FFF9E6',
          100: '#FFEDB8',
          200: '#FFE08A',
          300: '#FFD45C',
          400: '#FFC72E',
          500: '#E6B400',
          600: '#BF9600',
          700: '#997800',
          800: '#735A00',
          900: '#4D3C00',
        },
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
