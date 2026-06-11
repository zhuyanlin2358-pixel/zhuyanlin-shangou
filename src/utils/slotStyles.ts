/**
 * 老虎机风格注册表
 * 每个风格定义：banner 背景绘制函数 + 奖品卡颜色配置
 * 新增风格：在 SLOT_STYLE_REGISTRY 里加一条记录即可
 */

export interface SlotStyleColors {
  tintFrom: string
  tintTo: string
}

/** 奖品卡颜色配置（drawPrizeCanvas 使用） */
export interface SlotPrizeStyle {
  bgType: 'flat' | 'gradient'
  bgColor: string      // flat 色 或 渐变起始色（顶部）
  bgColorEnd: string   // 渐变结束色（底部），flat 时忽略
  borderColor: string
  useDashedBorder: boolean
  labelBg: string
  textPrimary: string
  textSecondary: string
}

export interface SlotStyleDef {
  id: string
  label: string
  /** 在已裁切的圆角矩形区域内绘制背景，ctx 已 save() 且 clip() */
  drawBg: (ctx: CanvasRenderingContext2D, W: number, H: number, colors: SlotStyleColors) => void
  prizeStyle: SlotPrizeStyle
}

export const SLOT_STYLE_REGISTRY: Record<string, SlotStyleDef> = {

  // ── 常规极简 ─────────────────────────────────────────────────────────────
  minimal: {
    id: 'minimal',
    label: '常规极简',
    drawBg: (ctx, W, H, { tintFrom, tintTo }) => {
      // 背景皮肤702×242，居中于750px canvas（左右各24px留白）
      const SX = 24, SW = 702
      const bg = ctx.createLinearGradient(SX, 0, SX + SW, H)
      bg.addColorStop(0, tintFrom)
      bg.addColorStop(1, tintTo)
      ctx.fillStyle = bg
      ctx.fillRect(SX, 0, SW, H)
    },
    prizeStyle: {
      bgType: 'gradient',
      bgColor: '#FDF6E8',    // rgba(253,246,232,1) 顶部极浅奶油
      bgColorEnd: '#FBE6A6', // rgba(251,230,166,1) 底部浅金
      borderColor: '#FFFFFF',
      useDashedBorder: false,
      labelBg: '#fff',
      textPrimary: '#77321E',
      textSecondary: '#77321E',
    },
  },

  // ── 日常活动 ─────────────────────────────────────────────────────────────
  daily: {
    id: 'daily',
    label: '日常活动',
    // Figma API 精确还原（节点 13:417 蒙版 + 13:416 矩形备份7 + 13:429 圆形2）
    drawBg: (ctx, W, H, _colors) => {
      const SX = 24, SW = 702  // 皮肤702×242，居中于750px canvas，左右各24px留白

      // ① 蒙版主背景（13:417）：#FFF2F6→#FEDCE2 横向渐变
      const mainBg = ctx.createLinearGradient(SX, 0, SX + SW, 0)
      mainBg.addColorStop(0, '#FFF2F6')
      mainBg.addColorStop(1, '#FEDCE2')
      ctx.fillStyle = mainBg
      ctx.fillRect(SX, 0, SW, H)

      // ② 圆形2（13:429）：模糊椭圆柔光，center(110.5,-20) rx:152.5 ry:121 blur:71px
      ctx.save()
      ctx.filter = 'blur(71px)'
      ctx.beginPath()
      ctx.ellipse(110.5, -20, 152.5, 121, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,249,254,0.70)'
      ctx.fill()
      ctx.filter = 'none'
      ctx.restore()

      // ③ 矩形备份7（13:416）：x:342 y:0 w:384 h:105 r:24左侧圆角
      // 精确渐变 rgb(255,216,218)→rgb(255,199,212)
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(366, 0)
      ctx.lineTo(726, 0)
      ctx.lineTo(726, 105)
      ctx.lineTo(366, 105)
      ctx.arcTo(342, 105, 342, 81, 24)
      ctx.lineTo(342, 24)
      ctx.arcTo(342, 0, 366, 0, 24)
      ctx.closePath()
      ctx.clip()
      const rect7G = ctx.createLinearGradient(342, 0, 726, 0)
      rect7G.addColorStop(0, '#FFD8DA')
      rect7G.addColorStop(1, '#FFC7D4')
      ctx.fillStyle = rect7G
      ctx.fillRect(342, 0, 384, 105)
      ctx.restore()

      // ④ 顶部 1px 内描边（Figma inner shadow y=1 white）
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(255,255,255,0.80)'
      ctx.fillRect(SX, 0, SW, 1)
    },
    prizeStyle: {
      bgType: 'gradient',
      bgColor: '#FDF6E8',    // rgba(253,246,232,1)
      bgColorEnd: '#FBE6A6', // rgba(251,230,166,1)
      borderColor: '#FFFFFF',
      useDashedBorder: false,
      labelBg: '#FFFFFF',
      textPrimary: '#77321E',
      textSecondary: '#77321E',
    },
  },

}

export function getSlotStyle(id?: string): SlotStyleDef {
  return SLOT_STYLE_REGISTRY[id ?? 'minimal'] ?? SLOT_STYLE_REGISTRY.minimal
}

export const SLOT_STYLE_LIST: SlotStyleDef[] = Object.values(SLOT_STYLE_REGISTRY)
