/**
 * ThemeContext — manages light/dark mode, persisted in localStorage so the
 * choice survives a page refresh. Applies/removes the `dark` class on
 * <html>, which our index.css @custom-variant uses to drive all `dark:`
 * utility classes throughout the app.
 *
 * Default: respects the user's OS preference on first visit (via
 * `prefers-color-scheme`), then remembers whatever they explicitly choose
 * afterward.
 */

import { useState, useEffect, useCallback } from "react";
import { THEME_STORAGE_KEY } from "../utils/constants";
import { ThemeContext } from "./theme-context";

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
