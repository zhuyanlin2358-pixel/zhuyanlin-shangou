/**
 * 高达会场 · 左侧面板
 *
 * 上半「页面结构」：活动头图（固定）+ 已加入画布的组件（可选中 / 拖序）
 * 下半「组件工坊」：VENUE_COMP_IDS 常驻列表，随时点击进入配置
 *   ─ 未加入画布的组件：正常显示，点击 → 进入聚焦模式配置
 *   ─ 已加入画布的组件：显示「已加入」角标，点击 → 进入聚焦模式再次编辑
 */
import { useVenue } from '@/contexts/VenueContext'
import { useApp }   from '@/contexts/AppContext'
import { VENUE_COMP_IDS, findComponent } from '@/types'
import type { ComponentId } from '@/types'

// ── 组件图标（SVG 线描） ──────────────────────────────────────────────────────
function IconHeader() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18"/><path d="M9 21V9"/>
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

// ── 图层行（页面结构区） ───────────────────────────────────────────────────────
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
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <span style={{ opacity: 0.7, flexShrink: 0 }}>{icon}</span>
      <span className="flex-1 text-[12px] truncate">{label}</span>
      {order !== undefined && (
        <span className="text-[9px] shrink-0 px-1 rounded"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }}>
          {order}
        </span>
      )}
    </div>
  )
}

// ── 组件工坊行（常驻） ────────────────────────────────────────────────────────
function WorkshopRow({
  compId, label, isAdded, onClick,
}: {
  compId: ComponentId; label: string; isAdded: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all"
      style={{
        background: 'transparent',
        border: 'none',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      <span style={{ opacity: 0.55, flexShrink: 0 }}>{compIcon(compId)}</span>
      <span className="flex-1 text-[12px] truncate">{label}</span>
      {isAdded ? (
        <span className="text-[9px] shrink-0 px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(45,120,244,0.15)', color: '#6AA3FF', border: '1px solid rgba(45,120,244,0.25)' }}>
          已加入
        </span>
      ) : (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
          style={{ opacity: 0.3, flexShrink: 0 }}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      )}
    </button>
  )
}

// ── 区块分隔标题 ──────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-4 pb-1.5 text-[10px] font-semibold tracking-widest uppercase shrink-0"
      style={{ color: 'rgba(255,255,255,0.18)' }}>
      {children}
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

  // 哪些 componentId 已经加入了画布
  const addedCompIds = new Set(items.map(it => it.componentId))

  return (
    <aside
      className="flex flex-col h-full shrink-0 border-r"
      style={{ width: 220, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* 返回首页 */}
      <button
        onClick={goHome}
        className="flex items-center gap-2 px-4 h-11 text-xs transition-opacity hover:opacity-70 shrink-0"
        style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
        返回首页
      </button>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />

      {/* 上半：页面结构（可滚动） */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <SectionLabel>页面结构</SectionLabel>

        {/* 活动头图（固定首位） */}
        <LayerRow
          icon={<IconHeader />}
          label="活动头图"
          selected={selectedLayer === 'header'}
          onClick={() => onSelect('header')}
        />

        {/* 已加入画布的组件 */}
        {items.length > 0 && (
          <>
            <div className="mx-3 my-1" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
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
          </>
        )}

        {items.length === 0 && (
          <p className="px-4 pt-1 pb-3 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.16)' }}>
            配置组件后点「加入会场」<br />即可在此预览
          </p>
        )}
      </div>

      {/* 下半：组件工坊（最多 220px，超出可滚动） */}
      <div
        className="border-t overflow-y-auto"
        style={{ borderColor: 'rgba(255,255,255,0.07)', maxHeight: 220, flexShrink: 0 }}
      >
        <SectionLabel>组件工坊</SectionLabel>
        {VENUE_COMP_IDS.map(id => (
          <WorkshopRow
            key={id}
            compId={id}
            label={findComponent(id)?.name ?? id}
            isAdded={addedCompIds.has(id)}
            onClick={() => onAddNew(id)}
          />
        ))}
        <div style={{ height: 8 }} />
      </div>
    </aside>
  )
}
