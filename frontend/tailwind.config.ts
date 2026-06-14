import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        '.perspective-1000': { perspective: '1000px' },
        '.backface-hidden': { 'backface-visibility': 'hidden' },
        '.preserve-3d': { 'transform-style': 'preserve-3d' },
        '.bg-white\\/2': { 'background-color': 'rgba(255,255,255,0.02)' },
        '.bg-white\\/3': { 'background-color': 'rgba(255,255,255,0.03)' },
      });
    },
  ],
};
export default config;
