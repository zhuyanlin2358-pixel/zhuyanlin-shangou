/**
 * 通用组件工作室（楼层条 / 横滑Tab / 一键领券红包）
 * 与 SlotStudio 完全相同的三栏布局：
 *   [左 20% 结构树] | [中 40% 实时Canvas] | [右 40% 配置面板]
 */
import { useState, useEffect, useRef, Suspense, lazy } from 'react'
import { useFloor }  from '@/contexts/FloorContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useCoupon } from '@/contexts/CouponContext'
import type { ComponentId } from '@/types'
import {
  drawFloorCanvas, drawHTabCanvas, drawCouponPreview, preloadFonts,
} from '@/utils/exportUtils'

const FloorPanel  = lazy(() => import('@/components/panels/FloorPanel'))
const HTabPanel   = lazy(() => import('@/components/panels/HTabPanel'))
const CouponPanel = lazy(() => import('@/components/panels/CouponPanel'))

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
    studioLabel: '楼层条工作室',
    panelLabel: '楼层条配置',
    layers: [
      { id: 'text',  label: '楼层文案',   sub: '文字 · 颜色' },
      { id: 'style', label: '风格装饰',   sub: '样式 · 图形' },
      { id: 'bg',    label: '背景色',     sub: '透明底' },
    ],
  },
  'h-tab': {
    studioLabel: '横滑 Tab 工作室',
    panelLabel: '横滑 Tab 配置',
    layers: [
      { id: 'color', label: '配色主题',   sub: '7 种颜色' },
      { id: 'tabs',  label: 'Tab 文案',   sub: '2 / 3 / 4 个' },
      { id: 'size',  label: '输出尺寸',   sub: '750 × 88 px' },
    ],
  },
  coupon: {
    studioLabel: '红包组件工作室',
    panelLabel: '红包配置',
    layers: [
      { id: 'color',    label: '款式配色',   sub: '7 种配色' },
      { id: 'text',     label: '文案设置',   sub: '主文案 · 按钮' },
      { id: 'bg',       label: '券包背景',   sub: '702 × 352 px' },
      { id: 'waist',    label: '腰封',       sub: '702 × 168 px' },
      { id: 'btn',      label: '按钮',       sub: '480 × 80 px' },
    ],
  },
}

const ZOOM_LEVELS = [50, 75, 100, 150] as const
type ZoomLevel = typeof ZOOM_LEVELS[number]

// SVG icon helper（与 SlotStudio 同款风格）
const Ic = (d: string) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor"
    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
)

// ── 实时 Canvas 预览 Hook（300ms debounce）────────────────────────────────────
function useCanvasPreview(compId: ComponentId) {
  const { config: floorCfg, floors }          = useFloor()
  const { config: hTabCfg, items: hTabItems } = useHTab()
  const { config: couponCfg }                 = useCoupon()
  const [url, setUrl]     = useState('')
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
          canvas = await drawCouponPreview(couponCfg)
        }
        if (canvas) setUrl(canvas.toDataURL())
      } catch {}
      setLoading(false)
    }, 300)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [compId, floorCfg, floors, hTabCfg, hTabItems, couponCfg])

  return { url, loading }
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
interface Props { compId: ComponentId; onBack: () => void }

export default function ComponentStudio({ compId, onBack }: Props) {
  const { url: canvasUrl, loading } = useCanvasPreview(compId)
  const [zoom, setZoom]       = useState<ZoomLevel>(100)
  const [activeLayer, setActiveLayer] = useState<string | null>(null)
  const meta = COMP_META[compId] ?? { studioLabel: compId, panelLabel: '配置', layers: [] }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#080C14' }}>

      {/* ── 顶栏（与 SlotStudio 完全相同）── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
        height: 48, flexShrink: 0, background: '#0D1117',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          fontSize: 12, fontWeight: 700, borderRadius: 12, color: '#fff',
          background: 'linear-gradient(90deg,#FF3060,#FF6030)', border: 'none', cursor: 'pointer',
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

      {/* ── 三栏主体（20% / 40% / 40%，与 SlotStudio 一致）── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* 左 20%：结构树 */}
        <div style={{
          width: '20%', minWidth: 150, maxWidth: 210,
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          background: '#0C111B', borderRight: '1px solid rgba(255,255,255,0.07)',
          overflowY: 'auto',
        }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.18)',
            padding: '12px 14px 6px', textTransform: 'uppercase', letterSpacing: 1.5,
          }}>组件结构</div>
          <div style={{ padding: '0 4px 12px' }}>
            {meta.layers.map(layer => {
              const active = activeLayer === layer.id
              return (
                <div key={layer.id}
                  onClick={() => setActiveLayer(active ? null : layer.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
                    marginBottom: 1, userSelect: 'none',
                    background: active ? 'rgba(45,120,244,0.12)' : 'transparent',
                    borderLeft: `2px solid ${active ? '#2D78F4' : 'transparent'}`,
                    color: active ? '#6AA3FF' : 'rgba(255,255,255,0.6)',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{ flexShrink: 0, opacity: active ? 1 : 0.5 }}>
                    {Ic('M2 4h12v8H2zM5 4v8M9 4v8')}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.4 }}>{layer.label}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>{layer.sub}</div>
                  </div>
                </div>
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
          {/* 工具条：缩放 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {ZOOM_LEVELS.map(z => (
              <button key={z} onClick={() => setZoom(z)} style={{
                padding: '4px 11px', fontSize: 10, borderRadius: 7, cursor: 'pointer',
                background: zoom === z ? 'rgba(45,120,244,0.2)' : 'rgba(255,255,255,0.05)',
                color:      zoom === z ? '#6AA3FF' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${zoom === z ? 'rgba(45,120,244,0.35)' : 'rgba(255,255,255,0.08)'}`,
                fontWeight: zoom === z ? 600 : 400, transition: 'all 0.12s',
              }}>{z}%</button>
            ))}
          </div>

          {/* Canvas 图像 */}
          <div style={{
            transform: `scale(${zoom / 100})`, transformOrigin: 'top center',
            transition: 'transform 0.18s ease', flexShrink: 0,
          }}>
            {loading ? (
              <div style={{
                width: 500, height: 100, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'rgba(255,255,255,0.04)',
                borderRadius: 14, fontSize: 11, color: 'rgba(255,255,255,0.3)',
              }}>渲染中…</div>
            ) : canvasUrl ? (
              <img src={canvasUrl} alt={meta.studioLabel} style={{
                maxWidth: 750, width: '100%', height: 'auto',
                borderRadius: 14, display: 'block',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }} />
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

        {/* 右 40%：配置面板 */}
        <div style={{
          width: '40%', minWidth: 280, maxWidth: 370,
          display: 'flex', flexDirection: 'column', flexShrink: 0,
          background: '#0D1117', borderLeft: '1px solid rgba(255,255,255,0.07)',
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
              {compId === 'coupon' && <CouponPanel />}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
