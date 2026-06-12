import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type FloorConfig, type FloorVariant, type FloorItem, FLOOR_PRESETS } from '@/types'

// 生成唯一 id（不依赖 uuid 库）
function makeId() {
  return `fl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

interface FloorCtx {
  // ── 全局样式 ──────────────────────────────────────────────────────────────
  config: FloorConfig
  patchConfig: (patch: Partial<FloorConfig>) => void
  setConfig: (cfg: FloorConfig) => void
  applyVariant: (v: FloorVariant) => void

  // ── 楼层列表 ──────────────────────────────────────────────────────────────
  floors: FloorItem[]
  addFloor: () => void
  removeFloor: (id: string) => void
  updateFloor: (id: string, text: string) => void
  moveFloor: (id: string, dir: 'up' | 'down') => void
}

const Ctx = createContext<FloorCtx | null>(null)

const DEFAULT_CFG: FloorConfig = {
  variant: 'dachao',
  ...FLOOR_PRESETS.dachao,
}

export function FloorProvider({ children }: { children: ReactNode }) {
  const [config, rawSetConfig] = useState<FloorConfig>(DEFAULT_CFG)

  // ── 样式操作 ─────────────────────────────────────────────────────────────
  // 函数式更新，防止快速拖拽色轮时 stale closure 导致颜色更新被覆盖
  const patchConfig = useCallback((patch: Partial<FloorConfig>) => {
    rawSetConfig(prev => ({ ...prev, ...patch }))
  }, [])

  const setConfig = useCallback((cfg: FloorConfig) => {
    rawSetConfig(cfg)
  }, [])

  const applyVariant = useCallback((v: FloorVariant) => {
    if (v === 'custom') {
      rawSetConfig(prev => ({ ...prev, variant: 'custom' }))
    } else {
      rawSetConfig({ variant: v, ...FLOOR_PRESETS[v] })
    }
  }, [])

  // ── 楼层列表操作 ──────────────────────────────────────────────────────────
  const [floors, setFloors] = useState<FloorItem[]>([
    { id: makeId(), text: FLOOR_PRESETS.dachao.text },
  ])

  const addFloor = useCallback(() => {
    setFloors(prev => [
      ...prev,
      { id: makeId(), text: `楼层 ${prev.length + 1}` },
    ])
  }, [])

  const removeFloor = useCallback((id: string) => {
    setFloors(prev => prev.length > 1 ? prev.filter(f => f.id !== id) : prev)
  }, [])

  const updateFloor = useCallback((id: string, text: string) => {
    setFloors(prev => prev.map(f => f.id === id ? { ...f, text } : f))
  }, [])

  const moveFloor = useCallback((id: string, dir: 'up' | 'down') => {
    setFloors(prev => {
      const idx = prev.findIndex(f => f.id === id)
      if (idx < 0) return prev
      const newIdx = dir === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
      return next
    })
  }, [])

  return (
    <Ctx.Provider value={{
      config, patchConfig, setConfig, applyVariant,
      floors, addFloor, removeFloor, updateFloor, moveFloor,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useFloor(): FloorCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFloor must be used inside FloorProvider')
  return ctx
}
