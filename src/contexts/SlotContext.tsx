import { createContext, useContext, useState, type ReactNode } from 'react'
import type { SlotConfig, SlotPreset } from '@/types'

// 9 套配色完全来自 Figma API（情人粉/大促红/黄色/橘色/蓝色/绿色/青色/年货红/紫色）
export const SLOT_PRESETS: Record<string, SlotPreset & { label: string; tone: 'light' | 'dark' }> = {
  // ── 浅色系（8款）────────────────────────────────────────────────────────────
  qinrenfen: {
    label: '情人粉', tone: 'light',
    from: '#F952FF', to: '#FF443C',
    disFrom: '#FF3048', disTo: '#FF035D',
    slotFrom: '#FFECF5', slotTo: '#FFCEF4',   // Figma 15:5914 精确值
    rect7From: '#FFEFF8', rect7To: '#FFCCF7',  // Figma 15:5917 精确值
    linksColor: '#9D9D9D', titleColor: '#760101', isDark: false,
  },
  dacuhong: {
    label: '大促红', tone: 'light',
    from: '#FF3048', to: '#FF2D5D',
    disFrom: '#FF3048', disTo: '#FF035D',
    slotFrom: '#FFF2F6', slotTo: '#FEDCE2',
    rect7From: '#FFD8DA', rect7To: '#FFC7D4',
    linksColor: '#9D9D9D', titleColor: '#770101', isDark: false,
  },
  huang: {
    label: '黄色', tone: 'light',
    from: '#FF3048', to: '#FF2D5D',
    disFrom: '#FF3048', disTo: '#FF035D',
    slotFrom: '#FFF6CE', slotTo: '#FFECAD',
    rect7From: '#FFE4A7', rect7To: '#FFE8A5',
    linksColor: '#9D9D9D', titleColor: '#AE0000', isDark: false,
  },
  ju: {
    label: '橘色', tone: 'light',
    from: '#FF3328', to: '#FF7632',
    disFrom: '#FF3328', disTo: '#FF7632',
    slotFrom: '#FFE5D0', slotTo: '#FBE8D8',
    rect7From: '#FFE4CE', rect7To: '#FFD2B0',
    linksColor: '#9D9D9D', titleColor: '#AE0000', isDark: false,
  },
  lan: {
    label: '蓝色', tone: 'light',
    from: '#0598FE', to: '#06AFFE',
    disFrom: '#0598FE', disTo: '#06AFFE',
    slotFrom: '#B8F8FF', slotTo: '#88F4FE',
    rect7From: '#27D5FE', rect7To: '#1BD7F8',
    linksColor: '#9D9D9D', titleColor: '#008CF1', isDark: false,
  },
  lv: {
    label: '绿色', tone: 'light',
    from: '#46E800', to: '#69E129',
    disFrom: '#46E800', disTo: '#69E129',
    slotFrom: '#F9FFF0', slotTo: '#E8FCD1',
    rect7From: '#CDFCA9', rect7To: '#B6FF7D',
    linksColor: '#9D9D9D', titleColor: '#45CA00', isDark: false,
  },
  qing: {
    label: '青色', tone: 'light',
    from: '#46E800', to: '#69E129',
    disFrom: '#46E800', disTo: '#69E129',
    slotFrom: '#F9FFF0', slotTo: '#E8FCD1',
    rect7From: '#CDFCA9', rect7To: '#B6FF7D',
    linksColor: '#9D9D9D', titleColor: '#45CA00', isDark: false,
  },
  nianhuo: {
    label: '年货红', tone: 'dark',
    from: '#FFDCAB', to: '#FFF9C9',       // 金色渐变按钮
    disFrom: '#FFDCAB', disTo: '#FFF9C9',
    slotFrom: '#FF5F5F', slotTo: '#FF5B60',
    rect7From: '#FF4248', rect7To: '#FF7073',
    linksColor: '#FFFFFF', titleColor: '#FFFFFF',
    btnTextColor: '#DC2300',              // 浅色按钮用深红文字
    isDark: true,
  },
  // ── 深色（1款）────────────────────────────────────────────────────────────
  zi: {
    label: '紫色', tone: 'dark',
    from: '#27126D', to: '#552CC8',       // 深紫按钮（Figma 确认）
    disFrom: '#4A2D9C', disTo: '#7B5BD0', // 禁用按钮同紫色系（比活动按钮略浅，视觉区分）
    slotFrom: '#3819A2', slotTo: '#6E4BC3',
    rect7From: '#5A2EE3', rect7To: '#231355',
    linksColor: '#FFFFFF', titleColor: '#FFFFFF', isDark: true,
  },
}

// Vite BASE_URL：本地 / Vercel = '/'，GitHub Pages = '/zhuyanlin-tool/'
const BASE = import.meta.env.BASE_URL

