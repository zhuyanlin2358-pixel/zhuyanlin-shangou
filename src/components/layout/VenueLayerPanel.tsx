/**
 * 高达会场 · 左侧图层面板
 * - 36px 行高，圆角 hover/active（FileItem 统一规范）
 * - 组件工坊：行内「加入/↺」按钮，无需右侧二次点击
 */
import { useState } from 'react'
import { useVenue }  from '@/contexts/VenueContext'
import { useFloor }  from '@/contexts/FloorContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useCoupon } from '@/contexts/CouponContext'
import { useSlot }   from '@/contexts/SlotContext'
import { useApp }    from '@/contexts/AppContext'
import { VENUE_COMP_IDS, findComponent, COUPON_COLORS } from '@/types'
import type { ComponentId } from '@/types'
import { FileTree, FileItem, TreeSection } from '@/components/ui/FileTree'
import { genFloorUrl, genHTabUrl, genCouponUrl, genSlotUrl } from '@/utils/venuePreviewUrls'

// ── 删除按钮 ─────────────────────────────────────────────────────────────────
function DeleteBtn({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      title="从画布移除"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
        background: 'rgba(239,68,68,0.1)',
        color: 'rgba(239,68,68,0.65)',
        border: 'none', cursor: 'pointer',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = 'rgba(239,68,68,0.2)'
        el.style.color = 'rgba(239,68,68,0.9)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = 'rgba(239,68,68,0.1)'
        el.style.color = 'rgba(239,68,68,0.65)'
      }}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M4 4l8 8M12 4l-8 8"/>
      </svg>
    </button>
  )
}

// ── 侧边栏「加入/↺」按钮（内联，一键加入会场）──────────────────────────────
function SidebarAddBtn({ compId, onAdded }: { compId: ComponentId; onAdded?: () => void }) {
  const { addItem, items } = useVenue()
  const { config: floorCfg, floors } = useFloor()
  const { config: hTabCfg, items: hTabItems } = useHTab()
  const { config: couponCfg } = useCoupon()
  const { config: slotCfg } = useSlot()
  const { showToast } = useApp()
  const [loading, setLoading] = useState(false)

  const isAdded = items.some(it => it.componentId === compId)

  const handle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(true)
    try {
      switch (compId) {
        case 'floor': {
          const fi = floors[0]
          if (!fi) { showToast('请先在楼层配置里添加至少一条楼层'); return }
          const url = await genFloorUrl({ ...floorCfg, text: fi.text })
          addItem({ componentId: 'floor', label: fi.text || '楼层条', previewUrl: url, origW: 750, origH: 60, sourceId: fi.id })
          showToast(`✅ 「${fi.text || '楼层条'}」已加入会场`)
          break
        }
        case 'h-tab': {
          const hi = hTabItems[0]
          if (!hi) { showToast('请先配置 Tab 内容'); return }
          const tabCount = items.filter(it => it.componentId === 'h-tab').length
          const label = `Tab ${tabCount + 1}`
          const url = await genHTabUrl({ colorKey: hTabCfg.colorKey, tabs: hi.tabs, activeIndex: 0 })
          addItem({ componentId: 'h-tab', label, previewUrl: url, origW: 750, origH: 88, sourceId: hi.id })
          showToast(`✅ 「${label}」已加入会场`)
          break
        }
        case 'coupon': {
          const url = await genCouponUrl(couponCfg)
          const colorName = COUPON_COLORS[couponCfg.colorKey].name
          addItem({ componentId: 'coupon', label: `券红包·${colorName}`, previewUrl: url, origW: 702, origH: 352 })
          showToast('✅ 「一键领券红包」已加入会场')
          break
        }
        case 'slot': {
          const url = await genSlotUrl(slotCfg)
          addItem({ componentId: 'slot', label: '老虎机', previewUrl: url, origW: 750, origH: 242 })
          showToast('✅ 「老虎机」已加入会场')
          break
        }
      }
      onAdded?.()
    } catch {
      showToast('预览生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      title={isAdded ? '再次加入会场' : '加入会场'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 3, padding: '3px 8px', borderRadius: 6, flexShrink: 0,
        fontSize: 10, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
        background: loading
          ? 'rgba(250,217,0,0.08)'
          : isAdded
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(250,217,0,0.12)',
        color: loading
          ? 'rgba(250,217,0,0.3)'
          : isAdded
            ? 'rgba(255,255,255,0.4)'
            : '#fad900',
        border: `1px solid ${isAdded ? 'rgba(255,255,255,0.08)' : 'rgba(250,217,0,0.25)'}`,
        transition: 'all 0.12s',
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? '…' : isAdded ? '↺ 再加' : '+ 加入'}
    </button>
  )
}

interface Props {
  selectedLayer: 'header' | string | null
  onSelect:   (layer: 'header' | string | null) => void
  onAddNew:   (compId: ComponentId) => void
}

export default function VenueLayerPanel({ selectedLayer, onSelect, onAddNew }: Props) {
  const { items, removeItem, restoreItem } = useVenue()
  const { showToastWithUndo } = useApp()

  return (
    <aside
      style={{
        width: 216,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--sl-panel)',
        borderRight: '1px solid var(--sl-border)',
        boxShadow: 'var(--shadow-panel-r)',
        flexShrink: 0,
        zIndex: 5, position: 'relative',
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '10px 6px 8px' }}>

        {/* 页面结构 */}
        <FileTree>
          <FileItem
            label="活动头图"
            sublabel="头图 · 背景色 · 尺寸"
            active={selectedLayer === 'header'}
            onClick={() => onSelect('header')}
          />

          {items.map((item, idx) => (
            <FileItem
              key={item.id}
              label={item.label}
              sublabel={findComponent(item.componentId)?.desc || ''}
              active={selectedLayer === item.id}
              badge={idx + 1}
              onClick={() => onSelect(item.id)}
              action={
                <DeleteBtn onClick={e => {
                  e.stopPropagation()
                  const savedItem = item
                  const savedIdx  = idx
                  removeItem(item.id)
                  if (selectedLayer === item.id) onSelect(null)
                  showToastWithUndo(
                    `「${item.label}」已从画布移除`,
                    () => restoreItem(savedItem, savedIdx),
                  )
                }} />
              }
            />
          ))}

          {items.length === 0 && (
            <div style={{
              padding: '10px 10px 6px',
              fontSize: 12,
              color: 'rgba(255,255,255,0.18)',
              lineHeight: 1.5,
            }}>
              添加组件后在此显示
            </div>
          )}
        </FileTree>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 4px 10px' }} />

        {/* ── 组件工坊 ── */}
        <TreeSection label="组件工坊">
          <FileTree>
            {VENUE_COMP_IDS.map(id => {
              const comp = findComponent(id)
              return (
                <FileItem
                  key={id}
                  label={comp?.name ?? id}
                  sublabel="点击查看组件详情"
                  onClick={() => onAddNew(id)}
                  action={<SidebarAddBtn compId={id} />}
                />
              )
            })}
          </FileTree>
        </TreeSection>

      </div>
    </aside>
  )
}
