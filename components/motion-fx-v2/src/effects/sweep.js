// effects/sweep.js
// 扫光（简化版：全图线性渐变扫光，无路径蒙版）— 由 particle-system.ts 的 renderSweepLight 转写
// 原理：沿扫光方向移动的线性渐变光束，整图填充，整数 waveCount 保证首尾无缝循环
// 无状态（无 init）

window.EffectSweep = {
  name: '扫光',

  // config: { angle, width, brightness, color, softness, waveCount }
  // 无 init（无粒子状态）
  init: function () { return null },

  draw: function (ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images) {
    var c = ctx2d || ctx
    var brightness = config.brightness
    if (brightness <= 0) return
    var waveCount = config.waveCount || 1

    // 扫光方向向量
    var rad = (config.angle * Math.PI) / 180
    var sdx = Math.cos(rad), sdy = Math.sin(rad)

    // 画布对角线 & 光束半宽
    var diag = Math.hypot(canvasW, canvasH)
    var halfW = (config.width * diag) / 2

    // 当前光束中心位置（沿扫光方向，从画布外左侧扫到画布外右侧，整数循环）
    // tNorm=0 时光束完全在画布外 → 首尾无缝接
    var tNorm = ((t / durationMs) * waveCount) % 1
    var travel = diag + 2 * halfW
    var pos = tNorm * travel - (diag / 2 + halfW) // 中心距画布中心的距离

    var cx = canvasW / 2, cy = canvasH / 2
    var scx = cx + sdx * pos, scy = cy + sdy * pos

    // 渐变起止点（沿扫光方向，±halfW）
    var g1x = scx - sdx * halfW, g1y = scy - sdy * halfW
    var g2x = scx + sdx * halfW, g2y = scy + sdy * halfW

    // 颜色解析（hex → r,g,b）
    var rr = parseInt(config.color.slice(1, 3), 16)
    var rg = parseInt(config.color.slice(3, 5), 16)
    var rb = parseInt(config.color.slice(5, 7), 16)
    var soft = Math.max(0.02, Math.min(0.48, config.softness * 0.48))

    var g = c.createLinearGradient(g1x, g1y, g2x, g2y)
    g.addColorStop(0, 'rgba(' + rr + ',' + rg + ',' + rb + ',0)')
    g.addColorStop(soft, 'rgba(' + rr + ',' + rg + ',' + rb + ',' + brightness + ')')
    g.addColorStop(0.5, 'rgba(' + rr + ',' + rg + ',' + rb + ',' + brightness + ')')
    g.addColorStop(1 - soft, 'rgba(' + rr + ',' + rg + ',' + rb + ',' + brightness + ')')
    g.addColorStop(1, 'rgba(' + rr + ',' + rg + ',' + rb + ',0)')

    c.save()
    c.globalCompositeOperation = 'screen'
    c.fillStyle = g
    c.fillRect(0, 0, canvasW, canvasH)
    c.restore()
  },
}
