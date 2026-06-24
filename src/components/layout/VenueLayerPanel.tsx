/**
 * 高达会场 · 左侧图层面板
 *
 * 参考 animate-ui / shadcn sidebar 风格：
 * - 36px 行高，圆角 hover/active
 * - 章节标签分隔
 * - 删除按钮 hover 渐显
 */
import { useVenue } from '@/contexts/VenueContext'
import { VENUE_COMP_IDS, findComponent } from '@/types'
import type { ComponentId } from '@/types'
import { FileTree, FileItem, TreeSection } from '@/components/ui/FileTree'

// ── SVG 图标（16×16 线描风）──────────────────────────────────────────────────
function Ic({ d, d2 }: { d: string; d2?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
      {d2 && <path d={d2}/>}
    </svg>
  )
}

const Icons = {
  header: () => <Ic d="M2 3h12v10H2z" d2="M2 6h12M5 6v7" />,
  slot:   () => <Ic d="M2 4h12v8H2z" d2="M6 4v8M10 4v8" />,
  floor:  () => <Ic d="M3 5h10M3 8h10M3 11h10" />,
  htab:   () => <Ic d="M2 4h4v8H2z" d2="M8 4h4v8H8" />,
  coupon: () => <Ic d="M2 6h12v4H2z" d2="M2 9h12M8 6v4" />,
  image:  () => <Ic d="M2 3h12v10H2z" d2="M2 9l3-3 2 2 3-4 4 5" />,
  trash:  () => <Ic d="M3 4h10M6 4V3h4v1M5 4v9h6V4" />,
}

function compIcon(id: ComponentId) {
  switch (id) {
    case 'slot':   return <Icons.slot />
    case 'floor':  return <Icons.floor />
    case 'h-tab':  return <Icons.htab />
    case 'coupon': return <Icons.coupon />
    default:       return <Icons.image />
  }
}

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

interface Props {
  selectedLayer: 'header' | string | null
  onSelect:   (layer: 'header' | string | null) => void
  onAddNew:   (compId: ComponentId) => void
}

export default function VenueLayerPanel({ selectedLayer, onSelect, onAddNew }: Props) {
  const { items, removeItem } = useVenue()
  const addedSet = new Set(items.map(it => it.componentId))

  return (
    <aside
      style={{
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--sl-panel)',
        borderRight: '1px solid var(--sl-border)',
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '10px 6px 8px' }}>

        {/* ── 页面结构 ── */}
        <TreeSection label="页面结构">
          <FileTree>
            {/* 活动头图 */}
            <FileItem
              icon={<Icons.header />}
              label="活动头图"
              sublabel="头图 · 背景色 · 尺寸"
              active={selectedLayer === 'header'}
              onClick={() => onSelect('header')}
            />

            {/* 已加入画布的组件 */}
            {items.map((item, idx) => (
              <FileItem
                key={item.id}
                icon={compIcon(item.componentId)}
                label={item.label}
                sublabel={findComponent(item.componentId)?.desc || ''}
                active={selectedLayer === item.id}
                badge={idx + 1}
                onClick={() => onSelect(item.id)}
                action={
                  <DeleteBtn onClick={e => {
                    e.stopPropagation()
                    removeItem(item.id)
                    if (selectedLayer === item.id) onSelect(null)
                  }} />
                }
              />
            ))}

            {items.length === 0 && (
              <div style={{
                padding: '10px 10px 6px',
                fontSize: 11,
                color: 'rgba(255,255,255,0.18)',
                lineHeight: 1.5,
              }}>
                添加组件后在此显示
              </div>
            )}
          </FileTree>
        </TreeSection>

        {/* 分隔线 */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 4px 10px' }} />

        {/* ── 组件工坊 ── */}
        <TreeSection label="组件工坊">
          <FileTree>
            {VENUE_COMP_IDS.map(id => {
              const comp  = findComponent(id)
              const added = addedSet.has(id)
              return (
                <FileItem
                  key={id}
                  icon={compIcon(id)}
                  label={comp?.name ?? id}
                  sublabel={added ? '点击查看预览 / 再次加入' : '点击查看组件介绍'}
                  badge={added ? '已加入' : undefined}
                  onClick={() => onAddNew(id)}
                />
              )
            })}
          </FileTree>
        </TreeSection>

      </div>
    </aside>
  )
}
