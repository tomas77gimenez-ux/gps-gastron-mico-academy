import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export type Theme = "light" | "dark";
export type LangCode = "es" | "en" | "pt";

export const THEME_COOKIE = "gps-theme";
export const LANG_COOKIE = "gps-lang";

export const DEFAULT_THEME: Theme = "dark";
export const DEFAULT_LANG: LangCode = "es";

const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [rawKey, ...rest] = part.split("=");
    if (rawKey?.trim() === name) return decodeURIComponent(rest.join("=").trim());
  }
  return undefined;
}

function normalizeTheme(value: string | undefined): Theme {
  return value === "light" || value === "dark" ? value : DEFAULT_THEME;
}

function normalizeLang(value: string | undefined): LangCode {
  return value === "es" || value === "en" || value === "pt" ? value : DEFAULT_LANG;
}

/**
 * Reads the UI preferences from the cookie on both sides of the render:
 * on the server from the incoming request, on the client from document.cookie.
 * Both return the same value, so SSR markup and hydration agree — no flash.
 */
export const readPrefs = createIsomorphicFn()
  .server((): { theme: Theme; lang: LangCode } => {
    const header = getRequestHeader("cookie");
    return {
      theme: normalizeTheme(readCookie(header, THEME_COOKIE)),
      lang: normalizeLang(readCookie(header, LANG_COOKIE)),
    };
  })
  .client((): { theme: Theme; lang: LangCode } => {
    const header = typeof document === "undefined" ? undefined : document.cookie;
    return {
      theme: normalizeTheme(readCookie(header, THEME_COOKIE)),
      lang: normalizeLang(readCookie(header, LANG_COOKIE)),
    };
  });

export function writePrefCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
}

export function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

/**
 * Runs before hydration. When there is no cookie yet, follows the OS preference
 * so the very first paint already matches what the user will end up seeing.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"${DEFAULT_THEME}";}var r=document.documentElement;r.classList.toggle("dark",t==="dark");r.style.colorScheme=t;}catch(e){}})();`;
