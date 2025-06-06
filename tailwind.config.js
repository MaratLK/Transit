/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  safelist: [
    'animate-fade-in',
    'fade-in-active',
    'animate-moveCar',
    'animate-fade-in-out'
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
        'fade-in-out': "fade-in-out 4.5s ease forwards",
      },
      keyframes: {
        moveCar: {
          "0%": { transform: "translateX(-100%) scaleX(-1)" },
          "100%": { transform: "translateX(100vw) scaleX(-1)" } 
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        'fade-in-out': {
          "0%, 100%": { opacity: "0", transform: "translateY(10px)" },
          "10%, 90%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
