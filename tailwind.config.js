export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { ink: "#101411", forest: "#0f3d2e", mint: "#dbeade", paper: "#f7f7f5", line: "#e8e8e4" },
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
