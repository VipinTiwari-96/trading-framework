/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17201b',
        paper: '#f7f8f4',
        mint: '#dff5e8',
        forest: '#1e5c43',
        amberline: '#d69429'
      }
    }
  },
  plugins: []
};
