/**
 * 老虎机风格注册表
 * 每个风格只负责绘制背景区域（clip 之后，白色奖品框之前）
 * 新增风格：在 SLOT_STYLE_REGISTRY 里加一条记录，实现 drawBg 即可
 */

export interface SlotStyleColors {
  tintFrom: string
  tintTo: string
}

export interface SlotStyleDef {
  id: string
  label: string
  /** 在已裁切的圆角矩形区域内绘制背景，ctx 已 save() 且 clip() */
  drawBg: (ctx: CanvasRenderingContext2D, W: number, H: number, colors: SlotStyleColors) => void
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
  },

  // ── 日常活动（占位，等待设计稿嵌入）──────────────────────────────────────
  // daily: {
  //   id: 'daily',
  //   label: '日常活动',
  //   drawBg: (ctx, W, H, colors) => { /* TODO */ },
  // },

}

export function getSlotStyle(id: string): SlotStyleDef {
  return SLOT_STYLE_REGISTRY[id] ?? SLOT_STYLE_REGISTRY.minimal
}

export const SLOT_STYLE_LIST: SlotStyleDef[] = Object.values(SLOT_STYLE_REGISTRY)
