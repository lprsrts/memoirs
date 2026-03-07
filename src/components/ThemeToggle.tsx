"use client";

import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      title="Toggle theme"
      style={{
        background: "none",
        border: "1px solid var(--border)",
        color: "var(--fg-muted)",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        padding: "5px 10px",
        cursor: "pointer",
        letterSpacing: "1px",
        transition: "border-color 0.2s, color 0.2s",
      }}
    >
      {theme === "light" ? "[ DARK ]" : "[ LIGHT ]"}
    </button>
  );
}
