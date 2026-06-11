import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import { getSlotStyle, type SlotPrizeStyle } from './slotStyles'

export async function captureElement(
  el: HTMLElement,
  width: number,
  height: number,
  scale = 1,
): Promise<HTMLCanvasElement> {
  return html2canvas(el, {
    scale,
    width,
    height,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  })
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function downloadZip(
  files: { canvas: HTMLCanvasElement; name: string }[],
  zipName: string,
) {
  const zip = new JSZip()
  for (const f of files) {
    const blob = await canvasToBlob(f.canvas)
    zip.file(f.name, blob)
  }
  const content = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.download = zipName + '.zip'
  link.href = URL.createObjectURL(content)
  link.click()
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise(resolve =>
    canvas.toBlob(b => resolve(b!), 'image/png')
  )
}

/** 预加载自定义字体，确保 Canvas 绘制时可用 */
export async function preloadFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return
  await Promise.allSettled([
    document.fonts.load('400 16px "FZLanTingHei-M"'),
    document.fonts.load('400 16px "FZLanTingHei-DB"'),
    document.fonts.load('400 16px "FZLanTingHei"'),
    document.fonts.load('700 16px "MeituanDigitalType"'),
  ])
}

// ── Canvas 直接绘制工具 ──────────────────────────────────────────────────────

// FZLanTingHei-M-GBK：正文/链接/计数/底部文字
const F  = '"FZLanTingHei-M","PingFang SC","Microsoft YaHei",sans-serif'
// FZLanTingHei-DB-GBK：标题/按钮/大字
const FB = '"FZLanTingHei-DB","FZLanTingHei-M","PingFang SC","Microsoft YaHei",sans-serif'

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

export interface BannerConfig {
  slotTintFrom: string; slotTintTo: string
  slotRect7From?: string; slotRect7To?: string
  titleText: string;    titleColor: string
  linksColor: string
  btnActiveFrom: string; btnActiveTo: string
  btnTextColor?: string  // 按钮文字颜色，默认 #fff
  slotStyle?: string
}

