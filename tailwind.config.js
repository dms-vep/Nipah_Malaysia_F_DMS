//const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./homepage/.vitepress/**/*.{vue,js,html,md}",
    "./homepage/main/**/*.vue",
    "./homepage/visualizations/*.md",
    "./homepage/visualizations/posts/*.md",
  ],
  darkMode: "class",
  important: true,
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      }),
      backgroundImage: {
        "sky-dark": "linear-gradient(220deg, #d1d5db, #f9fafb)",
        "green": "linear-gradient(to top, #051937, #004d7a, #008793, #00bf72, #a8eb12)",
        red: "linear-gradient(120deg, #1e293b, #450a0a)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
