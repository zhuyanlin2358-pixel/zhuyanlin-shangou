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
  useDashedBorder: boolean  // product-dashed 类型是否用虚线框
  labelBg: string
  textPrimary: string   // 金额/大字颜色
  textSecondary: string // 底部小字颜色
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
      bgType: 'flat',
      bgColor: '#FFE9B0',
      bgColorEnd: '#FFE9B0',
      borderColor: 'rgba(180,120,0,0.15)',
      useDashedBorder: true,
      labelBg: '#fff',
      textPrimary: '#812D16',
      textSecondary: '#7B3A00',
    },
  },

  // ── 日常活动 ─────────────────────────────────────────────────────────────
  daily: {
    id: 'daily',
    label: '日常活动',
    drawBg: (ctx, W, H, { tintFrom, tintTo }) => {
      // 主背景：竖向渐变（top 5% → bottom 100%）
      const mainBg = ctx.createLinearGradient(0, 0, 0, H)
      mainBg.addColorStop(0.05, tintFrom)
      mainBg.addColorStop(1, tintTo)
      ctx.fillStyle = mainBg
      ctx.fillRect(0, 0, W, H)

      // 右上角装饰块：从 x=342 到 x=726，高 105px
      // 白色半透明对角渐变（右上→左下），制造层次感
      const decG = ctx.createLinearGradient(726, 0, 342, 105)
      decG.addColorStop(0, 'rgba(255,255,255,0.30)')
      decG.addColorStop(1, 'rgba(255,255,255,0.00)')
      ctx.fillStyle = decG
      ctx.fillRect(342, 0, 384, 105)

      // 顶部 1px 内描边（白色）
      ctx.fillStyle = 'rgba(255,255,255,0.65)'
      ctx.fillRect(0, 0, W, 1)
    },
    prizeStyle: {
      bgType: 'gradient',
      bgColor: '#FDF6E8',    // top: rgba(253,246,232,1)
      bgColorEnd: '#FBE6A6', // bottom: rgba(251,230,166,1)
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
