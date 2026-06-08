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
      // ① 蒙版主背景（全区）：横向渐变 tintFrom → tintTo
      const mainBg = ctx.createLinearGradient(0, 0, W, 0)
      mainBg.addColorStop(0, tintFrom)
      mainBg.addColorStop(1, tintTo)
      ctx.fillStyle = mainBg
      ctx.fillRect(0, 0, W, H)

      // ② 矩形备份7（右上叠层）：x:342 y:0 w:384 h:105 r:24（左侧两角圆角）
      // 用 tintTo 实色叠 30% 透明，比主背景深一档，任何主题下均可见
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(366, 0)           // 左上圆角起始
      ctx.lineTo(726, 0)           // 顶边 → 右上角（紧贴外框，无圆角）
      ctx.lineTo(726, 105)         // 右侧 → 右下角
      ctx.lineTo(366, 105)         // 底边 → 左下圆角前
      ctx.arcTo(342, 105, 342, 81, 24) // 左下圆角
      ctx.lineTo(342, 24)          // 左侧
      ctx.arcTo(342, 0, 366, 0, 24)   // 左上圆角
      ctx.closePath()
      ctx.clip()
      ctx.globalAlpha = 0.30
      ctx.fillStyle = tintTo       // 深色端叠加，统一增饱和度
      ctx.fillRect(342, 0, 384, 105)
      ctx.restore()

      // ③ 顶部 1px 白色内描边
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(255,255,255,0.80)'
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
