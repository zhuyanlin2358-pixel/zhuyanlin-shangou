/**
 * 高达会场 · 中间画布预览区
 *
 * 手机帧居中显示，背景网格暗示"这是画布"。
 * 点击头图/组件 → 选中对应图层，右侧属性面板同步切换。
 * 支持 pointer 拖拽排序。
 */
import { useRef, useState, useEffect } from 'react'
import { ImageIcon } from 'lucide-react'
import { useVenue } from '@/contexts/VenueContext'
import type { VenueHeaderSize } from '@/types'

// 预览模式选项
const PREVIEW_MODES = [
  { id: 'h5',   label: 'H5 效果预览',    desc: '手机模拟器 · 375px', active: true },
  { id: 'admin',label: '系统后台预览',   desc: '用于审核上线', active: false },
  { id: 'shop', label: '店铺预览效果',   desc: '店铺内页视角', active: false },
] as const
type PreviewMode = (typeof PREVIEW_MODES)[number]['id']

const HEADER_SIZES: { key: VenueHeaderSize; h: number }[] = [
  { key: '424', h: 424 },
  { key: '624', h: 624 },
  { key: '274', h: 274 },
]

// slot 预览热区配置（百分比，基于 750×242 坐标系）
const SLOT_ZONES: { id: string; label: string; top: string; left: string; w: string; h: string }[] = [
  { id: 'text',  label: '文案',   top: '4%',  left: '3%',   w: '29%', h: '26%' },
  { id: 'prize', label: '奖品图', top: '30%', left: '5.5%', w: '57%', h: '59%' },
  { id: 'color', label: '配色/按钮', top: '42%', left: '66%', w: '27%', h: '33%' },
]

interface Props {
  selectedLayer: 'header' | string | null
  onSelectLayer: (layer: 'header' | string | null) => void
  onZoneSelect?: (itemId: string, zone: string) => void
  activeZone?:   string   // 当前激活的配置热区，用于高亮对应区域
}

