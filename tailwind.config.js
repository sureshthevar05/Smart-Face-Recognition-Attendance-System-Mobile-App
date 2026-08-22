/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1E4D",
          dark: "#081538",
          light: "#132a63",
        },
        gold: {
          DEFAULT: "#F5A623",
          light: "#FCD9A0",
        },
        brand: {
          blue: "#2563EB",
          "blue-dark": "#1D4ED8",
          "blue-light": "#EFF4FF",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
        },
        surface: {
          DEFAULT: "#F5F7FB",
          card: "#FFFFFF",
          border: "#E5E9F2",
          muted: "#6B7280",
        },
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
