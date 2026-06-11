import { useRef, useEffect, useCallback, useState } from 'react'
import { gsap } from 'gsap'
import { Eye, Download } from 'lucide-react'
import { useSlot } from '@/contexts/SlotContext'
import { useApp } from '@/contexts/AppContext'
import { downloadCanvas, downloadZip, drawSlotBannerCanvas, drawSlotBgCanvas, drawButtonCanvas, drawLinkCanvas, drawEmptyStateCanvas, drawPrizeCanvas, drawDialogButtonCanvas, drawDialogResultCanvas, preloadFonts } from '@/utils/exportUtils'
import type { PrizeInfo, XfTransform } from '@/utils/exportUtils'
import type { PrizeConfig, PrizeType, ImgTransform } from '@/types'
import { getSlotStyle } from '@/utils/slotStyles'

/* ── 通用可拖拽图片容器 ── */
interface DraggableWrapProps {
  w: number; h: number
  transform: ImgTransform
  imageUrl: string
  onTransformChange: (t: Partial<ImgTransform>) => void
  onReset?: () => void
  minScale?: number; maxScale?: number
  checkered?: boolean
  onClickEmpty?: () => void
  emptyHint?: string
  cursor?: string
}

function DraggableImageWrap({
  w, h, transform, imageUrl, onTransformChange, minScale = 0.1, maxScale = 4,
  checkered = true, onClickEmpty, emptyHint, cursor,
}: DraggableWrapProps) {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startOff = useRef({ x: 0, y: 0 })
  // 用 ref 缓存最新 transform，避免闭包陈旧值
  const transformRef  = useRef(transform)
  const onChangeRef   = useRef(onTransformChange)
  const minScaleRef   = useRef(minScale)
  const maxScaleRef   = useRef(maxScale)
  const imageUrlRef   = useRef(imageUrl)
  useEffect(() => { transformRef.current  = transform },         [transform])
  useEffect(() => { onChangeRef.current   = onTransformChange }, [onTransformChange])
  useEffect(() => { minScaleRef.current   = minScale },          [minScale])
  useEffect(() => { maxScaleRef.current   = maxScale },          [maxScale])
  useEffect(() => { imageUrlRef.current   = imageUrl },          [imageUrl])

  // mousedown → 开始拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!imageUrlRef.current) { onClickEmpty?.(); return }
    dragging.current = true
    startPos.current = { x: e.clientX, y: e.clientY }
    startOff.current = { x: transformRef.current.offsetX, y: transformRef.current.offsetY }
    e.preventDefault()
  }, [onClickEmpty])

  // mousemove / mouseup 全局绑定
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      onChangeRef.current({
        offsetX: startOff.current.x + (e.clientX - startPos.current.x),
        offsetY: startOff.current.y + (e.clientY - startPos.current.y),
      })
    }
    const onUp = () => { dragging.current = false }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
    }
  }, [])   // 只绑定一次，通过 ref 读最新值

  // wheel：必须 passive:false 才能 preventDefault，阻止页面滚动
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!imageUrlRef.current) return
      e.preventDefault()   // 阻止页面滚动
      e.stopPropagation()
      const delta = e.deltaY > 0 ? -0.08 : 0.08
      const cur   = transformRef.current.scale
      onChangeRef.current({
        scale: Math.min(maxScaleRef.current, Math.max(minScaleRef.current, cur + delta)),
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])   // 只绑定一次

  const bg = checkered
    ? 'repeating-conic-gradient(#E8E8E8 0% 25%,#F8F8F8 0% 50%) 0 0/8px 8px'
    : undefined

  return (
    <div
      ref={wrapRef}
      style={{
        width: w, height: h, position: 'relative', overflow: 'hidden',
        background: bg, flexShrink: 0,
        cursor: imageUrl ? (dragging.current ? 'grabbing' : (cursor || 'grab')) : 'pointer',
      }}
      onMouseDown={handleMouseDown}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          draggable={false}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(calc(-50% + ${transform.offsetX}px), calc(-50% + ${transform.offsetY}px)) scale(${transform.scale})`,
            maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto',
            objectFit: 'contain', userSelect: 'none', pointerEvents: 'none',
            display: 'block',
          }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 18, opacity: 0.3 }}>+</div>
          {emptyHint && <div style={{ fontSize: 9, color: '#888', textAlign: 'center', lineHeight: 1.4 }}>{emptyHint}</div>}
        </div>
      )}
    </div>
  )
}

const PF  = "'FZLanTingHei-M','PingFang SC','Microsoft YaHei',sans-serif"

/* ── Spotlight 鼠标跟踪 hook ── */
function useSpotlight(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fn = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    el.addEventListener('mousemove', fn)
    return () => el.removeEventListener('mousemove', fn)
  }, [ref])
}

/* ── 脉冲点击示意动画（空idle时展示） ── */
function PulseHint({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, pointerEvents: 'none' }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', background: '#FF3060',
        boxShadow: '0 0 0 0 rgba(255,48,96,0.6)',
        animation: 'pulse-dot 1.8s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes pulse-dot {
          0%   { box-shadow: 0 0 0 0 rgba(255,48,96,0.6); }
          70%  { box-shadow: 0 0 0 8px rgba(255,48,96,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,48,96,0); }
        }
      `}</style>
    </div>
  )
}

