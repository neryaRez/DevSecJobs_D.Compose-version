/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:["Inter", "sans-serif"],
      },
      colors: {
        primary: "#ff4f4f",
        secondary: "#4f4fff",
      },
    },
  },
  plugins: [],
}
