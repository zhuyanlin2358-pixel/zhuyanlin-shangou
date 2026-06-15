import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type HTabConfig, type HTabColorKey } from '@/types'

interface HTabCtx {
  config: HTabConfig
  setColor: (k: HTabColorKey) => void
  setActiveIndex: (i: number) => void
  setTab: (i: number, text: string) => void
  setTabCount: (n: number) => void
}

const Ctx = createContext<HTabCtx | null>(null)

const DEFAULT: HTabConfig = {
  colorKey: 'yellow',
  tabs: ['甜点饮品', '能量西餐', '品质生鲜'],
  activeIndex: 0,
}

export function HTabProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HTabConfig>(DEFAULT)

  const setColor = useCallback((k: HTabColorKey) => {
    setConfig(p => ({ ...p, colorKey: k }))
  }, [])

  const setActiveIndex = useCallback((i: number) => {
    setConfig(p => ({ ...p, activeIndex: i }))
  }, [])

  const setTab = useCallback((i: number, text: string) => {
    setConfig(p => {
      const tabs = [...p.tabs]
      tabs[i] = text
      return { ...p, tabs }
    })
  }, [])

  const setTabCount = useCallback((n: number) => {
    setConfig(p => {
      const tabs = Array.from({ length: n }, (_, i) => p.tabs[i] ?? `标签 ${i + 1}`)
      const activeIndex = Math.min(p.activeIndex, n - 1)
      return { ...p, tabs, activeIndex }
    })
  }, [])

  return (
    <Ctx.Provider value={{ config, setColor, setActiveIndex, setTab, setTabCount }}>
      {children}
    </Ctx.Provider>
  )
}

export function useHTab() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useHTab must be used inside HTabProvider')
  return ctx
}
