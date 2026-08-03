/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5EFDE',
        aura: {
          strangerthings: '#F0501E',
          modemachine: '#0F7EA3',
          cashsansclash: '#F2C230',
          yaquoi: '#9C4F9C',
          numero10: '#2CA6A0',
          bonus: '#C7A06E',
          joker: '#8CACB6',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', '"Poppins"', 'sans-serif'],
        rounded: ['"Quicksand"', '"Nunito"', 'sans-serif'],
      },
      borderRadius: {
        card: '1.25rem',
      },
    },
  },
  plugins: [],
}
