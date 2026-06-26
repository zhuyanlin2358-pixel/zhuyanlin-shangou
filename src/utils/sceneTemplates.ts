/**
 * 场景方案库 — 一键套用完整会场方案
 * 每个模板定义：主题色 + 组件列表（按顺序加入画布）
 */
import type { ComponentId } from '@/types'

export interface SceneTemplate {
  key: string
  name: string
  desc: string
  tag: string           // 角标标签（大促 / 日常 / 节日）
  themeKey: string      // 对应 GLOBAL_THEMES 的 key
  components: ComponentId[]  // 按顺序加入画布
  bgColor: string       // 首页卡片色条颜色
  bgColor2: string      // 渐变终色
}

export const SCENE_TEMPLATES: SceneTemplate[] = [
  {
    key: '618-main',
    name: '大促主会场',
    desc: '老虎机抽奖 + 楼层分区 + 横滑分类 + 领券红包',
    tag: '大促',
    themeKey: 'red',
    components: ['slot', 'floor', 'h-tab', 'coupon'],
    bgColor: '#FF3048',
    bgColor2: '#FF6B6B',
  },
  {
    key: 'daily-coupon',
    name: '日常满减活动',
    desc: '一键领券红包 + 楼层分区，适合日常运营',
    tag: '日常',
    themeKey: 'yellow',
    components: ['coupon', 'floor'],
    bgColor: '#FFD000',
    bgColor2: '#FFA203',
  },
  {
    key: 'category-tab',
    name: '分类浏览会场',
    desc: '横滑Tab导航 + 楼层分区，适合品类展示',
    tag: '日常',
    themeKey: 'blue',
    components: ['h-tab', 'floor'],
    bgColor: '#0598FE',
    bgColor2: '#06AFFE',
  },
  {
    key: 'holiday-full',
    name: '节日主题会场',
    desc: '老虎机抽奖 + 一键领券，节日氛围拉满',
    tag: '节日',
    themeKey: 'pink',
    components: ['slot', 'coupon'],
    bgColor: '#F952FF',
    bgColor2: '#FF443C',
  },
]