export default function VenueCanvasCenter({ selectedLayer, onSelectLayer, onZoneSelect, activeZone = '' }: Props) {
  const {
    items, moveItem,
    headerUrl, headerSize, bgColor,
  } = useVenue()

  const SCALE   = 0.5
  const headerH = (HEADER_SIZES.find(s => s.key === headerSize)?.h ?? 424) * SCALE

  // ── 预览模式 ──────────────────────────────────────────────────────────────
  const [previewMode,   setPreviewMode]   = useState<PreviewMode>('h5')
  const [showPreviewDD, setShowPreviewDD] = useState(false)
  const previewDDRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉
  useEffect(() => {
    if (!showPreviewDD) return
    const close = (e: MouseEvent) => {
      if (previewDDRef.current && !previewDDRef.current.contains(e.target as Node))
        setShowPreviewDD(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showPreviewDD])

  const currentMode = PREVIEW_MODES.find(m => m.id === previewMode)!

  // ── 拖拽排序 ──────────────────────────────────────────────────────────────
  const draggedId    = useRef<string | null>(null)
  const lastSwapTime = useRef(0)
  const itemRefs     = useRef<Record<string, HTMLDivElement | null>>({})
  const latestItems  = useRef(items)
  latestItems.current = items
  const [dragOver, setDragOver] = useState<string | null>(null)
  // 双击激活的 item（显示热区 overlay）
  const [dblClickId, setDblClickId] = useState<string | null>(null)

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
        className="w-full flex items-center px-5 shrink-0 gap-3"
        style={{ height: 44, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-[11px] font-semibold flex-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
          画布预览 · 375px
        </span>

        {items.length > 0 && (
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            {items.length} 组件 · 拖拽排序
          </span>
        )}

        {/* 预览模式下拉 */}
        <div ref={previewDDRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPreviewDD(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all"
            style={{
              background: showPreviewDD ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            {currentMode.label}
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
              style={{ opacity: 0.5, transform: showPreviewDD ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {showPreviewDD && (
            <div
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6,
                width: 200, borderRadius: 10, overflow: 'hidden',
                background: '#1A2030', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                zIndex: 100,
              }}
            >
              {PREVIEW_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => { setPreviewMode(mode.id); setShowPreviewDD(false) }}
                  disabled={!mode.active}
                  className="w-full flex flex-col items-start px-4 py-2.5 transition-all text-left"
                  style={{
                    background: previewMode === mode.id ? 'rgba(45,120,244,0.12)' : 'transparent',
                    color: !mode.active ? 'rgba(255,255,255,0.25)' : previewMode === mode.id ? '#6AA3FF' : 'rgba(255,255,255,0.7)',
                    border: 'none',
                    cursor: mode.active ? 'pointer' : 'not-allowed',
                  }}
                  onMouseEnter={e => { if (mode.active && previewMode !== mode.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                  onMouseLeave={e => { if (previewMode !== mode.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{mode.label}</span>
                    {!mode.active && (
                      <span style={{ fontSize: 9, color: 'rgba(255,180,0,0.5)', background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.15)', borderRadius: 3, padding: '1px 5px' }}>
                        待开发
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{mode.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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

          {items.map(item => {
            const isSlot    = item.componentId === 'slot'
            const isCoupon  = item.componentId === 'coupon'
            const isDblActive = dblClickId === item.id
            const pad = isCoupon ? 20 : 8
            const r   = isCoupon ? 10 : 0

            return (
              <div
                key={item.id}
                ref={el => { itemRefs.current[item.id] = el }}
                onPointerDown={e => handlePointerDown(e, item.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onDoubleClick={e => {
                  e.stopPropagation()
                  if (!isSlot) return

                  // 根据双击位置检测热区，直接切换右侧配置
                  const imgEl = (e.currentTarget as HTMLElement).querySelector('img')
                  const rect  = imgEl ? imgEl.getBoundingClientRect()
                                      : e.currentTarget.getBoundingClientRect()
                  const xPct = ((e.clientX - rect.left) / rect.width)  * 100
                  const yPct = ((e.clientY - rect.top)  / rect.height) * 100

                  // 对应 750×242 坐标系的区域判断
                  let zone = 'color' // 其余区域（背景）→ 配色
                  if (xPct >= 3  && xPct <= 30 && yPct >= 4  && yPct <= 28) zone = 'text'
                  else if (xPct >= 5  && xPct <= 62 && yPct >= 30 && yPct <= 90) zone = 'prize'
                  else if (xPct >= 66 && xPct <= 93 && yPct >= 42 && yPct <= 76) zone = 'color'
                  // 其余（背景区）→ 'color'（配色预设）

                  setDblClickId(item.id)          // 激活黄色框 + 热区 overlay
                  onSelectLayer(item.id)           // 选中图层
                  onZoneSelect?.(item.id, zone)    // 立刻切换右侧面板
                }}
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
                      ? `2.5px solid ${isDblActive ? '#FFB800' : '#2D78F4'}`
                      : '2.5px solid transparent',
                    outlineOffset: -1,
                    transition: 'outline-color 0.12s',
                    position: 'relative',
                  }}
                >
                  <div style={{ padding: `0 ${pad}px`, background: bgColor, position: 'relative' }}>
                    <img
                      src={item.previewUrl} alt={item.label}
                      draggable={false}
                      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: r }}
                    />

                    {/* slot 双击后显示热区 overlay */}
                    {isSlot && isDblActive && (
                      <>
                        {SLOT_ZONES.map(z => {
                          const isActive = activeZone === z.id
                          return (
                            <div
                              key={z.id}
                              onClick={e => {
                                e.stopPropagation()
                                onZoneSelect?.(item.id, z.id)
                              }}
                              title={z.label}
                              style={{
                                position: 'absolute',
                                top: z.top, left: z.left, width: z.w, height: z.h,
                                cursor: 'pointer',
                                border: isActive
                                  ? '2px solid rgba(255,200,0,1)'
                                  : '1.5px dashed rgba(255,200,0,0.4)',
                                borderRadius: 4,
                                background: isActive ? 'rgba(255,200,0,0.18)' : 'transparent',
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'flex-end',
                                paddingBottom: 3,
                                paddingLeft: 3,
                                transition: 'all 0.12s',
                              }}
                              onMouseEnter={e => {
                                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,200,0,0.1)'
                              }}
                              onMouseLeave={e => {
                                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
                              }}
                            >
                              {isActive && (
                                <span style={{
                                  fontSize: 8, fontWeight: 700, color: '#1a0a00',
                                  background: 'rgba(255,200,0,0.9)',
                                  borderRadius: 2, padding: '1px 4px',
                                  lineHeight: 1.5,
                                }}>
                                  {z.label} ✓
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </>
                    )}
                  </div>

                  {/* 选中标签（单击蓝色，双击黄色） */}
                  {selectedLayer === item.id && !isDblActive && (
                    <div style={{
                      position: 'absolute', top: 4, left: isCoupon ? 24 : 12,
                      fontSize: 9, fontWeight: 600, color: '#fff',
                      background: '#2D78F4', borderRadius: 3, padding: '1px 5px',
                      pointerEvents: 'none',
                    }}>
                      {item.label}
                    </div>
                  )}
                  {isDblActive && (
                    <div style={{
                      position: 'absolute', top: 4, left: isCoupon ? 24 : 12,
                      fontSize: 9, fontWeight: 600, color: '#1a0a00',
                      background: '#FFB800', borderRadius: 3, padding: '1px 5px',
                      pointerEvents: 'none',
                    }}>
                      双击选中 · 点热区配置
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          <div style={{ height: 12, background: bgColor }} />
        </div>
      </div>
    </div>
  )
}

