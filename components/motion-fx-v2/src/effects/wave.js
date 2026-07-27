// effects/wave.js
// 波形抖动（简化版：单圆心径向波形位移）— 由 particle-system.ts 的 renderWaveDistort 转写
// 逐 tile 读取底图，按正弦函数偏移后绘制，形成流体波浪形变
// 整数 waveCount 保证 t=0 与 t=durationMs 时相位完全一致 → 无缝循环

window.EffectWave = {
  name: '波形抖动',

  // config: { centerX, centerY, radius, waveCount, angle, amplitude, frequency, isRadial }
  // 创建波形圆心参数（init 仅作占位/校验，实际计算在 draw 内做）
  init: function (config, canvasW, canvasH, rng) {
    return {
      centerX: config.centerX,
      centerY: config.centerY,
      radius: config.radius,
      waveCount: config.waveCount,
      angle: config.angle,
      amplitude: config.amplitude,
      frequency: config.frequency,
      isRadial: config.isRadial,
    }
  },

  // draw 签名: draw(ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images)
  // images.base = 底图 HTMLImageElement
  draw: function (ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images) {
    var c = ctx2d || ctx
    var image = images && images.base
    if (!image) return

    // 先画完整静态图作为底层
    c.drawImage(image, 0, 0, canvasW, canvasH)

    var TILE = 2 // tile 尺寸（px）

    // 图片自然尺寸（drawImage 源坐标是图片像素，需把画布坐标 × scale 才能正确采样）
    var natW = image.naturalWidth || image.width || canvasW
    var natH = image.naturalHeight || image.height || canvasH
    var scaleX = natW / canvasW
    var scaleY = natH / canvasH

    var cx = config.centerX * canvasW
    var cy = config.centerY * canvasH
    var r = config.radius * Math.hypot(canvasW, canvasH) / 2
    var tPhase = (t / durationMs) * Math.PI * 2 * config.waveCount
    var fixedRad = config.angle * Math.PI / 180
    var amplitude = config.amplitude
    var frequency = config.frequency
    var isRadial = config.isRadial

    for (var ty = 0; ty < canvasH; ty += TILE) {
      for (var tx = 0; tx < canvasW; tx += TILE) {
        var tcx = tx + TILE / 2
        var tcy = ty + TILE / 2
        var ddx = tcx - cx
        var ddy = tcy - cy
        var d = Math.sqrt(ddx * ddx + ddy * ddy)
        if (d < 0.5) continue

        var t2 = d / r
        // 高斯衰减：无硬截止边界
        var fade = Math.exp(-2.5 * t2 * t2)
        if (fade < 0.002) continue

        var disp = amplitude * fade * Math.sin(d * frequency - tPhase)
        var totalDx, totalDy
        if (isRadial) {
          var a = Math.atan2(ddy, ddx)
          totalDx = disp * Math.cos(a)
          totalDy = disp * Math.sin(a)
        } else {
          totalDx = disp * Math.cos(fixedRad)
          totalDy = disp * Math.sin(fixedRad)
        }

        // 静态底图已覆盖，位移为 0 时跳过（性能优化）
        if (totalDx === 0 && totalDy === 0) continue

        // 边缘衰减：靠近画布四边时位移平滑降为 0，防止边缘被拉扯抖动
        var EDGE = 40
        var eL = Math.min(tx / EDGE, 1)
        var eR = Math.min((canvasW - tx) / EDGE, 1)
        var eT = Math.min(ty / EDGE, 1)
        var eB = Math.min((canvasH - ty) / EDGE, 1)
        var edgeFade = eL * eR * eT * eB
        if (edgeFade === 0) continue
        totalDx *= edgeFade
        totalDy *= edgeFade

        var twC = Math.min(TILE, canvasW - tx)
        var thC = Math.min(TILE, canvasH - ty)
        var twI = twC * scaleX
        var thI = thC * scaleY
        var srcX = Math.max(0, Math.min(natW - twI, (tx + totalDx) * scaleX))
        var srcY = Math.max(0, Math.min(natH - thI, (ty + totalDy) * scaleY))

        c.drawImage(image, srcX, srcY, twI, thI, tx, ty, twC, thC)
      }
    }
  },
}
