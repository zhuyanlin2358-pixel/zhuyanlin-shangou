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
      // 1. 主背景：竖向渐变（5% → 100%）
      const mainBg = ctx.createLinearGradient(0, 0, 0, H)
      mainBg.addColorStop(0.05, tintFrom)
      mainBg.addColorStop(1, tintTo)
      ctx.fillStyle = mainBg
      ctx.fillRect(0, 0, W, H)

      // 2. 左侧大椭圆柔光（Figma：圆形2，center≈110.5,-20，rx:152.5，ry:121，blur:71px，rgba(255,249,254,0.7)）
      ctx.save()
      ctx.filter = 'blur(71px)'
      ctx.beginPath()
      ctx.ellipse(110.5, -20, 152.5, 121, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,249,254,0.70)'
      ctx.fill()
      ctx.filter = 'none'
      ctx.restore()

      // 3. 右上角装饰块（x:342, y:0, w:384, h:105, r:24px 仅底左角圆润）
      // 使用白色半透明渐变叠层，适配任意主题色
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(366, 0)           // top-left 圆角起点
      ctx.lineTo(726, 0)           // 上边（右侧被 banner clip 裁切，不需圆角）
      ctx.lineTo(726, 105)         // 右边
      ctx.lineTo(366, 105)         // 下边
      ctx.arcTo(342, 105, 342, 81, 24)  // 底左圆角
      ctx.lineTo(342, 24)
      ctx.arcTo(342, 0, 366, 0, 24)     // 顶左圆角
      ctx.closePath()
      const decG = ctx.createLinearGradient(726, 0, 342, 105)
      decG.addColorStop(0, 'rgba(255,255,255,0.38)')
      decG.addColorStop(1, 'rgba(255,255,255,0.00)')
      ctx.fillStyle = decG
      ctx.fill()
      ctx.restore()

      // 4. 顶部 1px 内描边
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
