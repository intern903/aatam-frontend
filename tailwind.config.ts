import type { Config } from "tailwindcss";

// Design tokens from Figma: "Aatam - Bridge to I (Copy)".
// Colours = local paint styles. Type = "Mobile/*" text styles + Typography Primitives.
// Spacing, radii and shadows have no Figma variables; these are the recurring values on the screens.
// Theme keys below REPLACE Tailwind's defaults, so only design values are available.

const ramp = (values: string[]) =>
  Object.fromEntries(values.map((v, i) => [String((i + 1) * 100), v]));

const heatmap = (values: string[]) =>
  Object.fromEntries(values.map((v, i) => [String(i + 1), v]));

const px = (values: number[]) =>
  Object.fromEntries(values.map((v) => [String(v), `${v}px`]));

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: "#000000",

      primary: ramp(["#e5f1e5", "#cbe2cc", "#b2d4b2", "#98c599", "#7eb77f", "#659266", "#4c6e4c", "#324933"]),
      pink: ramp(["#fae8e6", "#f5d1cc", "#f1bab3", "#eca399", "#e78c80", "#b97066", "#8b544d", "#5c3833"]),
      blue: ramp(["#e2e8ef", "#c5d1df", "#a8bbce", "#8ba4be", "#6e8dae", "#58718b", "#425568", "#2c3846"]),
      yellow: ramp(["#f7edd9", "#f0dbb3", "#e8c88d", "#e1b667", "#d9a441", "#ae8334", "#826227", "#57421a"]),
      brown: ramp(["#f1e5dd", "#e3cabb", "#d6b099", "#c89577", "#ba7b55", "#956244", "#704a33", "#4a3122"]),
      background: {
        ...ramp(["#fefdfc", "#fefbf9", "#fdfaf6", "#fdf8f3", "#fcf6f0", "#cac5c0", "#979490", "#656260"]),
        DEFAULT: "#fcf6f0", // Background/500 — fill of every 393px screen
      },

      // Text colours (not styles in Figma; used across the screens)
      ink: {
        DEFAULT: "#000000",
        80: "rgb(0 0 0 / 0.8)",
        75: "rgb(0 0 0 / 0.75)",
        60: "rgb(0 0 0 / 0.6)",
        50: "rgb(0 0 0 / 0.5)",
        25: "rgb(0 0 0 / 0.25)",
        brown: "#423827",
      },

      heatmap: {
        brown: heatmap(["#f8ebe2", "#f4e0d2", "#f0d5c2", "#eccab1", "#e8bea1", "#e2b08d", "#dea57c", "#da9a6c", "#d68f5c", "#d2844b"]),
        green: heatmap(["#e2f8e6", "#d2f4d8", "#c2f0c9", "#b1ecbb", "#a1e8ad", "#8de29b", "#7cde8d", "#6cda7e", "#5cd670", "#4bd262"]),
        pink: heatmap(["#f8e2eb", "#f4d2e0", "#f0c2d5", "#ecb1ca", "#e8a1be", "#e28db0", "#de7ca5", "#da6c9a", "#d65c8f", "#d24b84"]),
        blue: heatmap(["#e2edf8", "#d2e3f4", "#c2d9f0", "#b1cfec", "#a1c4e8", "#8db8e2", "#7cadde", "#6ca3da", "#5c99d6", "#4b8fd2"]),
        yellow: heatmap(["#f8f3e2", "#f4ebd2", "#f0e4c2", "#ecddb1", "#e8d6a1", "#e2cd8d", "#dec67c", "#dabf6c", "#d6b85c", "#d2b04b"]),
      },
    },

    fontFamily: {
      heading: ["var(--font-poppins)", "sans-serif"], // family/heading
      body: ["var(--font-dm-sans)", "sans-serif"], // family/body
      mono: ["var(--font-jetbrains-mono)", "monospace"], // family/mono
    },

    fontWeight: {
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },

    // Mobile/* text styles: [size, { lineHeight, letterSpacing, fontWeight }]
    fontSize: {
      display: ["36px", { lineHeight: "43.2px", letterSpacing: "-0.54px", fontWeight: "600" }],
      h1: ["28px", { lineHeight: "35px", letterSpacing: "-0.28px", fontWeight: "600" }],
      h2: ["24px", { lineHeight: "31.2px", letterSpacing: "-0.24px", fontWeight: "600" }],
      h3: ["20px", { lineHeight: "27px", letterSpacing: "-0.1px", fontWeight: "500" }],
      h4: ["18px", { lineHeight: "25.2px", letterSpacing: "0px", fontWeight: "500" }],
      overline: ["12px", { lineHeight: "16.8px", letterSpacing: "0.72px", fontWeight: "600" }],
      "body-large": ["18px", { lineHeight: "25.6px", letterSpacing: "0px", fontWeight: "400" }],
      body: ["16px", { lineHeight: "21px", letterSpacing: "0px", fontWeight: "400" }],
      "body-medium": ["15px", { lineHeight: "22.5px", letterSpacing: "0px", fontWeight: "500" }],
      "body-small": ["13px", { lineHeight: "19.5px", letterSpacing: "0px", fontWeight: "400" }],
      caption: ["11px", { lineHeight: "15.4px", letterSpacing: "0.11px", fontWeight: "500" }],
      "button-cta": ["14px", { lineHeight: "14px", letterSpacing: "0.14px", fontWeight: "600" }],
      "stat-display": ["36px", { lineHeight: "39.6px", letterSpacing: "0px", fontWeight: "700" }],
      "stat-large": ["24px", { lineHeight: "27.6px", letterSpacing: "0px", fontWeight: "500" }],
      "data-table": ["14px", { lineHeight: "21px", letterSpacing: "0px", fontWeight: "400" }],
      "data-small": ["12px", { lineHeight: "16.8px", letterSpacing: "0px", fontWeight: "400" }],
      "micro-data": ["10px", { lineHeight: "13px", letterSpacing: "0px", fontWeight: "500" }],
    },

    // Keys are pixel values: p-16 = 16px.
    spacing: {
      0: "0px",
      px: "1px",
      ...px([2, 4, 6, 8, 10, 12, 16, 20, 24, 32]),
    },

    borderRadius: {
      none: "0px",
      ...px([2, 4, 8, 12, 16, 24]),
      pill: "9999px",
    },

    boxShadow: {
      none: "none",
      card: "0 0 12px 0 rgb(0 0 0 / 0.25)",
      "card-sm": "0 0 4px 0 rgb(0 0 0 / 0.25)",
      "input-inset": "inset 0 0 4px 0 rgb(0 0 0 / 0.25)",
      image: "0 0 12px 0 rgb(0 0 0 / 0.5)",
    },

    extend: {
      // Screens are designed at 393 × 852.
      width: { frame: "393px" },
      maxWidth: { frame: "393px" },
      minHeight: { frame: "852px" },
    },
  },
  plugins: [],
};
export default config;
