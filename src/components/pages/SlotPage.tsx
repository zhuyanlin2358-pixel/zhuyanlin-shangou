import { useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { useSlot } from '@/contexts/SlotContext'
import { useApp } from '@/contexts/AppContext'
import { captureElement, downloadCanvas, downloadZip } from '@/utils/exportUtils'
import Stepper from '@/components/panels/Stepper'
import type { PrizeConfig, PrizeType, ImgTransform } from '@/types'

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

const PF = "'PingFang SC','Microsoft YaHei',sans-serif"

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

/* ── 奖品卡片 ── */
function PrizeCard({ prize, onClick }: { prize: PrizeConfig; onClick?: () => void }) {
  const isDashed = prize.type === 'product-dashed'
  const isThanks = prize.type === 'thanks'
  const isAmount = prize.type === 'amount'
  const showImg   = prize.type === 'product-tag' || isDashed
  const showBottom = !isThanks

  const cardStyle: React.CSSProperties = isThanks
    ? { width: 111, height: 111, borderRadius: '50%', background: '#FFD060', border: '1px solid rgba(180,120,0,0.2)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }
    : { width: 111, height: 119, borderRadius: 14, background: isDashed ? '#FFF4D0' : '#FFE9B0', border: isDashed ? '1.5px dashed #F0A830' : '1px solid rgba(180,120,0,0.15)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: PF }

  return (
    <div style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
      <div style={cardStyle}>
        {prize.type === 'product-tag' && (
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 81, minHeight: 18, background: '#fff', borderRadius: '0 0 6px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 6px', zIndex: 2 }}>
            <span style={{ fontSize: 12, color: '#812D16', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{prize.tag || '无门槛优惠券'}</span>
          </div>
        )}
        {showImg && (
          <div
            onClick={onClick}
            style={{
              position: 'absolute', bottom: 31, left: '50%', transform: 'translateX(-50%)',
              width: isDashed ? 77 : 72, height: isDashed ? 78 : 72,
              background: 'repeating-conic-gradient(#E8E8E8 0% 25%,#F8F8F8 0% 50%) 0 0/8px 8px',
              borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: onClick ? 'pointer' : 'default',
            }}
          >
            {prize.imageUrl
              ? <img src={prize.imageUrl} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
              : <span style={{ fontSize: 9, color: '#888', textAlign: 'center', lineHeight: 1.4, pointerEvents: 'none' }}>点击左侧<br/>上传图片</span>
            }
          </div>
        )}
        {isAmount && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-58%)', display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ fontSize: 60, fontWeight: 700, color: '#812D16', fontFamily: "'MeituanDigitalType',sans-serif", lineHeight: 1, letterSpacing: -4 }}>{prize.amount || '30'}</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#812D16' }}>{prize.unit || '元'}</span>
          </div>
        )}
        {isThanks && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 22, fontWeight: 700, color: '#7B3A00', textAlign: 'center', whiteSpace: 'nowrap' }}>
            {prize.thanksText || '谢谢参与'}
          </div>
        )}
        {showBottom && (
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 13, color: '#7B3A00', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
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
            <button className="btn-preview" onClick={onPreview} style={{ height: 28, padding: '0 10px', fontSize: 12 }}>👁 预览</button>
          )}
          <button className="slot-btn-export" onClick={onExport}>⬇ 导出</button>
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
  'product-tag': '产品图+标签', 'product-dashed': '产品图+虚线',
  'amount': '金额券', 'thanks': '谢谢参与',
}

