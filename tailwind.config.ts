/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF8F3",
        sage: {
          50: "#F4F6F0",
          100: "#EDF1E6",
          200: "#D9E2CC",
          400: "#9CB28E",
          600: "#7C9473",
          800: "#4D5C46",
        },
        clay: {
          100: "#F6E8D8",
          400: "#D9A06B",
          600: "#B97D45",
        },
        moss: {
          900: "#3F4438",
          600: "#5C6353",
          400: "#8A8F7E",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl: "20px",
        "2xl": "28px",
      },
      boxShadow: {
        soft: "0 2px 16px rgba(63, 68, 56, 0.06)",
        card: "0 1px 8px rgba(63, 68, 56, 0.05)",
      },
    },
  },
  plugins: [],
};
