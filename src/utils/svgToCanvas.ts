/**
 * SVG 字符串 → Canvas → PNG
 *
 * 核心思路：
 *   颜色直接插值进 SVG 字符串（不用 CSS 变量）
 *   → Blob URL → Image → Canvas @2x 超采样 → 输出 1x PNG
 *
 * 为什么不用 CSS 变量：
 *   SVG 序列化成 Blob 后进入独立上下文，CSS 变量无法跨上下文传递。
 *   模板字符串插值是最可靠、无副作用的方案。
 */
export function svgToCanvas(
  svgString: string,
  width: number,
  height: number,
  scale = 2,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    // 确保 SVG 有正确的命名空间和尺寸
    const svg = svgString
      .replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"`)

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url  = URL.createObjectURL(blob)

    const img = new Image()
    img.onload = () => {
      // @2x 超采样
      const hi = document.createElement('canvas')
      hi.width = width * scale; hi.height = height * scale
      hi.getContext('2d')!.drawImage(img, 0, 0, width * scale, height * scale)
      URL.revokeObjectURL(url)

      // 缩回 1x
      const out = document.createElement('canvas')
      out.width = width; out.height = height
      out.getContext('2d')!.drawImage(hi, 0, 0, width, height)
      resolve(out)
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG 渲染失败')) }
    img.src = url
  })
}

/** 便捷：canvas → data URL（用于 previewUrl / 加入会场） */
export async function svgToDataUrl(
  svgString: string,
  width: number,
  height: number,
): Promise<string> {
  const canvas = await svgToCanvas(svgString, width, height)
  return canvas.toDataURL('image/png')
}
