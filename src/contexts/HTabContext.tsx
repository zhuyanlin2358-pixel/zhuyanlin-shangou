import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type HTabConfig, type HTabColorKey } from '@/types'

function makeId() {
  return `ht_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

/** 单条横滑 Tab：独立文案 + 选中状态，共享全局配色 */
export interface HTabItem {
  id: string
  tabs: string[]
  activeIndex: number
}

interface HTabCtx {
  // ── 全局配色 ──────────────────────────────────────────────────────────────
  config: HTabConfig
  setColor: (k: HTabColorKey) => void
  // ── 条目列表 ──────────────────────────────────────────────────────────────
  items: HTabItem[]
  addItem: () => void
  removeItem: (id: string) => void
  updateItem: (id: string, patch: Partial<HTabItem>) => void
  moveItem: (id: string, dir: 'up' | 'down') => void
}

const Ctx = createContext<HTabCtx | null>(null)

const DEFAULT_TABS = ['甜点饮品', '能量西餐', '品质生鲜']

const DEFAULT_CONFIG: HTabConfig = {
  colorKey: 'yellow',
  tabs: DEFAULT_TABS,
  activeIndex: 0,
}

const DEFAULT_ITEM: HTabItem = {
  id: makeId(),
  tabs: [...DEFAULT_TABS],
  activeIndex: 0,
}

export function HTabProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HTabConfig>(DEFAULT_CONFIG)
  const [items, setItems] = useState<HTabItem[]>([{ ...DEFAULT_ITEM }])

  const setColor = useCallback((k: HTabColorKey) => {
    setConfig(p => ({ ...p, colorKey: k }))
  }, [])

  const addItem = useCallback(() => {
    setItems(prev => [
      ...prev,
      {
        id: makeId(),
        tabs: [...DEFAULT_TABS],
        activeIndex: 0,
      },
    ])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.length > 1 ? prev.filter(it => it.id !== id) : prev)
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<HTabItem>) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it))
  }, [])

  const moveItem = useCallback((id: string, dir: 'up' | 'down') => {
    setItems(prev => {
      const idx = prev.findIndex(it => it.id === id)
      if (idx < 0) return prev
      const next = [...prev]
      const newIdx = dir === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= next.length) return prev
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
  }, [])

  return (
    <Ctx.Provider value={{ config, setColor, items, addItem, removeItem, updateItem, moveItem }}>
      {children}
    </Ctx.Provider>
  )
}

export function useHTab() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useHTab must be used inside HTabProvider')
  return ctx
}
