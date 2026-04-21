import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-foreground)",
        accent: "var(--color-accent)",
        muted: "var(--color-muted)",
        secondary: "var(--color-secondary)",
        surface: "var(--color-surface)",
      },
      fontFamily: {
        heading: ["var(--font-cormorant)", "var(--font-noto-serif)", "Georgia", "serif"],
        body: ["var(--font-noto-serif)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", '"Fira Code"', "monospace"],
      },
      spacing: {
        "space-1": "var(--space-1)",
        "space-2": "var(--space-2)",
        "space-3": "var(--space-3)",
        "space-4": "var(--space-4)",
        "space-5": "var(--space-5)",
        "space-6": "var(--space-6)",
        "space-8": "var(--space-8)",
      },
      borderRadius: {
        "radius-sm": "var(--radius-sm)",
        "radius-md": "var(--radius-md)",
        "radius-lg": "var(--radius-lg)",
        "radius-full": "var(--radius-full)",
      },
      transitionTimingFunction: {
        "out-expo": "var(--ease-out-expo)",
        "out-quart": "var(--ease-out-quart)",
      },
      transitionDuration: {
        "micro": "var(--duration-micro)",
        "standard": "var(--duration-standard)",
        "page": "var(--duration-page)",
      },
      backdropBlur: {
        glass: "24px",
        "glass-strong": "32px",
        "glass-subtle": "16px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
