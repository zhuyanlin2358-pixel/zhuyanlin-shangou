/**
 * 通用组件工作室（楼层条 / 横滑Tab / 一键领券红包）
 * 三栏布局：[左 20% 结构树] | [中 40% 实时Canvas] | [右 40% 配置面板]
 */
import { useState, useEffect, useRef, Suspense, lazy } from 'react'
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: 80, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>加载中…</div>
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
          // 按选中图层渲染对应素材
          if (activeLayer === 'bg')     canvas = await drawCouponBg(couponCfg)
          else if (activeLayer === 'waist')  canvas = await drawCouponWaistband(couponCfg)
          else if (activeLayer === 'btn')    canvas = await drawCouponButton(couponCfg)
          else if (activeLayer === 'single') canvas = await drawCouponSingleBg(couponCfg)
          else                               canvas = await drawCouponPreview(couponCfg)
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
                padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
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

  const META: Record<string, { label: string; size: string; fn: () => Promise<HTMLCanvasElement>; filename: string }> = {
    bg:     { label: '领取前无tab-背景图', size: '702 × 352 px', fn: () => drawCouponBg(config),       filename: `券红包_${COUPON_COLORS[config.colorKey].name}_领取前无tab背景图_702x352.png` },
    waist:  { label: '组件腰封图',         size: '702 × 168 px', fn: () => drawCouponWaistband(config), filename: `券红包_${COUPON_COLORS[config.colorKey].name}_组件腰封图_702x168.png` },
    btn:    { label: '组件按钮图',         size: '480 × 80 px',  fn: () => drawCouponButton(config),    filename: `券红包_${COUPON_COLORS[config.colorKey].name}_组件按钮图_480x80.png` },
    single: { label: '仅剩一张券背景图',   size: '702 × 236 px', fn: () => drawCouponSingleBg(config),  filename: `券红包_${COUPON_COLORS[config.colorKey].name}_仅剩一张券背景图_702x236.png` },
  }

  const m = META[layer]
  if (!m) return null

  const handleDownload = async () => {
    try { downloadCanvas(await m.fn(), m.filename) } catch {}
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>素材信息</div>
      <div style={{
        background: 'rgba(255,255,255,0.04)', borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.08)', padding: '14px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#ebe9fc' }}>{m.label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{m.size} · PNG</div>
        <button onClick={handleDownload} style={{
          marginTop: 4, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
          background: 'var(--sl-primary-grad)', color: 'var(--sl-cta-text)',
          border: 'none', fontSize: 12, fontWeight: 700,
        }}>
          ↓ 导出此素材
        </button>
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
        左侧图层对应画布已切换至当前素材预览。
      </div>
    </div>
  )
}

// ── 红包配置右面板（根据 activeLayer 切换内容）────────────────────────────────
function CouponRightPanel({ activeLayer }: { activeLayer: string | null }) {
  if (activeLayer === 'color')  return <CouponColorPanel />
  if (activeLayer === 'text')   return <CouponTextPanel />
  if (activeLayer === 'bg' || activeLayer === 'waist' || activeLayer === 'btn' || activeLayer === 'single')
    return <CouponAssetPanel layer={activeLayer} />
  // 默认：全部展开（颜色 + 文案）
  return (
    <div>
      <div style={{ padding: '10px 16px 0',
        fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)',
        textTransform: 'uppercase', letterSpacing: '0.1em' }}>款式配色</div>
      <CouponColorPanel />
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />
      <div style={{ padding: '10px 16px 0',
        fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)',
        textTransform: 'uppercase', letterSpacing: '0.1em' }}>文案设置</div>
      <CouponTextPanel />
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
        height: 48, flexShrink: 0, background: 'var(--sl-panel)',
        borderBottom: '1px solid var(--sl-border)',
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
                borderRadius: 14, fontSize: 11, color: 'rgba(255,255,255,0.3)',
              }}>渲染中…</div>
            ) : (
              <div style={{
                width: 500, height: 80, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'rgba(255,255,255,0.04)',
                borderRadius: 14, fontSize: 11, color: 'rgba(255,255,255,0.25)',
              }}>暂无预览</div>
            )}
          </div>
          {loading && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: -8 }}>
              同步中…
            </div>
          )}
        </div>

        {/* 右 360px（45×8）：配置面板 */}
        <div style={{
          width: 360, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: 'var(--sl-panel)', borderLeft: '1px solid var(--sl-border)',
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
            <Suspense fallback={<Loader />}>
              {compId === 'floor'  && <FloorPanel />}
              {compId === 'h-tab'  && <HTabPanel />}
              {compId === 'coupon' && <CouponRightPanel activeLayer={activeLayer} />}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
