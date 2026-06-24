/**
 * 高达会场统一工作区
 *
 * 两种模式：
 *
 * ① 画布布局模式（默认三列）
 *   [图层面板 220px] | [手机画布 flex-1] | [核心属性面板 280px]
 *   右侧面板：只放当前选中组件的核心属性 + 底部「高级设置 →」按钮
 *
 * ② 高级设置模式（点击「高级设置」进入）
 *   [返回条 40px] | [组件完整配置页 flex-1] | [手机预览 380px]
 *   包含：弹窗、导出、Tab文案、奖品图等深度配置
 */
import { Suspense, lazy, useState } from 'react'
import { useApp }   from '@/contexts/AppContext'
import { useVenue } from '@/contexts/VenueContext'
import type { ComponentId } from '@/types'
import type { ZoomOpt } from '@/components/layout/VenueCanvasCenter'

const ZOOM_OPTS: ZoomOpt[] = [50, 75, 100, 125, 150]

import VenueLayerPanel   from '@/components/layout/VenueLayerPanel'
import VenueCanvasCenter from '@/components/layout/VenueCanvasCenter'
import VenueDynamicPanel from '@/components/layout/VenueDynamicPanel'

const SlotStudio      = lazy(() => import('./SlotStudio'))
const ComponentStudio = lazy(() => import('./ComponentStudio'))

function Loader() {
  return <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>加载中…</div>
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
export default function VenuePage() {
  const { goDelivery, goHome } = useApp()
  const { items } = useVenue()

  // 画布缩放（由顶栏统一管理，传给 VenueCanvasCenter）
  const [zoomPct, setZoomPct] = useState<ZoomOpt>(100)

  // 画布模式：选中图层
  const [selectedLayer, setSelectedLayer] = useState<'header' | string | null>(null)
  // 画布模式：正在配置、待加入画布的新组件
  const [pendingComp,   setPendingComp]   = useState<ComponentId | null>(null)
  // 画布模式：双击 slot 后选中的热区（'text' | 'prize' | 'color' | ''）
  const [activeZone,    setActiveZone]    = useState('')
  // 高级设置模式：哪个组件正在全屏精细编辑
  const [advancedComp,  setAdvancedComp]  = useState<ComponentId | null>(null)
  const handleSelectLayer = (layer: 'header' | string | null) => {
    setPendingComp(null)
    setSelectedLayer(layer)
    setActiveZone('')  // 切换图层时清空热区选中
  }

  // 双击 slot 热区 → 右侧切换对应配置
  const handleZoneSelect = (_itemId: string, zone: string) => {
    setActiveZone(zone)
  }

  const handleAddNew = (compId: ComponentId) => {
    setSelectedLayer(null)
    setPendingComp(compId)
  }

  const handleAdvanced = (compId: ComponentId) => {
    setAdvancedComp(compId)
  }

  const exitAdvanced = () => setAdvancedComp(null)

  // ── 工作室模式：老虎机用专属 SlotStudio ─────────────────────────────────────
  if (advancedComp === 'slot') {
    return (
      <Suspense fallback={<Loader />}>
        <SlotStudio onBack={exitAdvanced} />
      </Suspense>
    )
  }

  // ── 其他组件：统一 ComponentStudio（与 SlotStudio 风格一致）────────────────
  if (advancedComp) {
    return (
      <Suspense fallback={<Loader />}>
        <ComponentStudio compId={advancedComp} onBack={exitAdvanced} />
      </Suspense>
    )
  }

  // ── 画布布局模式（默认三列） ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--sl-bg)' }}>

      {/* ── 统一顶栏（Figma风格：左固定 + 中绝对居中 + 右固定）── */}
      <div className="flex items-center shrink-0 border-b"
        style={{ position: 'relative', height: 48, background: 'var(--sl-panel)', borderColor: 'var(--sl-border)', padding: 0, gap: 0 }}>

        {/* 左段：220px，与侧边栏等宽，← 首页 + 页面结构 */}
        <div style={{
          width: 220, flexShrink: 0, height: '100%',
          display: 'flex', alignItems: 'center',
          padding: '0 10px',
          borderRight: '1px solid var(--sl-border)',
        }}>
          <button onClick={goHome}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, color: 'rgba(235,233,252,0.38)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 6px 0 0', transition: 'color 0.12s', flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(235,233,252,0.65)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(235,233,252,0.38)'}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            首页
          </button>
          <div style={{ width: 1, height: 12, background: 'rgba(235,233,252,0.1)', margin: '0 8px', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(235,233,252,0.4)', letterSpacing: '0.05em' }}>
            页面结构
          </span>
        </div>

        {/* 中央标题：绝对居中，不影响两端布局 */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', alignItems: 'center', gap: 8,
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--sl-text-1)', whiteSpace: 'nowrap' }}>
            会场搭建
          </span>
          {items.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: 'rgba(235,233,252,0.45)',
              background: 'rgba(235,233,252,0.08)', borderRadius: 4,
              padding: '1px 6px',
            }}>
              {items.length} 个组件
            </span>
          )}
        </div>

        {/* 中段：flex-1，缩放控制居中（对应画布区域）*/}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {ZOOM_OPTS.map(z => (
            <button key={z} onClick={() => setZoomPct(z)}
              style={{
                padding: '3px 7px', fontSize: 10, borderRadius: 6, cursor: 'pointer',
                background: zoomPct === z ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: zoomPct === z ? '#fff' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${zoomPct === z ? 'rgba(255,255,255,0.18)' : 'transparent'}`,
                fontWeight: zoomPct === z ? 600 : 400,
                lineHeight: 1,
              }}>
              {z}%
            </button>
          ))}
        </div>

        {/* 右段：280px，与右侧配置面板等宽，包含 CTA */}
        <div style={{
          width: 280, flexShrink: 0, height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 16px',
          borderLeft: '1px solid var(--sl-border)',
        }}>
          <button
            onClick={goDelivery}
            className="flex items-center gap-2 text-[13px] font-bold rounded-xl transition-all hover:opacity-90"
            style={{ background: 'var(--sl-primary-grad)', color: 'var(--sl-cta-text)', padding: '7px 16px', border: 'none', cursor: 'pointer' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            完成 · 下载素材
          </button>
        </div>
      </div>

      {/* 三列主体 */}
      <div className="flex flex-1 overflow-hidden">
        <VenueLayerPanel
          selectedLayer={selectedLayer}
          onSelect={handleSelectLayer}
          onAddNew={handleAddNew}
        />
        <VenueCanvasCenter
          selectedLayer={selectedLayer}
          onSelectLayer={handleSelectLayer}
          onZoneSelect={handleZoneSelect}
          activeZone={activeZone}
          zoomPct={zoomPct}
        />
        <VenueDynamicPanel
          selectedLayer={selectedLayer}
          pendingComp={pendingComp}
          activeZone={activeZone}
          onZoneClear={() => setActiveZone('')}
          onPendingDone={() => setPendingComp(null)}
          onAdvanced={handleAdvanced}
        />
      </div>
    </div>
  )
}
