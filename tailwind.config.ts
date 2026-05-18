import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50:  "#f0faf4",
          100: "#d8f3e3",
          200: "#b3e6c9",
          300: "#7ed0a8",
          400: "#52b788",
          500: "#2d9e68",
          600: "#2d6a4f",
          700: "#245740",
          800: "#1e4534",
          900: "#19382b",
        },
        brand: {
          DEFAULT: "#2d6a4f",
          light:   "#52b788",
          dark:    "#1e4534",
        },
        surface: "#F4EDE0",
        card:    "#ffffff",
        border:  "#DED4C0",
        muted:   "#7a6f5e",
        festival: "#f59e0b",
        speaker:  "#7c3aed",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl:  "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};
export default config;
