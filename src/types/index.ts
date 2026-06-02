export type ComponentId =
  | 'slot' | 'n4' | 'n2' | 'yituosi'
  | 'coupon' | 'floor' | 'banner' | 'countdown'

export type ComponentStatus = 'done' | 'coming'
export type PageId = 'home' | 'comp' | 'assets'

export interface ComponentDef {
  id: ComponentId
  label: string
  desc: string
  priority: string // P0-P6
  status: ComponentStatus
}

export interface Logo {
  id: string
  name: string
  data: string
  type: 'filled' | 'stroke'
}

export interface AssetRecord {
  id: string
  compId: ComponentId
  compLabel: string
  files: string[]
  status: 'pending' | 'approved' | 'rejected'
  timestamp: number
}

export interface SlotPreset {
  from: string
  to: string
  disFrom: string
  disTo: string
  slotFrom: string
  slotTo: string
  linksColor: string
  titleColor: string
  isDark: boolean
}

export interface SlotConfig {
  bgColor: string
  bgImageUrl: string
  btnActiveFrom: string
  btnActiveTo: string
  btnDisabledFrom: string
  btnDisabledTo: string
  slotTintFrom: string
  slotTintTo: string
  linksColor: string
  titleColor: string
  titleText: string
  emptyText: string
  emptyImageUrl: string
  emptyScale: number
  prizes: PrizeConfig[]
  tone: 'light' | 'dark'
}

export interface PrizeConfig {
  imageUrl: string
  name: string
}

export const COMPONENT_REGISTRY: ComponentDef[] = [
  { id: 'slot',      label: '老虎机',     desc: '抽奖组件全套切图',         priority: 'P0', status: 'done' },
  { id: 'n4',        label: 'N4 文字标签', desc: '240×156 透明底文字标签',  priority: 'P1', status: 'done' },
  { id: 'n2',        label: 'N2 品牌Logo', desc: '圆形 Logo 有底色/无底色', priority: 'P1', status: 'done' },
  { id: 'yituosi',   label: '一拖四',      desc: '四宫格商品组件',           priority: 'P2', status: 'coming' },
  { id: 'coupon',    label: '优惠券',      desc: '券组件切图',               priority: 'P3', status: 'coming' },
  { id: 'floor',     label: '楼层',        desc: '楼层组件切图',             priority: 'P3', status: 'coming' },
  { id: 'banner',    label: '横幅',        desc: '横幅组件切图',             priority: 'P4', status: 'coming' },
  { id: 'countdown', label: '倒计时',      desc: '倒计时组件切图',           priority: 'P4', status: 'coming' },
]
