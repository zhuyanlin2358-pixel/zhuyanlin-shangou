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

// slot 预览热区配置（仅两处：标题文案 + 奖品图）
const SLOT_ZONES: { id: string; label: string; top: string; left: string; w: string; h: string }[] = [
  { id: 'text',  label: '标题文案', top: '4%',  left: '3%',   w: '31%', h: '26%' },
  { id: 'prize', label: '奖品图',   top: '29%', left: '5%',   w: '58%', h: '62%' },
]

// 缩放级别（由 VenuePage 顶栏统一控制，通过 props 传入）
const ZOOM_OPTS = [50, 75, 100, 125, 150] as const
export type ZoomOpt = typeof ZOOM_OPTS[number]

interface Props {
  selectedLayer: 'header' | string | null
  onSelectLayer: (layer: 'header' | string | null) => void
  onZoneSelect?: (itemId: string, zone: string) => void
  activeZone?:   string
  zoomPct: ZoomOpt
}

// ── 简易亮度检测（决定状态栏/导航栏文字颜色）─────────────────────────────────
function hexLuminance(hex: string): number {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return 0.5
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  return 0.299*r + 0.587*g + 0.114*b
}

export default function VenueCanvasCenter({ selectedLayer, onSelectLayer, onZoneSelect, activeZone = '', zoomPct }: Props) {
  const {
    items, moveItem,
    headerUrl, headerSize, bgColor,
  } = useVenue()

  const [showNavBar, setShowNavBar] = useState(false)

  const phoneW  = Math.round(375 * (zoomPct / 100))
  const phoneH  = Math.round(812 * (zoomPct / 100))   // 固定 iPhone 比例
  const headerH = (HEADER_SIZES.find(s => s.key === headerSize)?.h ?? 424) * (zoomPct / 200)

  // 根据背景色决定状态栏/导航栏颜色
  const isLightBg = hexLuminance(bgColor) > 0.4
  const barColor  = isLightBg ? '#000' : '#fff'
  const barAlpha  = 0.85

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

  // ── 状态栏 iOS 图标（SVG）──────────────────────────────────────────────────
  const BarIcons = ({ color }: { color: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: Math.round(5 * zoomPct / 100) }}>
      {/* 信号 */}
      <svg width={Math.round(17 * zoomPct / 100)} height={Math.round(12 * zoomPct / 100)} viewBox="0 0 17 12" fill={color} opacity={barAlpha}>
        <rect x="0" y="7" width="2.5" height="5" rx="0.6"/>
        <rect x="4.5" y="5" width="2.5" height="7" rx="0.6"/>
        <rect x="9" y="3" width="2.5" height="9" rx="0.6"/>
        <rect x="13.5" y="0" width="2.5" height="12" rx="0.6" opacity="0.28"/>
      </svg>
      {/* WiFi */}
      <svg width={Math.round(16 * zoomPct / 100)} height={Math.round(12 * zoomPct / 100)} viewBox="0 0 16 12" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity={barAlpha}>
        <circle cx="8" cy="11" r="0.8" fill={color} stroke="none"/>
        <path d="M5.2 8.2a4 4 0 015.6 0"/>
        <path d="M2.5 5.5a8 8 0 0111 0"/>
      </svg>
      {/* 电池 */}
      <svg width={Math.round(25 * zoomPct / 100)} height={Math.round(12 * zoomPct / 100)} viewBox="0 0 25 12">
        <rect x="0.5" y="1.5" width="20" height="9" rx="2" stroke={color} strokeWidth="1" fill="none" opacity={0.35 * barAlpha}/>
        <rect x="21" y="4" width="2.5" height="4" rx="1" fill={color} opacity={0.4 * barAlpha}/>
        <rect x="2" y="3" width="15" height="6" rx="1" fill={color} opacity={barAlpha}/>
      </svg>
    </div>
  )

  return (
    <div
      className="flex-1 flex flex-col items-center overflow-y-auto"
      style={{
        background: 'var(--sl-bg)',
        backgroundImage: 'radial-gradient(rgba(235,233,252,0.04) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* 功能切换条（导航栏开关）*/}
      <div className="flex items-center gap-2 shrink-0"
        style={{ paddingTop: 20, paddingBottom: 10 }}>
        <button
          onClick={() => setShowNavBar(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
            borderRadius: 7, fontSize: 10, cursor: 'pointer',
            background: showNavBar ? 'rgba(45,120,244,0.15)' : 'rgba(255,255,255,0.06)',
            color: showNavBar ? '#6AA3FF' : 'rgba(255,255,255,0.35)',
            border: `1px solid ${showNavBar ? 'rgba(45,120,244,0.25)' : 'rgba(255,255,255,0.08)'}`,
          }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18"/></svg>
          导航栏 · {showNavBar ? '显示中' : '已隐藏'}
        </button>
      </div>

      {/* 手机帧（固定高度 = iPhone 比例，内容区域可滚动）*/}
      <div className="flex items-start justify-center px-4 w-full"
        style={{ paddingBottom: 24 }}>
        <div
          className="rounded-[24px] overflow-hidden shadow-2xl shrink-0 flex flex-col"
          style={{
            width: phoneW,
            height: phoneH,
            background: bgColor,
            border: '2px solid rgba(255,255,255,0.12)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            transition: 'width 0.2s ease, height 0.2s ease',
          }}
        >
          {/* ── 可滚动内容区（头图 + 组件）── */}
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

          {/* 头图区域（状态栏/导航栏叠加其上）*/}
          <div
            onClick={() => onSelectLayer('header')}
            className="cursor-pointer"
            style={{
              position: 'relative',
              outline: selectedLayer === 'header' ? '2.5px solid #2D78F4' : '2.5px solid transparent',
              outlineOffset: -1,
              transition: 'outline-color 0.15s',
            }}
          >
            {/* 头图背景 */}
            {headerUrl ? (
              <img
                src={headerUrl}
                alt="头图"
                style={{ width: '100%', height: headerH, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '100%', height: Math.max(headerH, 80),
                  background: bgColor,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <ImageIcon size={16} style={{ color: isLightBg ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: Math.round(9 * zoomPct / 100), color: isLightBg ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }}>
                  点击选中头图区域
                </span>
              </div>
            )}

            {/* ── 状态栏 overlay（88px @750 = 44px @375，标准 iOS 状态栏）── */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: Math.round(44 * zoomPct / 100),
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              padding: `0 ${Math.round(18 * zoomPct / 100)}px ${Math.round(8 * zoomPct / 100)}px`,
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: Math.round(13 * zoomPct / 100), fontWeight: 700, color: barColor, opacity: barAlpha }}>
                9:41
              </span>
              <BarIcons color={barColor} />
            </div>

            {/* ── 导航栏 overlay（71px @750 = 36px @375；状态栏44+导航36=80≈159/2）── */}
            {showNavBar && (
              <div style={{
                position: 'absolute',
                top: Math.round(44 * zoomPct / 100),   // 紧跟状态栏
                left: 0, right: 0,
                height: Math.round(36 * zoomPct / 100),
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `0 ${Math.round(16 * zoomPct / 100)}px`,
                pointerEvents: 'none',
              }}>
                {/* 返回箭头 */}
                <svg width={Math.round(14 * zoomPct / 100)} height={Math.round(24 * zoomPct / 100)}
                  viewBox="0 0 14 24" fill="none" stroke={barColor} strokeWidth="2.5" strokeLinecap="round">
                  <path d="M11 2L3 12l8 10"/>
                </svg>
                {/* 分享图标 */}
                <svg width={Math.round(22 * zoomPct / 100)} height={Math.round(22 * zoomPct / 100)}
                  viewBox="0 0 24 24" fill="none" stroke={barColor} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              </div>
            )}

            {/* 蓝色选中标签 */}
            {selectedLayer === 'header' && (
              <div
                style={{
                  position: 'absolute', bottom: 4, left: 4,
                  fontSize: Math.round(9 * zoomPct / 100), fontWeight: 600, color: '#fff',
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

                  // 只检测两处热区（标题文案 / 奖品图）
                  let zone = ''
                  if (xPct >= 3  && xPct <= 34 && yPct >= 4  && yPct <= 30) zone = 'text'
                  else if (xPct >= 5  && xPct <= 63 && yPct >= 29 && yPct <= 91) zone = 'prize'

                  if (!zone) return  // 点在热区外（背景/按钮）→ 不触发双击模式

                  setDblClickId(item.id)
                  onSelectLayer(item.id)
                  onZoneSelect?.(item.id, zone)
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
                  <div style={{ height: Math.round(item.spacingAbove * zoomPct / 200), background: bgColor }} />
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

          <div style={{ height: 20, background: bgColor }} />
          </div>{/* end 滚动内容区 */}

          {/* ── Home indicator ── */}
          <div style={{
            height: Math.round(34 * zoomPct / 100), flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: bgColor,
          }}>
            <div style={{
              width: Math.round(134 * zoomPct / 100), height: Math.max(4, Math.round(5 * zoomPct / 100)),
              borderRadius: 99, background: barColor, opacity: 0.22,
            }} />
          </div>
        </div>{/* end 手机帧 */}
      </div>
    </div>
  )
}

