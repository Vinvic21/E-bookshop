// src/context/ThemeContext.jsx
// ─── Theme (Dark Mode) Context ─────────────────────────────────────────────
// Provides: theme ("light" | "dark"), toggleTheme(), isDark
// Persists choice to localStorage and applies it via a `data-theme` attribute
// on <html>, which GLOBAL_STYLES (theme.jsx) uses to re-skin surfaces for
// dark mode without touching every component's CSS.

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("stasho_theme");
      if (saved === "light" || saved === "dark") return saved;
      // Fall back to the user's OS preference on first visit
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
      return "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("stasho_theme", theme);
    } catch {
      /* ignore storage errors (e.g. private browsing) */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}