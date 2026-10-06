/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg-canvas)",
        surface: "var(--bg-surface)",
        border: "var(--border-subtle)",
        subtle: "var(--border-subtle)",
        foreground: "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        amber: {
          primary: "var(--accent-primary)",
          hover: "var(--accent-hover)",
          surface: "var(--accent-surface)",
        },
        background: "var(--bg-canvas)",
        card: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        primary: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-hover)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--bg-surface)",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent-surface)",
          foreground: "var(--accent-primary)",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

