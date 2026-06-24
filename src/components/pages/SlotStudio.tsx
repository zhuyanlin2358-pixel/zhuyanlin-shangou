/**
 * 老虎机工作室（专业深度编辑）
 * 布局：20% 结构树 | 40% 预览+演示 | 40% 素材预览+配置
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
  SlotColorConfig, SlotTextConfig,
  SlotDialogBtnConfig, SlotDialogBgConfig, SlotEmptyConfig,
  PrizeBlock,
} from '@/components/panels/SlotConfigBlocks'

// ── 常量 ───────────────────────────────────────────────────────────────────────
const DIALOG_RESULTS = [
  { state: '正在抽奖', label: '正在抽奖（默认）' },
  { state: '已中奖',   label: '已中奖（成功领取）' },
  { state: '谢谢参与', label: '谢谢参与（未中奖）' },
  { state: '已领满',   label: '奖品已领满' },
  { state: '已使用',   label: '奖品已使用' },
  { state: '出错了',   label: '出错了' },
] as const

const DIALOG_BUTTONS = [
  '确认', '领奖品', '查看收货地址', '重新加载', '关闭', '查看详情', '分享给朋友',
]

// ── 工具 ───────────────────────────────────────────────────────────────────────
function dl(canvas: HTMLCanvasElement, name: string) {
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = name + '.png'
  a.click()
}

// ── SVG 图标（Linear 风格）────────────────────────────────────────────────────
const Ic = (d: string) => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"
    strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
)
const Icons = {
  bg:      () => Ic('M2 3h12v10H2zM2 6h12M5 6v7'),
  title:   () => Ic('M3 4h10M3 7h7M3 10h5'),
  drum:    () => Ic('M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM8 2v12M2 8h12'),
  image:   () => Ic('M2 3h12v10H2zM2 9l3-3 2 2 3-4 4 5'),
  button:  () => Ic('M3 6h10a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z'),
  link:    () => Ic('M6.5 9.5a3 3 0 0 0 4.243 0L12.5 7.75a3 3 0 0 0-4.243-4.244l-1 1M9.5 6.5a3 3 0 0 0-4.243 0L3.5 8.25a3 3 0 0 0 4.243 4.243l1-1'),
  dialog:  () => Ic('M3 3h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8l-3 2.5V11H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z'),
  empty:   () => Ic('M8 3C5.2 3 3 5.2 3 8s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 3v2l1.5 1.5'),
  chevron: () => Ic('M4 6l4 4 4-4'),
  play:    () => Ic('M5 3l8 5-8 5V3z'),
  stop:    () => Ic('M3 3h10v10H3z'),
  dl:      () => Ic('M8 2v8M5 7l3 3 3-3M3 13h10'),
  back:    () => Ic('M10 4L6 8l4 4'),
}

// ── 层级定义 ───────────────────────────────────────────────────────────────────
type LayerId = 'bg'|'title'|'drum'|'prize1'|'prize2'|'prize3'|'button'|'links'|'empty'|'dialog'
interface Layer { id: LayerId; label: string; sub: string; icon: ()=>JSX.Element; children?: Layer[] }

const LAYERS: Layer[] = [
  { id:'bg',     label:'背景层',   sub:'渐变配色',       icon: Icons.bg     },
  { id:'title',  label:'主标题',   sub:'文案 · 字色',    icon: Icons.title  },
  { id:'drum',   label:'转盘区',   sub:'奖品图 · 滚轮',  icon: Icons.drum,
    children: [
      { id:'prize1', label:'奖品图 1', sub:'商品图标', icon: Icons.image },
      { id:'prize2', label:'奖品图 2', sub:'商品图标', icon: Icons.image },
      { id:'prize3', label:'奖品图 3', sub:'谢谢参与', icon: Icons.image },
    ]},
  { id:'button', label:'抽奖按钮', sub:'文案 · 渐变色', icon: Icons.button },
  { id:'links',  label:'链接文字', sub:'奖品 · 规则',   icon: Icons.link   },
  { id:'empty',  label:'空态页',   sub:'插图 · 文案',   icon: Icons.empty  },
  { id:'dialog', label:'弹窗层',   sub:'结果页 · 按钮', icon: Icons.dialog },
]


// ── 画布行（预览图 + 名称 + 下载）─────────────────────────────────────────────
function CanvasRow({ url, label, onDl }: { url: string; label: string; onDl: () => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
        <button onClick={onDl}
          className="flex items-center gap-1 px-2 py-0.5 text-[9px] rounded-lg"
          style={{ background: 'rgba(45,120,244,0.12)', color: '#6AA3FF', border: '1px solid rgba(45,120,244,0.2)', cursor: 'pointer' }}>
          <Icons.dl /> 下载
        </button>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 6, overflow: 'hidden' }}>
        <img src={url} style={{ maxWidth: '100%', height: 'auto', borderRadius: 4, display: 'block', maxHeight: 100, objectFit: 'contain', margin: '0 auto' }} />
      </div>
    </div>
  )
}

// ── 右侧：按层级显示素材 + 配置 ───────────────────────────────────────────────
function RightPanel({ selected }: { selected: LayerId | null }) {
  const { config, setPrize } = useSlot()
  const [state, setState] = useState<Record<string, string>>({})

  // 生成素材 urls
  useEffect(() => {
    let cancelled = false
    async function gen() {
      if (!selected) return
      await preloadFonts()
      const next: Record<string, string> = {}
      try {
        if (selected === 'button') {
          next.btnA = drawButtonCanvas('立即抽奖',   config.btnActiveFrom,   config.btnActiveTo,   config.btnTextColor).toDataURL()
          next.btnD = drawButtonCanvas('活动已结束', config.btnDisabledFrom, config.btnDisabledTo, config.btnTextColor).toDataURL()
        }
        if (selected === 'links') {
          next.lp = drawLinkCanvas([{ text: '我的奖品' }], config.linksColor, 186, 44, 45, 2).toDataURL()
          next.lr = drawLinkCanvas([{ text: '|', opacity: 0.6 }, { text: '抽奖规则' }], config.linksColor, 218, 44, 45, 2).toDataURL()
        }
        if (selected === 'empty') {
          next.empty = (await drawEmptyStateCanvas(config.emptyImageUrl, config.emptyTransform as XfTransform, config.emptyText)).toDataURL()
        }
        if (selected === 'drum' || selected?.startsWith('prize')) {
          const indices = selected === 'drum'
            ? config.prizes.map((_, i) => i)
            : [parseInt(selected!.replace('prize', ''), 10) - 1]
          for (const i of indices) {
            if (config.prizes[i]) {
              next[`prize${i}`] = (await drawPrizeCanvas(config.prizes[i] as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)).toDataURL()
            }
          }
        }
        if (selected === 'dialog') {
          // 全部弹窗结果页
          for (const dr of DIALOG_RESULTS) {
            next[`dr_${dr.state}`] = drawDialogResultCanvas(dr.state, config.slotTintFrom, config.slotTintTo, config.titleColor).toDataURL()
          }
          // 全部弹窗按钮
          for (const text of DIALOG_BUTTONS) {
            next[`db_${text}`] = drawDialogButtonCanvas(text, config.btnActiveFrom, config.btnActiveTo, undefined, config.btnTextColor).toDataURL()
          }
        }
      } catch {}
      if (!cancelled) setState(next)
    }
    setState({})
    gen()
    return () => { cancelled = true }
  }, [
    selected,
    config.btnActiveFrom, config.btnActiveTo, config.btnDisabledFrom, config.btnDisabledTo,
    config.linksColor, config.slotTintFrom, config.slotTintTo, config.titleColor,
    config.emptyText, config.emptyImageUrl, config.slotStyle,
    config.prizes, config.prizeTransforms,
  ])

  // ── 无选中 ──
  if (!selected) {
    return (
      <div className="p-4 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
        在左侧结构树点击任意层级，右侧显示该层的素材预览和配置项。
      </div>
    )
  }

  // ── 背景层：只显示配色配置，无素材预览 ──
  if (selected === 'bg') {
    return (
      <div className="p-3">
        <SectionHead label="配色预设" />
        <SlotColorConfig />
      </div>
    )
  }

  // ── 主标题：只显示文案配置 ──
  if (selected === 'title') {
    return (
      <div className="p-3">
        <SectionHead label="标题文案" />
        <SlotTextConfig />
      </div>
    )
  }

  // ── 转盘区：3张奖品图横排 + 各自配置 ──
  if (selected === 'drum') {
    return (
      <div>
        {/* 横排3张预览 */}
        <div className="px-3 pt-3 pb-2">
          <SectionHead label="奖品图素材（横排预览）" />
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(config.prizes.length, 4)},1fr)`, gap: 8, marginBottom: 16 }}>
            {config.prizes.map((_, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ height: 60, background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                  {state[`prize${i}`]
                    ? <img src={state[`prize${i}`]} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>生成中</span>
                  }
                </div>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>奖品 {i+1}</span>
                {state[`prize${i}`] && (
                  <div style={{ marginTop: 3 }}>
                    <button onClick={() => dl(Object.assign(document.createElement('canvas'), { width: 1, height: 1 }), '')}
                      style={{ display: 'none' }} />
                    <a href={state[`prize${i}`]} download={`奖品图${i+1}.png`}
                      style={{ fontSize: 8, color: '#6AA3FF', textDecoration: 'none', background: 'rgba(45,120,244,0.1)', padding: '1px 5px', borderRadius: 3 }}>
                      ↓下载
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 每张奖品图的配置 */}
        {config.prizes.map((_, idx) => (
          <div key={idx} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 12px 8px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
              奖品图 {idx+1} · {config.prizes[idx]?.tag || '未设置标签'}
            </div>
            <PrizeBlock
              idx={idx}
              prize={config.prizes[idx]}
              onChange={p => setPrize(idx, p)}
              onImgChange={e => {
                const file = e.target.files?.[0]; if (!file) return
                const reader = new FileReader()
                reader.onload = ev => setPrize(idx, { imageUrl: ev.target?.result as string })
                reader.readAsDataURL(file)
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  // ── 单个奖品图 ──
  if (selected === 'prize1' || selected === 'prize2' || selected === 'prize3') {
    const idx = selected === 'prize1' ? 0 : selected === 'prize2' ? 1 : 2
    const url = state[`prize${idx}`]
    return (
      <div>
        {url && (
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>奖品图 {idx+1} 预览</span>
              <a href={url} download={`奖品图${idx+1}.png`}
                style={{ fontSize: 9, color: '#6AA3FF', background: 'rgba(45,120,244,0.1)', padding: '2px 7px', borderRadius: 4, textDecoration: 'none' }}>
                ↓ 下载
              </a>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 8, display: 'flex', justifyContent: 'center' }}>
              <img src={url} style={{ maxHeight: 80, objectFit: 'contain' }} />
            </div>
          </div>
        )}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 12px 8px' }}>
          <PrizeBlock idx={idx} prize={config.prizes[idx]}
            onChange={p => setPrize(idx, p)}
            onImgChange={e => {
              const file = e.target.files?.[0]; if (!file) return
              const reader = new FileReader()
              reader.onload = ev => setPrize(idx, { imageUrl: ev.target?.result as string })
              reader.readAsDataURL(file)
            }} />
        </div>
      </div>
    )
  }

  // ── 抽奖按钮：只显示按钮素材，无配色预设 ──
  if (selected === 'button') {
    return (
      <div className="p-3">
        <SectionHead label="抽奖按钮素材" />
        {state.btnA && <CanvasRow url={state.btnA} label="立即抽奖"
          onDl={() => { const a = document.createElement('a'); a.href = state.btnA; a.download = '按钮_立即抽奖.png'; a.click() }} />}
        {state.btnD && <CanvasRow url={state.btnD} label="活动已结束"
          onDl={() => { const a = document.createElement('a'); a.href = state.btnD; a.download = '按钮_活动结束.png'; a.click() }} />}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
          按钮颜色跟随「背景层」配色预设
        </div>
      </div>
    )
  }

  // ── 链接文字：只显示链接素材，无配色预设 ──
  if (selected === 'links') {
    return (
      <div className="p-3">
        <SectionHead label="链接文字素材" />
        {state.lp && <CanvasRow url={state.lp} label="我的奖品"
          onDl={() => { const a = document.createElement('a'); a.href = state.lp; a.download = '链接_我的奖品.png'; a.click() }} />}
        {state.lr && <CanvasRow url={state.lr} label="抽奖规则"
          onDl={() => { const a = document.createElement('a'); a.href = state.lr; a.download = '链接_抽奖规则.png'; a.click() }} />}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>
          链接颜色跟随「背景层」配色预设
        </div>
      </div>
    )
  }

  // ── 空态页 ──
  if (selected === 'empty') {
    return (
      <div>
        {state.empty && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>空态页预览</span>
              <a href={state.empty} download="空态页.png"
                style={{ fontSize: 9, color: '#6AA3FF', background: 'rgba(45,120,244,0.1)', padding: '2px 7px', borderRadius: 4, textDecoration: 'none' }}>
                ↓ 下载
              </a>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 6 }}>
              <img src={state.empty} style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain', margin: '0 auto', display: 'block' }} />
            </div>
          </div>
        )}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 12px 8px' }}>
          <SectionHead label="空态页设置" />
          <SlotEmptyConfig />
        </div>
      </div>
    )
  }

  // ── 弹窗层：全部6种结果页 + 全部7种按钮 ──
  if (selected === 'dialog') {
    return (
      <div className="overflow-y-auto">
        {/* 弹窗结果页 */}
        <div className="px-3 pt-3">
          <SectionHead label="弹窗结果页（6 种状态）" />
          {DIALOG_RESULTS.map(dr => {
            const url = state[`dr_${dr.state}`]
            return url ? (
              <CanvasRow key={dr.state} url={url} label={dr.label}
                onDl={() => { const a = document.createElement('a'); a.href = url; a.download = `弹窗_${dr.label}.png`; a.click() }} />
            ) : (
              <div key={dr.state} style={{ height: 40, background: 'rgba(255,255,255,0.03)', borderRadius: 6, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>生成 {dr.label}…</span>
              </div>
            )
          })}
        </div>

        {/* 弹窗按钮 */}
        <div className="px-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <SectionHead label="弹窗按钮（7 种文案）" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6, marginBottom: 12 }}>
            {DIALOG_BUTTONS.map(text => {
              const url = state[`db_${text}`]
              return (
                <div key={text} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '6px 6px 4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                    {url ? <img src={url} style={{ maxWidth: '100%', maxHeight: 32, objectFit: 'contain' }} />
                          : <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>生成中</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{text}</span>
                    {url && (
                      <a href={url} download={`弹窗按钮_${text}.png`}
                        style={{ fontSize: 8, color: '#6AA3FF', textDecoration: 'none', background: 'rgba(45,120,244,0.1)', padding: '1px 5px', borderRadius: 3 }}>
                        ↓
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 弹窗配置 */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 12px 8px' }}>
          <SectionHead label="弹窗按钮配色" />
          <SlotDialogBtnConfig />
          <div style={{ height: 12 }} />
          <SectionHead label="弹窗结果页配色" />
          <SlotDialogBgConfig />
        </div>
      </div>
    )
  }

  return null
}

function SectionHead({ label }: { label: string }) {
  return <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
}

// ── 左侧结构树 ────────────────────────────────────────────────────────────────
function LayerTree({ layers, selected, onSelect, depth = 0, expanded, onToggle }: {
  layers: Layer[]; selected: LayerId | null
  onSelect: (id: LayerId) => void
  depth?: number; expanded: Set<LayerId>; onToggle: (id: LayerId) => void
}) {
  return (
    <>
      {layers.map(layer => {
        const active = selected === layer.id
        const hasKids = !!layer.children?.length
        const isOpen  = expanded.has(layer.id)
        const Icon    = layer.icon
        return (
          <div key={layer.id}>
            <div
              onClick={() => { onSelect(layer.id); if (hasKids) onToggle(layer.id) }}
              className="flex items-center gap-2 py-2 cursor-pointer transition-all rounded-lg select-none"
              style={{
                paddingLeft: 12 + depth * 12, paddingRight: 8,
                background: active ? 'rgba(45,120,244,0.12)' : 'transparent',
                borderLeft: active ? '2px solid #2D78F4' : '2px solid transparent',
                color: active ? '#6AA3FF' : 'rgba(255,255,255,0.6)',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <span style={{ flexShrink: 0, opacity: active ? 1 : 0.55 }}><Icon /></span>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 11, fontWeight: 500, truncate: 'true' } as React.CSSProperties}>{layer.label}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>{layer.sub}</div>
              </div>
              {hasKids && (
                <span style={{ opacity: 0.3, transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.18s', flexShrink: 0 }}>
                  <Icons.chevron />
                </span>
              )}
            </div>
            {hasKids && isOpen && layer.children && (
              <LayerTree layers={layer.children} selected={selected} onSelect={onSelect}
                depth={depth + 1} expanded={expanded} onToggle={onToggle} />
            )}
          </div>
        )
      })}
    </>
  )
}

// ── 中间预览 ───────────────────────────────────────────────────────────────────
type DemoState = 'idle' | 'spinning' | 'won' | 'dialog'

function StudioCanvas({ bannerUrl, config, onLayerClick }: {
  bannerUrl: string; config: ReturnType<typeof useSlot>['config']; onLayerClick: (id: LayerId) => void
}) {
  const [demo, setDemo] = useState<DemoState>('idle')
  const [wonIdx, setWonIdx] = useState(0)
  const [prizeUrls, setPrizeUrls] = useState<string[]>([])
  const [dialogUrl, setDialogUrl] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    let cancelled = false
    const gen = async () => {
      try {
        await preloadFonts()
        const pcs = await Promise.all(config.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)))
        const dc = drawDialogResultCanvas('已中奖', config.slotTintFrom, config.slotTintTo, config.titleColor)
        if (!cancelled) { setPrizeUrls(pcs.map(c => c.toDataURL())); setDialogUrl(dc.toDataURL()) }
      } catch {}
    }
    gen()
    return () => { cancelled = true }
  }, [config])

  const startDemo = () => {
    if (demo !== 'idle') { setDemo('idle'); clearTimeout(timer.current); return }
    setDemo('spinning')
    timer.current = setTimeout(() => {
      setWonIdx(Math.floor(Math.random() * Math.min(config.prizes.length, 3)))
      setDemo('won')
      timer.current = setTimeout(() => setDemo('dialog'), 1200)
    }, 2500)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6"
      style={{ background: '#080C14', backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      {/* 工具条 */}
      <div className="flex gap-2 shrink-0">
        {['100%','参考线','网格'].map(l => (
          <button key={l} className="px-3 py-1 text-[10px] rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {/* 预览 */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 520 }}>
        {bannerUrl
          ? <img src={bannerUrl} draggable={false} style={{ width: '100%', borderRadius: 14, display: 'block', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
          : <div style={{ width: '100%', aspectRatio: '750/242', borderRadius: 14, background: `linear-gradient(120deg,${config.slotTintFrom},${config.slotTintTo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>渲染中…</div>
        }
        {/* 热区 */}
        {demo === 'idle' && [
          { id: 'title'  as LayerId, top:'4%',  left:'3%',  w:'31%', h:'27%', l:'标题' },
          { id: 'drum'   as LayerId, top:'30%', left:'5%',  w:'58%', h:'62%', l:'转盘' },
          { id: 'button' as LayerId, top:'42%', left:'66%', w:'27%', h:'33%', l:'按钮' },
        ].map(z => (
          <div key={z.id} onClick={() => onLayerClick(z.id)}
            style={{ position:'absolute', top:z.top, left:z.left, width:z.w, height:z.h, cursor:'pointer',
              border:'1.5px dashed rgba(255,255,255,0.12)', borderRadius:6, zIndex:2,
              display:'flex', alignItems:'flex-start', padding:'3px 5px' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.border='1.5px solid rgba(45,120,244,0.7)'; el.style.background='rgba(45,120,244,0.08)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.border='1.5px dashed rgba(255,255,255,0.12)'; el.style.background='transparent' }}>
            <span style={{ fontSize:8, color:'rgba(255,255,255,0.3)', background:'rgba(0,0,0,0.5)', borderRadius:2, padding:'1px 4px' }}>{z.l}</span>
          </div>
        ))}
        {/* 演示：转动 */}
        {demo === 'spinning' && (
          <div style={{ position:'absolute', top:'28%', left:'4%', width:'61%', height:'64%', background:'rgba(0,0,0,0.55)', borderRadius:10, zIndex:5, display:'flex', alignItems:'center', justifyContent:'center', gap:8, overflow:'hidden' }}>
            {prizeUrls.slice(0,3).map((url,i) => (
              <div key={i} style={{ width:50, height:50, borderRadius:8, overflow:'hidden', background:'rgba(255,255,255,0.08)', animation:'studioSpin 0.18s linear infinite', animationDelay:`${i*0.06}s` }}>
                <img src={url} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
              </div>
            ))}
            <style>{`@keyframes studioSpin{0%{transform:translateY(0)}25%{transform:translateY(-10px)}75%{transform:translateY(10px)}100%{transform:translateY(0)}}`}</style>
          </div>
        )}
        {/* 演示：中奖 */}
        {demo === 'won' && prizeUrls[wonIdx] && (
          <div style={{ position:'absolute', top:'28%', left:'4%', width:'61%', height:'64%', background:'rgba(0,0,0,0.6)', borderRadius:10, zIndex:5, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
            <img src={prizeUrls[wonIdx]} style={{ width:58, height:58, objectFit:'contain' }} />
            <span style={{ fontSize:11, color:'#fff', fontWeight:700 }}>中奖！{config.prizes[wonIdx]?.tag||''}</span>
          </div>
        )}
        {/* 演示：弹窗 */}
        {demo === 'dialog' && dialogUrl && (
          <div style={{ position:'absolute', inset:-16, background:'rgba(0,0,0,0.78)', borderRadius:16, zIndex:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ maxWidth:'82%', position:'relative' }}>
              <img src={dialogUrl} style={{ width:'100%', height:'auto', borderRadius:16, display:'block', boxShadow:'0 20px 60px rgba(0,0,0,0.7)' }} />
              <button onClick={() => setDemo('idle')}
                style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)', padding:'8px 24px', borderRadius:20, border:'none', cursor:'pointer', background:`linear-gradient(90deg,${config.btnActiveFrom},${config.btnActiveTo})`, color:config.btnTextColor||'#fff', fontSize:12, fontWeight:700 }}>
                确认领奖
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 演示按钮 */}
      <button onClick={startDemo}
        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full shrink-0"
        style={{ background: demo==='idle' ? `linear-gradient(90deg,${config.btnActiveFrom},${config.btnActiveTo})` : 'rgba(255,255,255,0.08)', color:'#fff', border:'none', cursor:'pointer', boxShadow: demo==='idle' ? '0 4px 20px rgba(0,0,0,0.3)' : 'none' }}>
        {demo==='idle' ? <><Icons.play /> 点击体验演示效果</> : <><Icons.stop /> 停止演示</>}
      </button>
    </div>
  )
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
      const pcs = await Promise.all(config.prizes.map((p,i) => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)))
      const sc = {
        slotTintFrom: config.slotTintFrom, slotTintTo: config.slotTintTo,
        slotRect7From: config.slotRect7From, slotRect7To: config.slotRect7To,
        titleText: config.titleText, titleColor: config.titleColor, linksColor: config.linksColor,
        btnActiveFrom: config.btnActiveFrom, btnActiveTo: config.btnActiveTo,
        btnTextColor: config.btnTextColor, slotStyle: config.slotStyle,
      }
      setBannerUrl((await drawSlotBannerCanvas(sc, pcs)).toDataURL())
    } catch {}
  }, [config])

  useEffect(() => { buildBanner() }, [buildBanner])

  const handleToggle = (id: LayerId) =>
    setExpanded(p => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s })

  const currentLabel = selected
    ? LAYERS.flatMap(l => l.children ? [l,...l.children] : [l]).find(l => l.id === selected)?.label
    : '属性面板'

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080C14' }}>
      {/* 顶栏 */}
      <div className="flex items-center gap-3 px-5 h-12 shrink-0 border-b"
        style={{ background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>
        <button onClick={onBack}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-xl text-white hover:opacity-90"
          style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)', border: 'none', cursor: 'pointer' }}>
          <Icons.back /> 完成并返回画布
        </button>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>老虎机工作室</span>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>改动实时同步</span>
        <div style={{ flex: 1 }} />
        {[{l:'保存模板',i:'⊕'},{l:'版本对比',i:'⟺'},{l:'导出资源',i:'↓'}].map(b => (
          <button key={b.l}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg hover:opacity-80"
            style={{ background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer' }}>
            <span style={{ fontSize:11 }}>{b.i}</span>{b.l}
          </button>
        ))}
      </div>

      {/* 三栏 20 / 40 / 40 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 左20% */}
        <div className="flex flex-col border-r overflow-y-auto shrink-0"
          style={{ width: '20%', minWidth: 155, maxWidth: 210, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.18)', padding: '12px 14px 6px', textTransform: 'uppercase', letterSpacing: 1.5 }}>
            组件结构
          </div>
          <div className="flex-1 px-1 pb-4">
            <LayerTree layers={LAYERS} selected={selected} onSelect={setSelected}
              expanded={expanded} onToggle={handleToggle} />
          </div>
        </div>

        {/* 中40% */}
        <StudioCanvas bannerUrl={bannerUrl} config={config} onLayerClick={setSelected} />

        {/* 右40% */}
        <div className="flex flex-col border-l overflow-hidden shrink-0"
          style={{ width: '40%', minWidth: 280, background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="h-11 flex items-center px-4 border-b shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{currentLabel}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <RightPanel selected={selected} />
          </div>
        </div>
      </div>
    </div>
  )
}