const INITIAL_CONFIG: SlotConfig = {
  bgColor: '#FFF5F8',
  bgImageUrl: '',
  btnActiveFrom: '#FF3048',
  btnActiveTo: '#FF2D5D',
  btnDisabledFrom: '#FF3048',
  btnDisabledTo: '#FF035D',
  slotTintFrom: '#FFF2F6',
  slotTintTo: '#FEDCE2',
  slotRect7From: '#FFD8DA',
  slotRect7To: '#FFC7D4',
  linksColor: '#9D9D9D',
  titleColor: '#770101',
  btnTextColor: '#FFFFFF',
  titleText: '惊喜抽奖',
  emptyText: '活动太火爆，请稍后重试...',
  emptyImageUrl: `${BASE}empty-illus.png`,
  emptyTransform: { offsetX: 0, offsetY: 0, scale: 1 },
  prizes: [
    { type: 'product-tag',    imageUrl: `${BASE}prize-1.png`, tag: '无门槛优惠券', amount: '30', unit: '元', bottomText: '迪奥口红免单券', thanksText: '谢谢参与' },
    { type: 'product-dashed', imageUrl: `${BASE}prize-2.png`, tag: '零食免单券',   amount: '30', unit: '元', bottomText: '零食免单券',     thanksText: '谢谢参与' },
    { type: 'thanks',         imageUrl: '',             tag: '',             amount: '30', unit: '元', bottomText: '零食盲盒券',     thanksText: '谢谢参与' },
  ],
  prizeTransforms: [
    { offsetX: 0, offsetY: 0, scale: 1 },
    { offsetX: 0, offsetY: 0, scale: 1 },
    { offsetX: 0, offsetY: 0, scale: 1 },
  ],
  tone: 'light',
  slotStyle: 'daily',
}

interface SlotContextValue {
  config: SlotConfig
  activePreset: string | null
  activeStep: number
  slotBannerUrl: string
  setConfig: (patch: Partial<SlotConfig>) => void
  applyPreset: (key: string) => void
  setPrize: (idx: number, patch: Partial<import('@/types').PrizeConfig>) => void
  addPrize: () => void
  removePrize: (idx: number) => void
  setActiveStep: (n: number) => void
  setSlotBannerUrl: (url: string) => void
  setEmptyTransform: (t: Partial<import('@/types').ImgTransform>) => void
  setPrizeTransform: (idx: number, t: Partial<import('@/types').ImgTransform>) => void
  resetEmptyTransform: () => void
  resetPrizeTransform: (idx: number) => void
}

const SlotContext = createContext<SlotContextValue | null>(null)

export function SlotProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<SlotConfig>(INITIAL_CONFIG)
  const [activePreset, setActivePreset] = useState<string | null>('dacuhong')
  const [activeStep, setActiveStep] = useState(1)
  const [slotBannerUrl, setSlotBannerUrl] = useState('')

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
      slotRect7From: p.rect7From,
      slotRect7To: p.rect7To,
      linksColor: p.linksColor,
      titleColor: p.titleColor,
      btnTextColor: p.btnTextColor ?? '#FFFFFF',
      tone: p.tone,
    }))
    setActivePreset(key)
  }

  const setPrize = (idx: number, patch: Partial<import('@/types').PrizeConfig>) =>
    setConfigState(prev => ({
      ...prev,
      prizes: prev.prizes.map((p, i) => i === idx ? { ...p, ...patch } : p),
    }))

  const setEmptyTransform = (t: Partial<import('@/types').ImgTransform>) =>
    setConfigState(prev => ({ ...prev, emptyTransform: { ...prev.emptyTransform, ...t } }))

  const setPrizeTransform = (idx: number, t: Partial<import('@/types').ImgTransform>) =>
    setConfigState(prev => ({
      ...prev,
      prizeTransforms: prev.prizeTransforms.map((tr, i) => i === idx ? { ...tr, ...t } : tr),
    }))

  const resetEmptyTransform = () =>
    setConfigState(prev => ({ ...prev, emptyTransform: { offsetX: 0, offsetY: 0, scale: 1 } }))

  const resetPrizeTransform = (idx: number) =>
    setConfigState(prev => ({
      ...prev,
      prizeTransforms: prev.prizeTransforms.map((tr, i) => i === idx ? { offsetX: 0, offsetY: 0, scale: 1 } : tr),
    }))

  const addPrize = () =>
    setConfigState(prev => ({
      ...prev,
      prizes: [...prev.prizes, { type: 'product-tag', imageUrl: '', tag: '新奖品', amount: '30', unit: '元', bottomText: '', thanksText: '谢谢参与' }],
      prizeTransforms: [...prev.prizeTransforms, { offsetX: 0, offsetY: 0, scale: 1 }],
    }))

  const removePrize = (idx: number) =>
    setConfigState(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== idx),
      prizeTransforms: prev.prizeTransforms.filter((_, i) => i !== idx),
    }))

  return (
    <SlotContext.Provider value={{ config, activePreset, activeStep, slotBannerUrl, setConfig, applyPreset, setPrize, addPrize, removePrize, setActiveStep, setSlotBannerUrl, setEmptyTransform, setPrizeTransform, resetEmptyTransform, resetPrizeTransform }}>
      {children}
    </SlotContext.Provider>
  )
}

export function useSlot() {
  const ctx = useContext(SlotContext)
  if (!ctx) throw new Error('useSlot must be inside SlotProvider')
  return ctx
}
