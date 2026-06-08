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
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, tintFrom)
      bg.addColorStop(1, tintTo)
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)
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
    drawBg: (ctx, W, H, { tintFrom, tintTo }) => {
      // Figma 层级（后→前）：
      // ① 蒙版（主背景，横向渐变，覆盖全区，x:24 w:702 h:242）
      // ② 矩形备份7（叠在主背景上，multiply 加深右上角，x:342 y:0 w:384 h:105 r:24）

      // 1. 蒙版主背景：Figma 横向渐变，左浅→右深
      const mainBg = ctx.createLinearGradient(0, 0, W, 0)
      mainBg.addColorStop(0, tintFrom)
      mainBg.addColorStop(1, tintTo)
      ctx.fillStyle = mainBg
      ctx.fillRect(0, 0, W, H)

      // 2. 矩形备份7：x:342 y:0 w:384 h:105 r:24，multiply 自然加深右上区域
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
      ctx.globalCompositeOperation = 'multiply'
      ctx.globalAlpha = 0.38
      const rect7G = ctx.createLinearGradient(342, 0, 726, 0)
      rect7G.addColorStop(0, tintFrom)
      rect7G.addColorStop(1, tintTo)
      ctx.fillStyle = rect7G
      ctx.fillRect(342, 0, 384, 105)
      ctx.restore()

      // 3. 顶部 1px 内描边（Figma inset 0px 1px 0px white）
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(255,255,255,0.65)'
      ctx.fillRect(0, 0, W, 1)
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
