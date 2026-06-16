/**
 * 高达会场右侧手机预览（持久，始终显示）
 * 使用 pointer 事件实现上下拖拽排序（比 HTML5 drag 在滚动容器里更可靠）
 */
import { useRef, useState } from 'react'
import { useVenue } from '@/contexts/VenueContext'

export default function VenuePhonePreview() {
  const { items, headerUrl, headerSize, bgColor, reorderItems } = useVenue()

  const SCALE   = 0.5
  const headerH = Math.round(parseInt(headerSize) * SCALE)

  // ── 拖拽状态 ──────────────────────────────────────────────────────────────
  const draggedId  = useRef<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)  // 高亮目标
  const itemRefs   = useRef<Record<string, HTMLDivElement | null>>({})

  // pointer 按下：记录被拖的 id，绑定指针捕获
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    draggedId.current = id
  }

  // pointer 移动：逐帧检测指针 Y 是否越过相邻元素中线
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (!draggedId.current || e.buttons === 0) {
      draggedId.current = null
      setDragOver(null)
      return
    }
    if (draggedId.current === id) return

    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const srcIdx = items.findIndex(it => it.id === draggedId.current)
    const tgtIdx = items.findIndex(it => it.id === id)

    // 向下拖：指针过中线下方才 swap
    if (srcIdx < tgtIdx && e.clientY > midY) {
      reorderItems(draggedId.current, id)
      draggedId.current = id  // 更新 draggedId 为新位置
    }
    // 向上拖：指针过中线上方才 swap
    if (srcIdx > tgtIdx && e.clientY < midY) {
      reorderItems(draggedId.current, id)
      draggedId.current = id
    }
    setDragOver(id)
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
      {/* 标题栏 */}
      <div
        className="h-12 flex items-center justify-between px-4 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
          手机预览 · 375px
        </span>
        {items.length > 0 && (
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {items.length} 个组件 · 上下拖拽排序
          </span>
        )}
      </div>

      {/* 手机预览 */}
      <div className="flex-1 overflow-y-auto flex justify-center pt-3 pb-3 px-2">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl w-full"
          style={{
            maxWidth: 375,
            background: bgColor,
            border: '1.5px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* 状态栏（后续用户可提供真实截图替换）*/}
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

          {/* 头图 */}
          {headerUrl ? (
            <img src={headerUrl} alt="头图"
              style={{ width: 375, height: headerH, objectFit: 'cover', display: 'block' }} />
          ) : (
            <div className="flex items-center justify-center"
              style={{ width: 375, height: headerH || 60, background: '#f5f5f5' }}>
              <span style={{ fontSize: 10, color: '#bbb' }}>暂无头图（在「会场」里上传）</span>
            </div>
          )}

          {/* 可拖拽排序组件列表 */}
          <div style={{ background: bgColor }}>
            {items.length === 0 && (
              <div className="flex items-center justify-center py-10"
                style={{ color: '#bbb', fontSize: 10 }}>
                配置组件后点「加入会场」↗
              </div>
            )}
            {items.map(item => (
              <div
                key={item.id}
                ref={el => { itemRefs.current[item.id] = el }}
                onPointerDown={e => handlePointerDown(e, item.id)}
                onPointerMove={e => handlePointerMove(e, item.id)}
                onPointerUp={handlePointerUp}
                style={{
                  cursor: draggedId.current === item.id ? 'grabbing' : 'grab',
                  position: 'relative',
                  touchAction: 'none',  // 防止移动端滚动干扰
                  outline: dragOver === item.id ? '2px solid rgba(255,80,80,0.5)' : 'none',
                  transition: 'outline 0.1s',
                  userSelect: 'none',
                }}
              >
                {item.spacingAbove > 0 && (
                  <div style={{ height: Math.round(item.spacingAbove * SCALE), background: bgColor }} />
                )}
                <img
                  src={item.previewUrl} alt={item.label}
                  draggable={false}
                  style={{ width: 375, height: Math.round(item.origH * SCALE), display: 'block', objectFit: 'fill' }}
                />
              </div>
            ))}
            <div style={{ height: 16, background: bgColor }} />
          </div>
        </div>
      </div>
    </div>
  )
}
