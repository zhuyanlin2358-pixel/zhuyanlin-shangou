// ════════════════════════════════════════════════════════════════════
// motion-fx 动效合成 — 纯 JS 渲染核心
// SG_* 协议 + raf 渲染循环 + EffectRegistry 调度
// ════════════════════════════════════════════════════════════════════

const CANVAS_W = 750
const CANVAS_H = 424
const DURATION_MS = 3000  // 默认循环时长

// ── 动效注册表 ──────────────────────────────────────────────────────
const EffectRegistry = {
  petal_fall:  window.EffectPetal,
  snow:        window.EffectSnow,
  sparkle:     window.EffectSparkle,
  sweep_light: window.EffectSweep,
  wave_distort:window.EffectWave,
  confetti:    window.EffectConfetti,
  emission:    window.EffectEmission,
}

// ── 配置 ────────────────────────────────────────────────────────────
let config = {
  images: { main: '' },
  custom: {
    activeEffects: ['petal_fall'],
    config: {
      color: '#ff7575',
      size: 12,
      density: 18,
      speed: 1.0,
      direction: 1,
      turbulence: 0.42,
      spread: 1,
      shape: 'petal',
    },
  },
}

// ── 状态 ────────────────────────────────────────────────────────────
let canvas, ctx
let bgImg = null
let rafId = null
let isPaused = false
let startTime = 0
let effectStates = {}  // { effectId: { particles, ... } }
let petalImages = {}   // 花瓣图片

// ── 配置更新（深合并）──────────────────────────────────────────────
function applyConfig(newConfig) {
  if (newConfig.images) {
    config.images = { ...config.images, ...newConfig.images }
  }
  if (newConfig.custom) {
    config.custom = { ...config.custom, ...newConfig.custom }
    if (newConfig.custom.config) {
      config.custom.config = { ...config.custom.config, ...newConfig.custom.config }
    }
  }
}

// ── 初始化动效 ──────────────────────────────────────────────────────
function initEffects() {
  const effects = config.custom.activeEffects || []
  const rng = Utils.seededRng(12345)
  const cfg = config.custom.config

  effectStates = {}
  for (const id of effects) {
    const effect = EffectRegistry[id]
    if (!effect) continue
    if (effect.init) {
      effectStates[id] = { particles: effect.init(cfg, CANVAS_W, CANVAS_H, rng) }
    } else {
      effectStates[id] = {}
    }
  }
}

// ── 加载底图 ────────────────────────────────────────────────────────
async function loadBgImage() {
  if (config.images.main) {
    try {
      bgImg = await Utils.loadImage(config.images.main)
    } catch (e) {
      console.warn('[motion-fx] 底图加载失败', e)
      bgImg = null
    }
  }
}

// ── 加载花瓣精灵图（petal1/petal3）──────────────────────────────────
// 不加载则 EffectPetal 回退成椭圆，质量差
async function loadPetalImages() {
  var keys = ['petal1', 'petal3']
  await Promise.all(keys.map(function (k) {
    return new Promise(function (resolve) {
      var img = new Image()
      img.onload = function () { petalImages[k] = img; resolve() }
      img.onerror = function () { resolve() }
      img.src = 'petals/' + k + '.png'  // 相对 index.html
    })
  }))
}

// ── 单帧渲染 ────────────────────────────────────────────────────────
function drawFrame(timestamp) {
  if (!ctx) return

  const t = (timestamp - startTime) % DURATION_MS
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

  // 1. 底图
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H)
  }

  // 2. 各动效
  const effects = config.custom.activeEffects || []
  for (const id of effects) {
    const effect = EffectRegistry[id]
    if (!effect || !effect.draw) continue
    const state = effectStates[id]
    if (!state) continue
    effect.draw(ctx, state.particles, config.custom.config, undefined, t, DURATION_MS, CANVAS_W, CANVAS_H, petalImages)
  }

  // 3. 继续 raf（仅播放时）
  if (!isPaused) {
    rafId = requestAnimationFrame(drawFrame)
  }
}

// ── 动画控制 ────────────────────────────────────────────────────────
function startAnimation() {
  isPaused = false
  startTime = performance.now()
  rafId = requestAnimationFrame(drawFrame)
}

function pauseAnimation() {
  isPaused = true
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

// ── SG_* 协议 ───────────────────────────────────────────────────────
window.addEventListener('message', (e) => {
  const { type, payload } = e.data || {}
  if (!type || !type.startsWith('SG_')) return

  switch (type) {
    case 'SG_SET_CONFIG':
      applyConfig(payload)
      Promise.all([loadBgImage(), loadPetalImages()]).then(() => initEffects())
      break

    case 'SG_EXPORT':
      pauseAnimation()
      drawFrame(performance.now())
      const dataUrl = canvas.toDataURL('image/png')
      window.parent.postMessage({ type: 'SG_EXPORT_RESULT', dataUrl }, '*')
      startAnimation()
      break

    case 'SG_PREVIEW':
      window.parent.postMessage({
        type: 'SG_PREVIEW_RESULT',
        dataUrl: canvas.toDataURL('image/png'),
      }, '*')
      break
  }
})

// ── 页面加载就绪 ────────────────────────────────────────────────────
window.addEventListener('load', () => {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')

  // 先加载花瓣精灵图再渲染默认状态
  loadPetalImages().then(() => {
    initEffects()
    startAnimation()
  })

  // 通知工具已就绪
  window.parent.postMessage({
    type: 'SG_READY',
    meta: {
      name: '动效合成',
      id: 'motion-fx',
      version: '2.0.0',
      width: CANVAS_W,
      height: CANVAS_H,
    },
  }, '*')
})

// ── 页面可见性管理 ──────────────────────────────────────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseAnimation()
  else startAnimation()
})