/* ── Prize editor card（奖品图区域，可拖拽/缩放/上传） ── */
function PrizeEditorCard({ idx, prize, onExport }: {
  idx: number; prize: PrizeConfig; onExport: () => void
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

  const CARD_BG = isThanks ? '#FFD060' : isDashed ? '#FFF4D0' : '#FFE9B0'
  const CARD_BORDER = isThanks ? '1px solid rgba(180,120,0,0.2)' : isDashed ? '1.5px dashed #F0A830' : '1px solid rgba(180,120,0,0.15)'

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      {/* 棋盘格预览区（含奖品卡） */}
      <div style={{ background: 'repeating-conic-gradient(#F0F0F0 0% 25%,#FAFAFA 0% 50%) 0 0/16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' }}>
        <PulseHint visible={showImg && !prize.imageUrl} />

        {/* 奖品卡外壳 */}
        <div style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={isThanks
            ? { width: 111, height: 111, borderRadius: '50%', background: CARD_BG, border: CARD_BORDER, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }
            : { width: 111, height: 119, borderRadius: 14, background: CARD_BG, border: CARD_BORDER, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: PF }
          }>
            {prize.type === 'product-tag' && (
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 81, minHeight: 18, background: '#fff', borderRadius: '0 0 6px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 6px', zIndex: 5 }}>
                <span style={{ fontSize: 12, color: '#812D16', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{prize.tag}</span>
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
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-58%)', display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <span style={{ fontSize: 60, fontWeight: 700, color: '#812D16', fontFamily: "'MeituanDigitalType',sans-serif", lineHeight: 1, letterSpacing: -4 }}>{prize.amount || '30'}</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#812D16' }}>{prize.unit || '元'}</span>
              </div>
            )}
            {isThanks && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 22, fontWeight: 700, color: '#7B3A00', textAlign: 'center', whiteSpace: 'nowrap' }}>{prize.thanksText || '谢谢参与'}</div>
            )}
            {!isThanks && (
              <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 13, color: '#7B3A00', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{prize.bottomText}</div>
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
          {showImg && (
            <button onClick={() => fileRef.current?.click()} className="slot-btn-export" style={{ fontSize: 11, padding: '3px 8px', height: 24 }}>
              📂 上传
            </button>
          )}
          <button className="slot-btn-export" onClick={onExport}>⬇ 导出</button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

/* ── 主页面 ── */
export default function SlotPage() {
  const { config, setEmptyTransform } = useSlot()
  const { showToast, registerExportAll } = useApp()

  // 监听 toast 事件
  useEffect(() => {
    const fn = (e: Event) => showToast((e as CustomEvent).detail)
    window.addEventListener('show-toast', fn)
    return () => window.removeEventListener('show-toast', fn)
  }, [showToast])

  const refs = {
    preview:     useRef<HTMLDivElement>(null),
    bg:          useRef<HTMLDivElement>(null),
    empty:       useRef<HTMLDivElement>(null),
    btnActive:   useRef<HTMLDivElement>(null),
    btnDisabled: useRef<HTMLDivElement>(null),
    linkPrize:   useRef<HTMLDivElement>(null),
    linkRule:    useRef<HTMLDivElement>(null),
    prize:       [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)],
  }

  const ex = useCallback(async (ref: React.RefObject<HTMLDivElement | null>, name: string, w: number, h: number) => {
    if (!ref.current) return
    showToast(`正在渲染 ${name}…`)
    try {
      const canvas = await captureElement(ref.current, w, h)
      downloadCanvas(canvas, `${name}.png`)
      showToast(`✅ ${name}.png`)
    } catch (e: unknown) { showToast(`❌ ${e instanceof Error ? e.message : '导出失败'}`) }
  }, [showToast])

  const doExportAll = useCallback(async () => {
    showToast('正在打包…')
    const tasks = [
      { ref: refs.preview,     name: 'slot_1_未抽奖状态_750x242',  w: 750, h: 242 },
      { ref: refs.bg,          name: 'slot_2_背景_750x242',        w: 750, h: 242 },
      { ref: refs.empty,       name: 'slot_3_空态页_854x284',      w: 854, h: 284 },
      { ref: refs.btnActive,   name: 'slot_4_按钮立即抽奖_194x80', w: 194, h: 80  },
      { ref: refs.btnDisabled, name: 'slot_4_按钮活动结束_194x80', w: 194, h: 80  },
      { ref: refs.linkPrize,   name: 'slot_5_我的奖品_96x34',      w: 96,  h: 34  },
      { ref: refs.linkRule,    name: 'slot_5_抽奖规则_109x34',     w: 109, h: 34  },
      ...refs.prize.map((r, i) => ({ ref: r, name: `slot_6_奖品${i+1}_124x124`, w: 124, h: 124 })),
    ]
    try {
      const files = await Promise.all(
        tasks.filter(t => t.ref.current).map(async t => ({
          canvas: await captureElement(t.ref.current!, t.w, t.h), name: `${t.name}.png`,
        }))
      )
      await downloadZip(files, '老虎机_切图包')
      showToast('✅ 已打包：老虎机_切图包.zip')
    } catch (e: unknown) { showToast(`❌ ${e instanceof Error ? e.message : '打包失败'}`) }
  }, [showToast]) // eslint-disable-line

  useEffect(() => {
    registerExportAll(doExportAll)
    gsap.from('.slot-section-title', { opacity: 0, y: 16, duration: 0.4, stagger: 0.07, delay: 0.1, ease: 'power2.out', clearProps: 'all' })
    return () => registerExportAll(null)
  }, [doExportAll, registerExportAll])

  const v = {
    '--btn-active-from': config.btnActiveFrom,   '--btn-active-to': config.btnActiveTo,
    '--btn-disabled-from': config.btnDisabledFrom, '--btn-disabled-to': config.btnDisabledTo,
    '--slot-tint-from': config.slotTintFrom,     '--slot-tint-to': config.slotTintTo,
    '--slot-links-color': config.linksColor,     '--slot-title-color': config.titleColor,
  } as React.CSSProperties

  return (
    <div style={v}>
      {/* Stepper */}
      <Stepper />

      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── 1 未抽奖状态 ── */}
        <div id="slot-section-1">
          <SectionTitle num={1} label="老虎机未抽奖状态" sub="含标题 + 奖品图 + 按钮 · 750 × 242 px" badge="素材 1" />
          <ExportCard label="老虎机 — 未抽奖状态" sub="750 × 242 px · PNG"
            onExport={() => ex(refs.preview, 'slot_1_未抽奖状态_750x242', 750, 242)}
            onPreview={() => showToast('已同步到手机预览')}>
            <div ref={refs.preview} style={{ width: 750, height: 242, position: 'relative', overflow: 'hidden', background: `linear-gradient(120deg,var(--slot-tint-from),var(--slot-tint-to))`, borderRadius: 20, flexShrink: 0 }}>
              <div style={{ position: 'absolute', left: 42, top: 25, fontSize: 33, fontWeight: 500, color: 'var(--slot-title-color)', fontFamily: PF, zIndex: 3 }}>{config.titleText}</div>
              <div style={{ position: 'absolute', top: 24, right: 48, display: 'flex', alignItems: 'center', fontSize: 22, color: 'var(--slot-links-color)', fontFamily: PF, zIndex: 3 }}>
                <span>我的奖品</span><span style={{ margin: '0 8px', opacity: 0.6 }}>|</span><span>抽奖规则</span>
              </div>
              <div style={{ position: 'absolute', left: 43, top: 76, width: 441, height: 142, borderRadius: 20, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', zIndex: 1 }} />
              <div style={{ position: 'absolute', left: 43, top: 76, width: 441, height: 142, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 12px' }}>
                {config.prizes.map((p, i) => <PrizeCard key={i} prize={p} />)}
              </div>
              <div style={{ position: 'absolute', right: 46, top: 106, width: 194, height: 80, borderRadius: 40, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(90deg,var(--btn-active-from),var(--btn-active-to))`, fontSize: 30, color: '#fff', fontFamily: PF }}>立即抽奖</div>
              <div style={{ position: 'absolute', right: 46, bottom: 14, fontSize: 14, color: 'var(--slot-links-color)', textAlign: 'center', width: 194, zIndex: 3 }}>还剩 999 次抽奖机会</div>
            </div>
          </ExportCard>
        </div>

        {/* ── 2 背景 ── */}
        <div id="slot-section-2">
          <SectionTitle num={2} label="老虎机背景" sub="含主标题，不带商品图 · 750 × 242 px" badge="素材 2" />
          <ExportCard label="老虎机背景（含主标题）" sub="750 × 242 px · PNG" onExport={() => ex(refs.bg, 'slot_2_背景_750x242', 750, 242)}>
            <div ref={refs.bg} style={{ width: 750, height: 242, position: 'relative', overflow: 'hidden', background: `linear-gradient(120deg,var(--slot-tint-from),var(--slot-tint-to))`, borderRadius: 20, flexShrink: 0 }}>
              <div style={{ position: 'absolute', left: 42, top: 25, fontSize: 33, fontWeight: 500, color: 'var(--slot-title-color)', fontFamily: PF }}>{config.titleText}</div>
              <div style={{ position: 'absolute', left: 43, top: 76, width: 441, height: 142, borderRadius: 20, background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }} />
            </div>
          </ExportCard>
        </div>

        {/* ── 3 空态页 ── */}
        <div id="slot-section-3">
          <SectionTitle num={3} label="老虎机空态页" sub="854 × 284 px @2x" badge="素材 3" />
          <ExportCard label="老虎机空态页" sub="854 × 284 px · PNG" onExport={() => ex(refs.empty, 'slot_3_空态页_854x284', 854, 284)}>
            <div ref={refs.empty} style={{ width: 427, height: 142, borderRadius: 12, background: '#fff', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {/* 空态插图：可拖拽 + 滚轮缩放 */}
              <DraggableImageWrap
                w={239} h={96}
                transform={config.emptyTransform}
                imageUrl={config.emptyImageUrl}
                onTransformChange={t => setEmptyTransform(t)}
                emptyHint="点击上传\n自定义插图"
                minScale={0} maxScale={2}
                cursor="grab"
              />
              <div style={{ marginTop: 2, fontFamily: PF, fontSize: 13, color: '#999', textAlign: 'center', whiteSpace: 'nowrap' }}>{config.emptyText}</div>
            </div>
          </ExportCard>
          {config.emptyImageUrl && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              拖动插图调整位置 · 滚轮调整大小 · 在左侧面板替换图片
            </div>
          )}
        </div>

        {/* ── 4 按钮（两款）── */}
        <div id="slot-section-4">
          <SectionTitle num={4} label="抽奖按钮" sub="194 × 80 px · 随配色自动适配" badge="素材 4–5" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ExportCard label="按钮 — 立即抽奖" sub="194 × 80 px · PNG" onExport={() => ex(refs.btnActive, 'slot_4_按钮立即抽奖_194x80', 194, 80)}>
              <div ref={refs.btnActive} style={{ width: 194, height: 80, borderRadius: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(90deg,var(--btn-active-from),var(--btn-active-to))`, fontSize: 30, color: '#fff', fontFamily: PF }}>立即抽奖</div>
            </ExportCard>
            <ExportCard label="按钮 — 活动已结束" sub="194 × 80 px · PNG" onExport={() => ex(refs.btnDisabled, 'slot_4_按钮活动结束_194x80', 194, 80)}>
              <div ref={refs.btnDisabled} style={{ width: 194, height: 80, borderRadius: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(90deg,var(--btn-disabled-from),var(--btn-disabled-to))`, fontSize: 30, color: '#fff', fontFamily: PF }}>活动已结束</div>
            </ExportCard>
          </div>
        </div>

        {/* ── 5 链接（两款）── */}
        <div id="slot-section-5">
          <SectionTitle num={5} label="链接文字" sub="透明背景 · 随配色自动适配" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ExportCard label="我的奖品" sub="96 × 34 px · PNG" onExport={() => ex(refs.linkPrize, 'slot_5_我的奖品_96x34', 96, 34)}>
              <div ref={refs.linkPrize} style={{ width: 96, height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--slot-links-color)', fontFamily: PF }}>我的奖品</div>
            </ExportCard>
            <ExportCard label="抽奖规则" sub="109 × 34 px · PNG" onExport={() => ex(refs.linkRule, 'slot_5_抽奖规则_109x34', 109, 34)}>
              <div ref={refs.linkRule} style={{ width: 109, height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--slot-links-color)', fontFamily: PF }}>
                <span style={{ opacity: 0.6, marginRight: 8 }}>|</span>抽奖规则
              </div>
            </ExportCard>
          </div>
        </div>

        {/* ── 6 奖品图（可点击上传）── */}
        <div id="slot-section-6">
          <SectionTitle num={6} label="奖品图" sub="124 × 124 px · 点击棋盘格区域上传商品图" badge="素材 6" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {config.prizes.map((p, i) => (
              <PrizeEditorCard
                key={i} idx={i} prize={p}
                onExport={() => ex(refs.prize[i], `slot_6_奖品${i+1}_124x124`, 124, 124)}
              />
            ))}
          </div>
          {/* 隐藏导出用 canvas */}
          <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
            {config.prizes.map((p, i) => (
              <div key={i} ref={refs.prize[i]} style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.85)' }}>
                <PrizeCard prize={p} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
