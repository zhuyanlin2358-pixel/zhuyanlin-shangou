/**
 * 高达会场统一工作区（重构版）
 *
 * 两种模式：
 *
 * ① 页面布局模式（默认）
 *   [图层面板 220px] | [画布预览 flex-1] | [动态属性面板 280px]
 *
 * ② 组件聚焦模式（深入编辑）
 *   [收缩条 40px] | [组件全屏编辑器 flex-1] | [手机预览 380px]
 *   —— 对应亦仁/刘小排方案B：点击「深入编辑」放大画布，专注配置单个组件
 */
import { Suspense, lazy, useState } from 'react'
import { useApp }   from '@/contexts/AppContext'
import { useVenue } from '@/contexts/VenueContext'
import { findComponent } from '@/types'
import type { ComponentId } from '@/types'

import VenueLayerPanel   from '@/components/layout/VenueLayerPanel'
import VenueCanvasCenter from '@/components/layout/VenueCanvasCenter'
import VenueDynamicPanel from '@/components/layout/VenueDynamicPanel'
import VenuePhonePreview from './VenuePhonePreview'

const SlotPage   = lazy(() => import('./SlotPage'))
const FloorPage  = lazy(() => import('./FloorPage'))
const HTabPage   = lazy(() => import('./HTabPage'))
const CouponPage = lazy(() => import('./CouponPage'))

function Loader() {
  return (
    <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
      加载中…
    </div>
  )
}

// ── 聚焦模式左侧收缩条 ────────────────────────────────────────────────────────
function FocusStrip({ onBack }: { onBack: () => void }) {
  return (
    <div
      className="flex flex-col items-center py-3 gap-3 h-screen shrink-0 border-r"
      style={{ width: 40, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <button
        onClick={onBack}
        title="返回画布"
        className="p-2 rounded-lg transition-opacity hover:opacity-70"
        style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
export default function VenuePage() {
  const { hasExportAll, triggerExportAll } = useApp()
  const { items } = useVenue()

  // 当前选中的图层：null = 页面设置，'header' = 头图，string = VenueItem.id
  const [selectedLayer, setSelectedLayer] = useState<'header' | string | null>(null)

  // 聚焦模式：哪个组件正在全屏深入编辑
  const [focusComp, setFocusComp] = useState<ComponentId | null>(null)

  const enterFocus = (compId: ComponentId) => setFocusComp(compId)
  const exitFocus  = () => setFocusComp(null)

  // 添加新组件：进入聚焦模式（先配置，再「加入会场」）
  const handleAddNew = (compId: ComponentId) => {
    setFocusComp(compId)
    setSelectedLayer(null)
  }

  // 聚焦模式下，找到对应图层名称
  const focusLabel = focusComp ? (findComponent(focusComp)?.name ?? focusComp) : ''
  const focusItem  = focusComp
    ? items.find(it => it.componentId === focusComp)
    : null

  // ── 组件聚焦模式 ──────────────────────────────────────────────────────────
  if (focusComp) {
    return (
      <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
        {/* 收缩条 */}
        <FocusStrip onBack={exitFocus} />

        {/* 组件全屏编辑器 */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ marginRight: 380 }}>
          {/* 聚焦顶栏 */}
          <div
            className="h-11 flex items-center px-4 border-b shrink-0 gap-3"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <button
              onClick={exitFocus}
              className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70 shrink-0"
              style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              返回画布
            </button>

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />

            <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              {focusItem ? `编辑中：${focusLabel}` : `配置：${focusLabel}`}
            </span>

            {!focusItem && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,120,244,0.12)', color: '#6AA3FF' }}>
                配置后点「加入会场」即可添加到画布
              </span>
            )}
            {focusItem && (
              <>
                <div style={{ width: 6, height: 6, background: '#FF3060', borderRadius: '50%' }} />
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>改动实时同步</span>
              </>
            )}

            <div style={{ flex: 1 }} />

            {hasExportAll && (
              <button
                onClick={triggerExportAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                完成设计并下载
              </button>
            )}
          </div>

          {/* 组件页内容 */}
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={<Loader />}>
              {focusComp === 'slot'   && <SlotPage />}
              {focusComp === 'floor'  && <FloorPage />}
              {focusComp === 'h-tab'  && <HTabPage />}
              {focusComp === 'coupon' && <CouponPage />}
            </Suspense>
          </main>
        </div>

        {/* 右侧手机预览（聚焦时保留上下文） */}
        <VenuePhonePreview />
      </div>
    )
  }

  // ── 页面布局模式（默认）────────────────────────────────────────────────────
  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>

      {/* ① 图层结构面板 */}
      <VenueLayerPanel
        selectedLayer={selectedLayer}
        onSelect={setSelectedLayer}
        onAddNew={handleAddNew}
      />

      {/* ② 画布预览（中间） */}
      <VenueCanvasCenter
        selectedLayer={selectedLayer}
        onSelectLayer={setSelectedLayer}
      />

      {/* ③ 动态属性面板 */}
      <VenueDynamicPanel
        selectedLayer={selectedLayer}
        onEnterFocus={enterFocus}
      />

    </div>
  )
}
