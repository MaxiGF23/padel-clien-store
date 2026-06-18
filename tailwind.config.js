export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101411",
        forest: "#0f3d2e",
        "forest-dark": "#0b2f24",
        "forest-deep": "#214a35",
        "forest-bright": "#4b9b61",
        mint: "#dbeade",
        paper: "#f7f7f5",
        line: "#e8e8e4",
        cloud: "#f2f2f0",
        fog: "#f4f4f3"
      },
      boxShadow: { soft: "0 10px 30px rgba(16, 20, 17, 0.08)" },
      keyframes: {
        "toast-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: { "toast-in": "toast-in 0.2s ease-out" }
    }
  },
  plugins: []
};
