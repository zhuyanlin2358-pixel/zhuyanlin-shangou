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
import { findComponent } from '@/types'
import type { ComponentId } from '@/types'

import VenueLayerPanel   from '@/components/layout/VenueLayerPanel'
import VenueCanvasCenter from '@/components/layout/VenueCanvasCenter'
import VenueDynamicPanel from '@/components/layout/VenueDynamicPanel'
import { drawVenueStitch } from '@/utils/venueExport'
import {
  SlotColorConfig, SlotTextConfig, SlotPrizeConfig,
  SlotDialogBtnConfig, SlotDialogBgConfig, InlineConfigSection,
} from '@/components/panels/SlotConfigBlocks'

const SlotPage   = lazy(() => import('./SlotPage'))
const FloorPage  = lazy(() => import('./FloorPage'))
const HTabPage   = lazy(() => import('./HTabPage'))
const CouponPage = lazy(() => import('./CouponPage'))

// ── 高级设置右侧配置面板（针对 slot 热区） ──────────────────────────────────────
function SlotAdvancedPanel({ zone, onZoneClear }: { zone: string; onZoneClear: () => void }) {
  const zoneLabel: Record<string, string> = {
    text: '文案设置', prize: '奖品图设置',
    color: '配色 / 按钮', '': '全部配置',
  }
  return (
    <div className="flex flex-col h-full shrink-0 border-l overflow-y-auto"
      style={{ width: 280, background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>
      {/* 标题栏 */}
      <div className="h-11 flex items-center px-4 border-b shrink-0 gap-2"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <span className="text-xs font-semibold flex-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {zoneLabel[zone] ?? '配置面板'}
        </span>
        {zone && (
          <button onClick={onZoneClear}
            className="text-[10px] px-2 py-0.5 rounded transition-all hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
            全部
          </button>
        )}
      </div>
      {/* 提示 */}
      {!zone && (
        <div className="px-4 pt-3 pb-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          点击左侧预览图的黄色热区，切换到对应配置
        </div>
      )}
      {/* 配置内容 */}
      <div className="flex-1 overflow-y-auto py-2 px-0">
        {(!zone || zone === 'color') && (
          <div className="px-4">
            <InlineConfigSection label="配色预设" badge="素材 1–5" defaultOpen={zone === 'color'}>
              <SlotColorConfig />
            </InlineConfigSection>
          </div>
        )}
        {(!zone || zone === 'text') && (
          <div className="px-4">
            <InlineConfigSection label="文案设置" badge="素材 2" defaultOpen={zone === 'text'}>
              <SlotTextConfig />
            </InlineConfigSection>
          </div>
        )}
        {(!zone || zone === 'prize') && (
          <div className="px-4">
            <InlineConfigSection label="奖品图设置" badge="素材 6" defaultOpen={zone === 'prize'}>
              <SlotPrizeConfig />
            </InlineConfigSection>
          </div>
        )}
        {!zone && (
          <div className="px-4">
            <InlineConfigSection label="弹窗按钮配色" badge="素材 7">
              <SlotDialogBtnConfig />
            </InlineConfigSection>
            <InlineConfigSection label="弹窗结果页配色" badge="素材 8">
              <SlotDialogBgConfig />
            </InlineConfigSection>
          </div>
        )}
      </div>
    </div>
  )
}

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
  const { showToast }    = useApp()
  const { items, headerUrl, headerSize, bgColor } = useVenue()

  // 画布模式：选中图层
  const [selectedLayer, setSelectedLayer] = useState<'header' | string | null>(null)
  // 画布模式：正在配置、待加入画布的新组件
  const [pendingComp,   setPendingComp]   = useState<ComponentId | null>(null)
  // 画布模式：双击 slot 后选中的热区（'text' | 'prize' | 'color' | ''）
  const [activeZone,    setActiveZone]    = useState('')
  // 高级设置模式：哪个组件正在全屏精细编辑
  const [advancedComp,  setAdvancedComp]  = useState<ComponentId | null>(null)
  // 高级设置模式：当前选中的配置热区
  const [advZone,       setAdvZone]       = useState('')

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

  // 导出会场拼图
  const handleExportVenue = async () => {
    if (items.length === 0 && !headerUrl) {
      showToast('画布上还没有组件，先添加后再导出')
      return
    }
    try {
      await drawVenueStitch({ items, headerUrl, headerSize, bgColor })
      showToast('✅ 会场拼图已下载')
    } catch {
      showToast('导出失败，请重试')
    }
  }

  // ── 高级设置模式 ────────────────────────────────────────────────────────────
  if (advancedComp) {
    const label = findComponent(advancedComp)?.name ?? advancedComp
    return (
      <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
        {/* 收缩条 */}
        <AdvancedStrip label={label} onBack={exitAdvanced} />

        {/* 组件完整配置页（全宽，不显示右侧手机预览） */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶栏 */}
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
            <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              高级设置：{label}
            </span>
            <div style={{ width: 6, height: 6, background: '#FF3060', borderRadius: '50%' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>全量配置 + 导出素材</span>
            <div style={{ flex: 1 }} />
          </div>
          {/* 组件完整页内容 */}
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={<Loader />}>
              {advancedComp === 'slot'   && <SlotPage onZoneClick={setAdvZone} />}
              {advancedComp === 'floor'  && <FloorPage />}
              {advancedComp === 'h-tab'  && <HTabPage />}
              {advancedComp === 'coupon' && <CouponPage />}
            </Suspense>
          </main>
        </div>

        {/* 右侧配置面板（slot 专用，随热区切换） */}
        {advancedComp === 'slot' && (
          <SlotAdvancedPanel zone={advZone} onZoneClear={() => setAdvZone('')} />
        )}
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

        {/* 导出会场拼图 */}
        <button
          onClick={handleExportVenue}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:opacity-85"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          导出会场拼图
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
