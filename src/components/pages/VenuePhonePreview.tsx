/**
 * 高达会场右侧面板 = 活动入口配置 + 手机实时预览
 *
 * 上半：活动头图配置区（上传/尺寸/背景色/动效占位）→ 会场活动的起点
 * 下半：手机预览（pointer 事件拖拽排序）
 */
import { useRef, useState } from 'react'
import { ImageIcon, Trash2 } from 'lucide-react'
import { useVenue } from '@/contexts/VenueContext'
import type { VenueHeaderSize } from '@/types'

const HEADER_SIZES: { key: VenueHeaderSize; label: string; h: number }[] = [
  { key: '424', label: '标准', h: 424 },
  { key: '624', label: '大图', h: 624 },
  { key: '274', label: '极矮', h: 274 },
]

export default function VenuePhonePreview() {
  const {
    items, moveItem,
    headerUrl, setHeaderUrl, headerSize, setHeaderSize,
    bgColor, setBgColor,
  } = useVenue()

  const SCALE   = 0.5
  const headerH = Math.round(parseInt(headerSize) * SCALE)

  // ── 头图上传 ────────────────────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null)
  const handleHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setHeaderUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

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
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggedId.current || e.buttons === 0) {
      draggedId.current = null
      setDragOver(null)
      return
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
          moveItem(draggedId.current, 'up')
          lastSwapTime.current = now
          setDragOver(above.id)
          return
        }
      }
    }
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
      {/* ── 标题栏 ── */}
      <div
        className="h-12 flex items-center justify-between px-4 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
          画布预览 · 375px
        </span>
        {items.length > 0 && (
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {items.length} 组件 · 拖拽排序
          </span>
        )}
      </div>

      {/* ── 活动头图配置区 ── */}
      <div
        className="shrink-0 px-3 pt-3 pb-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* 区块标题 */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
            活动头图
          </span>
          {/* 方案包入口（占位，未来扩展） */}
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,200,0,0.08)', color: 'rgba(255,180,0,0.5)', border: '1px solid rgba(255,180,0,0.15)' }}
          >
            方案包 · 即将上线
          </span>
        </div>

        {/* 上传区 */}
        <div
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all hover:opacity-80 mb-2"
          style={{ border: '1px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
        >
          {headerUrl ? (
            <img
              src={headerUrl} alt="头图"
              className="rounded shrink-0"
              style={{ width: 52, height: Math.round(52 * parseInt(headerSize) / 750), objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded shrink-0 flex items-center justify-center"
              style={{ width: 52, height: 28, background: 'rgba(255,255,255,0.05)' }}
            >
              <ImageIcon size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {headerUrl ? '点击更换头图' : '上传头图'}
            </div>
            <div className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              750 × {HEADER_SIZES.find(s => s.key === headerSize)?.h} px
            </div>
          </div>
          {headerUrl && (
            <button
              onClick={e => { e.stopPropagation(); setHeaderUrl('') }}
              className="shrink-0 p-1 rounded hover:text-red-400 transition-colors"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleHeaderUpload} />

        {/* 尺寸 + 背景色 同行 */}
        <div className="flex items-center gap-2 mb-2">
          {/* 尺寸选择 */}
          <div className="flex gap-1 flex-1">
            {HEADER_SIZES.map(s => (
              <button
                key={s.key}
                onClick={() => setHeaderSize(s.key)}
                className="flex-1 py-1 text-[10px] rounded-lg transition-all"
                style={{
                  border: `1px solid ${headerSize === s.key ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  background: headerSize === s.key ? 'rgba(255,80,80,0.1)' : 'rgba(255,255,255,0.03)',
                  color: headerSize === s.key ? '#FF8080' : 'rgba(255,255,255,0.4)',
                  fontWeight: headerSize === s.key ? 600 : 400,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* 背景色 */}
          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>背景色</span>
            <div className="relative">
              <div
                className="rounded border"
                style={{ width: 20, height: 20, background: bgColor, border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <input
                type="color"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <span className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {bgColor.toUpperCase()}
            </span>
          </label>
        </div>

        {/* 动效 + 文案占位行（未来扩展） */}
        <div className="flex gap-2">
          {[
            { label: '动效', icon: '✦' },
            { label: '头图文案', icon: 'T' },
          ].map(item => (
            <div
              key={item.label}
              className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{item.icon}</span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{item.label}</span>
              <span className="ml-auto text-[8px] px-1 py-0.5 rounded" style={{ background: 'rgba(255,200,0,0.08)', color: 'rgba(255,180,0,0.4)' }}>
                待开发
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 手机预览区 ── */}
      <div className="flex-1 overflow-y-auto flex justify-center pt-3 pb-4 px-2">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl w-full"
          style={{ maxWidth: 375, background: bgColor, border: '1.5px solid rgba(255,255,255,0.1)' }}
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

          {/* 内容区 */}
          <div style={{ background: bgColor }}>
            {/* 头图 */}
            {headerUrl ? (
              <img src={headerUrl} alt="头图"
                style={{ width: '100%', height: headerH, objectFit: 'cover', display: 'block' }} />
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '100%', height: Math.max(headerH, 48),
                  background: 'rgba(0,0,0,0.06)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 4, cursor: 'pointer',
                }}>
                <ImageIcon size={16} style={{ color: 'rgba(0,0,0,0.2)' }} />
                <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.25)' }}>点击上传头图</span>
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
                {(() => {
                  const isCoupon = item.componentId === 'coupon'
                  const pad = isCoupon ? 20 : 8
                  const r   = isCoupon ? 10 : 0
                  return (
                    <div style={{ padding: `0 ${pad}px`, background: bgColor }}>
                      <img
                        src={item.previewUrl} alt={item.label}
                        draggable={false}
                        style={{ width: '100%', height: 'auto', display: 'block', borderRadius: r, overflow: 'hidden' }}
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
