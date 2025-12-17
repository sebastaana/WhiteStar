export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          metal: "#23272F",
          gold: "#D4AF37"
        },
        light: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          input: "#F1F5F9",
          txt: "#1E293B",
          muted: "#64748B",
          hover: "#F1F5F9"
        },
        dark: {
          bg: "#181A20",
          card: "#23272F",
          border: "#2D3340",
          input: "#23272F",
          txt: "#F3F3F6",
          muted: "#A6AAB9"
        }
      },
      boxShadow: {
        "metal-soft": "0 4px 24px rgba(32,36,42,0.25)"
      }
    }
  },
  plugins: []
}