/** 绘制 slot_1 未抽奖状态 @2x → 1500×484，prizeCanvases 为 3 张奖品 canvas */
export async function drawSlotBannerCanvas(
  cfg: BannerConfig,
  prizeCanvases: (HTMLCanvasElement | null)[],
): Promise<HTMLCanvasElement> {
  const W = 750, H = 242
  const canvas = document.createElement('canvas')
  canvas.width = W * 2; canvas.height = H * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)

  // 背景：调用风格注册表（背景在各自的702×242区域内自绘，无全宽clip）
  getSlotStyle(cfg.slotStyle).drawBg(ctx, W, H, { tintFrom: cfg.slotTintFrom, tintTo: cfg.slotTintTo, rect7From: cfg.slotRect7From, rect7To: cfg.slotRect7To })

  // 白色奖品框（Figma 13:431：白色 + 底部淡粉渐变 + 白色描边 + 内阴影）
  roundedRect(ctx, 43, 75, 427, 142, 24)
  const boxFill = ctx.createLinearGradient(43, 75, 43, 75 + 142)
  boxFill.addColorStop(0, '#FFFFFF')
  boxFill.addColorStop(0.67, '#FFFFFF')
  boxFill.addColorStop(1, 'rgba(255,246,249,1)')
  ctx.fillStyle = boxFill; ctx.fill()
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.stroke()
  roundedRect(ctx, 43, 75, 427, 142, 24)
  const boxInner = ctx.createLinearGradient(43, 217 - 4, 43, 217)
  boxInner.addColorStop(0, 'rgba(255,255,255,0)')
  boxInner.addColorStop(1, 'rgba(255,255,255,0.6)')
  ctx.fillStyle = boxInner; ctx.fill()

  // 按钮渐变
  const btnX = 499
  roundedRect(ctx, btnX, 104, 194, 80, 40)
  const btnG = ctx.createLinearGradient(btnX, 0, btnX + 194, 0)
  btnG.addColorStop(0, cfg.btnActiveFrom)
  btnG.addColorStop(1, cfg.btnActiveTo)
  ctx.fillStyle = btnG
  ctx.fill()

  // 两侧装饰箭头 — 仅日常活动（Figma 位图备份3 4 / 位图4，26×26）
  // x:31 y:139（左）/ x:452 y:139（右），来自 Figma API 精确坐标
  if (cfg.slotStyle === 'daily') {
    const BASE = import.meta.env.BASE_URL
    try {
      const [arrowL, arrowR] = await Promise.all([
        loadImage(`${BASE}arrow-left.png`),
        loadImage(`${BASE}arrow-right.png`),
      ])
      ctx.drawImage(arrowL, 31, 139, 26, 26)
      ctx.drawImage(arrowR, 452, 139, 26, 26)
    } catch {
      // fallback: 简单三角
      ctx.fillStyle = 'rgba(222,152,60,0.75)'
      ctx.beginPath(); ctx.moveTo(55,139); ctx.lineTo(31,152); ctx.lineTo(55,165); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(452,139); ctx.lineTo(478,152); ctx.lineTo(452,165); ctx.closePath(); ctx.fill()
    }
  }

  // 奖品 canvas 贴入白框（水平居中）
  const innerW = 427 - 24  // 403
  const cardsW = 3 * 124 + 2 * 8  // 388
  const px = 43 + 12 + (innerW - cardsW) / 2  // ≈ 62.5
  const py = 75 + (142 - 124) / 2              // 84
  prizeCanvases.forEach((pc, i) => {
    if (pc) ctx.drawImage(pc, px + i * 132, py, 124, 124)
  })

  // 文字部分（重置 globalAlpha 防止 path/透明度污染）
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.font = `400 38px ${FB}`   // FZLanTingHei-DB-GBK
  ctx.fillStyle = cfg.titleColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(cfg.titleText, 43, 40)

  // 链接文字（右对齐）Figma: 45px FZLanTingHei-M-GBK，letterSpacing=2
  ctx.font = `400 45px ${F}`
  if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = '2px'
  ctx.fillStyle = cfg.linksColor
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('我的奖品 | 抽奖规则', W - 48, 38)
  if ('letterSpacing' in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px'

  // 按钮文字 FZLanTingHei-M（比 DB 细一度，用户要求）
  ctx.font = `400 34px ${F}`
  ctx.fillStyle = cfg.btnTextColor ?? '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('立即抽奖', btnX + 97, 144)

  // 剩余次数 FZLanTingHei-M-GBK
  ctx.font = `400 20px ${F}`
  ctx.fillStyle = cfg.linksColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('还剩 999 次抽奖机会', btnX + 97, 203)

  return downsample(canvas)  // 2x → 1x 超采样
}

// ── 超采样：2x 内部渲染 → 缩回原尺寸，清晰度提升 ───────────────────────────
function downsample(hq: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width  = hq.width  / 2
  out.height = hq.height / 2
  const ctx = out.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(hq, 0, 0, out.width, out.height)
  return out
}

// ── 图片加载工具 ─────────────────────────────────────────────────────────────
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** 在 canvas 内指定区域绘制 contain 图片，支持 offset+scale */
function drawContainedImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number, cy: number, cw: number, ch: number,
  offsetX: number, offsetY: number, scale: number,
) {
  const ar = img.naturalWidth / img.naturalHeight
  const arC = cw / ch
  let dw = ar >= arC ? cw : ch * ar
  let dh = ar >= arC ? cw / ar : ch
  dw *= scale; dh *= scale
  const dx = cx + cw / 2 + offsetX - dw / 2
  const dy = cy + ch / 2 + offsetY - dh / 2
  ctx.save()
  ctx.beginPath()
  ctx.rect(cx, cy, cw, ch)
  ctx.clip()
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

/** 绘制 slot_4 按钮 @2x → 388×160；使用 M 字体（比 DB 细一度）*/
export function drawButtonCanvas(text: string, from: string, to: string, textColor = '#fff'): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 388; canvas.height = 160
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)
  roundedRect(ctx, 0, 0, 194, 80, 40)
  const g = ctx.createLinearGradient(0, 0, 194, 0)
  g.addColorStop(0, from); g.addColorStop(1, to)
  ctx.fillStyle = g; ctx.fill()
  ctx.font = `400 34px ${F}`; ctx.fillStyle = textColor
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, 97, 40)
  return downsample(canvas)
}

