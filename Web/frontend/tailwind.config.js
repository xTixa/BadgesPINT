// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        brand: {
          50: "#EEF6FF",
          100: "#D9EAFE",
          200: "#B7D6FE",
          300: "#8ABAFE",
          400: "#5C9AFD",
          500: "#0F62FE",
          600: "#0B55DD",
          700: "#16558C",
          800: "#124878",
          900: "#0B2D4D",
          accent: "#00AEEF",
        },
        primary: "#0F62FE", // Azul escuro
        accent: "#00AEEF", // Azul claro
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
      fontSize: {
        xs: ["0.75rem", "1rem"],
        sm: ["0.875rem", "1.25rem"],
        base: ["1rem", "1.5rem"],
        lg: ["1.125rem", "1.75rem"],
        xl: ["1.25rem", "1.75rem"],
        "2xl": ["1.5rem", "2rem"],
        "3xl": ["1.875rem", "2.25rem"],
      },
    },
  },
  plugins: [],
};
