/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'disponible': '#10b981', // verde
        'reservada': '#f59e0b', // amarillo
        'pagada': '#ef4444', // rojo
      }
    },
  },
  plugins: [],
}
