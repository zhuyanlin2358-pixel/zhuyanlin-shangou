/**
 * 通用组件工作室（楼层条 / 横滑Tab / 一键领券红包）
 * 三栏布局：[左 20% 结构树] | [中 40% 实时Canvas] | [右 40% 配置面板]
 */
import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import Spinner from '@/components/ui/Spinner'
import { FileItem } from '@/components/ui/FileTree'
import { useFloor }  from '@/contexts/FloorContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useCoupon } from '@/contexts/CouponContext'
import { COUPON_COLORS, type CouponColorKey, type ComponentId } from '@/types'
import {
  drawFloorCanvas, drawHTabCanvas,
  drawCouponPreview, drawCouponBg, drawCouponWaistband,
  drawCouponButton, drawCouponSingleBg,
  downloadCanvas, preloadFonts,
} from '@/utils/exportUtils'

const FloorPanel = lazy(() => import('@/components/panels/FloorPanel'))
const HTabPanel  = lazy(() => import('@/components/panels/HTabPanel'))

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
      <Spinner size="sm" />
    </div>
  )
}

// ── 组件元信息 ────────────────────────────────────────────────────────────────
interface LayerDef { id: string; label: string; sub: string }

const COMP_META: Record<string, {
  studioLabel: string; panelLabel: string; layers: LayerDef[]
}> = {
  floor: {
    studioLabel: '楼层条工作室', panelLabel: '楼层条配置',
    layers: [
      { id: 'style',  label: '款式配色', sub: '3款预设 · 自定义色' },
      { id: 'text',   label: '文案设置', sub: '楼层标题' },
      { id: 'export', label: '楼层条',   sub: '750 × 60 px' },
    ],
  },
  'h-tab': {
    studioLabel: 'Tab 工作室', panelLabel: 'Tab 配置',
    layers: [
      { id: 'style',  label: '款式配色', sub: '7种配色' },
      { id: 'tabs',   label: 'Tab 文案', sub: '各 Tab 名称' },
      { id: 'export', label: 'Tab 切图', sub: '2/3/4 Tab' },
    ],
  },
  coupon: {
    studioLabel: '红包组件工作室', panelLabel: '红包配置',
    layers: [
      { id: 'color',  label: '款式配色',      sub: '7 种配色' },
      { id: 'text',   label: '文案设置',       sub: '主文案 · 按钮' },
      { id: 'bg',     label: '领取前背景图',   sub: '702 × 352 px' },
      { id: 'waist',  label: '腰封',           sub: '702 × 168 px' },
      { id: 'btn',    label: '按钮',           sub: '480 × 80 px' },
      { id: 'single', label: '仅剩一张券背景', sub: '702 × 236 px' },
    ],
  },
}


// ── Canvas 预览 Hook（300ms debounce，随 activeLayer 切换）─────────────────────
function useCanvasPreview(compId: ComponentId, activeLayer: string | null) {
  const { config: floorCfg, floors }          = useFloor()
  const { config: hTabCfg, items: hTabItems } = useHTab()
  const { config: couponCfg }                 = useCoupon()
  const [url, setUrl]         = useState('')
  const [loading, setLoading] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    setLoading(true)
    timer.current = setTimeout(async () => {
      try {
        await preloadFonts()
        let canvas: HTMLCanvasElement | null = null
        if (compId === 'floor') {
          const fi = floors[0]
          canvas = await drawFloorCanvas({ ...floorCfg, text: fi?.text ?? '领好店券 下单更优惠' })
        } else if (compId === 'h-tab') {
          const hi = hTabItems[0]
          canvas = await drawHTabCanvas({
            colorKey: hTabCfg.colorKey, tabs: hi?.tabs ?? ['Tab 1', 'Tab 2'], activeIndex: 0,
          })
        } else if (compId === 'coupon') {
          // 中间画布始终显示完整预览（与老虎机一致）
          canvas = await drawCouponPreview(couponCfg)
        }
        if (canvas) setUrl(canvas.toDataURL())
      } catch {}
      setLoading(false)
    }, 300)
    return () => { if (timer.current) clearTimeout(timer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compId, activeLayer, floorCfg, floors, hTabCfg, hTabItems, couponCfg])

  return { url, loading }
}

// ── 红包配色面板（横排药丸，与老虎机 PresetGrid 完全一致）─────────────────────
const COLOR_KEYS = Object.keys(COUPON_COLORS) as CouponColorKey[]

