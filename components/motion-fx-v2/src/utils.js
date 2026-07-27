// ── 工具函数 ──────────────────────────────────────────────────────

/** 确定性随机数生成器（LCG），同种子产生相同序列 */
function seededRng(seed = 12345) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff
    return (s & 0x7fffffff) / 0x7fffffff
  }
}

/** 线性插值 */
function lerp(a, b, t) { return a + (b - a) * t }

/** 缓动函数 */
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 }
function easeOut(t) { return 1 - Math.pow(1 - t, 3) }
function easeIn(t) { return t * t * t }

/** 加载图片 → Promise<HTMLImageElement> */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith('data:')) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** HSL 饱和度调节（hex 颜色 → 调节饱和度 → hex） */
function adjustHexSaturation(hex, factor) {
  if (Math.abs(factor - 1) < 0.01) return hex
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0, s = 0
  if (d > 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  const newS = Math.max(0, Math.min(1, s * factor))
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  const q2 = l < 0.5 ? l * (1 + newS) : l + newS - l * newS
  const p2 = 2 * l - q2
  const nr = newS === 0 ? l : hue2rgb(p2, q2, h + 1/3)
  const ng = newS === 0 ? l : hue2rgb(p2, q2, h)
  const nb = newS === 0 ? l : hue2rgb(p2, q2, h - 1/3)
  const toH = v => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toH(nr)}${toH(ng)}${toH(nb)}`
}

// 暴露到全局
window.Utils = { seededRng, lerp, easeInOut, easeOut, easeIn, loadImage, adjustHexSaturation }
