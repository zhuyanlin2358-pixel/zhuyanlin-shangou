import { createContext, useContext, useState, type ReactNode } from 'react'

export type N4VariantId =
  | 'text-only' | 'price-3digit' | 'price-2digit' | 'price-1digit'
  | 'discount-2digit' | 'discount-1digit' | 'fullcut-2digit' | 'fullcut-1digit'

export const N4_VARIANTS: Record<N4VariantId, { label: string; hint: string; maxLen: number }> = {
  'text-only':       { label: '纯汉字',   hint: '最多3字，如：免单',  maxLen: 3 },
  'price-3digit':    { label: '￥三位数', hint: '3位数字，如：200',   maxLen: 3 },
  'price-2digit':    { label: '￥两位数', hint: '2位数字，如：20',    maxLen: 2 },
  'price-1digit':    { label: '￥一位数', hint: '1位数字，如：8',     maxLen: 1 },
  'discount-2digit': { label: '折扣两位', hint: '折扣数，如：88',     maxLen: 4 },
  'discount-1digit': { label: '折扣一位', hint: '折扣数，如：8',      maxLen: 1 },
  'fullcut-2digit':  { label: '满减两位', hint: '减后数字，如：80',   maxLen: 3 },
  'fullcut-1digit':  { label: '满减一位', hint: '减后数字，如：8',    maxLen: 2 },
}

export const N4_VARIANT_IDS = Object.keys(N4_VARIANTS) as N4VariantId[]

const DEFAULT_CONTENTS: Record<N4VariantId, string> = {
  'text-only': '免单', 'price-3digit': '200', 'price-2digit': '20',
  'price-1digit': '8', 'discount-2digit': '88', 'discount-1digit': '8',
  'fullcut-2digit': '80', 'fullcut-1digit': '8',
}

interface N4ContextValue {
  variant: N4VariantId
  contents: Record<N4VariantId, string>
  setVariant: (v: N4VariantId) => void
  setContent: (v: N4VariantId, text: string) => void
}

const N4Context = createContext<N4ContextValue | null>(null)

export function N4Provider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<N4VariantId>('text-only')
  const [contents, setContents] = useState<Record<N4VariantId, string>>(DEFAULT_CONTENTS)
  const setContent = (v: N4VariantId, text: string) =>
    setContents(prev => ({ ...prev, [v]: text }))
  return (
    <N4Context.Provider value={{ variant, contents, setVariant, setContent }}>
      {children}
    </N4Context.Provider>
  )
}

export function useN4() {
  const ctx = useContext(N4Context)
  if (!ctx) throw new Error('useN4 must be inside N4Provider')
  return ctx
}