function CouponColorPanel() {
  const { config, setColorKey } = useCoupon()
  return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>配色预设</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {COLOR_KEYS.map(k => {
          const def = COUPON_COLORS[k]
          const active = config.colorKey === k
          return (
            <button key={k} onClick={() => setColorKey(k)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                borderColor: active ? 'rgba(255,48,96,0.6)' : 'rgba(255,255,255,0.1)',
                borderWidth: 1, borderStyle: 'solid',
                background: active ? 'rgba(255,48,96,0.12)' : 'rgba(255,255,255,0.04)',
                color:      active ? '#FF8FAA' : 'rgba(255,255,255,0.5)',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.12s',
              }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
                background: def.dotColor,
              }} />
              {def.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── 红包文案面板（内联）──────────────────────────────────────────────────────
function CouponTextPanel() {
  const { config, setTitleText, setBtnText } = useCoupon()
  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '7px 10px', fontSize: 12,
    color: '#ebe9fc', outline: 'none',
  }
  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>主文案</div>
        <input style={inp} value={config.titleText} maxLength={24}
          onChange={e => setTitleText(e.target.value)} placeholder="领618好店券 下单更优惠" />
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
          默认：领618好店券 下单更优惠
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>按钮文案</div>
        <input style={inp} value={config.btnText} maxLength={10}
          onChange={e => setBtnText(e.target.value)} placeholder="一键领取" />
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
          默认：一键领取
        </div>
      </div>
    </div>
  )
}

// ── 红包素材图层面板（bg / waist / btn / single）──────────────────────────────
function CouponAssetPanel({ layer }: { layer: string }) {
  const { config } = useCoupon()
  const [previewUrl, setPreviewUrl] = useState('')

  const META: Record<string, { label: string; size: string; fn: () => Promise<HTMLCanvasElement>; filename: string }> = {
    bg:     { label: '领取前无tab-背景图', size: '702 × 352 px', fn: () => drawCouponBg(config),       filename: `券红包_${COUPON_COLORS[config.colorKey].name}_领取前无tab背景图_702x352.png` },
    waist:  { label: '组件腰封图',         size: '702 × 168 px', fn: () => drawCouponWaistband(config), filename: `券红包_${COUPON_COLORS[config.colorKey].name}_组件腰封图_702x168.png` },
    btn:    { label: '组件按钮图',         size: '480 × 80 px',  fn: () => drawCouponButton(config),    filename: `券红包_${COUPON_COLORS[config.colorKey].name}_组件按钮图_480x80.png` },
    single: { label: '仅剩一张券背景图',   size: '702 × 236 px', fn: () => drawCouponSingleBg(config),  filename: `券红包_${COUPON_COLORS[config.colorKey].name}_仅剩一张券背景图_702x236.png` },
  }

  const m = META[layer]

  // 右侧顶部预览图（与老虎机风格一致）
  useEffect(() => {
    if (!m) return
    let cancelled = false
    setPreviewUrl('')
    m.fn().then(c => { if (!cancelled) setPreviewUrl(c.toDataURL()) }).catch(() => {})
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer, config.colorKey, config.titleText, config.btnText])

  if (!m) return null

  const handleDownload = async () => {
    try { downloadCanvas(await m.fn(), m.filename) } catch {}
  }

  return (
    <div>
      {/* 素材预览图（右侧顶部，与老虎机配置预览位置一致）*/}
      <div style={{
        margin: '12px 16px 0',
        borderRadius: 10, overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        minHeight: 72, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {previewUrl ? (
          <img src={previewUrl} alt={m.label}
            style={{ width: '100%', height: 'auto', display: 'block' }} />
        ) : (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', padding: 12 }}>渲染中…</div>
        )}
      </div>

      {/* 素材信息 + 下载 */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ebe9fc' }}>{m.label}</div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>{m.size} · PNG</div>
        <button onClick={handleDownload} style={{
          width: '100%', padding: '8px 0', borderRadius: 8, cursor: 'pointer',
          background: 'var(--sl-primary-grad)', color: 'var(--sl-cta-text)',
          border: 'none', fontSize: 12, fontWeight: 700,
        }}>
          ↓ 导出此素材
        </button>
      </div>
    </div>
  )
}

// ── 红包配置右面板（根据 activeLayer 切换内容）────────────────────────────────
function CouponRightPanel({ activeLayer }: { activeLayer: string | null }) {
  const isAsset = activeLayer === 'bg' || activeLayer === 'waist' || activeLayer === 'btn' || activeLayer === 'single'

  return (
    <div>
      {/* 素材层：顶部显示该素材预览 + 导出，下面跟配置 */}
      {isAsset && (
        <>
          <CouponAssetPanel layer={activeLayer!} />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0 0' }} />
        </>
      )}

      {/* 配色 */}
      {(activeLayer === 'color' || activeLayer === null || isAsset) && (
        <>
          <div style={{ padding: '10px 16px 0',
            fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase', letterSpacing: '0.1em' }}>款式配色</div>
          <CouponColorPanel />
        </>
      )}

      {/* 分割线 */}
      {(activeLayer === null || isAsset) && (
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />
      )}

      {/* 文案 */}
      {(activeLayer === 'text' || activeLayer === null || isAsset) && (
        <>
          <div style={{ padding: '10px 16px 0',
            fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase', letterSpacing: '0.1em' }}>文案设置</div>
          <CouponTextPanel />
        </>
      )}
    </div>
  )
}

// ── 楼层条素材面板 ────────────────────────────────────────────────────────────
function FloorAssetPanel() {
  const { config, floors } = useFloor()
  const [previewUrl, setPreviewUrl] = useState('')
  const text = floors[0]?.text || '领好店券 下单更优惠'

  useEffect(() => {
    let cancelled = false
    setPreviewUrl('')
    preloadFonts()
      .then(() => drawFloorCanvas({ ...config, text }))
      .then(c => { if (!cancelled) setPreviewUrl(c.toDataURL()) })
      .catch(() => {})
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, floors])

  const handleDownload = async () => {
    try {
      await preloadFonts()
      const c = await drawFloorCanvas({ ...config, text })
      downloadCanvas(c, `楼层条_${config.variant}_750x60.png`)
    } catch {}
  }

  return (
    <div>
      <div style={{
        margin: '12px 16px 0', borderRadius: 10, overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {previewUrl ? (
          <img src={previewUrl} alt="楼层条"
            style={{ width: '100%', height: 'auto', display: 'block' }} />
        ) : (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', padding: 12 }}>渲染中…</div>
        )}
      </div>
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#ebe9fc', marginBottom: 4 }}>楼层条</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>750 × 60 px · PNG</div>
        <button onClick={handleDownload} style={{
          width: '100%', padding: '8px 0', borderRadius: 8, cursor: 'pointer',
          background: 'var(--sl-primary-grad)', color: 'var(--sl-cta-text)',
          border: 'none', fontSize: 12, fontWeight: 700,
        }}>↓ 导出此素材</button>
      </div>
    </div>
  )
}

// ── 楼层条右侧面板 ────────────────────────────────────────────────────────────
function FloorRightPanel({ activeLayer }: { activeLayer: string | null }) {
  return (
    <div>
      {activeLayer === 'export' && (
        <>
          <FloorAssetPanel />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0 0' }} />
        </>
      )}
      <Suspense fallback={<Loader />}>
        <FloorPanel />
      </Suspense>
    </div>
  )
}

// ── Tab 素材面板 ───────────────────────────────────────────────────────────────
function HTabAssetPanel() {
  const { config, items } = useHTab()
  const tabs = items[0]?.tabs ?? ['Tab 1', 'Tab 2', 'Tab 3']
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    let cancelled = false
    setPreviewUrl('')
    drawHTabCanvas({ colorKey: config.colorKey, tabs, activeIndex: 0 })
      .then(c => { if (!cancelled) setPreviewUrl(c.toDataURL()) })
      .catch(() => {})
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.colorKey, items])

  const tabW = tabs.length === 2 ? '336' : tabs.length === 3 ? '226' : '180'

  const handleDownload = async () => {
    try {
      const c = await drawHTabCanvas({ colorKey: config.colorKey, tabs, activeIndex: 0 })
      downloadCanvas(c, `横滑Tab_${config.colorKey}_${tabs.length}tab_${tabW}x88.png`)
    } catch {}
  }

  return (
    <div>
      <div style={{
        margin: '12px 16px 0', borderRadius: 10, overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {previewUrl ? (
          <img src={previewUrl} alt="Tab切图"
            style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
        ) : (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', padding: 12 }}>渲染中…</div>
        )}
      </div>
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#ebe9fc', marginBottom: 4 }}>Tab 切图</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
          {tabW} × 88 px · PNG
        </div>
        <button onClick={handleDownload} style={{
          width: '100%', padding: '8px 0', borderRadius: 8, cursor: 'pointer',
          background: 'var(--sl-primary-grad)', color: 'var(--sl-cta-text)',
          border: 'none', fontSize: 12, fontWeight: 700,
        }}>↓ 导出此素材</button>
      </div>
    </div>
  )
}

// ── Tab 右侧面板 ───────────────────────────────────────────────────────────────
function HTabRightPanel({ activeLayer }: { activeLayer: string | null }) {
  return (
    <div>
      {activeLayer === 'export' && (
        <>
          <HTabAssetPanel />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0 0' }} />
        </>
      )}
      <Suspense fallback={<Loader />}>
        <HTabPanel />
      </Suspense>
    </div>
  )
}

// ── 工具函数 ──────────────────────────────────────────────────────────────────
function Ic(d: string) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

const ZOOM_LEVELS = [50, 75, 100, 150] as const
type ZoomLevel = typeof ZOOM_LEVELS[number]

// ── 主组件 ────────────────────────────────────────────────────────────────────
interface Props { compId: ComponentId; onBack: () => void }

export default function ComponentStudio({ compId, onBack }: Props) {
  const [zoom, setZoom]             = useState<ZoomLevel>(100)
  const [activeLayer, setActiveLayer] = useState<string | null>(null)

  const { url: canvasUrl, loading } = useCanvasPreview(compId, activeLayer)

  const meta = COMP_META[compId] ?? { studioLabel: compId, panelLabel: '配置', layers: [] }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--sl-bg)' }}>

      {/* ── 顶栏 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
        height: 56, flexShrink: 0, background: 'var(--sl-panel)',
        borderBottom: '1px solid var(--sl-border)',
        boxShadow: 'var(--shadow-topbar)', zIndex: 10, position: 'relative',
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          fontSize: 12, fontWeight: 700, borderRadius: 12, color: 'var(--sl-cta-text)',
          background: 'var(--sl-primary-grad)', border: 'none', cursor: 'pointer',
        }}>
          {Ic('M10 4L6 8l4 4')}
          完成并返回画布
        </button>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{meta.studioLabel}</span>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>改动自动同步</span>
        <div style={{ flex: 1 }} />
      </div>

      {/* ── 三栏主体 ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* 左 200px（25×8）：结构树 */}
        <div style={{
          width: 200, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: 'var(--sl-panel)', borderRight: '1px solid var(--sl-border)',
          boxShadow: 'var(--shadow-panel-r)', zIndex: 5, position: 'relative',
          overflowY: 'auto',
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
            padding: '12px 14px 4px', textTransform: 'uppercase',
            letterSpacing: '0.1em', lineHeight: '26px',
          }}>组件结构</div>
          <div style={{ padding: '2px 6px 16px' }}>
            {meta.layers.map(layer => {
              const active = activeLayer === layer.id
              return (
                <FileItem key={layer.id} active={active}
                  onClick={() => setActiveLayer(active ? null : layer.id)}
                  label={layer.label} sublabel={layer.sub} />
              )
            })}
          </div>
        </div>

        {/* 中 ~40%：实时 Canvas 预览 */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 20, padding: '20px 24px', overflowY: 'auto',
          background: '#080C14',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}>
          {/* 缩放工具条 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {ZOOM_LEVELS.map(z => (
              <button key={z} onClick={() => setZoom(z)} style={{
                padding: '4px 11px', fontSize: 10, borderRadius: 7, cursor: 'pointer',
                background: zoom === z ? 'rgba(250,217,0,0.12)' : 'rgba(255,255,255,0.05)',
                color:      zoom === z ? '#fad900' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${zoom === z ? 'rgba(250,217,0,0.3)' : 'rgba(255,255,255,0.08)'}`,
                fontWeight: zoom === z ? 600 : 400, transition: 'all 0.12s',
              }}>{z}%</button>
            ))}
          </div>

          {/* Canvas 图像 */}
          <div style={{
            transform: `scale(${zoom / 100})`, transformOrigin: 'top center',
            transition: 'transform 0.18s ease', flexShrink: 0,
          }}>
            {/* 有旧图时保留显示（加载中渐隐），避免闪烁 */}
            {canvasUrl ? (
              <img src={canvasUrl} alt={meta.studioLabel} style={{
                maxWidth: 750, width: '100%', height: 'auto',
                borderRadius: 14, display: 'block',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                opacity: loading ? 0.5 : 1,
                transition: 'opacity 0.15s ease',
              }} />
            ) : loading ? (
              <div style={{
                width: 500, height: 100, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'rgba(255,255,255,0.04)',
                borderRadius: 14,
              }}>
                <Spinner size="md" />
              </div>
            ) : (
              <div style={{
                width: 500, height: 80, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'rgba(255,255,255,0.04)',
                borderRadius: 14, fontSize: 12, color: 'rgba(255,255,255,0.25)',
              }}>暂无预览</div>
            )}
          </div>
          {loading && <Spinner size="sm" />}
        </div>

        {/* 右 360px（45×8）：配置面板 */}
        <div style={{
          width: 360, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: 'var(--sl-panel)', borderLeft: '1px solid var(--sl-border)',
          boxShadow: 'var(--shadow-panel-l)', zIndex: 5, position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            height: 44, display: 'flex', alignItems: 'center', padding: '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
              {meta.panelLabel}
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {compId === 'floor'  && <FloorRightPanel  activeLayer={activeLayer} />}
            {compId === 'h-tab'  && <HTabRightPanel   activeLayer={activeLayer} />}
            {compId === 'coupon' && <CouponRightPanel  activeLayer={activeLayer} />}
          </div>
        </div>
      </div>
    </div>
  )
}
