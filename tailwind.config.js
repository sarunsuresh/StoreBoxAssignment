/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // VS Code-ish palette
        vscode: {
          bg: "#ffffff",
          panel: "#f3f3f3",
          border: "#e5e7eb",
          hover: "#f0f4f9",
          selected: "#e6f0fb",
          text: "#1f2328",
          muted: "#6b7280",
          accent: "#2563eb",
        },
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
