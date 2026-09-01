import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { applyThemeClass, THEME_COOKIE, writePrefCookie, type Theme } from "@/lib/prefs";

interface ThemeContextValue {
  /** `null` until mounted — the class on <html> is owned by the bootstrap script. */
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function currentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme | null>(null);

  useEffect(() => {
    setThemeState(currentTheme());
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writePrefCookie(THEME_COOKIE, next);
    applyThemeClass(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