/* ── 奖品卡片（带 transform，Section1/导出/预览三处共用）── */
export function PrizeCardFull({
  prize, transform, onClick,
}: {
  prize: PrizeConfig
  transform?: ImgTransform
  onClick?: () => void
}) {
  const { config } = useSlot()
  const ps = getSlotStyle(config.slotStyle).prizeStyle

  const isDashed  = prize.type === 'product-dashed'
  const isThanks  = prize.type === 'thanks'
  const isAmount  = prize.type === 'amount'
  const showImg   = prize.type === 'product-tag' || isDashed
  const showBottom = !isThanks
  const imgW = isDashed ? 77 : 72
  const imgH = isDashed ? 78 : 72
  const tr = transform ?? { offsetX: 0, offsetY: 0, scale: 1 }

  const cardBg = ps.bgType === 'gradient'
    ? `linear-gradient(180deg, ${ps.bgColor} 0%, ${ps.bgColorEnd} 100%)`
    : ps.bgColor

  const cardStyle: React.CSSProperties = isThanks
    ? { width: 111, height: 111, borderRadius: '50%', background: '#FCEAAB',
        position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'center', alignSelf: 'center', overflow: 'visible' }
    : { width: 111, height: 119, borderRadius: 17,
        background: cardBg,
        border: `1px solid ${ps.borderColor}`,
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        fontFamily: PF }

  return (
    <div style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
      <div style={cardStyle}>
        {/* 顶部标签（product-tag / amount 类型） */}
        {(prize.type === 'product-tag' || isAmount) && prize.tag && (
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: 81, minHeight: 18, background: ps.labelBg, borderRadius: '0 0 6px 6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2px 6px', zIndex: 2 }}>
            <span style={{ fontSize: 12, color: ps.textPrimary, lineHeight: 1.3, whiteSpace: 'nowrap' }}>
              {prize.tag}
            </span>
          </div>
        )}
        {/* 商品图区域（product-tag / product-dashed） */}
        {showImg && (
          <div
            onClick={onClick}
            style={{
              position: 'absolute', bottom: 31, left: '50%',
              transform: 'translateX(-50%)',
              width: imgW, height: imgH,
              background: 'repeating-conic-gradient(#E8E8E8 0% 25%,#F8F8F8 0% 50%) 0 0/8px 8px',
              borderRadius: 6, overflow: 'hidden',
              cursor: onClick ? 'grab' : 'default',
            }}
          >
            {prize.imageUrl
              ? <img
                  src={prize.imageUrl}
                  draggable={false}
                  style={{
                    position: 'absolute',
                    top: `calc(50% + ${tr.offsetY}px)`,
                    left: `calc(50% + ${tr.offsetX}px)`,
                    transform: `translate(-50%, -50%) scale(${tr.scale})`,
                    maxWidth: '100%', maxHeight: '100%',
                    width: 'auto', height: 'auto',
                    objectFit: 'contain', userSelect: 'none', display: 'block',
                  }}
                />
              : <span style={{ fontSize: 9, color: '#888', textAlign: 'center', lineHeight: 1.4, pointerEvents: 'none' }}>
                  {onClick ? '点击\n上传图片' : ''}
                </span>
            }
          </div>
        )}
        {/* 金额券 */}
        {isAmount && (
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: prize.tag ? 18 : 4, bottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ fontSize: 60, fontWeight: 700, color: ps.textPrimary, fontFamily: "'MeituanDigitalType',sans-serif", lineHeight: 1, letterSpacing: -4 }}>
                {prize.amount || '30'}
              </span>
              <span style={{ fontSize: 16, fontWeight: 600, color: ps.textPrimary }}>{prize.unit || '元'}</span>
            </div>
          </div>
        )}
        {/* 谢谢参与：双圆设计（Figma还原） */}
        {isThanks && (
          <div style={{
            width: 99, height: 99, borderRadius: '50%',
            background: 'linear-gradient(180deg, #FEF8DD 4%, #FBE5A2 50%, #FDF4C8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontSize: 27, fontWeight: 400, color: '#77321E', textAlign: 'center', lineHeight: '27px', fontFamily: PF }}>
              {(prize.thanksText || '谢谢参与').length === 4
                ? <>{(prize.thanksText || '谢谢参与').slice(0, 2)}<br />{(prize.thanksText || '谢谢参与').slice(2)}</>
                : prize.thanksText || '谢谢参与'}
            </div>
          </div>
        )}
        {/* 底部文字 */}
        {showBottom && (
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 13, color: ps.textSecondary, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            {prize.bottomText}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── ExportCard (Spotlight + hover) ── */
function ExportCard({ children, label, sub, onExport, onPreview }: {
  children: React.ReactNode; label: string; sub: string
  onExport: () => void; onPreview?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useSpotlight(ref)
  return (
    <div ref={ref} className="slot-export-card" style={{ '--mx': '50%', '--my': '50%' } as React.CSSProperties}>
      <style>{`.slot-export-card::before{content:'';position:absolute;inset:0;background:radial-gradient(160px circle at var(--mx) var(--my),rgba(255,255,255,0.06),transparent 80%);opacity:0;transition:opacity 0.3s;pointer-events:none;z-index:0}.slot-export-card:hover::before{opacity:1}.slot-export-card>*{position:relative;z-index:1}`}</style>
      <div className="slot-card-preview">{children}</div>
      <div className="slot-card-footer">
        <div>
          <div className="slot-card-name">{label}</div>
          <div className="slot-card-size">{sub}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {onPreview && (
            <button className="btn-preview" onClick={onPreview} style={{ height: 28, padding: '0 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} />预览</button>
          )}
          <button className="slot-btn-export" onClick={onExport} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Download size={12} />导出</button>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ num, label, sub, badge, id }: { num: number; label: string; sub: string; badge?: string; id?: string }) {
  return (
    <div id={id} className="slot-section-title" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FF3060', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{num}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>
      </div>
      {badge && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>{badge}</span>}
    </div>
  )
}

const PRIZE_TYPE_LABELS: Record<PrizeType, string> = {
  'product-tag': '产品图+标签', 'product-dashed': '产品图',
  'amount': '金额券', 'thanks': '谢谢参与',
}

/* ── Prize editor card（奖品图区域，可拖拽/缩放/上传） ── */
function PrizeEditorCard({ idx, prize, onExport, onPreview }: {
  idx: number; prize: PrizeConfig; onExport: () => void; onPreview?: () => void
}) {
  const { setPrize, setPrizeTransform, resetPrizeTransform, config } = useSlot()
  const fileRef = useRef<HTMLInputElement>(null)
  const transform = config.prizeTransforms[idx] ?? { offsetX: 0, offsetY: 0, scale: 1 }
  const showImg = prize.type === 'product-tag' || prize.type === 'product-dashed'

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setPrize(idx, { imageUrl: URL.createObjectURL(file) })
    resetPrizeTransform(idx)
  }

  // 渲染奖品卡外壳，图片区用拖拽组件替换
  const isDashed = prize.type === 'product-dashed'
  const isThanks = prize.type === 'thanks'
  const isAmount = prize.type === 'amount'

  const ps = getSlotStyle(config.slotStyle).prizeStyle
  const CARD_BG = isThanks ? '#FCEAAB' : (ps.bgType === 'gradient' ? `linear-gradient(180deg, ${ps.bgColor} 0%, ${ps.bgColorEnd} 100%)` : ps.bgColor)
  const CARD_BORDER = `1px solid ${ps.borderColor}`

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      {/* 棋盘格预览区（含奖品卡） */}
      <div style={{ background: 'repeating-conic-gradient(#F0F0F0 0% 25%,#FAFAFA 0% 50%) 0 0/16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' }}>
        <PulseHint visible={showImg && !prize.imageUrl} />

        {/* 奖品卡外壳 */}
        <div style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={isThanks
            ? { width: 111, height: 111, borderRadius: '50%', background: CARD_BG, border: CARD_BORDER, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }
            : { width: 111, height: 119, borderRadius: 17, background: CARD_BG, border: CARD_BORDER, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: PF }
          }>
            {(prize.type === 'product-tag' || isAmount) && prize.tag && (
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 81, minHeight: 18, background: ps.labelBg, borderRadius: '0 0 6px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 6px', zIndex: 5 }}>
                <span style={{ fontSize: 12, color: ps.textPrimary, lineHeight: 1.3, whiteSpace: 'nowrap' }}>{prize.tag}</span>
              </div>
            )}

            {showImg && (
              <div style={{ position: 'absolute', bottom: 31, left: '50%', transform: 'translateX(-50%)', width: isDashed ? 77 : 72, height: isDashed ? 78 : 72, borderRadius: 6, overflow: 'hidden', zIndex: 2 }}>
                <DraggableImageWrap
                  w={isDashed ? 77 : 72} h={isDashed ? 78 : 72}
                  transform={transform}
                  imageUrl={prize.imageUrl}
                  onTransformChange={t => setPrizeTransform(idx, t)}
                  onClickEmpty={() => fileRef.current?.click()}
                  emptyHint={'点击\n上传图片'}
                  minScale={0.1} maxScale={4}
                />
              </div>
            )}
            {isAmount && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: prize.tag ? 18 : 4, bottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <span style={{ fontSize: 60, fontWeight: 700, color: ps.textPrimary, fontFamily: "'MeituanDigitalType',sans-serif", lineHeight: 1, letterSpacing: -4 }}>{prize.amount || '30'}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: ps.textPrimary }}>{prize.unit || '元'}</span>
                </div>
              </div>
            )}
            {isThanks && (
              <div style={{ width: 99, height: 99, borderRadius: '50%', background: 'linear-gradient(180deg, #FEF8DD 4%, #FBE5A2 50%, #FDF4C8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 27, fontWeight: 400, color: '#77321E', textAlign: 'center', lineHeight: '27px', fontFamily: PF }}>
                  {(prize.thanksText || '谢谢参与').length === 4
                    ? <>{(prize.thanksText || '谢谢参与').slice(0, 2)}<br />{(prize.thanksText || '谢谢参与').slice(2)}</>
                    : prize.thanksText || '谢谢参与'}
                </div>
              </div>
            )}
            {!isThanks && (
              <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 13, color: ps.textSecondary, fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{prize.bottomText}</div>
            )}
          </div>
        </div>

        {showImg && (
          <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', fontSize: 10, color: '#aaa' }}>
            {prize.imageUrl ? '拖动调整位置 · 滚轮缩放' : '点击棋盘格区域上传图片'}
          </div>
        )}
      </div>

      {/* 底部信息行 */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,48,96,0.08)', borderRadius: 4, padding: '1px 6px', display: 'inline-block', marginBottom: 2 }}>
            {PRIZE_TYPE_LABELS[prize.type]}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
            {prize.type === 'thanks' ? prize.thanksText : prize.bottomText}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>124 × 124 px · PNG</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          {onPreview && <button className="btn-preview" onClick={onPreview} style={{ height: 28, padding: '0 10px', fontSize: 12 }}>👁 预览</button>}
          <button className="slot-btn-export" onClick={onExport} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Download size={12} />导出</button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

/* ── 弹窗按钮/结果页配置 ── */
const DIALOG_BUTTONS = [
  { key: 'confirm',  text: '确认',         label: '确认' },
  { key: 'claim',    text: '领奖品',       label: '领奖品' },
  { key: 'address',  text: '查看收货地址', label: '查看收货地址' },
  { key: 'reload',   text: '重新加载',                         label: '重新加载' },
  { key: 'tomorrow', text: '明日再来',     label: '明日再来' },
  { key: 'nochance', text: '已无抽奖次数', label: '已无抽奖次数' },
  { key: 'copy',     text: '复制粘贴',     label: '复制粘贴' },
] as const

const DIALOG_RESULTS = [
  { key: 'congrats', state: '恭喜你',  label: '恭喜你（中奖）' },
  { key: 'won',      state: '中奖了',  label: '中奖了' },
  { key: 'nowin',    state: '未中奖',  label: '未中奖' },
  { key: 'nochance', state: '没机会了', label: '没机会了' },
  { key: 'myprize',  state: '我的奖品', label: '我的奖品' },
  { key: 'error',    state: '出错了',  label: '出错了' },
] as const

/* ── 主页面 ── */
export default function SlotPage() {
  const { config, activePreset, setEmptyTransform, setSlotBannerUrl } = useSlot()
  const { showToast, registerExportAll } = useApp()

  // 字体预加载（确保 Canvas 绘制时自定义字体可用）
  useEffect(() => { preloadFonts() }, [])

  // 监听 toast 事件
  useEffect(() => {
    const fn = (e: Event) => showToast((e as CustomEvent).detail)
    window.addEventListener('show-toast', fn)
    return () => window.removeEventListener('show-toast', fn)
  }, [showToast])

  // ── 所有预览/导出 100% Canvas，无 html2canvas ──────────────────────────────
  const [previews, setPreviews] = useState<Record<string, string>>({})

  // ── 1. Banner / 按钮 / 链接预览（只在配色/文案变化时重建，不含奖品图和空态）
  const buildBanner = useCallback(async () => {
    // 先用当前奖品 canvas（不重绘奖品，避免图片 decode 影响 s1 标题）
    const pcs = await Promise.all(
      config.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle))
    )
    const [c1, c2, c4a, c4d, c5p, c5r] = await Promise.all([
      drawSlotBannerCanvas(config, pcs),
      drawSlotBgCanvas(config),
      Promise.resolve(drawButtonCanvas('立即抽奖', config.btnActiveFrom, config.btnActiveTo, config.btnTextColor)),
      Promise.resolve(drawButtonCanvas('活动已结束', config.btnDisabledFrom, config.btnDisabledTo, config.btnTextColor)),
      Promise.resolve(drawLinkCanvas([{ text: '我的奖品' }], config.linksColor, 186, 44, 45, 2)),
      Promise.resolve(drawLinkCanvas([{ text: '|', opacity: 0.6 }, { text: '抽奖规则' }], config.linksColor, 218, 44, 45, 2)),
    ])
    setSlotBannerUrl(c1.toDataURL())
    setPreviews(prev => ({
      ...prev,
      s1: c1.toDataURL(), s2: c2.toDataURL(),
      s4a: c4a.toDataURL(), s4d: c4d.toDataURL(),
      s5p: c5p.toDataURL(), s5r: c5r.toDataURL(),
    }))
  }, [  // eslint-disable-line
    config.prizes, config.prizeTransforms,
    config.titleText, config.titleColor, config.linksColor,
    config.slotTintFrom, config.slotTintTo,
    config.slotRect7From, config.slotRect7To,
    config.btnActiveFrom, config.btnActiveTo,
    config.btnDisabledFrom, config.btnDisabledTo,
    config.slotStyle,
  ])

  // ── 2. 奖品图预览（拖动/上传奖品时只更新 s6，不碰 s1/s2）
  const buildPrizes = useCallback(async () => {
    const pcs = await Promise.all(
      config.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle))
    )
    setPreviews(prev => ({
      ...prev,
      ...Object.fromEntries(pcs.map((c, i) => [`s6_${i}`, c.toDataURL()])),
    }))
  }, [config.prizes, config.prizeTransforms, config.slotStyle]) // eslint-disable-line

  // ── 3. 空态页预览（只在空态配置变化时更新 s3）
  const buildEmpty = useCallback(async () => {
    const c3 = await drawEmptyStateCanvas(config.emptyImageUrl, config.emptyTransform as XfTransform, config.emptyText)
    setPreviews(prev => ({ ...prev, s3: c3.toDataURL() }))
  }, [config.emptyImageUrl, config.emptyTransform, config.emptyText])

  // ── 3b. 空态手机预览：把空态插图合成到老虎机背景白框里 → 推手机预览
  const buildEmptyPreview = useCallback(async () => {
    const [bg, empty] = await Promise.all([
      drawSlotBgCanvas(config),
      drawEmptyStateCanvas(config.emptyImageUrl, config.emptyTransform as XfTransform, config.emptyText),
    ])
    // bg 是 750×242 @1x；empty 是 854×284 (@2x of 427×142)，叠入白框 x43 y75
    const out = document.createElement('canvas')
    out.width = bg.width; out.height = bg.height
    const ctx2 = out.getContext('2d')!
    ctx2.drawImage(bg, 0, 0)
    ctx2.drawImage(empty, 43, 75, 427, 142)  // scale 854×284 → 427×142
    setSlotBannerUrl(out.toDataURL())
  }, [config, setSlotBannerUrl])

  // ── 4. 弹窗按钮预览（配色变化时重建）
  const buildDialogButtons = useCallback(() => {
    const p: Record<string, string> = {}
    DIALOG_BUTTONS.forEach(v => {
      p[v.key] = drawDialogButtonCanvas(v.text, config.btnActiveFrom, config.btnActiveTo, undefined, config.btnTextColor).toDataURL()
    })
    setPreviews(prev => ({ ...prev, ...Object.fromEntries(Object.entries(p).map(([k, val]) => [`db_${k}`, val])) }))
  }, [config.btnActiveFrom, config.btnActiveTo])

  // ── 5. 弹窗结果页预览（主题配色变化时重建）
  const buildDialogResults = useCallback(() => {
    const p: Record<string, string> = {}
    DIALOG_RESULTS.forEach(v => {
      p[v.key] = drawDialogResultCanvas(v.state, config.slotTintFrom, config.slotTintTo, config.titleColor).toDataURL()
    })
    setPreviews(prev => ({ ...prev, ...Object.fromEntries(Object.entries(p).map(([k, val]) => [`dr_${k}`, val])) }))
  }, [config.slotTintFrom, config.slotTintTo, config.titleColor])

  const bannerTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prizeTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emptyTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dialogBtnTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dialogResTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
    bannerTimerRef.current = setTimeout(buildBanner, 400)
    return () => { if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current) }
  }, [buildBanner])

  useEffect(() => {
    if (prizeTimerRef.current) clearTimeout(prizeTimerRef.current)
    prizeTimerRef.current = setTimeout(buildPrizes, 300)
    return () => { if (prizeTimerRef.current) clearTimeout(prizeTimerRef.current) }
  }, [buildPrizes])

  // 切换风格时同步刷新 banner + 奖品图（跳过 debounce，立即重建）
  // 切换风格 → 立即重建（50ms，跳过 400ms 防抖）
  useEffect(() => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
    if (prizeTimerRef.current) clearTimeout(prizeTimerRef.current)
    bannerTimerRef.current = setTimeout(buildBanner, 50)
    prizeTimerRef.current  = setTimeout(buildPrizes, 50)
  }, [config.slotStyle]) // eslint-disable-line

  // 切换配色预设 → 立即重建（手机预览与 canvas 完全同步）
  useEffect(() => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current)
    if (dialogBtnTimer.current) clearTimeout(dialogBtnTimer.current)
    if (dialogResTimer.current) clearTimeout(dialogResTimer.current)
    bannerTimerRef.current = setTimeout(buildBanner, 50)
    dialogBtnTimer.current = setTimeout(buildDialogButtons, 100)
    dialogResTimer.current = setTimeout(buildDialogResults, 100)
  }, [activePreset]) // eslint-disable-line

  useEffect(() => {
    if (emptyTimerRef.current) clearTimeout(emptyTimerRef.current)
    emptyTimerRef.current = setTimeout(buildEmpty, 100)
    return () => { if (emptyTimerRef.current) clearTimeout(emptyTimerRef.current) }
  }, [buildEmpty])

  useEffect(() => {
    if (dialogBtnTimer.current) clearTimeout(dialogBtnTimer.current)
    dialogBtnTimer.current = setTimeout(buildDialogButtons, 200)
    return () => { if (dialogBtnTimer.current) clearTimeout(dialogBtnTimer.current) }
  }, [buildDialogButtons])

  useEffect(() => {
    if (dialogResTimer.current) clearTimeout(dialogResTimer.current)
    dialogResTimer.current = setTimeout(buildDialogResults, 200)
    return () => { if (dialogResTimer.current) clearTimeout(dialogResTimer.current) }
  }, [buildDialogResults])

  // ── 导出单张 ─────────────────────────────────────────────────────────────
  const exportOne = useCallback(async (_key: string, filename: string, builder: () => Promise<HTMLCanvasElement>) => {
    showToast(`正在渲染 ${filename}…`)
    try {
      const canvas = await builder()
      downloadCanvas(canvas, `${filename}.png`)
      showToast(`✅ ${filename}.png`)
    } catch (e: unknown) { showToast(`❌ ${e instanceof Error ? e.message : '导出失败'}`) }
  }, [showToast])

  // ── 一键导出全部 ──────────────────────────────────────────────────────────
  const doExportAll = useCallback(async () => {
    showToast('正在打包…')
    try {
      const p = config.prizes; const t = config.prizeTransforms
      const prizes = p.map((pr, i) => ({ prize: pr as PrizeInfo, tr: t[i] as XfTransform }))
      const pcs = await Promise.all(prizes.map(x => drawPrizeCanvas(x.prize, x.tr, config.slotStyle)))
      const [c1, c3, c4a, c4d, c5p, c5r, ...c6s] = await Promise.all([
        drawSlotBannerCanvas(config, pcs),
        drawEmptyStateCanvas(config.emptyImageUrl, config.emptyTransform as XfTransform, config.emptyText),
        Promise.resolve(drawButtonCanvas('立即抽奖', config.btnActiveFrom, config.btnActiveTo, config.btnTextColor)),
        Promise.resolve(drawButtonCanvas('活动已结束', config.btnDisabledFrom, config.btnDisabledTo, config.btnTextColor)),
        Promise.resolve(drawLinkCanvas([{ text: '我的奖品' }], config.linksColor, 186, 44, 45, 2)),
        Promise.resolve(drawLinkCanvas([{ text: '|', opacity: 0.6 }, { text: '抽奖规则' }], config.linksColor, 218, 44, 45, 2)),
        ...prizes.map(x => drawPrizeCanvas(x.prize, x.tr, config.slotStyle)),
      ])
      const c2 = await drawSlotBgCanvas(config)
      const dialogBtnFiles = DIALOG_BUTTONS.map(v => ({
        canvas: drawDialogButtonCanvas(v.text, config.btnActiveFrom, config.btnActiveTo, undefined, config.btnTextColor),
        name: `dialog_7_弹窗按钮_${v.label}_276x118.png`,
      }))
      const dialogResFiles = DIALOG_RESULTS.map(v => ({
        canvas: drawDialogResultCanvas(v.state, config.slotTintFrom, config.slotTintTo, config.titleColor),
        name: `dialog_8_弹窗结果页_${v.label}_750x612.png`,
      }))
      const files = [
        { canvas: c1, name: 'slot_1_未抽奖状态_750x242.png' },
        { canvas: c2, name: 'slot_2_背景_750x242.png' },
        { canvas: c3, name: 'slot_3_空态页_854x284.png' },
        { canvas: c4a, name: 'slot_4_按钮立即抽奖_194x80.png' },
        { canvas: c4d, name: 'slot_4_按钮活动结束_194x80.png' },
        { canvas: c5p, name: 'slot_5_我的奖品_186x44.png' },
        { canvas: c5r, name: 'slot_5_抽奖规则_218x44.png' },
        ...(c6s as HTMLCanvasElement[]).map((c, i) => ({ canvas: c, name: `slot_6_奖品${i+1}_124x124.png` })),
        ...dialogBtnFiles,
        ...dialogResFiles,
      ]
      await downloadZip(files, '老虎机_切图包')
      showToast('✅ 已打包：老虎机_切图包.zip')
    } catch (e: unknown) { showToast(`❌ ${e instanceof Error ? e.message : '打包失败'}`) }
  }, [config, showToast]) // eslint-disable-line

  useEffect(() => {
    gsap.from('.slot-section-title', { opacity: 0, y: 16, duration: 0.4, stagger: 0.07, delay: 0.1, ease: 'power2.out', clearProps: 'all' })
  }, [])  // 只在挂载时执行一次

  useEffect(() => {
    registerExportAll(doExportAll)
    return () => registerExportAll(null)
  }, [doExportAll, registerExportAll])

  const v = {
    '--btn-active-from': config.btnActiveFrom,   '--btn-active-to': config.btnActiveTo,
    '--btn-disabled-from': config.btnDisabledFrom, '--btn-disabled-to': config.btnDisabledTo,
    '--slot-tint-from': config.slotTintFrom,     '--slot-tint-to': config.slotTintTo,
    '--slot-links-color': config.linksColor,     '--slot-title-color': config.titleColor,
  } as React.CSSProperties

  return (
    <>
    <div style={v}>
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 32, position: 'relative' }}>

        {/* ── 1 未抽奖状态 ── */}
        <div id="slot-section-1">
          <SectionTitle num={1} label="老虎机未抽奖状态" sub="含标题 + 奖品图 + 按钮 · 750 × 242 px" badge="素材 1" />
          <ExportCard label="老虎机 — 未抽奖状态" sub="750 × 242 px · PNG"
            onExport={() => exportOne('s1', 'slot_1_未抽奖状态_750x242', async () => drawSlotBannerCanvas(config, await Promise.all(config.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)))))}
            onPreview={() => showToast('已同步到手机预览')}>
            {previews.s1
              ? <img src={previews.s1} style={{ width: 495, height: 160, borderRadius: 13, display: 'block', flexShrink: 0 }} />
              : <div style={{ width: 495, height: 160, borderRadius: 13, background: `linear-gradient(120deg,${config.slotTintFrom},${config.slotTintTo})`, flexShrink: 0 }} />
            }
          </ExportCard>
        </div>

        {/* ── 2 背景 ── */}
        <div>
          <SectionTitle num={2} label="老虎机背景" sub="含主标题，不带商品图 · 750 × 242 px" badge="素材 2" />
          <ExportCard label="老虎机背景（含主标题）" sub="750 × 242 px · PNG"
            onExport={() => exportOne('s2', 'slot_2_背景_750x242', async () => drawSlotBgCanvas(config))}>
            {previews.s2
              ? <img src={previews.s2} style={{ width: 495, height: 160, borderRadius: 13, display: 'block', flexShrink: 0 }} />
              : <div style={{ width: 495, height: 160, borderRadius: 13, background: `linear-gradient(120deg,${config.slotTintFrom},${config.slotTintTo})`, flexShrink: 0 }} />
            }
          </ExportCard>
        </div>

        {/* ── 3 空态页 ── */}
        <div>
          <SectionTitle num={3} label="老虎机空态页" sub="854 × 284 px @2x" badge="素材 3" />
          <ExportCard label="老虎机空态页" sub="854 × 284 px · PNG"
            onExport={() => exportOne('s3', 'slot_3_空态页_854x284', () => drawEmptyStateCanvas(config.emptyImageUrl, config.emptyTransform as XfTransform, config.emptyText))}
            onPreview={() => { buildEmptyPreview(); showToast('已在手机预览中显示空态效果') }}>
            <div style={{ width: 427, height: 142, borderRadius: 12, background: '#fff', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              <DraggableImageWrap w={239} h={96} transform={config.emptyTransform} imageUrl={config.emptyImageUrl}
                onTransformChange={t => setEmptyTransform(t)} emptyHint="点击上传\n自定义插图" minScale={0} maxScale={2} cursor="grab" />
              <div style={{ marginTop: 2, fontFamily: PF, fontSize: 13, color: '#999', textAlign: 'center', whiteSpace: 'nowrap' }}>{config.emptyText}</div>
            </div>
          </ExportCard>
          {config.emptyImageUrl && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              拖动插图调整位置 · 滚轮调整大小
            </div>
          )}
        </div>

        {/* ── 4 按钮（两款）── */}
        <div>
          <SectionTitle num={4} label="抽奖按钮" sub="194 × 80 px · 随配色自动适配" badge="素材 4–5" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ExportCard label="按钮 — 立即抽奖" sub="194 × 80 px · PNG"
              onExport={() => exportOne('s4a', 'slot_4_按钮立即抽奖_194x80', async () => drawButtonCanvas('立即抽奖', config.btnActiveFrom, config.btnActiveTo, config.btnTextColor))}>
              {previews.s4a
                ? <img src={previews.s4a} style={{ width: 194, height: 80, display: 'block', flexShrink: 0, objectFit: 'contain' }} />
                : <div style={{ width: 194, height: 80, borderRadius: 40, background: `linear-gradient(90deg,${config.btnActiveFrom},${config.btnActiveTo})`, flexShrink: 0 }} />
              }
            </ExportCard>
            <ExportCard label="按钮 — 活动已结束" sub="194 × 80 px · PNG"
              onExport={() => exportOne('s4d', 'slot_4_按钮活动结束_194x80', async () => drawButtonCanvas('活动已结束', config.btnDisabledFrom, config.btnDisabledTo, config.btnTextColor))}>
              {previews.s4d
                ? <img src={previews.s4d} style={{ width: 194, height: 80, display: 'block', flexShrink: 0, objectFit: 'contain' }} />
                : <div style={{ width: 194, height: 80, borderRadius: 40, background: `linear-gradient(90deg,${config.btnDisabledFrom},${config.btnDisabledTo})`, flexShrink: 0 }} />
              }
            </ExportCard>
          </div>
        </div>

        {/* ── 5 链接（两款）── */}
        <div>
          <SectionTitle num={5} label="链接文字" sub="透明背景 · 随配色自动适配" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ExportCard label="我的奖品" sub="186 × 44 px · PNG"
              onExport={() => exportOne('s5p', 'slot_5_我的奖品_186x44', async () => drawLinkCanvas([{ text: '我的奖品' }], config.linksColor, 186, 44, 45, 2))}>
              {previews.s5p
                ? <img src={previews.s5p} style={{ width: 186, height: 44, display: 'block', flexShrink: 0 }} />
                : <div style={{ width: 186, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: config.linksColor, fontFamily: PF }}>我的奖品</div>
              }
            </ExportCard>
            <ExportCard label="抽奖规则" sub="218 × 44 px · PNG"
              onExport={() => exportOne('s5r', 'slot_5_抽奖规则_218x44', async () => drawLinkCanvas([{ text: '|', opacity: 0.6 }, { text: '抽奖规则' }], config.linksColor, 218, 44, 45, 2))}>
              {previews.s5r
                ? <img src={previews.s5r} style={{ width: 218, height: 44, display: 'block', flexShrink: 0 }} />
                : <div style={{ width: 218, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: config.linksColor, fontFamily: PF }}>
                    <span style={{ opacity: 0.6, marginRight: 8 }}>|</span>抽奖规则
                  </div>
              }
            </ExportCard>
          </div>
        </div>

        {/* ── 6 奖品图（可点击上传）── */}
        <div>
          <SectionTitle num={6} label="奖品图" sub="124 × 124 px · 点击棋盘格区域上传商品图" badge="素材 6" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {config.prizes.map((p, i) => (
              <PrizeEditorCard
                key={i} idx={i} prize={p}
                onExport={() => exportOne(`s6_${i}`, `slot_6_奖品${i+1}_124x124`, () => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle))}
                onPreview={() => showToast('已同步到手机预览')}
              />
            ))}
          </div>
        </div>

        {/* ── 分隔线：弹窗部分 ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.8px', marginBottom: 24 }}>
            老虎机弹窗
          </div>

          {/* ── 7 弹窗按钮 ── */}
          <div style={{ marginBottom: 32 }}>
            <SectionTitle num={7} label="弹窗按钮" sub="276 × 118 px（含空隙）· 按钮本体 276 × 80 · 7 款" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {DIALOG_BUTTONS.map(v => (
                <ExportCard key={v.key} label={v.label} sub="276 × 118 px · PNG"
                  onExport={() => exportOne(
                    `db_${v.key}`, `dialog_7_弹窗按钮_${v.label}_276x80`,
                    async () => drawDialogButtonCanvas(v.text, config.btnActiveFrom, config.btnActiveTo, undefined, config.btnTextColor),
                  )}
                >
                  {previews[`db_${v.key}`]
                    ? <img src={previews[`db_${v.key}`]} style={{ width: '100%', maxWidth: 276, height: 'auto', display: 'block', objectFit: 'contain' }} />
                    : <div style={{ width: '100%', maxWidth: 276, aspectRatio: '276/118', borderRadius: 40, background: `linear-gradient(90deg,${config.btnActiveFrom},${config.btnActiveTo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontFamily: PF }}>{v.text}</div>
                  }
                </ExportCard>
              ))}
            </div>
          </div>

          {/* ── 8 弹窗结果页 ── */}
          <div>
            <SectionTitle num={8} label="弹窗结果页" sub="750 × 612 px · 6 款状态" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
              {DIALOG_RESULTS.map(v => (
                <ExportCard key={v.key} label={v.label} sub="750 × 612 px · PNG"
                  onExport={() => exportOne(
                    `dr_${v.key}`, `dialog_8_弹窗结果页_${v.label}_750x612`,
                    async () => drawDialogResultCanvas(v.state, config.slotTintFrom, config.slotTintTo, config.titleColor),
                  )}
                >
                  {previews[`dr_${v.key}`]
                    ? <img src={previews[`dr_${v.key}`]} style={{ width: '100%', maxWidth: 375, height: 'auto', borderRadius: 22, display: 'block' }} />
                    : <div style={{ width: '100%', maxWidth: 375, aspectRatio: '750/612', borderRadius: 22, background: `linear-gradient(120deg,${config.slotTintFrom},${config.slotTintTo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontFamily: PF }}>{v.state}</div>
                  }
                </ExportCard>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>

    </>
  )
}
