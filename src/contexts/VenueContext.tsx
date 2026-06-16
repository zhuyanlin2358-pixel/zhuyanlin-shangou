import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type VenueItem, type VenueHeaderSize } from '@/types'

function makeId() {
  return `vi_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

interface VenueCtx {
  // ── 组件列表 ──────────────────────────────────────────────────────────────
  items: VenueItem[]
  addItem: (item: Omit<VenueItem, 'id' | 'spacingAbove'>) => void
  removeItem: (id: string) => void
  moveItem: (id: string, dir: 'up' | 'down') => void
  reorderItems: (fromId: string, toId: string) => void
  /** 按 label 匹配已有条目，更新其 previewUrl（用于「更新预览」） */
  updatePreview: (label: string, previewUrl: string) => void
  setSpacing: (id: string, v: number) => void

  // ── 头图 ──────────────────────────────────────────────────────────────────
  headerUrl: string
  headerSize: VenueHeaderSize   // '424' | '624' | '274'
  setHeaderUrl: (url: string) => void
  setHeaderSize: (s: VenueHeaderSize) => void

  // ── 背景色 ────────────────────────────────────────────────────────────────
  bgColor: string
  setBgColor: (c: string) => void

}

const Ctx = createContext<VenueCtx | null>(null)

export function VenueProvider({ children }: { children: ReactNode }) {
  const [items,      setItems]      = useState<VenueItem[]>([])
  // 默认头图：鲜花示意图（750×424），背景色粉色
  const [headerUrl,  setHeaderUrl]  = useState(`${import.meta.env.BASE_URL}demo-header.png`)
  const [headerSize, setHeaderSize] = useState<VenueHeaderSize>('424')
  const [bgColor,    setBgColor]    = useState('#FFD9E5')

  const addItem = useCallback((item: Omit<VenueItem, 'id' | 'spacingAbove'>) => {
    setItems(prev => [...prev, { ...item, id: makeId(), spacingAbove: 0 }])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(it => it.id !== id))
  }, [])

  const updatePreview = useCallback((label: string, previewUrl: string) => {
    setItems(prev => prev.map(it =>
      it.label === label ? { ...it, previewUrl } : it
    ))
  }, [])

  const reorderItems = useCallback((fromId: string, toId: string) => {
    setItems(prev => {
      const fromIdx = prev.findIndex(it => it.id === fromId)
      const toIdx   = prev.findIndex(it => it.id === toId)
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next
    })
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

  const setSpacing = useCallback((id: string, v: number) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, spacingAbove: v } : it))
  }, [])

  return (
    <Ctx.Provider value={{
      items, addItem, removeItem, moveItem, reorderItems, updatePreview, setSpacing,
      headerUrl, setHeaderUrl,
      headerSize, setHeaderSize,
      bgColor, setBgColor,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useVenue(): VenueCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useVenue must be used inside VenueProvider')
  return ctx
}
