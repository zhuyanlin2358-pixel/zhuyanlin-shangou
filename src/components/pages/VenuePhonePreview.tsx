/**
 * 高达会场右侧手机预览（持久，始终显示）
 * 头图 + 背景色 + 组件叠放，支持拖拽排序
 * 头图/背景色设置 → 在「会场」中心页管理（不在此重复）
 */
import { useRef } from 'react'
import { useVenue } from '@/contexts/VenueContext'

export default function VenuePhonePreview() {
  const { items, headerUrl, headerSize, bgColor, reorderItems } = useVenue()

  const SCALE   = 0.5   // 750 → 375
  const headerH = Math.round(parseInt(headerSize) * SCALE)

  const dragId     = useRef<string | null>(null)
  const dragOverId = useRef<string | null>(null)

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
            {items.length} 个组件 · 可拖拽排序
          </span>
        )}
      </div>

      {/* 手机预览（全高可滚动）*/}
      <div className="flex-1 overflow-y-auto flex justify-center pt-3 pb-3 px-2">
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
            style={{ height: 26, background: 'rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#555' }}>9:41</span>
            <div className="flex gap-1">
              {[1,2,3].map(i => (
                <div key={i} className="rounded-full"
                  style={{ width: 3.5, height: i === 3 ? 5 : 3.5, background: '#555', opacity: 0.6 }} />
              ))}
            </div>
          </div>

          {/* 导航栏 */}
          <div className="flex items-center px-3 shrink-0"
            style={{ height: 40, background: '#fff', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>闪购会场</span>
          </div>

          {/* 内容区 */}
          <div style={{ background: bgColor }}>
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

            {/* 可拖拽组件列表 */}
            {items.length === 0 && (
              <div className="flex items-center justify-center py-10"
                style={{ color: '#bbb', fontSize: 10 }}>
                配置组件后点「加入会场」↗
              </div>
            )}
            {items.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={e => {
                  dragId.current = item.id
                  // 透明幽灵图：防止元素被「提出去」飘走
                  const ghost = document.createElement('div')
                  ghost.style.cssText = 'position:fixed;top:-9999px;opacity:0;'
                  document.body.appendChild(ghost)
                  e.dataTransfer.setDragImage(ghost, 0, 0)
                  setTimeout(() => document.body.removeChild(ghost), 0)
                }}
                onDragOver={e => { e.preventDefault(); dragOverId.current = item.id }}
                onDrop={() => {
                  if (dragId.current && dragId.current !== item.id) {
                    reorderItems(dragId.current, item.id)
                  }
                  dragId.current = null; dragOverId.current = null
                }}
                style={{ cursor: 'ns-resize', position: 'relative' }}
              >
                {item.spacingAbove > 0 && (
                  <div style={{ height: Math.round(item.spacingAbove * SCALE), background: bgColor }} />
                )}
                {/* 顶部分隔线（拖拽视觉提示）*/}
                <div style={{
                  position: 'absolute',
                  top: item.spacingAbove > 0 ? Math.round(item.spacingAbove * SCALE) : 0,
                  left: 0, right: 0, height: 2,
                  background: 'rgba(255,80,80,0.35)',
                }} />
                <img src={item.previewUrl} alt={item.label}
                  draggable={false}
                  style={{ width: 375, height: Math.round(item.origH * SCALE), display: 'block', objectFit: 'fill' }} />
              </div>
            ))}
            <div style={{ height: 16, background: bgColor }} />
          </div>
        </div>
      </div>
    </div>
  )
}
