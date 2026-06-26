/**
 * 会场全局主题色系统
 * 一键切换 → 老虎机 / 横滑Tab / 一键领券红包 同步更新
 */
import type { HTabColorKey, CouponColorKey } from '@/types'

export interface GlobalTheme {
  key: string
  name: string
  dot: string            // 选择器圆点色
  slotPreset: string     // 对应 SLOT_PRESETS 的 key
  htabColor: HTabColorKey
  couponColor: CouponColorKey
}

export const GLOBAL_THEMES: GlobalTheme[] = [
  {
    key: 'red',
    name: '大促红',
    dot: '#FF3048',
    slotPreset: 'dacuhong',
    htabColor: 'red',
    couponColor: 'red',
  },
  {
    key: 'pink',
    name: '情人粉',
    dot: '#F952FF',
    slotPreset: 'qinrenfen',
    htabColor: 'pink',
    couponColor: 'pink',
  },
  {
    key: 'yellow',
    name: '美团黄',
    dot: '#FFD000',
    slotPreset: 'huang',
    htabColor: 'yellow',
    couponColor: 'gold1',
  },
  {
    key: 'orange',
    name: '暖橙',
    dot: '#FF7632',
    slotPreset: 'ju',
    htabColor: 'orange',
    couponColor: 'gold2',
  },
  {
    key: 'blue',
    name: '活力蓝',
    dot: '#06AFFE',
    slotPreset: 'lan',
    htabColor: 'blue',
    couponColor: 'blue',
  },
  {
    key: 'green',
    name: '自然绿',
    dot: '#46E800',
    slotPreset: 'lv',
    htabColor: 'green',
    couponColor: 'green',
  },
]
