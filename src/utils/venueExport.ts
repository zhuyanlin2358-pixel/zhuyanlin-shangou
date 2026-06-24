/**
 * 会场拼图导出
 * 将头图 + 各组件预览图垂直拼合为 750px PNG 并下载
 */
import type { VenueItem, VenueHeaderSize } from '@/types'
import { downloadCanvas } from './exportUtils'

interface VenueStitchParams {
  items:      VenueItem[]
  headerUrl:  string
  headerSize: VenueHeaderSize
  bgColor:    string
}

const HEADER_HEIGHT: Record<VenueHeaderSize, number> = {
  '424': 424,
  '624': 624,
  '274': 274,
}

/** 加载图片为 HTMLImageElement（支持 data URL 和普通 URL） */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function drawVenueStitch(params: VenueStitchParams): Promise<void> {
  const { items, headerUrl, headerSize, bgColor } = params
  const W = 750

  // ── 计算总高度 ──────────────────────────────────────────────────────────────
  const headerH = headerUrl ? HEADER_HEIGHT[headerSize] : 0
  const STATUS_BAR = 26  // 模拟状态栏高度

  // 预加载所有图片，同时获取实际高度
  const itemImgs: (HTMLImageElement | null)[] = await Promise.all(
    items.map(it =>
      it.previewUrl ? loadImage(it.previewUrl).catch(() => null) : Promise.resolve(null)
    )
  )

  const headerImg = headerUrl ? await loadImage(headerUrl).catch(() => null) : null

  // 计算每个 item 在 750px 宽度下的实际渲染高度
  const itemHeights = items.map((it, idx) => {
    const img = itemImgs[idx]
    if (!img) return it.origH
    // 渲染宽 = 750px - 左右 padding（coupon 有 20px*2，其他 8px*2）
    const pad = it.componentId === 'coupon' ? 40 : 16
    const drawW = W - pad
    return Math.round((drawW / img.naturalWidth) * img.naturalHeight)
  })

  const GAP = 4  // 组件间距（用背景色填充）
  let totalH = STATUS_BAR
  if (headerImg) totalH += headerH
  items.forEach((it, idx) => {
    totalH += it.spacingAbove + itemHeights[idx] + GAP
  })
  totalH += 12 // 底部留白

  // ── 绘制 ────────────────────────────────────────────────────────────────────
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = totalH
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, W, totalH)

  let y = STATUS_BAR

  // 头图
  if (headerImg) {
    ctx.drawImage(headerImg, 0, y, W, headerH)
    y += headerH
  }

  // 各组件
  items.forEach((it, idx) => {
    const img = itemImgs[idx]
    if (!img) { y += itemHeights[idx] + GAP; return }

    y += it.spacingAbove  // 自定义上间距

    const isCoupon = it.componentId === 'coupon'
    const padX = isCoupon ? 20 : 8
    const drawW = W - padX * 2
    const drawH = itemHeights[idx]

    if (isCoupon) {
      // 红包有圆角：用 clip 实现
      ctx.save()
      const r = 10
      ctx.beginPath()
      ctx.moveTo(padX + r, y)
      ctx.lineTo(padX + drawW - r, y)
      ctx.arcTo(padX + drawW, y, padX + drawW, y + r, r)
      ctx.lineTo(padX + drawW, y + drawH - r)
      ctx.arcTo(padX + drawW, y + drawH, padX + drawW - r, y + drawH, r)
      ctx.lineTo(padX + r, y + drawH)
      ctx.arcTo(padX, y + drawH, padX, y + drawH - r, r)
      ctx.lineTo(padX, y + r)
      ctx.arcTo(padX, y, padX + r, y, r)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(img, padX, y, drawW, drawH)
      ctx.restore()
    } else {
      ctx.drawImage(img, padX, y, drawW, drawH)
    }

    y += drawH + GAP
  })

  downloadCanvas(canvas, '会场拼图.png')
}
