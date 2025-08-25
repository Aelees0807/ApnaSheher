// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <-- Make sure this line looks like this
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}