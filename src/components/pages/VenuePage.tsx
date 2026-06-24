/**
 * 高达会场统一工作区
 *
 * 始终保持三列布局，不再跳转到独立编辑页：
 *   [图层面板 220px] | [画布预览 flex-1] | [动态属性面板 280px]
 *
 * 两种右侧面板状态：
 *   selectedLayer ≠ null  → 编辑已在画布上的组件（配置实时同步 canvas）
 *   pendingComp   ≠ null  → 配置新组件（尚未加入画布），底部显示「加入会场」
 */
import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import type { ComponentId } from '@/types'

import VenueLayerPanel   from '@/components/layout/VenueLayerPanel'
import VenueCanvasCenter from '@/components/layout/VenueCanvasCenter'
import VenueDynamicPanel from '@/components/layout/VenueDynamicPanel'

export default function VenuePage() {
  const { hasExportAll, triggerExportAll } = useApp()

  // 当前选中的已加入画布组件（string = VenueItem.id，'header' = 头图，null = 页面设置）
  const [selectedLayer, setSelectedLayer] = useState<'header' | string | null>(null)

  // 正在配置、尚未加入画布的组件（点「组件工坊」时设置）
  const [pendingComp,   setPendingComp]   = useState<ComponentId | null>(null)

  // 点击「组件工坊」→ 清空 selectedLayer，切换到 pending 配置模式
  const handleAddNew = (compId: ComponentId) => {
    setSelectedLayer(null)
    setPendingComp(compId)
  }

  // 点击图层列表 → 清空 pending，切换到已有组件配置模式
  const handleSelectLayer = (layer: 'header' | string | null) => {
    setPendingComp(null)
    setSelectedLayer(layer)
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>

      {/* 顶部工具栏（一行，极简）*/}
      <div
        className="flex items-center px-5 shrink-0 gap-3 border-b"
        style={{ height: 44, background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>会场搭建</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(45,120,244,0.1)', color: '#6AA3FF' }}>
          选中图层 → 右侧实时配置
        </span>
        <div style={{ flex: 1 }} />
        {hasExportAll && (
          <button
            onClick={triggerExportAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white"
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

      {/* 三列主体 */}
      <div className="flex flex-1 overflow-hidden">

        {/* ① 图层面板 */}
        <VenueLayerPanel
          selectedLayer={selectedLayer}
          onSelect={handleSelectLayer}
          onAddNew={handleAddNew}
        />

        {/* ② 画布预览 */}
        <VenueCanvasCenter
          selectedLayer={selectedLayer}
          onSelectLayer={handleSelectLayer}
        />

        {/* ③ 动态属性面板 */}
        <VenueDynamicPanel
          selectedLayer={selectedLayer}
          pendingComp={pendingComp}
          onPendingDone={() => setPendingComp(null)}
        />

      </div>
    </div>
  )
}
