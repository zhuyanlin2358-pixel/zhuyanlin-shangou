import { createContext, useContext, useState, type ReactNode } from 'react'
import { type CouponConfig, type CouponColorKey } from '@/types'

interface CouponCtx {
  config: CouponConfig
  setColorKey: (k: CouponColorKey) => void
  setTitleText: (t: string) => void
  setBtnText: (t: string) => void
}

const Ctx = createContext<CouponCtx | null>(null)

const DEFAULT_CONFIG: CouponConfig = {
  colorKey: 'red',
  titleText: '领618好店券 下单更优惠',
  btnText: '一键领取',
}

export function CouponProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<CouponConfig>(DEFAULT_CONFIG)

  const setColorKey = (k: CouponColorKey) => setConfig(p => ({ ...p, colorKey: k }))
  const setTitleText = (t: string) => setConfig(p => ({ ...p, titleText: t }))
  const setBtnText   = (t: string) => setConfig(p => ({ ...p, btnText: t }))

  return (
    <Ctx.Provider value={{ config, setColorKey, setTitleText, setBtnText }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCoupon(): CouponCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCoupon must be used inside CouponProvider')
  return ctx
}
