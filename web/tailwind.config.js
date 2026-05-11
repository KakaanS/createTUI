/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        ink: "#0b0c10",
        panel: "#16181d",
        accent: "#7d56f4",
        hot: "#ffa500",
        muted: "#6b7280",
      },
    },
  },
  plugins: [],
}
