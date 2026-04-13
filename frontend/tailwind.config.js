export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        "fill-width": {
          "0%": { width: "0%" },
          "100%": { width: "100%" }
        }
      },
      animation: {
        "fill-width": "fill-width 1.5s ease forwards"
      }
    }
  },
  plugins: []
};
