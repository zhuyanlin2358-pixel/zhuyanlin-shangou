// effects/emission.js
// 发射光效（简化版：从画布中心发射粒子）— 由 particle-system.ts 的 createEmissionParticles + renderEmissionEffect + drawEmissionShape 转写
// 每个粒子从画布中心沿随机发射角射出，钟形透明度曲线，含 glow 发光

/**
 * 绘制单个发射粒子形状（以原点为中心，radius = r）
 * variant = 0|1|2：同类形状的 3 个细分变体
 */
function drawEmissionShape(ctx, shape, r, variant) {
  var v = (((variant % 3) + 3) % 3) // 保证 0|1|2

  // 通用多角星辅助
  function nStar(pts, outer, inner, offsetAngle) {
    if (offsetAngle == null) offsetAngle = 0
    ctx.beginPath()
    for (var i = 0; i < pts * 2; i++) {
      var rad = i % 2 === 0 ? outer : inner
      var ang = (i * Math.PI) / pts + offsetAngle
      if (i === 0) ctx.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad)
      else ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad)
    }
    ctx.closePath()
    ctx.fill()
  }

  if (shape === 'circle') {
    if (v === 0) {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill()
    } else if (v === 1) {
      // 甜甜圈
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.arc(0, 0, r * 0.46, 0, Math.PI * 2, true)
      ctx.fill('evenodd')
    } else {
      // 旋转方钻
      ctx.beginPath()
      ctx.moveTo(0, -r); ctx.lineTo(r * 0.78, 0)
      ctx.lineTo(0, r); ctx.lineTo(-r * 0.78, 0)
      ctx.closePath(); ctx.fill()
    }
  } else if (shape === 'star') {
    if (v === 0) nStar(5, r, r * 0.42, -Math.PI / 2)
    else if (v === 1) nStar(5, r, r * 0.22, -Math.PI / 2)
    else nStar(6, r, r * 0.5, -Math.PI / 2)
  } else if (shape === 'sparkle') {
    if (v === 0) nStar(4, r, r * 0.12, -Math.PI / 4)
    else if (v === 1) nStar(6, r, r * 0.28, -Math.PI / 2)
    else nStar(8, r, r * 0.32, -Math.PI / 8)
  } else if (shape === 'heart') {
    var s = r / 15
    if (v === 0) {
      ctx.beginPath()
      ctx.moveTo(0, -5 * s)
      ctx.bezierCurveTo(12 * s, -14 * s, 18 * s, 2 * s, 0, 12 * s)
      ctx.bezierCurveTo(-18 * s, 2 * s, -12 * s, -14 * s, 0, -5 * s)
      ctx.fill()
    } else if (v === 1) {
      ctx.save()
      ctx.scale(1.18, 0.9)
      ctx.beginPath()
      ctx.moveTo(0, -5 * s)
      ctx.bezierCurveTo(12 * s, -14 * s, 18 * s, 2 * s, 0, 12 * s)
      ctx.bezierCurveTo(-18 * s, 2 * s, -12 * s, -14 * s, 0, -5 * s)
      ctx.fill()
      ctx.restore()
    } else {
      ctx.beginPath()
      ctx.moveTo(0, -4 * s)
      ctx.bezierCurveTo(11 * s, -15 * s, 20 * s, 0 * s, 0, 15 * s)
      ctx.bezierCurveTo(-20 * s, 0 * s, -11 * s, -15 * s, 0, -4 * s)
      ctx.fill()
    }
  } else if (shape === 'snowflake') {
    var aw = r * 0.13
    var bl = r * 0.30
    function snowArm(branches) {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(aw, r * 0.42); ctx.lineTo(0, r); ctx.lineTo(-aw, r * 0.42)
      ctx.closePath(); ctx.fill()
      var bpos = branches === 3 ? [0.40, 0.62, 0.82] : [0.58]
      for (var bi = 0; bi < bpos.length; bi++) {
        for (var si = 0; si < 2; si++) {
          var sign = si === 0 ? -1 : 1
          ctx.save()
          ctx.translate(0, r * bpos[bi])
          ctx.rotate(sign * Math.PI / 6)
          ctx.beginPath()
          ctx.moveTo(0, 0); ctx.lineTo(aw * 0.7, bl * 0.4)
          ctx.lineTo(0, bl); ctx.lineTo(-aw * 0.7, bl * 0.4)
          ctx.closePath(); ctx.fill()
          ctx.restore()
        }
      }
    }
    if (v === 0) {
      for (var i = 0; i < 6; i++) { ctx.save(); ctx.rotate((i * Math.PI) / 3); snowArm(1); ctx.restore() }
    } else if (v === 1) {
      var aw8 = r * 0.10
      for (var j = 0; j < 8; j++) {
        ctx.save(); ctx.rotate((j * Math.PI) / 4)
        ctx.beginPath()
        ctx.moveTo(0, 0); ctx.lineTo(aw8, r * 0.45)
        ctx.lineTo(0, r); ctx.lineTo(-aw8, r * 0.45)
        ctx.closePath(); ctx.fill()
        ctx.restore()
      }
      ctx.beginPath(); ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2); ctx.fill()
    } else {
      for (var k = 0; k < 6; k++) { ctx.save(); ctx.rotate((k * Math.PI) / 3); snowArm(2); ctx.restore() }
    }
  } else if (shape === 'flower') {
    var petalCount = [5, 6, 4][v]
    var pw = [r * 0.32, r * 0.24, r * 0.42][v]
    var ph = [r * 0.55, r * 0.62, r * 0.58][v]
    var centerOff = [r * 0.48, r * 0.45, r * 0.44][v]
    for (var fi = 0; fi < petalCount; fi++) {
      ctx.save()
      ctx.rotate((fi * Math.PI * 2) / petalCount)
      ctx.beginPath()
      ctx.ellipse(0, -centerOff, pw, ph, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    ctx.beginPath(); ctx.arc(0, 0, r * 0.20, 0, Math.PI * 2); ctx.fill()
  }
}

window.EffectEmission = {
  name: '发射光效',

  // config: { density, size, sizeRandom, lifetime, speed, directionOffset, spread, colorRatio, accentColor, shape, glow, rotationSpeed }
  // 简化版：从画布中心发射，每个粒子随机径向发射角
  init: function (config, canvasW, canvasH, rng) {
    var density = config.density || 30
    var particles = []
    for (var i = 0; i < density; i++) {
      particles.push({
        cycleOffset: rng(),                                  // [0,1)
        emitAngle: rng() * Math.PI * 2,                      // 随机径向发射角（中心向外）
        spreadFactor: rng() * 2 - 1,                         // [-1,1] 随机扩散方向
        speedFactor: 0.7 + rng() * 0.6,                      // [0.7,1.3]
        sizeFactor: Math.max(0.2, 1 - config.sizeRandom + rng() * config.sizeRandom * 2),
        lifetimeFactor: 0.7 + rng() * 0.6,
        isColorful: rng() < config.colorRatio,
        startRotation: rng() * Math.PI * 2,
        rotSpeed: (rng() - 0.5) * Math.PI * 6,
        shapeVariant: Math.floor(rng() * 3),                 // 0|1|2
      })
    }
    return particles
  },

  // draw 签名: draw(ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images)
  draw: function (ctx, particles, config, ctx2d, t, durationMs, canvasW, canvasH, images) {
    var c = ctx2d || ctx
    if (!particles || particles.length === 0) return

    var dirOffRad = config.directionOffset * Math.PI / 180
    var halfSpread = (config.spread / 2) * Math.PI / 180
    var baseSpeed = config.speed * 60 // px/s 基准
    var ox = canvasW / 2, oy = canvasH / 2 // 发射点 = 画布中心

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i]
      // 粒子自身时间轴 [0,1)
      var tNorm = ((t / durationMs) - p.cycleOffset + 2) % 1
      var particleLifetime = p.lifetimeFactor * config.lifetime
      var life = tNorm / particleLifetime
      if (life >= 1) continue // 粒子已消亡

      // 实际发射角度 = 径向角 + 全局方向偏移 + 粒子随机扩散
      var emitAngle = p.emitAngle + dirOffRad + p.spreadFactor * halfSpread

      // 飞出距离（px）
      var speed = p.speedFactor * baseSpeed
      var dist = speed * (life * particleLifetime * durationMs / 1000)
      var px = ox + Math.cos(emitAngle) * dist
      var py = oy + Math.sin(emitAngle) * dist

      // 透明度：钟形曲线（入场→亮→渐消）
      var opacity = Math.sin(life * Math.PI)
      var size = p.sizeFactor * config.size

      // 颜色：彩色粒子用 accentColor，白色粒子用白色
      var colorStr = p.isColorful ? config.accentColor : '#ffffff'

      var r = Math.max(0.5, size / 2)
      var rotation = p.startRotation + p.rotSpeed * life * (config.rotationSpeed || 1)

      c.save()
      c.translate(px, py)
      c.rotate(rotation)
      c.globalAlpha = opacity
      c.shadowColor = colorStr
      c.shadowBlur = size * config.glow
      c.fillStyle = colorStr
      drawEmissionShape(c, config.shape, r, p.shapeVariant)
      c.restore()
    }
  },
}
