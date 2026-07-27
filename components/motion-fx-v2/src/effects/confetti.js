// effects/confetti.js
// 彩屑纸片（简化版：单圆心发射）— 由 particle-system.ts 的 createConfettiCenterParticles + renderConfettiCenters 转写
// 每个粒子从圆心沿发射角射出，在半径边缘消失；位置 = f(t)，整数 rotCycles 保证无缝循环

var CONFETTI_COLORS = ['#FF4D6D', '#FF8C42', '#FFD166', '#06D6A0', '#118AB2', '#7B2FBE', '#FF6B9D', '#FFFFFF']

// 矩形纸片
function drawConfettiPiece(ctx, size, color, opacity) {
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.fillStyle = color
  var w = size * 0.65, h = size * 0.3
  ctx.fillRect(-w / 2, -h / 2, w, h)
  ctx.restore()
}

window.EffectConfetti = {
  name: '彩屑纸片',

  // config: { centerX, centerY, radius, angle, angleSpread, density, size, speed, gravity, burstDuration, pauseDuration }
  init: function (config, canvasW, canvasH, rng) {
    var centerAngleRad = (config.angle * Math.PI) / 180
    var spreadRad = (config.angleSpread * Math.PI) / 180
    var density = config.density || 30

    var particles = []
    for (var n = 0; n < density; n++) {
      // 在发射角范围内随机选一个方向
      var emitAngle = centerAngleRad - spreadRad / 2 + rng() * spreadRad
      // 存活时长占循环比例
      var lifeFrac = 0.25 + rng() * 0.55
      particles.push({
        cycleOffset: rng(),
        lifeFrac: lifeFrac,
        emitAngle: emitAngle,
        rotStart: rng() * Math.PI * 2,
        rotCycles: Math.floor(rng() * 5) - 2, // -2 到 +2，整数保证无缝
        size: config.size * (0.35 + rng() * 1.2),
        opacity: 0.65 + rng() * 0.35,
        colorVariant: Math.floor(rng() * CONFETTI_COLORS.length),
      })
    }
    return particles
  },

  // draw 签名: draw(ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images)
  draw: function (ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images) {
    var c = ctx2d || ctx
    var tNorm = t / durationMs

    var cx = config.centerX * canvasW
    var cy = config.centerY * canvasH
    var maxR = config.radius * Math.hypot(canvasW, canvasH) / 2

    // 发射/间隔窗口（绝对时间，单位 ms）
    var burstMs = (config.burstDuration || 0) * 1000
    var pauseMs = (config.pauseDuration || 0) * 1000
    var cycleMs = burstMs + pauseMs
    var isContinuous = cycleMs < 1 // 两者都为 0 → 持续模式
    var spd = config.speed == null ? 1.0 : config.speed

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i]
      var progress

      if (isContinuous) {
        var cyclePhase = (p.cycleOffset + tNorm) % 1
        if (cyclePhase >= p.lifeFrac) continue
        progress = cyclePhase / p.lifeFrac
      } else {
        // 有发射/间隔模式：cycleOffset 只在发射窗口内分散粒子
        var phaseMs = (t + p.cycleOffset * burstMs) % cycleMs
        if (phaseMs >= burstMs) continue // 间隔窗口不渲染
        var emitProgress = phaseMs / burstMs
        if (emitProgress >= p.lifeFrac) continue
        progress = emitProgress / p.lifeFrac
      }

      // 径向飞出 + 重力向下偏转
      var radial = progress * maxR * spd
      var gravDip = config.gravity * progress * progress * maxR * 0.9 * spd
      var x = cx + radial * Math.cos(p.emitAngle)
      var y = cy + radial * Math.sin(p.emitAngle) + gravDip

      // 不透明度：sin 钟形曲线（出生→峰值→消失）
      var opacity = p.opacity * Math.sin(progress * Math.PI)
      if (opacity < 0.01) continue

      var rotation = p.rotStart + 2 * Math.PI * p.rotCycles * tNorm

      c.save()
      c.translate(x, y)
      c.rotate(rotation)
      drawConfettiPiece(c, p.size, CONFETTI_COLORS[p.colorVariant % CONFETTI_COLORS.length], opacity)
      c.restore()
    }
  },
}
