/**
 * 高达会场右侧面板（持久，始终显示）
 * 上方：手机预览（头图置顶，组件叠放，背景色）
 * 下方：头图上传 + 3档尺寸 + 背景色选择（随时可调）
 */
import { useRef } from 'react'
import { ImageIcon, X } from 'lucide-react'
import { useVenue } from '@/contexts/VenueContext'
import { ColorField } from '@/components/ui/PanelField'
import type { VenueHeaderSize } from '@/types'

const HEADER_SIZES: { key: VenueHeaderSize; label: string; h: number; sub: string }[] = [
  { key: '274', label: '极矮', h: 274, sub: '750×274' },
  { key: '424', label: '标准', h: 424, sub: '750×424' },
  { key: '624', label: '大图', h: 624, sub: '750×624' },
]

export default function VenuePhonePreview() {
  const {
    items, headerUrl, setHeaderUrl,
    headerSize, setHeaderSize, bgColor, setBgColor,
    reorderItems,
  } = useVenue()

  const fileRef    = useRef<HTMLInputElement>(null)
  const dragId     = useRef<string | null>(null)
  const dragOverId = useRef<string | null>(null)
  const listRef    = useRef<HTMLDivElement>(null)

  // 手机内容宽度 = 375px，设计稿 750px，比例 0.5
  const SCALE  = 0.5
  const headerH = Math.round(parseInt(headerSize) * SCALE)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setHeaderUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div
      className="fixed top-0 right-0 h-screen flex flex-col border-l"
      style={{ width: 380, background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* ── 标题栏 ── */}
      <div
        className="h-12 flex items-center justify-between px-4 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
          手机预览 · 375px
        </span>
        {items.length > 0 && (
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {items.length} 个组件
          </span>
        )}
      </div>

      {/* ── 手机预览（可滚动）── */}
      <div className="flex-1 overflow-hidden flex justify-center pt-3 px-2" style={{ minHeight: 0 }}>
        <div
          className="rounded-2xl overflow-hidden shadow-2xl w-full"
          style={{
            maxWidth: 375,
            background: bgColor,
            border: '1.5px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '100%',
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

          {/* 可滚动内容区 */}
          <div className="overflow-y-auto flex-1" style={{ background: bgColor }}>
            {/* 头图区域 */}
            {headerUrl ? (
              <div className="relative">
                <img src={headerUrl} alt="头图"
                  style={{ width: 375, height: headerH, objectFit: 'cover', display: 'block' }} />
                {/* 高度标签 */}
                <span
                  className="absolute bottom-1 right-1 text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
                >
                  750×{headerSize}
                </span>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                style={{ width: 375, height: headerH || 60, background: '#f5f5f5' }}
                onClick={() => fileRef.current?.click()}
              >
                <ImageIcon size={16} style={{ color: '#bbb' }} />
                <span style={{ fontSize: 10, color: '#bbb' }}>点击上传头图</span>
              </div>
            )}

            {/* 组件列表 */}
            {items.length === 0 && !headerUrl && (
              <div className="flex items-center justify-center text-xs py-8" style={{ color: '#ccc' }}>
                配置组件后点「加入会场」
              </div>
            )}
            {/* 可拖拽排序区：使用 draggable + 透明幽灵图，防止元素被"拽出"屏幕 */}
            <div ref={listRef}>
              {items.map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={e => {
                    dragId.current = item.id
                    // 透明幽灵图：阻止浏览器把元素提出去飘
                    const ghost = document.createElement('div')
                    ghost.style.cssText = 'position:fixed;top:-9999px;opacity:0;'
                    document.body.appendChild(ghost)
                    e.dataTransfer.setDragImage(ghost, 0, 0)
                    setTimeout(() => document.body.removeChild(ghost), 0)
                  }}
                  onDragOver={e => {
                    e.preventDefault()
                    dragOverId.current = item.id
                  }}
                  onDrop={() => {
                    if (dragId.current && dragId.current !== item.id) {
                      reorderItems(dragId.current, item.id)
                    }
                    dragId.current = null
                    dragOverId.current = null
                  }}
                  style={{ cursor: 'ns-resize', position: 'relative' }}
                >
                  {item.spacingAbove > 0 && (
                    <div style={{ height: Math.round(item.spacingAbove * SCALE), background: bgColor }} />
                  )}
                  {/* 拖拽提示条 */}
                  <div
                    style={{
                      position: 'absolute', top: item.spacingAbove > 0 ? Math.round(item.spacingAbove * SCALE) : 0,
                      left: 0, right: 0, height: 3,
                      background: 'rgba(255,80,80,0.4)',
                      zIndex: 1,
                    }}
                  />
                  <img
                    src={item.previewUrl} alt={item.label}
                    draggable={false}
                    style={{ width: 375, height: Math.round(item.origH * SCALE), display: 'block', objectFit: 'fill' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ height: 16, background: bgColor }} />
          </div>
        </div>
      </div>

      {/* ── 设置区（头图 + 背景色，始终可见）── */}
      <div
        className="shrink-0 border-t px-4 py-3 space-y-3"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {/* 头图上传 + 三档尺寸 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              头图
            </span>
            {/* 三档尺寸 */}
            <div className="flex gap-1">
              {HEADER_SIZES.map(s => (
                <button key={s.key} onClick={() => setHeaderSize(s.key)}
                  className="px-2 py-0.5 text-[10px] rounded transition-all"
                  style={{
                    border: `1px solid ${headerSize === s.key ? '#FF5050' : 'rgba(255,255,255,0.12)'}`,
                    background: headerSize === s.key ? 'rgba(255,80,80,0.12)' : 'transparent',
                    color: headerSize === s.key ? '#FF8080' : 'rgba(255,255,255,0.4)',
                  }}
                  title={s.sub}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 上传区 */}
          <div
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all hover:opacity-80"
            style={{ border: '1.5px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}
          >
            <ImageIcon size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            {headerUrl ? (
              <>
                <img src={headerUrl} alt="" className="rounded"
                  style={{ width: 40, height: Math.round(40 * parseInt(headerSize) / 750), objectFit: 'cover' }} />
                <span className="text-xs flex-1 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  已上传 · 750×{headerSize}px
                </span>
                <button
                  onClick={e => { e.stopPropagation(); setHeaderUrl('') }}
                  className="shrink-0 hover:opacity-70"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  <X size={13} />
                </button>
              </>
            ) : (
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                点击上传头图（750×{headerSize}px）
              </span>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {/* 背景色 */}
        <ColorField label="背景色" value={bgColor} onChange={setBgColor} />
      </div>
    </div>
  )
}
