/**
 * 高达会场 · 左侧图层面板（精致化版本）
 *
 * 参考 Linear/animate-ui 风格：
 * - FileTree 组件驱动，带折叠动画
 * - 细分区块：页面结构 + 组件工坊
 * - 统一的 sidebar-item 样式
 */
import { useVenue } from '@/contexts/VenueContext'
import { useApp }   from '@/contexts/AppContext'
import { VENUE_COMP_IDS, findComponent } from '@/types'
import type { ComponentId } from '@/types'
import { FileTree, FileItem, TreeSection } from '@/components/ui/FileTree'

// ── SVG 图标（精简线描）────────────────────────────────────────────────────────
const Ic = (d: string) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor"
    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
)

const Icons = {
  header: () => Ic('M2 3h12v10H2zM2 6h12M5 6v7'),
  slot:   () => Ic('M2 4h12v8H2zM6 4v8M10 4v8'),
  floor:  () => Ic('M3 5h10M3 8h10M3 11h10'),
  htab:   () => Ic('M2 4h4v8H2zM8 4h4v8H8'),
  coupon: () => Ic('M2 6h12v4H2zM2 9h12M8 6v4'),
  image:  () => Ic('M2 3h12v10H2zM2 9l3-3 2 2 3-4 4 5'),
  add:    () => Ic('M8 3v10M3 8h10'),
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

interface Props {
  selectedLayer: 'header' | string | null
  onSelect:   (layer: 'header' | string | null) => void
  onAddNew:   (compId: ComponentId) => void
}

export default function VenueLayerPanel({ selectedLayer, onSelect, onAddNew }: Props) {
  const { goHome }     = useApp()
  const { items, removeItem } = useVenue()
  const addedSet    = new Set(items.map(it => it.componentId))

  return (
    <aside
      style={{
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0C111B',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}
    >
      {/* 返回首页 */}
      <div style={{ padding: '0 10px' }}>
        <button
          onClick={goHome}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            width: '100%', padding: '10px 8px',
            fontSize: 12, color: 'rgba(255,255,255,0.38)',
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 4,
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 4L6 8l4 4"/>
          </svg>
          返回首页
        </button>
      </div>

      {/* 可滚动主体 */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '0 6px' }}>

        {/* 页面结构 */}
        <TreeSection label="页面结构">
          <FileTree>
            <FileItem
              icon={<Icons.header />}
              label="活动头图"
              active={selectedLayer === 'header'}
              sublabel="头图 · 背景色 · 尺寸"
              onClick={() => onSelect('header')}
            />
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
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      removeItem(item.id)
                      // 如果删的是当前选中项，清空选中
                      if (selectedLayer === item.id) onSelect(null)
                    }}
                    title="从画布移除"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 20, height: 20, borderRadius: 5,
                      background: 'rgba(239,68,68,0.1)', color: 'rgba(239,68,68,0.7)',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4l8 8M12 4l-8 8"/>
                    </svg>
                  </button>
                }
              />
            ))}
            {items.length === 0 && (
              <div style={{ padding: '8px 12px', fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.5 }}>
                添加组件后在此显示
              </div>
            )}
          </FileTree>
        </TreeSection>

        {/* 分隔线 */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '4px 4px 8px' }} />

        {/* 组件工坊 */}
        <TreeSection label="组件工坊">
          <FileTree>
            {VENUE_COMP_IDS.map(id => {
              const comp = findComponent(id)
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
