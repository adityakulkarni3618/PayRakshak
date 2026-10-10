import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: { 950: "#070D1A", 900: "#0B1426", 800: "#111C33", 700: "#1B2A47", 500: "#5B6B8A", 200: "#D5DCE8", 100: "#E9EEF6", 50: "#F4F7FB" }, cy: { 400: "#22D3EE", 500: "#06B6D4", 600: "#0891B2", 700: "#0E7490" } },
      fontFamily: { sans: ['"Space Grotesk"', "system-ui", "sans-serif"], display: ["Syne", '"Space Grotesk"', "sans-serif"], mono: ['"JetBrains Mono"', "ui-monospace", "monospace"] },
    },
  },
  plugins: [],
} satisfies Config;
