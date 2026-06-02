import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Logo } from '@/types'

const STORAGE_KEY = 'shangou_n2_logos'

interface N2ContextValue {
  filledUrl: string
  strokeUrl: string
  logos: Logo[]
  setFilledUrl: (url: string) => void
  setStrokeUrl: (url: string) => void
  saveLogo: (url: string, type: 'filled' | 'stroke', name: string) => void
  selectLogo: (logo: Logo) => void
  deleteLogo: (id: string) => void
}

const N2Context = createContext<N2ContextValue | null>(null)

function loadLogos(): Logo[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export function N2Provider({ children }: { children: ReactNode }) {
  const [filledUrl, setFilledUrl] = useState('')
  const [strokeUrl, setStrokeUrl] = useState('')
  const [logos, setLogos] = useState<Logo[]>(loadLogos)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logos))
  }, [logos])

  const saveLogo = (url: string, type: 'filled' | 'stroke', name: string) => {
    const updated = [...logos, { id: Date.now().toString(), name, data: url, type }]
    updated.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
    setLogos(updated)
  }

  const selectLogo = (logo: Logo) => {
    if (logo.type === 'stroke') setStrokeUrl(logo.data)
    else setFilledUrl(logo.data)
  }

  const deleteLogo = (id: string) => setLogos(prev => prev.filter(l => l.id !== id))

  return (
    <N2Context.Provider value={{ filledUrl, strokeUrl, logos, setFilledUrl, setStrokeUrl, saveLogo, selectLogo, deleteLogo }}>
      {children}
    </N2Context.Provider>
  )
}

export function useN2() {
  const ctx = useContext(N2Context)
  if (!ctx) throw new Error('useN2 must be inside N2Provider')
  return ctx
}
