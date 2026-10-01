/** Design tokens: colors, type, radius, shadows, glow, motion */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#080706",
        surface: "#14110F",
        "surface-raised": "#1C1815",
        "surface-hover": "#25201C",
        ember: "#FF5500",
        flame: "#FF7A1A",
        gold: "#FFC83B",
        deep: "#8B2200",
        crimson: "#5A1200",
        muted: "#9E9690",
        "muted-light": "#C4BCB5",
        ink: "#FAF6F0",
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
        glass: "14px",
      },
      boxShadow: {
        glow: "0 0 50px -10px rgba(255, 85, 0, 0.55)",
        "glow-lg": "0 0 80px -12px rgba(255, 122, 26, 0.7)",
        "glow-gold": "0 0 50px -10px rgba(255, 200, 59, 0.5)",
        lift: "0 24px 64px -24px rgba(0, 0, 0, 0.9)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      transitionDuration: { ui: "400ms", slow: "900ms" },
      transitionTimingFunction: { cine: "cubic-bezier(.76,0,.24,1)", out: "cubic-bezier(.16,1,.3,1)" },
      maxWidth: { shell: "1320px" },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        }
      }
    },
  },
  plugins: [],
};

