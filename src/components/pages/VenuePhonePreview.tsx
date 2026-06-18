/**
 * 高达会场右侧手机预览
 * 拖拽：pointer 事件 + setPointerCapture（无 id 传参，通过 draggedId ref + itemRefs 定位邻居）
 * 高度：标题栏右侧滑块，400–820px 可调
 */
import { useRef, useState } from 'react'
import { useVenue } from '@/contexts/VenueContext'

export default function VenuePhonePreview() {
  const { items, headerUrl, headerSize, bgColor, moveItem } = useVenue()

  const SCALE   = 0.5
  const headerH = Math.round(parseInt(headerSize) * SCALE)

  // ── 拖拽排序 ──────────────────────────────────────────────────────────────
  const draggedId    = useRef<string | null>(null)
  const lastSwapTime = useRef(0)
  const itemRefs     = useRef<Record<string, HTMLDivElement | null>>({})

  // latestItems 始终持有最新 items（规避 useCallback stale closure）
  const latestItems = useRef(items)
  latestItems.current = items

  const [dragOver, setDragOver] = useState<string | null>(null)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggedId.current = id
  }

  // ⚠️ 不传 id：pointer 被捕获后所有 move 事件都走这里，靠 draggedId 定位邻居
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggedId.current || e.buttons === 0) {
      draggedId.current = null
      setDragOver(null)
      return
    }

    const now  = Date.now()
    if (now - lastSwapTime.current < 160) return   // 防止同一帧多次 swap

    const cur  = latestItems.current
    const srcIdx = cur.findIndex(it => it.id === draggedId.current)
    if (srcIdx < 0) return

    // 检查上方邻居
    if (srcIdx > 0) {
      const above = cur[srcIdx - 1]
      const ref   = itemRefs.current[above.id]
      if (ref) {
        const r = ref.getBoundingClientRect()
        if (e.clientY < r.top + r.height / 2) {
          moveItem(draggedId.current, 'up')
          lastSwapTime.current = now
          setDragOver(above.id)
          return
        }
      }
    }

    // 检查下方邻居
    if (srcIdx < cur.length - 1) {
      const below = cur[srcIdx + 1]
      const ref   = itemRefs.current[below.id]
      if (ref) {
        const r = ref.getBoundingClientRect()
        if (e.clientY > r.top + r.height / 2) {
          moveItem(draggedId.current, 'down')
          lastSwapTime.current = now
          setDragOver(below.id)
          return
        }
      }
    }
  }

  const handlePointerUp = () => {
    draggedId.current = null
    setDragOver(null)
  }

  return (
    <div
      className="fixed top-0 right-0 h-screen flex flex-col border-l"
      style={{ width: 380, background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* ── 标题栏（含高度调节）── */}
      <div
        className="h-12 flex items-center justify-between px-4 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
          手机预览 · 375px
        </span>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {items.length} 组件 · 拖拽排序
            </span>
          )}
        </div>
      </div>

      {/* ── 手机预览区（高度自适应，无上限；外层可滚动）── */}
      <div className="flex-1 overflow-y-auto flex justify-center pt-3 pb-4 px-2">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl w-full"
          style={{
            maxWidth: 375,
            background: bgColor,
            border: '1.5px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* 状态栏 */}
          <div className="flex items-center justify-between px-4 shrink-0"
            style={{ height: 26, background: bgColor }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#333' }}>9:41</span>
            <div className="flex gap-1">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-full"
                  style={{ width: 3.5, height: i === 3 ? 5 : 3.5, background: '#333', opacity: 0.5 }} />
              ))}
            </div>
          </div>

          {/* 内容区（高度随内容撑开，无上限）*/}
          <div style={{ background: bgColor }}>
            {/* 头图 */}
            {headerUrl ? (
              <img src={headerUrl} alt="头图"
                style={{ width: '100%', height: headerH, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', height: Math.max(headerH, 40), background: '#f5f5f5',
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize: 10, color: '#bbb' }}>暂无头图</span>
              </div>
            )}

            {/* 组件列表 */}
            {items.length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 10, color: '#bbb' }}>
                配置组件后点「加入会场」↗
              </div>
            )}
            {items.map(item => (
              <div
                key={item.id}
                ref={el => { itemRefs.current[item.id] = el }}
                onPointerDown={e => handlePointerDown(e, item.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                  cursor: draggedId.current === item.id ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  userSelect: 'none',
                  outline: dragOver === item.id ? '2px solid rgba(255,80,80,0.6)' : 'none',
                  marginTop: 4,
                }}
              >
                {item.spacingAbove > 0 && (
                  <div style={{ height: Math.round(item.spacingAbove * SCALE), background: bgColor }} />
                )}
                {/* 留白：750px 设计 = 8px；702px 设计(红包)按比例多加 12px = 20px */}
                {(() => {
                  const isCoupon = item.componentId === 'coupon'
                  const pad = isCoupon ? 20 : 8
                  const r   = isCoupon ? 10 : 0
                  return (
                    <div style={{ padding: `0 ${pad}px`, background: bgColor }}>
                      <img
                        src={item.previewUrl} alt={item.label}
                        draggable={false}
                        style={{ width: '100%', height: 'auto', display: 'block',
                          borderRadius: r, overflow: 'hidden' }}
                      />
                    </div>
                  )
                })()}
              </div>
            ))}
            <div style={{ height: 12, background: bgColor }} />
          </div>
        </div>
      </div>
    </div>
  )
}
