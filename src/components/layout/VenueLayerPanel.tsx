/**
 * 高达会场 · 左侧图层结构面板
 *
 * 从上到下展示当前画布上的所有组件：
 *   固定首位：活动头图
 *   动态列表：VenueContext.items（按顺序）
 * 底部：「+ 添加组件」→ 展开 VENUE_COMP_IDS 选择器
 */
import { useState } from 'react'
import { useVenue } from '@/contexts/VenueContext'
import { useApp }   from '@/contexts/AppContext'
import { VENUE_COMP_IDS, findComponent } from '@/types'
import type { ComponentId } from '@/types'

// ── 组件图标（SVG 线描） ──────────────────────────────────────────────────────
function IconHeader() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18"/>
      <path d="M9 21V9"/>
    </svg>
  )
}
function IconSlot() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M8 4v16M16 4v16"/>
    </svg>
  )
}
function IconFloor() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  )
}
function IconHTab() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="2" y="5" width="6" height="14" rx="1.5"/>
      <rect x="10" y="5" width="6" height="14" rx="1.5"/>
      <rect x="18" y="5" width="4" height="14" rx="1.5"/>
    </svg>
  )
}
function IconCoupon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M20 12V22H4V12"/>
      <path d="M22 7H2v5h20V7z"/>
      <path d="M12 22V7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  )
}
function IconGeneric() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
  )
}

function compIcon(id: ComponentId) {
  switch (id) {
    case 'slot':   return <IconSlot />
    case 'floor':  return <IconFloor />
    case 'h-tab':  return <IconHTab />
    case 'coupon': return <IconCoupon />
    default:       return <IconGeneric />
  }
}

// ── 单个图层行 ────────────────────────────────────────────────────────────────
function LayerRow({
  icon, label, selected, onClick, order,
}: {
  icon: React.ReactNode; label: string; selected: boolean
  onClick: () => void; order?: number
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-all select-none"
      style={{
        borderLeft:  selected ? '2px solid #2D78F4' : '2px solid transparent',
        background:  selected ? 'rgba(45,120,244,0.1)' : 'transparent',
        color:       selected ? '#6AA3FF' : 'rgba(255,255,255,0.5)',
      }}
      onMouseEnter={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
      }}
      onMouseLeave={e => {
        if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <span style={{ opacity: 0.7, flexShrink: 0 }}>{icon}</span>
      <span className="flex-1 text-[12px] truncate">{label}</span>
      {order !== undefined && (
        <span
          className="text-[9px] shrink-0 px-1 rounded"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }}
        >
          {order}
        </span>
      )}
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
interface Props {
  selectedLayer: 'header' | string | null
  onSelect:   (layer: 'header' | string | null) => void
  onAddNew:   (compId: ComponentId) => void
}

export default function VenueLayerPanel({ selectedLayer, onSelect, onAddNew }: Props) {
  const { goHome }  = useApp()
  const { items }   = useVenue()
  const [showPicker, setShowPicker] = useState(false)

  return (
    <aside
      className="flex flex-col h-screen shrink-0 border-r"
      style={{
        width: 220,
        background: '#0C111B',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      {/* 返回首页 */}
      <button
        onClick={goHome}
        className="flex items-center gap-2 px-4 h-11 border-b text-xs transition-opacity hover:opacity-70 shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        返回首页
      </button>

      {/* 区块标题 */}
      <div
        className="px-4 pt-4 pb-2 text-[10px] font-semibold tracking-widest uppercase shrink-0"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        页面结构
      </div>

      {/* 图层列表 */}
      <div className="flex-1 overflow-y-auto">
        {/* 活动头图 · 固定首位 */}
        <LayerRow
          icon={<IconHeader />}
          label="活动头图"
          selected={selectedLayer === 'header'}
          onClick={() => onSelect('header')}
        />

        {/* 已加入组件 */}
        {items.length > 0 && (
          <div className="mx-3 my-1" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
        )}
        {items.map((item, idx) => (
          <LayerRow
            key={item.id}
            icon={compIcon(item.componentId)}
            label={item.label}
            selected={selectedLayer === item.id}
            onClick={() => onSelect(item.id)}
            order={idx + 1}
          />
        ))}

        {/* 空态提示 */}
        {items.length === 0 && (
          <div className="px-4 pt-1 pb-2 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.18)' }}>
            点击下方「+ 添加组件」<br />开始搭建你的会场
          </div>
        )}
      </div>

      {/* + 添加组件 */}
      <div className="shrink-0 border-t p-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        {/* 选择器展开 */}
        {showPicker && (
          <div
            className="mb-2 rounded-xl overflow-hidden border"
            style={{ background: '#141920', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="px-3 py-2 text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
              选择要添加的组件
            </div>
            {VENUE_COMP_IDS.map(id => (
              <button
                key={id}
                onClick={() => { onAddNew(id); setShowPicker(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-all hover:opacity-80"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <span style={{ opacity: 0.5 }}>{compIcon(id)}</span>
                {findComponent(id)?.name ?? id}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowPicker(v => !v)}
          className="w-full flex items-center justify-center gap-2 py-2 text-[12px] font-medium rounded-xl transition-all"
          style={{
            background: showPicker ? 'rgba(45,120,244,0.15)' : 'rgba(255,255,255,0.05)',
            color: showPicker ? '#6AA3FF' : 'rgba(255,255,255,0.45)',
            border: `1px solid ${showPicker ? 'rgba(45,120,244,0.3)' : 'rgba(255,255,255,0.08)'}`,
            cursor: 'pointer',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M12 5v14M5 12h14"/>
          </svg>
          {showPicker ? '收起' : '添加组件'}
        </button>
      </div>
    </aside>
  )
}