/** 绘制 slot_5 链接文字（透明底）@2x；w 应比实际文字宽留 padding，确保不裁切 */
export function drawLinkCanvas(
  parts: { text: string; opacity?: number }[],
  color: string, w: number, h: number, fontSize: number,
  letterSpacing = 0,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = w * 2; canvas.height = h * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)
  ctx.font = `${fontSize}px ${F}`; ctx.textBaseline = 'middle'
  if (letterSpacing > 0 && 'letterSpacing' in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${letterSpacing}px`
  }
  // 计算总宽（补偿 measureText 可能不计入 letterSpacing）
  let totalW = 0
  for (const p of parts) {
    totalW += ctx.measureText(p.text).width
    totalW += letterSpacing * Math.max(0, p.text.length - 1)
    if (p.opacity !== undefined) totalW += 8
  }
  let x = (w - totalW) / 2
  for (const p of parts) {
    const tw = ctx.measureText(p.text).width
    const lsEx = letterSpacing * Math.max(0, p.text.length - 1)
    ctx.globalAlpha = p.opacity ?? 1
    ctx.fillStyle = color
    ctx.fillText(p.text, x, h / 2)
    x += tw + lsEx + (p.opacity !== undefined ? 8 : 0)
  }
  ctx.globalAlpha = 1
  return downsample(canvas)
}

/** 奖品类型最小接口 */
export interface PrizeInfo {
  type: 'product-tag' | 'product-dashed' | 'thanks' | 'amount'
  imageUrl?: string; tag?: string
  amount?: string; unit?: string
  bottomText?: string; thanksText?: string
}
export interface XfTransform { offsetX: number; offsetY: number; scale: number }

/** 绘制 slot_6 奖品图 @2x → 248×248；styleName 对应 SLOT_STYLE_REGISTRY */
export async function drawPrizeCanvas(prize: PrizeInfo, tr: XfTransform, styleName?: string): Promise<HTMLCanvasElement> {
  const W = 124, H = 124
  const canvas = document.createElement('canvas')
  canvas.width = W * 2; canvas.height = H * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)

  const ps: SlotPrizeStyle = getSlotStyle(styleName).prizeStyle
  const isDashed = prize.type === 'product-dashed'
  const isThanks = prize.type === 'thanks'
  const isAmount = prize.type === 'amount'
  const showImg  = prize.type === 'product-tag' || isDashed
  // Card geometry
  const cX = (W - 111) / 2, cY = (H - 119) / 2  // 6.5, 2.5

  if (isThanks) {
    // Figma 还原：外圆(极浅金) + 内圆(三段渐变金) + 两行文字
    const cx = W / 2, cy = H / 2
    // 外圆 124×124，fill #FCEAAB
    ctx.beginPath(); ctx.arc(cx, cy, 62, 0, Math.PI * 2)
    ctx.fillStyle = '#FCEAAB'; ctx.fill()
    // 内圆 111×111 at (6,6)，三段渐变
    const ig = ctx.createLinearGradient(cx, cy - 55.5, cx, cy + 55.5)
    ig.addColorStop(0.04, '#FEF8DD')
    ig.addColorStop(0.50, '#FBE5A2')
    ig.addColorStop(1.00, '#FDF4C8')
    ctx.beginPath(); ctx.arc(cx, cy, 55.5, 0, Math.PI * 2)
    ctx.fillStyle = ig; ctx.fill()
    // 文字两行：谢谢 / 参与，30px，#77321E
    const text = prize.thanksText || '谢谢参与'
    ctx.fillStyle = '#77321E'
    ctx.textAlign = 'center'
    ctx.font = `400 30px ${F}`
    if (text === '谢谢参与') {
      ctx.textBaseline = 'middle'
      ctx.fillText('谢谢', cx, cy - 15)
      ctx.fillText('参与', cx, cy + 15)
    } else {
      ctx.textBaseline = 'middle'
      ctx.font = `700 22px ${F}`
      ctx.fillText(text, cx, cy)
    }
    return downsample(canvas)
  }

  // Draw card background
  roundedRect(ctx, cX, cY, 111, 119, 17)
  if (ps.bgType === 'gradient') {
    const bg = ctx.createLinearGradient(cX, cY, cX, cY + 119)
    bg.addColorStop(0, ps.bgColor)
    bg.addColorStop(1, ps.bgColorEnd)
    ctx.fillStyle = bg
  } else {
    ctx.fillStyle = ps.bgColor
  }
  ctx.fill()

  // Border
  if (isDashed && ps.useDashedBorder) {
    ctx.setLineDash([3, 3]); ctx.strokeStyle = ps.borderColor; ctx.lineWidth = 1.5
  } else {
    ctx.setLineDash([]); ctx.strokeStyle = ps.borderColor; ctx.lineWidth = 1
  }
  ctx.stroke(); ctx.setLineDash([])

  // Product image area
  if (showImg) {
    const iw = isDashed ? 77 : 72, ih = isDashed ? 78 : 72
    const ix = cX + (111 - iw) / 2, iy = cY + 119 - 31 - ih
    if (prize.imageUrl) {
      try { await drawContainedImage(ctx, await loadImage(prize.imageUrl), ix, iy, iw, ih, tr.offsetX, tr.offsetY, tr.scale) }
      catch { /* no image */ }
    }
  }
  // Top label（product-tag 和 amount 类型均支持）
  if ((prize.type === 'product-tag' || isAmount) && prize.tag) {
    const lx = cX + (111 - 81) / 2
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(lx, cY); ctx.lineTo(lx + 81, cY)
    ctx.lineTo(lx + 81, cY + 18 - 6); ctx.arcTo(lx + 81, cY + 18, lx + 81 - 6, cY + 18, 6)
    ctx.lineTo(lx + 6, cY + 18); ctx.arcTo(lx, cY + 18, lx, cY + 18 - 6, 6)
    ctx.closePath()
    ctx.fillStyle = ps.labelBg; ctx.fill(); ctx.restore()
    ctx.font = `12px ${F}`; ctx.fillStyle = ps.textPrimary
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(prize.tag, lx + 40.5, cY + 9)
  }
  // Amount type — 数字 + 单位 baseline 对齐，水平居中
  if (isAmount) {
    const numStr = prize.amount || '30'
    const unitStr = prize.unit || '元'
    ctx.fillStyle = ps.textPrimary
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    ctx.font = `700 60px "MeituanDigitalType",${F}`
    const numW = ctx.measureText(numStr).width
    ctx.font = `600 16px ${F}`
    const unitW = ctx.measureText(unitStr).width
    const gap = 2
    const startX = cX + (111 - numW - gap - unitW) / 2
    const baseY = prize.tag ? cY + 80 : cY + 70

    ctx.font = `700 60px "MeituanDigitalType",${F}`
    ctx.fillText(numStr, startX, baseY)
    ctx.font = `600 16px ${F}`
    ctx.fillText(unitStr, startX + numW + gap, baseY)
  }
  // Bottom text
  if (!isThanks && prize.bottomText) {
    ctx.font = `500 13px ${F}`; ctx.fillStyle = ps.textSecondary
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(prize.bottomText, W / 2, cY + 119 - 8 - 6.5)
  }
  return downsample(canvas)
}

/** 绘制弹窗按钮 @2x → 276×118（Figma node 15:5614 精确值）；textColor 默认白色 */
export function drawDialogButtonCanvas(
  text: string, from: string, to: string, subText?: string, textColor = '#fff',
): HTMLCanvasElement {
  const W = 276, H = 118
  const canvas = document.createElement('canvas')
  canvas.width = W * 2; canvas.height = H * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)
  roundedRect(ctx, 0, 0, W, H, 59)  // 59 = H/2，完美胶囊形
  const g = ctx.createLinearGradient(W * 0.2, H, W * 0.8, 0)
  g.addColorStop(0, from); g.addColorStop(1, to)
  ctx.fillStyle = g; ctx.fill()
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  if (subText) {
    ctx.font = `400 22px ${F}`; ctx.textBaseline = 'middle'
    ctx.globalAlpha = 0.7
    ctx.fillText(subText, W / 2, H / 2 - 14)
    ctx.globalAlpha = 1
    ctx.font = `400 34px ${F}`
    ctx.fillText(text, W / 2, H / 2 + 14)
  } else {
    ctx.font = `400 38px ${F}`; ctx.textBaseline = 'middle'
    ctx.fillText(text, W / 2, H / 2)
  }
  return downsample(canvas)
}

/** 绘制弹窗结果页 @2x → 750×612 */
export function drawDialogResultCanvas(
  state: string, tintFrom: string, tintTo: string, titleColor = '#fff',
): HTMLCanvasElement {
  const W = 750, H = 612
  const canvas = document.createElement('canvas')
  canvas.width = W * 2; canvas.height = H * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)
  // 外层彩色圆角卡片 (706×577 at 24,14 r:43)
  roundedRect(ctx, 24, 14, 706, 577, 43)
  const bg = ctx.createLinearGradient(24, 14, 730, 591)
  bg.addColorStop(0, tintFrom); bg.addColorStop(1, tintTo)
  ctx.fillStyle = bg; ctx.fill()
  // 白色内容卡 (655×339 at 49,106 r:25)
  roundedRect(ctx, 49, 106, 655, 339, 25)
  ctx.fillStyle = '#fff'; ctx.fill()
  // 状态标题文字（居中，彩色区顶部）
  ctx.globalAlpha = 1; ctx.beginPath()
  ctx.font = `500 42px ${F}`
  ctx.fillStyle = titleColor
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(state, W / 2, 57)
  return downsample(canvas)
}

/** 绘制 slot_3 空态页 → 输出 854×284（@2x of 427×142） */
export async function drawEmptyStateCanvas(
  imageUrl: string, transform: XfTransform, text: string,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = 854; canvas.height = 284
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)  // draw at CSS px, output @2x
  // White rounded card
  roundedRect(ctx, 0, 0, 427, 142, 12)
  ctx.fillStyle = '#fff'; ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1; ctx.stroke()
  // Illustration image
  if (imageUrl) {
    try {
      const img = await loadImage(imageUrl)
      drawContainedImage(ctx, img, (427 - 239) / 2, 15, 239, 96, transform.offsetX, transform.offsetY, transform.scale)
    } catch { /* no image */ }
  }
  // Text
  ctx.font = `13px ${F}`; ctx.fillStyle = '#999'
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.fillText(text, 427 / 2, 15 + 96 + 4)
  return canvas
}

/** 绘制 slot_2 背景 750×242（无奖品无按钮，含主标题 + 日常活动箭头） */
export async function drawSlotBgCanvas(
  cfg: Pick<BannerConfig, 'slotTintFrom' | 'slotTintTo' | 'slotRect7From' | 'slotRect7To' | 'titleText' | 'titleColor' | 'slotStyle'>,
): Promise<HTMLCanvasElement> {
  const W = 750, H = 242
  const canvas = document.createElement('canvas')
  canvas.width = W * 2; canvas.height = H * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)

  getSlotStyle(cfg.slotStyle).drawBg(ctx, W, H, {
    tintFrom: cfg.slotTintFrom, tintTo: cfg.slotTintTo,
    rect7From: cfg.slotRect7From, rect7To: cfg.slotRect7To,
  })

  // 白色奖品框（与 slot_1 相同，slot_2 保留框体但不放奖品图）
  roundedRect(ctx, 43, 75, 427, 142, 24)
  const boxFill2 = ctx.createLinearGradient(43, 75, 43, 217)
  boxFill2.addColorStop(0, '#FFFFFF')
  boxFill2.addColorStop(0.67, '#FFFFFF')
  boxFill2.addColorStop(1, 'rgba(255,246,249,1)')
  ctx.fillStyle = boxFill2; ctx.fill()
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.stroke()

  // 日常活动：两侧装饰箭头（与 slot_1 完全相同）
  if (cfg.slotStyle === 'daily') {
    const BASE = import.meta.env.BASE_URL
    try {
      const [arrowL, arrowR] = await Promise.all([
        loadImage(`${BASE}arrow-left.png`),
        loadImage(`${BASE}arrow-right.png`),
      ])
      ctx.drawImage(arrowL, 31, 139, 26, 26)
      ctx.drawImage(arrowR, 452, 139, 26, 26)
    } catch {
      ctx.fillStyle = 'rgba(222,152,60,0.75)'
      ctx.beginPath(); ctx.moveTo(55,139); ctx.lineTo(31,152); ctx.lineTo(55,165); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(452,139); ctx.lineTo(478,152); ctx.lineTo(452,165); ctx.closePath(); ctx.fill()
    }
  }

  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.font = `400 38px ${FB}`
  ctx.fillStyle = cfg.titleColor
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(cfg.titleText, 43, 40)

  return downsample(canvas)
}
