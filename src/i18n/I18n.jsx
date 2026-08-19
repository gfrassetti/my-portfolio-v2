import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { en, es } from './messages.js'

const KEY = 'gf-locale'
const MESSAGES = { es, en }
const I18nContext = createContext(null)

function readInitial() {
  try {
    const stored = localStorage.getItem(KEY)
    if (stored === 'es' || stored === 'en') return stored
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'es'
  return nav.toLowerCase().startsWith('en') ? 'en' : 'es'
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(readInitial)

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'es-AR'
    try {
      localStorage.setItem(KEY, locale)
    } catch {
      /* ignore */
    }
  }, [locale])

  const setLocale = useCallback((next) => {
    if (next === 'es' || next === 'en') setLocaleState(next)
  }, [])

  const t = useMemo(() => MESSAGES[locale] ?? MESSAGES.es, [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
