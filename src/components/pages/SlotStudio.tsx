/**
 * 老虎机工作室（专业深度编辑）
 *
 * 布局：20% 结构树 | 40% 预览+演示 | 40% 属性面板（素材预览 + 配置）
 *
 * - 图标全部使用 SVG 线描（Linear 风格），无 emoji
 * - 演示动画使用实际 canvas 素材（奖品图、弹窗、按钮等）
 * - 右侧顶部展示该层对应的所有已渲染素材，底部展示配置控件
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSlot } from '@/contexts/SlotContext'
import {
  drawSlotBannerCanvas, drawPrizeCanvas, drawButtonCanvas,
  drawLinkCanvas, drawEmptyStateCanvas, drawDialogButtonCanvas,
  drawDialogResultCanvas, preloadFonts,
} from '@/utils/exportUtils'
import type { PrizeInfo, XfTransform } from '@/utils/exportUtils'
import {
  SlotColorConfig, SlotTextConfig, SlotPrizeConfig,
  SlotDialogBtnConfig, SlotDialogBgConfig, SlotEmptyConfig,
  InlineConfigSection,
} from '@/components/panels/SlotConfigBlocks'

// ── Linear 风格 SVG 图标 ──────────────────────────────────────────────────────
const IC = (p: string, vb = '0 0 16 16') => (
  <svg width="14" height="14" viewBox={vb} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d={p} />
  </svg>
)

const Icons = {
  bg:     () => IC('M2 3h12v10H2zM2 6h12M5 6v7'),
  title:  () => IC('M3 4h10M3 7h7M3 10h5'),
  drum:   () => IC('M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM8 2v12M2 8h12M4.5 3.5l7 9M11.5 3.5l-7 9'),
  image:  () => IC('M2 3h12v10H2zM2 9l3-3 2 2 3-4 4 5'),
  button: () => IC('M3 6h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z'),
  link:   () => IC('M6.5 9.5a3 3 0 0 0 4.243.001L12.5 7.75a3 3 0 0 0-4.243-4.244l-1 1M9.5 6.5a3 3 0 0 0-4.243 0L3.5 8.25a3 3 0 0 0 4.243 4.243l1-1'),
  dialog: () => IC('M3 3h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8l-3 2.5V11H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z'),
  empty:  () => IC('M8 3C5.2 3 3 5.2 3 8s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 3v2l1.5 1.5'),
  chevron:() => IC('M4 6l4 4 4-4'),
  back:   () => IC('M10 4L6 8l4 4', '0 0 16 16'),
  play:   () => IC('M5 3l8 5-8 5V3z'),
  stop:   () => IC('M3 3h10v10H3z'),
}

// ── 图层结构定义 ──────────────────────────────────────────────────────────────
type LayerId = 'bg' | 'title' | 'drum' | 'prize1' | 'prize2' | 'prize3' | 'button' | 'links' | 'empty' | 'dialog'

interface Layer {
  id: LayerId
  label: string
  sub: string
  icon: () => JSX.Element
  children?: Layer[]
}

const SLOT_LAYERS: Layer[] = [
  { id: 'bg',     label: '背景层',   sub: '渐变配色',      icon: Icons.bg },
  { id: 'title',  label: '主标题',   sub: '文案 · 字色',   icon: Icons.title },
  {
    id: 'drum', label: '转盘区', sub: '奖品图 · 滚轮', icon: Icons.drum,
    children: [
      { id: 'prize1', label: '奖品图 1', sub: '商品图标', icon: Icons.image },
      { id: 'prize2', label: '奖品图 2', sub: '商品图标', icon: Icons.image },
      { id: 'prize3', label: '奖品图 3', sub: '谢谢参与', icon: Icons.image },
    ],
  },
  { id: 'button', label: '抽奖按钮', sub: '文案 · 渐变色', icon: Icons.button },
  { id: 'links',  label: '链接文字', sub: '我的奖品 · 规则', icon: Icons.link },
  { id: 'empty',  label: '空态页',   sub: '插图 · 文案',  icon: Icons.empty },
  { id: 'dialog', label: '弹窗层',   sub: '按钮 · 结果页', icon: Icons.dialog },
]

// ── 左侧结构树 ────────────────────────────────────────────────────────────────
function LayerTree({ layers, selected, onSelect, depth = 0, expanded, onToggle }: {
  layers: Layer[]; selected: LayerId | null
  onSelect: (id: LayerId) => void
  depth?: number
  expanded: Set<LayerId>
  onToggle: (id: LayerId) => void
}) {
  return (
    <>
      {layers.map(layer => {
        const isSelected = selected === layer.id
        const hasChildren = !!layer.children?.length
        const isExpanded = expanded.has(layer.id)
        const Icon = layer.icon

        return (
          <div key={layer.id}>
            <div
              onClick={() => { onSelect(layer.id); if (hasChildren) onToggle(layer.id) }}
              className="flex items-center gap-2 py-2 cursor-pointer transition-all rounded-lg select-none"
              style={{
                paddingLeft: 12 + depth * 14,
                paddingRight: 10,
                background: isSelected ? 'rgba(45,120,244,0.12)' : 'transparent',
                borderLeft: isSelected ? '2px solid #2D78F4' : '2px solid transparent',
                color: isSelected ? '#6AA3FF' : 'rgba(255,255,255,0.6)',
              }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ flexShrink: 0, opacity: isSelected ? 1 : 0.6 }}><Icon /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium truncate">{layer.label}</div>
                <div className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{layer.sub}</div>
              </div>
              {hasChildren && (
                <span style={{ opacity: 0.3, transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
                  <Icons.chevron />
                </span>
              )}
            </div>
            {hasChildren && isExpanded && layer.children && (
              <LayerTree layers={layer.children} selected={selected} onSelect={onSelect}
                depth={depth + 1} expanded={expanded} onToggle={onToggle} />
            )}
          </div>
        )
      })}
    </>
  )
}

// ── 右侧素材预览区 ────────────────────────────────────────────────────────────
function AssetPreviewPanel({ selected, config }: {
  selected: LayerId | null
  config: ReturnType<typeof useSlot>['config']
}) {
  const [previews, setPreviews] = useState<{ label: string; url: string }[]>([])
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    let cancelled = false
    const generate = async () => {
      if (!selected) { setPreviews([]); return }
      setLoading(true)
      try {
        await preloadFonts()
        const sc = {
          slotTintFrom: config.slotTintFrom, slotTintTo: config.slotTintTo,
          slotRect7From: config.slotRect7From, slotRect7To: config.slotRect7To,
          titleText: config.titleText, titleColor: config.titleColor,
          linksColor: config.linksColor,
          btnActiveFrom: config.btnActiveFrom, btnActiveTo: config.btnActiveTo,
          btnTextColor: config.btnTextColor, slotStyle: config.slotStyle,
        }
        const items: { label: string; url: string }[] = []

        if (selected === 'bg' || selected === 'title') {
          const pcs = await Promise.all(config.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)))
          const c = await drawSlotBannerCanvas(sc, pcs)
          items.push({ label: '老虎机主视觉', url: c.toDataURL() })
        }

        if (selected === 'button') {
          const ca = drawButtonCanvas('立即抽奖',   config.btnActiveFrom,   config.btnActiveTo,   config.btnTextColor)
          const cd = drawButtonCanvas('活动已结束', config.btnDisabledFrom, config.btnDisabledTo, config.btnTextColor)
          items.push({ label: '立即抽奖', url: ca.toDataURL() }, { label: '活动已结束', url: cd.toDataURL() })
        }

        if (selected === 'links') {
          const cp = drawLinkCanvas([{ text: '我的奖品' }], config.linksColor, 186, 44, 45, 2)
          const cr = drawLinkCanvas([{ text: '|', opacity: 0.6 }, { text: '抽奖规则' }], config.linksColor, 218, 44, 45, 2)
          items.push({ label: '我的奖品', url: cp.toDataURL() }, { label: '抽奖规则', url: cr.toDataURL() })
        }

        if (selected === 'empty') {
          const c = await drawEmptyStateCanvas(config.emptyImageUrl, config.emptyTransform as XfTransform, config.emptyText)
          items.push({ label: '空态页', url: c.toDataURL() })
        }

        if (selected === 'dialog') {
          const cb = drawDialogButtonCanvas('确认领奖', config.btnActiveFrom, config.btnActiveTo, undefined, config.btnTextColor)
          const cr = await drawDialogResultCanvas('won', config.slotTintFrom, config.slotTintTo, config.titleColor)
          items.push({ label: '弹窗按钮', url: cb.toDataURL() }, { label: '弹窗结果页（中奖）', url: cr.toDataURL() })
        }

        if (selected === 'drum' || selected === 'prize1' || selected === 'prize2' || selected === 'prize3') {
          const idx = selected === 'prize1' ? [0] : selected === 'prize2' ? [1] : selected === 'prize3' ? [2] : [0, 1, 2]
          for (const i of idx) {
            if (config.prizes[i]) {
              const c = await drawPrizeCanvas(config.prizes[i] as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)
              items.push({ label: `奖品图 ${i+1}（${config.prizes[i].tag || '商品'}）`, url: c.toDataURL() })
            }
          }
        }

        if (!cancelled) setPreviews(items)
      } catch {}
      if (!cancelled) setLoading(false)
    }
    generate()
    return () => { cancelled = true }
  }, [selected, config.btnActiveFrom, config.btnActiveTo, config.btnDisabledFrom, config.btnDisabledTo,
      config.titleText, config.titleColor, config.linksColor, config.slotTintFrom, config.slotTintTo,
      config.emptyText, config.emptyImageUrl, config.slotStyle])

  if (!selected || previews.length === 0) return null

  return (
    <div className="border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)', maxHeight: '45%', overflowY: 'auto' }}>
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          素材预览
        </span>
        {loading && <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>生成中…</span>}
      </div>
      <div className="px-3 pb-3 space-y-2">
        {previews.map((p, i) => (
          <div key={i}>
            <div className="text-[9px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.label}</div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, overflow: 'hidden', padding: '6px', display: 'flex', justifyContent: 'center' }}>
              <img src={p.url} alt={p.label}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: 6, display: 'block', maxHeight: 120, objectFit: 'contain' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 中间预览区 ────────────────────────────────────────────────────────────────
type DemoState = 'idle' | 'spinning' | 'won' | 'dialog'

function StudioCanvas({ bannerUrl, config, onLayerClick }: {
  bannerUrl: string
  config: ReturnType<typeof useSlot>['config']
  onLayerClick: (id: LayerId) => void
}) {
  const [demo,     setDemo]     = useState<DemoState>('idle')
  const [wonIdx,   setWonIdx]   = useState(0)
  const [prizeUrls, setPrizeUrls] = useState<string[]>([])
  const [dialogUrl, setDialogUrl] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  // 预生成奖品图和弹窗
  useEffect(() => {
    let cancelled = false
    const gen = async () => {
      try {
        await preloadFonts()
        const pcs = await Promise.all(
          config.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle))
        )
        const dc = await drawDialogResultCanvas('won', config.slotTintFrom, config.slotTintTo, config.titleColor)
        if (!cancelled) {
          setPrizeUrls(pcs.map(c => c.toDataURL()))
          setDialogUrl(dc.toDataURL())
        }
      } catch {}
    }
    gen()
    return () => { cancelled = true }
  }, [config])

  const startDemo = () => {
    if (demo !== 'idle') { setDemo('idle'); clearTimeout(timerRef.current); return }
    setDemo('spinning')
    timerRef.current = setTimeout(() => {
      const idx = Math.floor(Math.random() * Math.min(config.prizes.length, 3))
      setWonIdx(idx)
      setDemo('won')
      timerRef.current = setTimeout(() => setDemo('dialog'), 1200)
    }, 2500)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6"
      style={{ background: '#080C14', backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>

      {/* 工具栏 */}
      <div className="flex items-center gap-2 shrink-0">
        {[{ l: '100%' }, { l: '参考线' }, { l: '网格' }].map(t => (
          <button key={t.l} className="px-3 py-1 text-[10px] rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer' }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* 预览主体 */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 540 }}>
        {bannerUrl ? (
          <img src={bannerUrl} alt="老虎机" draggable={false}
            style={{ width: '100%', borderRadius: 14, display: 'block', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
        ) : (
          <div style={{ width: '100%', aspectRatio: '750/242', borderRadius: 14,
            background: `linear-gradient(120deg,${config.slotTintFrom},${config.slotTintTo})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            渲染中…
          </div>
        )}

        {/* 点击热区 */}
        {demo === 'idle' && [
          { id: 'title'  as LayerId, top: '4%',  left: '3%',  w: '31%', h: '27%', l: '标题' },
          { id: 'drum'   as LayerId, top: '30%', left: '5%',  w: '58%', h: '62%', l: '转盘' },
          { id: 'button' as LayerId, top: '42%', left: '66%', w: '27%', h: '33%', l: '按钮' },
        ].map(z => (
          <div key={z.id} onClick={() => onLayerClick(z.id)}
            style={{
              position: 'absolute', top: z.top, left: z.left, width: z.w, height: z.h,
              cursor: 'pointer', border: '1.5px dashed rgba(255,255,255,0.12)', borderRadius: 6, zIndex: 2,
              display: 'flex', alignItems: 'flex-start', padding: '3px 5px',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.border = '1.5px solid rgba(45,120,244,0.7)'; el.style.background = 'rgba(45,120,244,0.08)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.border = '1.5px dashed rgba(255,255,255,0.12)'; el.style.background = 'transparent' }}>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.5)', borderRadius: 2, padding: '1px 4px' }}>{z.l}</span>
          </div>
        ))}

        {/* 演示：转动 */}
        {demo === 'spinning' && (
          <div style={{
            position: 'absolute', top: '28%', left: '4%', width: '61%', height: '64%',
            background: 'rgba(0,0,0,0.55)', borderRadius: 10, zIndex: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden',
          }}>
            {prizeUrls.slice(0, 3).map((url, i) => (
              <div key={i} style={{
                width: 52, height: 52, borderRadius: 10, overflow: 'hidden',
                background: 'rgba(255,255,255,0.1)',
                animation: 'studioSpin 0.18s linear infinite',
                animationDelay: `${i * 0.06}s`,
              }}>
                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
            <style>{`@keyframes studioSpin{0%{transform:translateY(0)}25%{transform:translateY(-10px)}75%{transform:translateY(10px)}100%{transform:translateY(0)}}`}</style>
          </div>
        )}

        {/* 演示：中奖 */}
        {demo === 'won' && prizeUrls[wonIdx] && (
          <div style={{
            position: 'absolute', top: '28%', left: '4%', width: '61%', height: '64%',
            background: 'rgba(0,0,0,0.6)', borderRadius: 10, zIndex: 5,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <img src={prizeUrls[wonIdx]} style={{ width: 60, height: 60, objectFit: 'contain' }} />
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
              中奖！{config.prizes[wonIdx]?.tag || ''}
            </span>
          </div>
        )}

        {/* 演示：弹窗 — 使用实际 canvas */}
        {demo === 'dialog' && dialogUrl && (
          <div style={{
            position: 'absolute', inset: -16, background: 'rgba(0,0,0,0.75)', borderRadius: 16,
            zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ maxWidth: '80%', position: 'relative' }}>
              <img src={dialogUrl} style={{ width: '100%', height: 'auto', borderRadius: 16, display: 'block',
                boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }} />
              <button onClick={() => setDemo('idle')}
                style={{
                  position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                  padding: '8px 24px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(90deg,${config.btnActiveFrom},${config.btnActiveTo})`,
                  color: config.btnTextColor || '#fff', fontSize: 12, fontWeight: 700,
                }}>
                确认领奖
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 演示按钮 */}
      <button onClick={startDemo}
        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-all shrink-0"
        style={{
          background: demo === 'idle'
            ? `linear-gradient(90deg,${config.btnActiveFrom},${config.btnActiveTo})`
            : 'rgba(255,255,255,0.08)',
          color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: demo === 'idle' ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
        }}>
        {demo === 'idle' ? <><Icons.play /> 点击体验演示效果</> : <><Icons.stop /> 停止演示</>}
      </button>
    </div>
  )
}

// ── 右侧配置控件（按层级） ────────────────────────────────────────────────────
function LayerConfig({ selected }: { selected: LayerId | null }) {
  if (!selected) {
    return (
      <div className="p-4 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
        在左侧结构树点击任意层级，这里显示该层的配置项，上方同步显示对应素材预览。
      </div>
    )
  }

  if (selected === 'bg' || selected === 'button' || selected === 'links') {
    return (
      <div className="px-3 py-2">
        <InlineConfigSection label="配色预设" defaultOpen><SlotColorConfig /></InlineConfigSection>
      </div>
    )
  }

  if (selected === 'title') {
    return (
      <div className="px-3 py-2">
        <InlineConfigSection label="文案设置" defaultOpen><SlotTextConfig /></InlineConfigSection>
      </div>
    )
  }

  if (selected === 'drum' || selected === 'prize1' || selected === 'prize2' || selected === 'prize3') {
    return (
      <div className="px-3 py-2">
        <InlineConfigSection label="奖品图设置" defaultOpen><SlotPrizeConfig /></InlineConfigSection>
      </div>
    )
  }

  if (selected === 'empty') {
    return (
      <div className="px-3 py-2">
        <InlineConfigSection label="空态页设置" defaultOpen><SlotEmptyConfig /></InlineConfigSection>
      </div>
    )
  }

  if (selected === 'dialog') {
    return (
      <div className="px-3 py-2 space-y-1">
        <InlineConfigSection label="弹窗按钮配色" defaultOpen><SlotDialogBtnConfig /></InlineConfigSection>
        <InlineConfigSection label="弹窗结果页配色"><SlotDialogBgConfig /></InlineConfigSection>
      </div>
    )
  }

  return null
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
export default function SlotStudio({ onBack }: { onBack: () => void }) {
  const { config } = useSlot()
  const [selected, setSelected] = useState<LayerId | null>(null)
  const [expanded, setExpanded] = useState<Set<LayerId>>(new Set(['drum']))
  const [bannerUrl, setBannerUrl] = useState('')

  const buildBanner = useCallback(async () => {
    try {
      await preloadFonts()
      const pcs = await Promise.all(config.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)))
      const sc = {
        slotTintFrom: config.slotTintFrom, slotTintTo: config.slotTintTo,
        slotRect7From: config.slotRect7From, slotRect7To: config.slotRect7To,
        titleText: config.titleText, titleColor: config.titleColor, linksColor: config.linksColor,
        btnActiveFrom: config.btnActiveFrom, btnActiveTo: config.btnActiveTo,
        btnTextColor: config.btnTextColor, slotStyle: config.slotStyle,
      }
      const c = await drawSlotBannerCanvas(sc, pcs)
      setBannerUrl(c.toDataURL())
    } catch {}
  }, [config])

  useEffect(() => { buildBanner() }, [buildBanner])

  const handleToggle = (id: LayerId) => {
    setExpanded(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080C14' }}>

      {/* 顶栏 */}
      <div className="flex items-center gap-3 px-5 h-12 shrink-0 border-b"
        style={{ background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>
        <button onClick={onBack}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-xl text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)', border: 'none', cursor: 'pointer' }}>
          <Icons.back />
          完成并返回画布
        </button>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
        <span className="text-sm font-bold" style={{ color: '#fff' }}>老虎机工作室</span>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>改动实时同步</span>
        <div style={{ flex: 1 }} />
        {[{ l: '保存模板', i: '⊕' }, { l: '版本对比', i: '⟺' }, { l: '导出资源', i: '↓' }].map(b => (
          <button key={b.l}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
            <span style={{ fontSize: 11 }}>{b.i}</span>{b.l}
          </button>
        ))}
      </div>

      {/* 三栏主体 20/40/40 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 左20%：结构树 */}
        <div className="flex flex-col border-r overflow-y-auto"
          style={{ width: '20%', minWidth: 160, maxWidth: 220, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="px-4 pt-3 pb-2 text-[9px] font-semibold uppercase tracking-widest shrink-0"
            style={{ color: 'rgba(255,255,255,0.18)' }}>
            组件结构
          </div>
          <div className="flex-1 px-1 pb-4">
            <LayerTree layers={SLOT_LAYERS} selected={selected} onSelect={setSelected}
              expanded={expanded} onToggle={handleToggle} />
          </div>
        </div>

        {/* 中40%：预览 */}
        <StudioCanvas bannerUrl={bannerUrl} config={config} onLayerClick={setSelected} />

        {/* 右40%：素材预览 + 配置 */}
        <div className="flex flex-col border-l overflow-hidden shrink-0"
          style={{ width: '40%', minWidth: 280, background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>

          {/* 顶部标题 */}
          <div className="h-11 flex items-center px-4 border-b shrink-0 gap-2"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <span className="text-xs font-semibold flex-1 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {selected
                ? SLOT_LAYERS.flatMap(l => l.children ? [l, ...l.children] : [l]).find(l => l.id === selected)?.label ?? '配置'
                : '属性面板'
              }
            </span>
            {!selected && (
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>选中左侧层级</span>
            )}
          </div>

          {/* 素材预览（上半，按需展示） */}
          <AssetPreviewPanel selected={selected} config={config} />

          {/* 配置控件（下半，可滚动） */}
          <div className="flex-1 overflow-y-auto">
            <LayerConfig selected={selected} />
          </div>
        </div>
      </div>
    </div>
  )
}
