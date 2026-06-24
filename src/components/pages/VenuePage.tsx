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
import { useApp } from '@/contexts/AppContext'
import { findComponent } from '@/types'
import type { ComponentId } from '@/types'

import VenueLayerPanel   from '@/components/layout/VenueLayerPanel'
import VenueCanvasCenter from '@/components/layout/VenueCanvasCenter'
import VenueDynamicPanel from '@/components/layout/VenueDynamicPanel'

const SlotStudio = lazy(() => import('./SlotStudio'))
const FloorPage  = lazy(() => import('./FloorPage'))
const HTabPage   = lazy(() => import('./HTabPage'))
const CouponPage = lazy(() => import('./CouponPage'))

function Loader() {
  return <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>加载中…</div>
}

// ── 高级设置模式左侧收缩条 ────────────────────────────────────────────────────
function AdvancedStrip({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center py-3 gap-4 h-full shrink-0 border-r"
      style={{ width: 44, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}>
      <button onClick={onBack} title="返回画布"
        className="p-2 rounded-lg transition-opacity hover:opacity-70"
        style={{ color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
      {/* 竖排组件名 */}
      <div style={{ writingMode: 'vertical-rl', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>
        {label}
      </div>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
export default function VenuePage() {
  const { goDelivery } = useApp()

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

  // ── 其他组件：老式高级设置（FloorPage / HTabPage / CouponPage）────────────
  if (advancedComp) {
    const label = findComponent(advancedComp)?.name ?? advancedComp
    return (
      <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
        <AdvancedStrip label={label} onBack={exitAdvanced} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-11 flex items-center px-4 border-b shrink-0 gap-3"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
            <button onClick={exitAdvanced}
              className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
              style={{ color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              返回画布
            </button>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{label}</span>
          </div>
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={<Loader />}>
              {advancedComp === 'floor'  && <FloorPage />}
              {advancedComp === 'h-tab'  && <HTabPage />}
              {advancedComp === 'coupon' && <CouponPage />}
            </Suspense>
          </main>
        </div>
      </div>
    )
  }

  // ── 画布布局模式（默认三列） ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>

      {/* 顶部工具栏 */}
      <div className="flex items-center px-5 shrink-0 gap-3 border-b"
        style={{ height: 44, background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>会场搭建</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(45,120,244,0.1)', color: '#6AA3FF' }}>
          选中图层 → 右侧配置 · 「高级设置」开启完整编辑
        </span>
        <div style={{ flex: 1 }} />

        {/* 完成 · 下载素材（主 CTA） */}
        <button
          onClick={goDelivery}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(90deg, #FF3060, #FF6030)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
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
