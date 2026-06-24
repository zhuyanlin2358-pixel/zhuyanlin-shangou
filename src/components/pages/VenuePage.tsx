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
  const { goDelivery } = useApp()
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

      {/* ── 统一顶栏（单行，所有控件集中对齐）── */}
      <div className="flex items-center shrink-0 border-b"
        style={{ height: 48, background: 'var(--sl-panel)', borderColor: 'var(--sl-border)', padding: '0 16px', gap: 0 }}>

        {/* 页面标题（返回首页已移至左侧面板顶部）*/}
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(235,233,252,0.55)', letterSpacing: '0.01em' }}>
          画布
        </span>

        {/* 弹性间距 */}
        <div style={{ flex: 1 }} />

        {/* 画布缩放控制（紧凑型，不超过 150px 宽）*/}
        <div className="flex items-center" style={{ gap: 2, marginRight: 12 }}>
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

        {/* 分隔线 */}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 14px 0 2px', flexShrink: 0 }} />

        {/* 完成 · 下载素材（主 CTA）*/}
        <button
          onClick={goDelivery}
          className="flex items-center gap-2 text-[13px] font-bold rounded-xl transition-all hover:opacity-90 shrink-0"
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
