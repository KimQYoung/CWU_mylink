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
        canvas: "#0a0a0a",
        "canvas-soft": "#1a1c20",
        "canvas-card": "#191919",
        "canvas-mid": "#363a3f",
        hairline: "#212327",
        ink: "#ffffff",
        body: "#dadbdf",
        "body-mid": "#7d8187",
        sunset: "#ff7a17",
        "sunset-soft": "#ffc285",
        dusk: "#7c3aed",
        twilight: "#c4b5fd",
        breeze: "#a0c3ec",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
