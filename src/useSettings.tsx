import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Settings, ProviderId } from './types'

const KEY = 'gallery-settings'

const DEFAULTS: Settings = {
  enabled: {
    wikipedia: true,
    nasa: true,
    pexels: false,
    pixabay: false,
    unsplash: false,
    flickr: false,
    bing: false,
    e621: false,
    danbooru: false,
    yandere: false,
  },
  keys: {},
  language: 'en',
  autoFullscreen: false,
  nsfwEnabled: true,
}

const load = (): Settings => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULTS,
      ...parsed,
      enabled: { ...DEFAULTS.enabled, ...(parsed.enabled || {}) },
      keys: { ...(parsed.keys || {}) },
    }
  } catch {
    return DEFAULTS
  }
}

const save = (s: Settings) => {
  localStorage.setItem(KEY, JSON.stringify(s))
}

interface SettingsCtx {
  settings: Settings
  toggleProvider: (id: ProviderId) => void
  setKey: (id: string, v: string) => void
  setLanguage: (lang: 'en' | 'ar') => void
  setAutoFullscreen: (v: boolean) => void
  setNsfwEnabled: (v: boolean) => void
  resetSettings: () => void
}

const Ctx = createContext<SettingsCtx | null>(null)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(load)

  useEffect(() => { save(settings) }, [settings])

  const toggleProvider = useCallback((id: ProviderId) => {
    setSettings(s => ({ ...s, enabled: { ...s.enabled, [id]: !s.enabled[id] } }))
  }, [])

  const setKey = useCallback((id: string, value: string) => {
    setSettings(s => {
      const next = { ...s.keys }
      if (value.trim()) next[id] = value.trim()
      else delete next[id]
      return { ...s, keys: next }
    })
  }, [])

  const setLanguage = useCallback((lang: 'en' | 'ar') => {
    setSettings(s => ({ ...s, language: lang }))
  }, [])

  const setAutoFullscreen = useCallback((v: boolean) => {
    setSettings(s => ({ ...s, autoFullscreen: v }))
  }, [])

  const setNsfwEnabled = useCallback((v: boolean) => {
    setSettings(s => ({ ...s, nsfwEnabled: v }))
  }, [])

  const resetSettings = useCallback(() => {
    localStorage.removeItem(KEY)
    setSettings(DEFAULTS)
  }, [])

  return (
    <Ctx.Provider value={{ settings, toggleProvider, setKey, setLanguage, setAutoFullscreen, setNsfwEnabled, resetSettings }}>
      {children}
    </Ctx.Provider>
  )
}

export const useSettings = (): SettingsCtx => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
