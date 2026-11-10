import type { Config } from "tailwindcss";

/** Colours are CSS variables defined in src/styles/tokens.css (light + dark). */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        raised: token("raised"),
        line: token("line"),
        ink: token("ink"),
        muted: token("muted"),
        faint: token("faint"),
        moon: token("moon"),
        gold: token("gold"),
        sky: token("sky"),
        rose: token("rose"),
      },
      fontFamily: {
        display: ['"Fraunces Variable"', "Georgia", "serif"],
        sans: ['"Inter Variable"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: { xl: "1rem", "2xl": "1.5rem" },
      screens: { xs: "400px" },
      transitionTimingFunction: { out: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    },
  },
  plugins: [],
} satisfies Config;
