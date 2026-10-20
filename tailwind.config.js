export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { cyan: { brand: '#19E3E0' }, purple: { brand: '#8A2BE2' }, orange: { brand: '#FF9F1C' } },
    fontFamily: { sans: ['Montserrat', 'system-ui', 'sans-serif'] },
  } },
  plugins: [],
}
