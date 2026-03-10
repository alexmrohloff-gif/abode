/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "SF Pro Text", "sans-serif"]
      },
      colors: {
        brand: {
          DEFAULT: "#0f766e", // teal
          soft: "#ccfbf1",
          dark: "#115e59"
        }
      }
    }
  },
  plugins: []
};
