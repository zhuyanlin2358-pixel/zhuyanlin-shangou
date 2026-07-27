// effects/sparkle.js
// 闪光粒子 — 由 particle-system.ts 的 createSparkleParticles + renderSparkleFrame + drawSparkleStar 转写
// 星光脉冲闪烁，含 brightness/glow

var SPARKLE_COLORS = ['#FFFFFF', '#FFD700', '#FFF0A0', '#E8F8FF', '#FFD6E8', '#FFFACD']

// 四角星形 + 中心高光点
function drawSparkleStar(ctx, size, color, opacity) {
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = color
  var r = size * 0.5
  var w = Math.max(0.5, size * 0.07) // 腰宽
  // 竖臂
  ctx.beginPath()
  ctx.moveTo(0, -r); ctx.lineTo(w, 0); ctx.lineTo(0, r); ctx.lineTo(-w, 0)
  ctx.closePath(); ctx.fill()
  // 横臂
  ctx.beginPath()
  ctx.moveTo(-r, 0); ctx.lineTo(0, w); ctx.lineTo(r, 0); ctx.lineTo(0, -w)
  ctx.closePath(); ctx.fill()
  // 中心高光点
  ctx.beginPath(); ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

window.EffectSparkle = {
  name: '闪光粒子',

  // config: { size, spread }  sc: { density, randomness, sizeScale, brightness }
  // 这里把 sc 的字段也并入 config：{ size, spread, density, randomness, sizeScale, brightness }
  init: function (config, canvasW, canvasH, rng) {
    var sc = config
    var effectiveW = canvasW * (0.05 + 0.95 * (config.spread || 1))
    // randomness: 0=节奏统一，1=完全随机
    var pulseBase = 500
    var pulseRange = 400 + (sc.randomness || 0) * 3600

    // 大小方差：低随机性→均匀；高随机性→差异大
    var sizeMin = 0.4 - (sc.randomness || 0) * 0.3
    var sizeVar = 0.3 + (sc.randomness || 0) * 1.0

    var particles = []
    var density = sc.density || 30
    for (var n = 0; n < density; n++) {
      particles.push({
        startX: canvasW / 2 - effectiveW / 2 + rng() * effectiveW,
        fixedYFrac: 0.04 + rng() * 0.92,
        wobbleAmp: 3 + rng() * 8,
        wobbleK: Math.floor(rng() * 3) + 1,
        wobblePhase: rng() * Math.PI * 2,
        pulseCycleMs: pulseBase + rng() * pulseRange,
        pulsePhase: rng() * Math.PI * 2,
        startRotation: rng() * Math.PI * 2,
        rotCycles: Math.floor(rng() * 3) - 1,
        size: (config.size || 20) * (sc.sizeScale || 1) * Math.max(0.05, sizeMin + rng() * sizeVar),
        maxOpacity: 0.45 + rng() * 0.55, // 0.45–1.0，亮度由 draw 乘上去
        colorVariant: Math.floor(rng() * SPARKLE_COLORS.length),
      })
    }
    return particles
  },

  // draw 签名: draw(ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images)
  // brightness 取自 config.brightness（实时乘，无需重建粒子）
  draw: function (ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images) {
    var c = ctx2d || ctx
    var brightness = config.brightness == null ? 1 : config.brightness
    var tNorm = t / durationMs
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i]
      var sinVal = Math.sin(2 * Math.PI * t / p.pulseCycleMs + p.pulsePhase)
      var opacity = p.maxOpacity * brightness * sinVal * sinVal
      if (opacity < 0.02) continue

      var x = p.startX + p.wobbleAmp * Math.sin(2 * Math.PI * p.wobbleK * tNorm + p.wobblePhase)
      var y = canvasH * p.fixedYFrac
      var rotation = p.startRotation + 2 * Math.PI * p.rotCycles * tNorm

      var glow = opacity * p.size * 0.3
      var sparkleColor = SPARKLE_COLORS[p.colorVariant % SPARKLE_COLORS.length]
      c.save()
      if (glow > 0.3) {
        // 浏览器：CSS filter blur 作发光
        c.filter = 'blur(' + glow.toFixed(1) + 'px)'
      }
      c.translate(x, y)
      c.rotate(rotation)
      drawSparkleStar(c, p.size, sparkleColor, opacity)
      c.restore()
    }
  },
}
