// effects/snow.js
// 雪花飘落 — 由 particle-system.ts 的 createSnowParticles + renderSnowFrame + drawSnowflake 转写

var SNOW_COLORS = ['#FFFFFF', '#EAF4FB', '#D0E9F7']

// 六角雪花：6 条主辐 + 每辐两侧小枝
function drawSnowflake(ctx, size, color, opacity) {
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.strokeStyle = color
  ctx.lineWidth = Math.max(0.6, size * 0.08)
  ctx.lineCap = 'round'
  var r = size * 0.5
  var branchR = r * 0.52
  var branchLen = r * 0.28
  for (var i = 0; i < 6; i++) {
    var a = (i / 6) * Math.PI * 2
    var ca = Math.cos(a), sa = Math.sin(a)
    // 主辐
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ca * r, sa * r); ctx.stroke()
    // 两侧小枝
    var bx = ca * branchR, by = sa * branchR
    for (var s = 0; s < 2; s++) {
      var side = s === 0 ? -1 : 1
      var ba = a + side * Math.PI / 3
      ctx.beginPath()
      ctx.moveTo(bx, by)
      ctx.lineTo(bx + Math.cos(ba) * branchLen, by + Math.sin(ba) * branchLen)
      ctx.stroke()
    }
  }
  ctx.restore()
}

window.EffectSnow = {
  name: '雪花飘落',

  // config: { size, density, speed, direction, turbulence, spread }
  init: function (config, canvasW, canvasH, rng) {
    var speedNorm = Math.max(0, Math.min(1, (config.speed - 0.2) / 2.8))
    var baseFallFrac = 0.9 - 0.6 * speedNorm // 0.9（慢）→ 0.3（快）

    var particles = []
    for (var n = 0; n < config.density; n++) {
      var fallFrac = Math.max(0.15, Math.min(1, baseFallFrac * (0.8 + rng() * 0.4)))
      var effectiveW = canvasW * (0.05 + 0.95 * config.spread)
      var startX = canvasW / 2 - effectiveW / 2 + rng() * effectiveW
      var turbK = Math.floor(rng() * 3) + 1
      particles.push({
        startX: startX,
        cycleOffset: rng(),
        fallFrac: fallFrac,
        wobbleAmp: 18 + rng() * 28, // 雪花横向飘摆更大
        wobbleK: Math.floor(rng() * 2) + 1,
        wobblePhase: rng() * Math.PI * 2,
        turbAmp: config.turbulence * 10 * (0.5 + rng()),
        turbK: turbK,
        turbPhase: rng() * Math.PI * 2,
        startRotation: rng() * Math.PI * 2,
        rotCycles: Math.floor(rng() * 3) - 1, // 慢转
        size: config.size * (0.15 + rng() * 0.7), // 雪花较小
        opacity: 0.5 + rng() * 0.5,
        colorVariant: Math.floor(rng() * SNOW_COLORS.length),
      })
    }
    return particles
  },

  draw: function (ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images) {
    var c = ctx2d || ctx
    var tNorm = t / durationMs
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i]
      var phase = (p.cycleOffset + t / durationMs) % 1
      if (phase >= p.fallFrac) continue

      var fallProgress = phase / p.fallFrac
      var y = -p.size + fallProgress * (canvasH + p.size * 2)
      var dirDrift = config.direction * (canvasH * 0.4) * fallProgress
      var wobble = p.wobbleAmp * Math.sin(2 * Math.PI * p.wobbleK * tNorm + p.wobblePhase)
      var turb = p.turbAmp * (
        0.6 * Math.sin(2 * Math.PI * p.turbK * tNorm + p.turbPhase) +
        0.4 * Math.sin(2 * Math.PI * (p.turbK * 2 + 1) * tNorm + p.turbPhase + 1.3)
      )
      var x = p.startX + dirDrift + wobble + turb
      var rotation = p.startRotation + 2 * Math.PI * p.rotCycles * tNorm

      // 渐隐
      var fadeStart = 0.6 + (p.wobblePhase / (Math.PI * 2)) * 0.25
      var fade = fallProgress < fadeStart ? 1 : Math.max(0, 1 - (fallProgress - fadeStart) / (1 - fadeStart))
      var opacity = p.opacity * fade
      if (opacity < 0.01) continue

      c.save()
      c.translate(x, y)
      c.rotate(rotation)
      var color = SNOW_COLORS[p.colorVariant % SNOW_COLORS.length]
      drawSnowflake(c, p.size, color, opacity)
      c.restore()
    }
  },
}
