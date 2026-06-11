/**
 * 老虎机风格注册表
 * 每个风格定义：banner 背景绘制函数 + 奖品卡颜色配置
 * 新增风格：在 SLOT_STYLE_REGISTRY 里加一条记录即可
 */

export interface SlotStyleColors {
  tintFrom: string
  tintTo: string
  rect7From?: string
  rect7To?: string
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

// 皮肤区域常量：702×242，左右各 24px 留白
const SX = 24, SW = 702, R = 24

// 在 ctx 上画皮肤圆角矩形路径（SX, 0, SW, H, r=24）
function skinPath(ctx: CanvasRenderingContext2D, H: number) {
  ctx.beginPath()
  ctx.moveTo(SX + R, 0)
  ctx.lineTo(SX + SW - R, 0)
  ctx.arcTo(SX + SW, 0, SX + SW, R, R)
  ctx.lineTo(SX + SW, H - R)
  ctx.arcTo(SX + SW, H, SX + SW - R, H, R)
  ctx.lineTo(SX + R, H)
  ctx.arcTo(SX, H, SX, H - R, R)
  ctx.lineTo(SX, R)
  ctx.arcTo(SX, 0, SX + R, 0, R)
  ctx.closePath()
}

export const SLOT_STYLE_REGISTRY: Record<string, SlotStyleDef> = {

  // ── 常规极简 ─────────────────────────────────────────────────────────────
  minimal: {
    id: 'minimal',
    label: '常规极简',
    drawBg: (ctx, _W, H, { tintFrom, tintTo }) => {
      ctx.save()
      skinPath(ctx, H)
      ctx.clip()
      const bg = ctx.createLinearGradient(SX, 0, SX + SW, H)
      bg.addColorStop(0, tintFrom)
      bg.addColorStop(1, tintTo)
      ctx.fillStyle = bg
      ctx.fillRect(SX, 0, SW, H)
      ctx.restore()
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
    // Figma API 精确还原（节点 48:262 蒙版VECTOR + 48:182 矩形备份7 + 圆形2柔光）
    // 两块拼接逻辑：矩形备份7在下，蒙版在上覆盖主区域，顶部弧形缺口让矩形备份7透出
    // 颜色完全跟随 preset：tintFrom/tintTo 为蒙版色，rect7From/rect7To 为叠层色
    drawBg: (ctx, _W, H, { tintFrom, tintTo, rect7From, rect7To }) => {
      ctx.save()
      skinPath(ctx, H)  // 外层 clip 防止溢出
      ctx.clip()

      // ① 矩形备份7（48:182，底层）: x=342 y=0 w=384 h=105，四角 r=24（Figma确认）
      // 填在蒙版顶部弧形缺口处，两块拼接形成完整背景
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(342 + 24, 0)               // top-left 圆角后
      ctx.lineTo(726 - 24, 0)               // 顶边
      ctx.arcTo(726, 0, 726, 24, 24)         // top-right r:24
      ctx.lineTo(726, 105 - 24)             // 右边
      ctx.arcTo(726, 105, 726 - 24, 105, 24) // bottom-right r:24
      ctx.lineTo(342 + 24, 105)             // 底边
      ctx.arcTo(342, 105, 342, 105 - 24, 24) // bottom-left r:24
      ctx.lineTo(342, 24)                   // 左边
      ctx.arcTo(342, 0, 342 + 24, 0, 24)    // top-left r:24
      ctx.closePath()
      ctx.clip()
      const rect7G = ctx.createLinearGradient(342, 0, 726, 0)
      rect7G.addColorStop(0, rect7From ?? '#FFD8DA')
      rect7G.addColorStop(1, rect7To ?? '#FFC7D4')
      ctx.fillStyle = rect7G
      ctx.fillRect(342, 0, 384, 105)
      ctx.restore()

      // ② 圆形2柔光（底层，在蒙版下方）
      ctx.save()
      ctx.filter = 'blur(71px)'
      ctx.beginPath()
      ctx.ellipse(110.5, -20, 152.5, 121, 0, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,249,254,0.70)'
      ctx.fill()
      ctx.filter = 'none'
      ctx.restore()

      // ③ 蒙版（48:262，上层）：Figma API 精确 SVG 路径
      // 路径坐标为 skin 空间(0-702)，+SX=24 转换为 750px canvas 坐标
      // 顶部弧形缺口：从 x≈405 到 x≈462 下降到 y=72，让矩形备份7在该区域显出
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(405.479, 0)
      ctx.bezierCurveTo(416.106, 0, 425.469, 6.989, 428.489, 17.179)
      ctx.lineTo(440.24, 56.824)
      ctx.bezierCurveTo(443.856, 65.972, 452.7, 72, 462.559, 72)
      ctx.lineTo(702, 72)
      ctx.bezierCurveTo(715.255, 72, 726, 82.745, 726, 96)  // top-right r:24
      ctx.lineTo(726, 218)
      ctx.bezierCurveTo(726, 231.255, 715.255, 242, 702, 242)  // bottom-right r:24
      ctx.lineTo(48, 242)
      ctx.bezierCurveTo(34.745, 242, 24, 231.255, 24, 218)    // bottom-left r:24
      ctx.lineTo(24, 24)
      ctx.bezierCurveTo(24, 10.745, 34.745, 0, 48, 0)         // top-left r:24
      ctx.lineTo(405.479, 0)
      ctx.closePath()
      ctx.clip()
      const mainBg = ctx.createLinearGradient(SX, 0, SX + SW, 0)
      mainBg.addColorStop(0, tintFrom)
      mainBg.addColorStop(1, tintTo)
      ctx.fillStyle = mainBg
      ctx.fillRect(SX, 0, SW, H)
      ctx.restore()

      ctx.restore()  // 释放 skinPath clip
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
