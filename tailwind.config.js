/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    'animate-fade-in', 'fade-in-active', 'animate-moveCar'
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a2b4c",
      },
      fontFamily: {
        exo: ["Exo 2", "sans-serif"],
      },
      animation: {
        moveCar: "moveCar 8s linear infinite",
        fadeIn: "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        moveCar: {
          "0%": { transform: "translateX(-100%) scaleX(-1)" }, /* Начинает слева */
          "100%": { transform: "translateX(100vw) scaleX(-1)" } /* Уезжает вправо */
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
