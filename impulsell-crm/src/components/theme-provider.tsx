"use client"

// ThemeProvider: dark / light / system modes.
// Default é DARK (conforme requisito do usuário).
// Persiste no localStorage e aplica via classe `.dark` / `.light` no <html>.
//
// Implementação:
// - `useSyncExternalStore` para reagir a mudanças no localStorage entre abas.
// - Script anti-flash em <head> (themeInitScript) aplica o tema antes do
//   React hidratar para evitar flash de cor.
// - `getServerSnapshot` retorna "dark" para SSR (consistente com o default).
// - `resolvedTheme` é derivado de `theme` + matchMedia (subscribed).

import * as React from "react"

export type Theme = "dark" | "light" | "system"

type ResolvedTheme = "dark" | "light"

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "impulsell-theme"

function isValidTheme(v: unknown): v is Theme {
  return v === "dark" || v === "light" || v === "system"
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  try {
    const v = window.localStorage.getItem(STORAGE_KEY)
    if (isValidTheme(v)) return v
  } catch {
    /* localStorage indisponível */
  }
  return "dark"
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyThemeClass(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.classList.remove("dark", "light")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

// Subscrição para localStorage changes (entre abas)
function subscribeStorage(notify: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) notify()
  }
  window.addEventListener("storage", onStorage)
  return () => window.removeEventListener("storage", onStorage)
}

// useSyncExternalStore para o tema do SO — também serve para sincronizar
// mudanças do SO em tempo real.
function getSystemSnapshot(): ResolvedTheme {
  return getSystemTheme()
}

function subscribeSystem(notify: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  const handler = () => notify()
  mq.addEventListener("change", handler)
  return () => mq.removeEventListener("change", handler)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore<Theme>(
    subscribeStorage,
    readStoredTheme,
    () => "dark"
  )
  const systemTheme = React.useSyncExternalStore<ResolvedTheme>(
    subscribeSystem,
    getSystemSnapshot,
    () => "dark"
  )

  const resolvedTheme = React.useMemo<ResolvedTheme>(
    () => (theme === "system" ? systemTheme : theme),
    [theme, systemTheme]
  )

  // Aplica a classe no <html> sempre que o resolved muda (único efeito).
  React.useEffect(() => {
    applyThemeClass(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = React.useCallback((next: Theme) => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage cheio / bloqueado */
    }
    // Dispara re-render via storage event customizado (storage event só
    // dispara em outras abas; usamos dispatch manual para a aba atual).
    window.dispatchEvent(
      new StorageEvent("storage", { key: STORAGE_KEY, newValue: next })
    )
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    return {
      theme: "dark" as Theme,
      resolvedTheme: "dark" as const,
      setTheme: () => {},
    }
  }
  return ctx
}

/**
 * Script anti-flash. Inserido em <head> ANTES do React hidratar.
 * Lê localStorage e aplica a classe correta no primeiro paint.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'dark';
    var resolved = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    var root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  } catch (e) {}
})();
`