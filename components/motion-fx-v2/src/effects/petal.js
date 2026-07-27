// effects/petal.js
// 花瓣飘落 — 由 particle-system.ts 的 createLoopParticles + renderLoopFrame + drawShape + drawWithBlur 转写
// 无缝循环：所有周期量使用整数频率，t=0 与 t=durationMs 状态完全一致

var PETAL_KEYS = ['petal1', 'petal3']

// ── 绘制单个粒子 ───────────────────────────────────────────────────
function drawShape(ctx, shape, size, color, opacity, petalVariant, images) {
  ctx.save()
  ctx.globalAlpha = opacity

  if (shape === 'petal') {
    var key = PETAL_KEYS[Math.min(petalVariant, PETAL_KEYS.length - 1)]
    var img = images ? images[key] : null
    if (img) {
      // 直接画预先着色好的图（颜色由外部 colorize 处理，保留明暗）
      var s = size * 1.4
      ctx.drawImage(img, -s / 2, -s / 2, s, s)
    } else {
      // 图片未就绪时回退椭圆
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.ellipse(0, 0, size * 0.3, size * 0.55, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
    return
  }

  ctx.fillStyle = color

  if (shape === 'circle') {
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2)
    ctx.fill()
  } else if (shape === 'heart') {
    var s = size * 0.04
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.1)
    ctx.bezierCurveTo(12 * s, -14 * s, 20 * s, 2 * s, 0, 14 * s)
    ctx.bezierCurveTo(-20 * s, 2 * s, -12 * s, -14 * s, 0, -size * 0.1)
    ctx.fill()
  } else if (shape === 'star') {
    var outer = size * 0.5
    var inner = size * 0.22
    ctx.beginPath()
    for (var i = 0; i < 10; i++) {
      var r = i % 2 === 0 ? outer : inner
      var angle = (i * Math.PI) / 5 - Math.PI / 2
      if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
      else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
    }
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

// ── 模糊绘制辅助 ──────────────────────────────────────────────────
// 浏览器端纯 JS：用 ctx.filter = 'blur(r px)'（GPU 支持）
function drawWithBlur(ctx, blur, drawFn, baseOpacity) {
  if (blur <= 0.1) { drawFn(baseOpacity); return }
  ctx.filter = 'blur(' + blur.toFixed(2) + 'px)'
  drawFn(baseOpacity)
  ctx.filter = 'none'
}

window.EffectPetal = {
  name: '花瓣飘落',

  // config: { size, density, speed, direction, turbulence, spread, color, shape }
  init: function (config, canvasW, canvasH, rng) {
    // fallFrac: 粒子"落下"阶段占循环时长的比例
    // 低速 → fallFrac 接近 1.0 → 粒子缓慢贯穿整个循环 → 视觉慢
    // 高速 → fallFrac 小       → 快速掠过后静止等待   → 视觉快
    var speedNorm = Math.max(0, Math.min(1, (config.speed - 0.2) / 2.8))
    var baseFallFrac = 1.0 - 0.85 * speedNorm // 1.0 at speed=0.2, 0.15 at speed=3.0

    // 抖动：turbulence 0–1 映射到抖动幅度
    var baseTurbAmp = config.turbulence * 32

    var particles = []
    for (var n = 0; n < config.density; n++) {
      var fallFrac = Math.max(0.1, Math.min(1, baseFallFrac * (0.7 + rng() * 0.6)))
      var turbK = Math.floor(rng() * 3) + 1 // 1/2/3，与 wobbleK 错相位组合形成拍频

      // spread 控制横向散布范围：0=仅中央 5% 宽，1=铺满全幅
      var effectiveW = canvasW * (0.05 + 0.95 * config.spread)
      var startX = canvasW / 2 - effectiveW / 2 + rng() * effectiveW

      particles.push({
        startX: startX,
        cycleOffset: rng(),
        fallFrac: fallFrac,
        wobbleAmp: 6 + rng() * 16,
        wobbleK: Math.floor(rng() * 3) + 1,
        wobblePhase: rng() * Math.PI * 2,
        startRotation: rng() * Math.PI * 2,
        rotCycles: Math.floor(rng() * 5) - 2,
        turbAmp: baseTurbAmp * (0.5 + rng() * 1.0),
        turbK: turbK,
        turbPhase: rng() * Math.PI * 2,
        size: config.size * (0.2 + rng() * 1.6),
        opacity: 0.6 + rng() * 0.4,
        petalVariant: Math.floor(rng() * 2), // 0|1
        blur: 1.5 + rng() * 2.5,
        blurCycleMs: 3000 + rng() * 4000,
        blurPhase: rng() * Math.PI * 2,
      })
    }
    return particles
  },

  draw: function (ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images) {
    var c = ctx2d || ctx
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i]
      // phase ∈ [0,1)：循环相位
      var phase = (p.cycleOffset + t / durationMs) % 1

      // 落下：phase ∈ [0, fallFrac) → y 从 -size 到 canvasH+size
      // 等待：phase ∈ [fallFrac, 1) → 屏幕外上方，不绘制
      if (phase >= p.fallFrac) continue

      var fallProgress = phase / p.fallFrac
      var y = -p.size + fallProgress * (canvasH + p.size * 2)

      // 方向偏移：direction ∈ [-1,+1]，最大偏移 = canvasH × 0.55
      var dirDrift = config.direction * (canvasH * 0.55) * fallProgress

      var wobble = p.wobbleAmp * Math.sin(2 * Math.PI * p.wobbleK * (t / durationMs) + p.wobblePhase)

      var tNorm = t / durationMs
      var turb = p.turbAmp * (
        0.6 * Math.sin(2 * Math.PI * p.turbK * tNorm + p.turbPhase) +
        0.4 * Math.sin(2 * Math.PI * (p.turbK * 2 + 1) * tNorm + p.turbPhase + 1.3)
      )

      var x = p.startX + dirDrift + wobble + turb

      // 旋转：整数 rotCycles → 首尾角度一致（mod 2π）
      var rotation = p.startRotation + 2 * Math.PI * p.rotCycles * (t / durationMs)

      // 模糊用独立绝对时间轴（3–7s/周期），与循环时长脱钩 → 极慢变化
      var sinVal = Math.sin(2 * Math.PI * t / p.blurCycleMs + p.blurPhase)
      var currentBlur = p.blur * Math.max(0, sinVal) * Math.max(0, sinVal)

      // 底部渐隐
      var fadeStart = 0.55 + (p.wobblePhase / (Math.PI * 2)) * 0.27
      var fadeOpacity = fallProgress < fadeStart
        ? 1
        : Math.max(0, 1 - (fallProgress - fadeStart) / (1 - fadeStart))
      var finalOpacity = p.opacity * fadeOpacity

      if (finalOpacity < 0.01) continue

      c.save()
      c.translate(x, y)
      c.rotate(rotation)
      drawWithBlur(c, currentBlur,
        function (op) { drawShape(c, config.shape, p.size, config.color, op, p.petalVariant, images) },
        finalOpacity)
      c.restore()
    }
  },
}
