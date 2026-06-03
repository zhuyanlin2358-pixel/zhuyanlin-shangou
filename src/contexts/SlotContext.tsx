import { createContext, useContext, useState, type ReactNode } from 'react'
import type { SlotConfig, SlotPreset } from '@/types'

export const SLOT_PRESETS: Record<string, SlotPreset & { label: string; tone: 'light' | 'dark' }> = {
  pink:        { label:'粉红', tone:'light', from:'#FF5518',to:'#FE10A8',disFrom:'#FFBDD0',disTo:'#FFD0B0',slotFrom:'#FFE1FA',slotTo:'#FFC9F3',linksColor:'#8f8f8f',titleColor:'#f00068',isDark:false },
  rose:        { label:'玫红', tone:'light', from:'#FF1C18',to:'#FE106F',disFrom:'#FFB3CE',disTo:'#FFC8D8',slotFrom:'#FFE1E6',slotTo:'#FFC9D6',linksColor:'#8f8f8f',titleColor:'#FF1C18',isDark:false },
  teal:        { label:'蓝绿', tone:'light', from:'#06B1FF',to:'#0596FD',disFrom:'#A8E6F0',disTo:'#C0F0F8',slotFrom:'#C8F9FF',slotTo:'#81F3FE',linksColor:'#8f8f8f',titleColor:'#06B1FF',isDark:false },
  purple:      { label:'蓝紫', tone:'light', from:'#9771FF',to:'#2D30FF',disFrom:'#DDD6FE',disTo:'#EDE9FE',slotFrom:'#E8E6FF',slotTo:'#D4D0FF',linksColor:'#8f8f8f',titleColor:'#9771FF',isDark:false },
  green:       { label:'绿色', tone:'light', from:'#27D365',to:'#00C24C',disFrom:'#A8E6C4',disTo:'#C8F5D8',slotFrom:'#E8FED4',slotTo:'#D3FFB2',linksColor:'#8f8f8f',titleColor:'#27D365',isDark:false },
  yellow:      { label:'黄橙', tone:'light', from:'#FF4560',to:'#FF0036',disFrom:'#FFE8A0',disTo:'#FFF3C0',slotFrom:'#FFF7D3',slotTo:'#FFE9A5',linksColor:'#8f8f8f',titleColor:'#FF4560',isDark:false },
  orange:      { label:'橙色', tone:'light', from:'#FF5E00',to:'#FF2500',disFrom:'#FFD8A8',disTo:'#FFE8A8',slotFrom:'#FFE8D8',slotTo:'#FFD3B4',linksColor:'#8f8f8f',titleColor:'#FF5E00',isDark:false },
  'dark-red':  { label:'深红', tone:'dark',  from:'#FF6B8A',to:'#FF9060',disFrom:'#C0392B',disTo:'#A93226',slotFrom:'#8B1A2A',slotTo:'#C0392B',linksColor:'rgba(255,255,255,0.85)',titleColor:'#FFFFFF',isDark:true },
  'dark-orange':{ label:'深橙', tone:'dark', from:'#FFB347',to:'#FFD700',disFrom:'#B8620A',disTo:'#9A5200',slotFrom:'#7A4500',slotTo:'#B8620A',linksColor:'rgba(255,255,255,0.85)',titleColor:'#FFFFFF',isDark:true },
  'dark-green':{ label:'深绿', tone:'dark',  from:'#4ADE80',to:'#86EFAC',disFrom:'#166534',disTo:'#14532D',slotFrom:'#052E16',slotTo:'#166534',linksColor:'rgba(255,255,255,0.85)',titleColor:'#FFFFFF',isDark:true },
  'dark-blue': { label:'深蓝', tone:'dark',  from:'#60A5FA',to:'#93C5FD',disFrom:'#1E40AF',disTo:'#1E3A8A',slotFrom:'#0A1628',slotTo:'#1A3A6B',linksColor:'rgba(255,255,255,0.85)',titleColor:'#FFFFFF',isDark:true },
  'dark-purple':{ label:'深紫', tone:'dark', from:'#C084FC',to:'#E879F9',disFrom:'#6D28D9',disTo:'#5B21B6',slotFrom:'#1E0A3C',slotTo:'#5B2D8E',linksColor:'rgba(255,255,255,0.85)',titleColor:'#FFFFFF',isDark:true },
}

const INITIAL_CONFIG: SlotConfig = {
  bgColor: '#FFF5F8',
  bgImageUrl: '',
  btnActiveFrom: '#FF5518',
  btnActiveTo: '#FE10A8',
  btnDisabledFrom: '#FFBDD0',
  btnDisabledTo: '#FFD0B0',
  slotTintFrom: '#FFE1FA',
  slotTintTo: '#FFC9F3',
  linksColor: '#8f8f8f',
  titleColor: '#f00068',
  titleText: '惊喜抽奖',
  emptyText: '活动太火爆，请稍后重试...',
  emptyImageUrl: '/empty-illus.png',
  emptyScale: 100,
  prizes: [
    { type: 'product-tag',    imageUrl: '/prize-1.png', tag: '无门槛优惠券', amount: '30', unit: '元', bottomText: '迪奥口红免单券', thanksText: '谢谢参与' },
    { type: 'product-dashed', imageUrl: '/prize-2.png', tag: '零食免单券',   amount: '30', unit: '元', bottomText: '零食免单券',     thanksText: '谢谢参与' },
    { type: 'thanks',         imageUrl: '/prize-3.png', tag: '',             amount: '30', unit: '元', bottomText: '零食盲盒券',     thanksText: '谢谢参与' },
  ],
  tone: 'light',
}

interface SlotContextValue {
  config: SlotConfig
  activePreset: string | null
  setConfig: (patch: Partial<SlotConfig>) => void
  applyPreset: (key: string) => void
  setPrize: (idx: number, patch: Partial<import('@/types').PrizeConfig>) => void
}

const SlotContext = createContext<SlotContextValue | null>(null)

export function SlotProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<SlotConfig>(INITIAL_CONFIG)
  const [activePreset, setActivePreset] = useState<string | null>('pink')

  const setConfig = (patch: Partial<SlotConfig>) =>
    setConfigState(prev => ({ ...prev, ...patch }))

  const applyPreset = (key: string) => {
    const p = SLOT_PRESETS[key]
    if (!p) return
    setConfigState(prev => ({
      ...prev,
      btnActiveFrom: p.from,
      btnActiveTo: p.to,
      btnDisabledFrom: p.disFrom,
      btnDisabledTo: p.disTo,
      slotTintFrom: p.slotFrom,
      slotTintTo: p.slotTo,
      linksColor: p.linksColor,
      titleColor: p.titleColor,
      tone: p.tone,
    }))
    setActivePreset(key)
  }

  const setPrize = (idx: number, patch: Partial<import('@/types').PrizeConfig>) =>
    setConfigState(prev => ({
      ...prev,
      prizes: prev.prizes.map((p, i) => i === idx ? { ...p, ...patch } : p),
    }))

  return (
    <SlotContext.Provider value={{ config, activePreset, setConfig, applyPreset, setPrize }}>
      {children}
    </SlotContext.Provider>
  )
}

export function useSlot() {
  const ctx = useContext(SlotContext)
  if (!ctx) throw new Error('useSlot must be inside SlotProvider')
  return ctx
}
