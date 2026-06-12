import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type FloorConfig, type FloorVariant, FLOOR_PRESETS } from '@/types'

interface FloorCtx {
  config: FloorConfig
  // 函数式更新，防止快速拖拽时 stale closure 导致中间值被吃掉
  patchConfig: (patch: Partial<FloorConfig>) => void
  setConfig: (cfg: FloorConfig) => void
  applyVariant: (v: FloorVariant) => void
}

const Ctx = createContext<FloorCtx | null>(null)

const DEFAULT_CFG: FloorConfig = {
  variant: 'dachao',
  ...FLOOR_PRESETS.dachao,
}

export function FloorProvider({ children }: { children: ReactNode }) {
  const [config, rawSetConfig] = useState<FloorConfig>(DEFAULT_CFG)

  // 函数式更新：始终基于最新 state，不受调用时的闭包影响
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

  return (
    <Ctx.Provider value={{ config, patchConfig, setConfig, applyVariant }}>
      {children}
    </Ctx.Provider>
  )
}

export function useFloor(): FloorCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFloor must be used inside FloorProvider')
  return ctx
}
