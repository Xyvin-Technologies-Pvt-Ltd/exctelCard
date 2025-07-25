/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF6B35" /* Modern Exctel orange */,
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        secondary: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#333333" /* Dark gray for text */,
          900: "#111111" /* Almost black */,
        },
        accent: {
          50: "#e6f7ff",
          100: "#bae3ff",
          200: "#7cc4ff",
          300: "#47a3f3",
          400: "#2186eb",
          500: "#0967d2",
          600: "#0552b5",
          700: "#03449e",
          800: "#01337d",
          900: "#002159",
        },
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.08)",
        button: "0 2px 8px rgba(0, 0, 0, 0.12)",
        "card-hover": "0 10px 30px rgba(0, 0, 0, 0.15)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      backgroundImage: {
        "diagonal-pattern": "linear-gradient(135deg, white 70%, #f0f0f0 70%)",
        "card-gradient": "linear-gradient(160deg, #ffffff 60%, #f6f6f6 100%)",
      },
    },
  },
  plugins: [],
};
