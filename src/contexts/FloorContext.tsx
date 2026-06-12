import { createContext, useContext, useState, type ReactNode } from 'react'
import { type FloorConfig, type FloorVariant, FLOOR_PRESETS } from '@/types'

interface FloorCtx {
  config: FloorConfig
  setConfig: (cfg: FloorConfig) => void
  applyVariant: (v: FloorVariant) => void
}

const Ctx = createContext<FloorCtx | null>(null)

const DEFAULT_CFG: FloorConfig = {
  variant: 'dachao',
  ...FLOOR_PRESETS.dachao,
}

export function FloorProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<FloorConfig>(DEFAULT_CFG)

  const applyVariant = (v: FloorVariant) => {
    if (v === 'custom') {
      setConfig(c => ({ ...c, variant: 'custom' }))
    } else {
      setConfig({ variant: v, ...FLOOR_PRESETS[v] })
    }
  }

  return (
    <Ctx.Provider value={{ config, setConfig, applyVariant }}>
      {children}
    </Ctx.Provider>
  )
}

export function useFloor(): FloorCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useFloor must be used inside FloorProvider')
  return ctx
}
