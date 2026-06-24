/**
 * 高达会场 · 中间画布预览区
 *
 * 手机帧居中显示，背景网格暗示"这是画布"。
 * 点击头图/组件 → 选中对应图层，右侧属性面板同步切换。
 * 支持 pointer 拖拽排序。
 */
import { useRef, useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { useVenue } from '@/contexts/VenueContext'
import type { VenueHeaderSize } from '@/types'

const HEADER_SIZES: { key: VenueHeaderSize; h: number }[] = [
  { key: '424', h: 424 },
  { key: '624', h: 624 },
  { key: '274', h: 274 },
]

interface Props {
  selectedLayer: 'header' | string | null
  onSelectLayer: (layer: 'header' | string | null) => void
}

export default function VenueCanvasCenter({ selectedLayer, onSelectLayer }: Props) {
  const {
    items, moveItem,
    headerUrl, headerSize, bgColor,
  } = useVenue()

  const SCALE   = 0.5
  const headerH = (HEADER_SIZES.find(s => s.key === headerSize)?.h ?? 424) * SCALE

  // ── 拖拽排序 ──────────────────────────────────────────────────────────────
  const draggedId    = useRef<string | null>(null)
  const lastSwapTime = useRef(0)
  const itemRefs     = useRef<Record<string, HTMLDivElement | null>>({})
  const latestItems  = useRef(items)
  latestItems.current = items
  const [dragOver, setDragOver] = useState<string | null>(null)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggedId.current = id
    onSelectLayer(id)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggedId.current || e.buttons === 0) {
      draggedId.current = null; setDragOver(null); return
    }
    const now = Date.now()
    if (now - lastSwapTime.current < 160) return
    const cur    = latestItems.current
    const srcIdx = cur.findIndex(it => it.id === draggedId.current)
    if (srcIdx < 0) return
    if (srcIdx > 0) {
      const above = cur[srcIdx - 1]
      const ref   = itemRefs.current[above.id]
      if (ref) {
        const r = ref.getBoundingClientRect()
        if (e.clientY < r.top + r.height / 2) {
          moveItem(draggedId.current, 'up'); lastSwapTime.current = now; setDragOver(above.id); return
        }
      }
    }
    if (srcIdx < cur.length - 1) {
      const below = cur[srcIdx + 1]
      const ref   = itemRefs.current[below.id]
      if (ref) {
        const r = ref.getBoundingClientRect()
        if (e.clientY > r.top + r.height / 2) {
          moveItem(draggedId.current, 'down'); lastSwapTime.current = now; setDragOver(below.id); return
        }
      }
    }
  }

  const handlePointerUp = () => { draggedId.current = null; setDragOver(null) }

  return (
    <div
      className="flex-1 flex flex-col items-center overflow-y-auto"
      style={{
        // 微网格背景，暗示这是画布
        background: '#080C14',
        backgroundImage: [
          'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '20px 20px',
      }}
    >
      {/* 顶部信息栏 */}
      <div
        className="w-full flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
          画布预览 · 375px
        </span>
        {items.length > 0 && (
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            {items.length} 组件 · 拖拽排序
          </span>
        )}
      </div>

      {/* 手机帧 */}
      <div className="flex-1 flex items-start justify-center py-6 px-4 w-full">
        <div
          className="rounded-[24px] overflow-hidden shadow-2xl shrink-0"
          style={{
            width: 375,
            background: bgColor,
            border: '2px solid rgba(255,255,255,0.1)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* 状态栏 */}
          <div
            className="flex items-center justify-between px-4 shrink-0"
            style={{ height: 26, background: bgColor }}
          >
            <span style={{ fontSize: 9, fontWeight: 700, color: '#333' }}>9:41</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-full" style={{ width: 3, height: i === 3 ? 5 : 3, background: '#333', opacity: 0.4 }} />
              ))}
            </div>
          </div>

          {/* 头图区域 */}
          <div
            onClick={() => onSelectLayer('header')}
            className="relative cursor-pointer"
            style={{
              outline: selectedLayer === 'header' ? '2.5px solid #2D78F4' : '2.5px solid transparent',
              outlineOffset: -1,
              transition: 'outline-color 0.15s',
            }}
          >
            {headerUrl ? (
              <img
                src={headerUrl}
                alt="头图"
                style={{ width: '100%', height: headerH, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: Math.max(headerH, 48),
                  background: 'rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <ImageIcon size={16} style={{ color: 'rgba(0,0,0,0.25)' }} />
                <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.25)' }}>点击选中头图区域</span>
              </div>
            )}

            {/* 蓝色选中标签 */}
            {selectedLayer === 'header' && (
              <div
                style={{
                  position: 'absolute', top: 4, left: 4,
                  fontSize: 9, fontWeight: 600, color: '#fff',
                  background: '#2D78F4', borderRadius: 3, padding: '1px 5px',
                  pointerEvents: 'none',
                }}
              >
                头图
              </div>
            )}
          </div>

          {/* 组件列表 */}
          {items.length === 0 && (
            <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 10, color: '#aaa' }}>
              添加组件后在此预览
            </div>
          )}

          {items.map(item => (
            <div
              key={item.id}
              ref={el => { itemRefs.current[item.id] = el }}
              onPointerDown={e => handlePointerDown(e, item.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative"
              style={{
                cursor: draggedId.current === item.id ? 'grabbing' : 'pointer',
                touchAction: 'none',
                userSelect: 'none',
                marginTop: 4,
              }}
            >
              {item.spacingAbove > 0 && (
                <div style={{ height: Math.round(item.spacingAbove * SCALE), background: bgColor }} />
              )}
              <div
                style={{
                  outline: (selectedLayer === item.id || dragOver === item.id)
                    ? '2.5px solid #2D78F4'
                    : '2.5px solid transparent',
                  outlineOffset: -1,
                  transition: 'outline-color 0.12s',
                  position: 'relative',
                }}
              >
                {(() => {
                  const isCoupon = item.componentId === 'coupon'
                  const pad = isCoupon ? 20 : 8
                  const r   = isCoupon ? 10 : 0
                  return (
                    <div style={{ padding: `0 ${pad}px`, background: bgColor }}>
                      <img
                        src={item.previewUrl} alt={item.label}
                        draggable={false}
                        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: r }}
                      />
                    </div>
                  )
                })()}

                {/* 选中标签 */}
                {selectedLayer === item.id && (
                  <div
                    style={{
                      position: 'absolute', top: 4, left: isCoupon(item.componentId) ? 24 : 12,
                      fontSize: 9, fontWeight: 600, color: '#fff',
                      background: '#2D78F4', borderRadius: 3, padding: '1px 5px',
                      pointerEvents: 'none',
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </div>
            </div>
          ))}

          <div style={{ height: 12, background: bgColor }} />
        </div>
      </div>
    </div>
  )
}

function isCoupon(compId: string) { return compId === 'coupon' }
