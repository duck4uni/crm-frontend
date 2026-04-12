import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Background colors
    'bg-primary-500', 'bg-primary-600',
    'bg-green-500', 'bg-green-600',
    'bg-orange-500', 'bg-orange-600', 'bg-orange-700',
    'bg-yellow-500', 'bg-yellow-600',
    'bg-red-500', 'bg-red-600',
    'bg-purple-500', 'bg-purple-600',
    'bg-cyan-500', 'bg-cyan-600',
    'bg-pink-500', 'bg-pink-600',
    'bg-indigo-500', 'bg-indigo-600',
    'bg-gray-500', 'bg-gray-600',
    'bg-emerald-500', 'bg-emerald-600',
    'bg-amber-500', 'bg-amber-600',
    'bg-teal-500', 'bg-teal-600',
    'bg-rose-500', 'bg-rose-600',
    'bg-violet-500', 'bg-violet-600',
    'bg-lime-500', 'bg-lime-600',
    // Text colors
    'text-white',
  ],
  theme: {
    extend: {
      colors: {
        // Primary: Indigo — matches mobile theme PRIMARY #4F46E5
        primary: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // PRIMARY_LIGHT
          600: "#4f46e5", // PRIMARY (main)
          700: "#4338ca", // PRIMARY_DARK
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Secondary: Cyan — matches mobile theme SECONDARY #06B6D4
        secondary: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
      },
    },
  },
  plugins: [],
};
export default config;
