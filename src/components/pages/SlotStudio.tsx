/**
 * 老虎机工作室（专业深度编辑环境）
 *
 * 布局：40% 结构树 | 40% 预览+演示 | 20% 属性面板
 *
 * 左侧：组件解剖图——背景/转盘/奖品/按钮/弹窗各层级
 * 中间：实时 canvas 预览 + 「▶ 点击体验」动态演示
 * 右侧：属性 Tab（颜色/文案/尺寸）+ 素材 Tab（奖品图替换）+ 逻辑 Tab（待开发）
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSlot } from '@/contexts/SlotContext'
import {
  drawSlotBannerCanvas, drawPrizeCanvas, preloadFonts,
} from '@/utils/exportUtils'
import type { PrizeInfo, XfTransform } from '@/utils/exportUtils'
import {
  SlotColorConfig, SlotTextConfig, SlotPrizeConfig,
  SlotDialogBtnConfig, SlotDialogBgConfig, InlineConfigSection,
} from '@/components/panels/SlotConfigBlocks'

// ── 图层结构定义 ──────────────────────────────────────────────────────────────
type LayerId = 'root' | 'bg' | 'title' | 'drum' | 'prize1' | 'prize2' | 'prize3' | 'button' | 'links' | 'dialog'

interface Layer {
  id: LayerId
  label: string
  sub?: string
  icon: string
  children?: Layer[]
  configKey: 'color' | 'text' | 'prize' | 'dialog' | 'style'
}

const SLOT_LAYERS: Layer[] = [
  { id: 'bg',     label: '背景层',   sub: '渐变配色 / 背景图', icon: '🎨', configKey: 'color' },
  { id: 'title',  label: '主标题',   sub: '文案 / 字色',        icon: '✏️', configKey: 'text'  },
  {
    id: 'drum', label: '转盘区', sub: '奖品图 / 转盘样式', icon: '🎰', configKey: 'prize',
    children: [
      { id: 'prize1', label: '奖品图 1', sub: '商品图标',   icon: '🖼', configKey: 'prize' },
      { id: 'prize2', label: '奖品图 2', sub: '商品图标',   icon: '🖼', configKey: 'prize' },
      { id: 'prize3', label: '奖品图 3', sub: '谢谢参与',   icon: '🖼', configKey: 'prize' },
    ],
  },
  { id: 'button', label: '抽奖按钮', sub: '文案 / 渐变色',     icon: '🔘', configKey: 'color' },
  { id: 'links',  label: '链接文字', sub: '我的奖品 / 规则',   icon: '🔗', configKey: 'color' },
  { id: 'dialog', label: '弹窗层',   sub: '按钮 / 结果页配色', icon: '💬', configKey: 'dialog'},
]

// ── 左侧：结构树 ──────────────────────────────────────────────────────────────
function LayerTree({
  layers, selected, onSelect, depth = 0,
}: {
  layers: Layer[]; selected: LayerId | null
  onSelect: (id: LayerId) => void; depth?: number
}) {
  const [expanded, setExpanded] = useState<Set<LayerId>>(new Set(['drum']))

  return (
    <>
      {layers.map(layer => (
        <div key={layer.id}>
          <div
            onClick={() => { onSelect(layer.id); if (layer.children) setExpanded(p => { const s = new Set(p); s.has(layer.id) ? s.delete(layer.id) : s.add(layer.id); return s }) }}
            className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all rounded-lg mx-2 mb-0.5"
            style={{
              paddingLeft: 12 + depth * 16,
              background: selected === layer.id ? 'rgba(45,120,244,0.15)' : 'transparent',
              borderLeft: selected === layer.id ? '2px solid #2D78F4' : '2px solid transparent',
            }}
            onMouseEnter={e => { if (selected !== layer.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (selected !== layer.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <span style={{ fontSize: 13, flexShrink: 0 }}>{layer.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium truncate" style={{ color: selected === layer.id ? '#6AA3FF' : 'rgba(255,255,255,0.75)' }}>
                {layer.label}
              </div>
              {layer.sub && (
                <div className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{layer.sub}</div>
              )}
            </div>
            {layer.children && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                style={{ color: 'rgba(255,255,255,0.25)', transform: expanded.has(layer.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                <path d="M6 9l6 6 6-6"/>
              </svg>
            )}
          </div>
          {layer.children && expanded.has(layer.id) && (
            <LayerTree layers={layer.children} selected={selected} onSelect={onSelect} depth={depth + 1} />
          )}
        </div>
      ))}
    </>
  )
}

// ── 中间：预览 + 动态演示 ────────────────────────────────────────────────────
type DemoState = 'idle' | 'spinning' | 'won' | 'dialog'

const PRIZE_EMOJIS = ['🎁', '🎪', '🎊']

function StudioCanvas({
  bannerUrl, config, onLayerClick,
}: {
  bannerUrl: string
  config: ReturnType<typeof useSlot>['config']
  onLayerClick: (id: LayerId) => void
}) {
  const [demo, setDemo] = useState<DemoState>('idle')
  const [wonIdx, setWonIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const startDemo = () => {
    if (demo !== 'idle') { setDemo('idle'); clearTimeout(timerRef.current); return }
    setDemo('spinning')
    timerRef.current = setTimeout(() => {
      const idx = Math.floor(Math.random() * 3)
      setWonIdx(idx)
      setDemo('won')
      timerRef.current = setTimeout(() => setDemo('dialog'), 1200)
    }, 2500)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  // 奖品名称
  const prizeName = config.prizes[wonIdx]?.tag || '免单大奖'
  const prizeImg  = config.prizes[wonIdx]?.imageUrl || ''

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 relative"
      style={{ background: '#080C14', backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>

      {/* 画布工具栏 */}
      <div className="flex items-center gap-3 mb-2">
        {[{ label: '100%' }, { label: '参考线', icon: '⊞' }, { label: '网格', icon: '⊟' }].map(t => (
          <button key={t.label}
            className="flex items-center gap-1 px-3 py-1 text-[10px] rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer' }}>
            {t.icon && <span>{t.icon}</span>}
            {t.label}
          </button>
        ))}
      </div>

      {/* 老虎机预览 */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
        {bannerUrl ? (
          <img src={bannerUrl} alt="老虎机预览"
            style={{ width: '100%', borderRadius: 14, display: 'block', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            draggable={false} />
        ) : (
          <div style={{ width: '100%', aspectRatio: '750/242', borderRadius: 14,
            background: `linear-gradient(120deg,${config.slotTintFrom},${config.slotTintTo})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            渲染中…
          </div>
        )}

        {/* 可点击热区（选择层级） */}
        {demo === 'idle' && [
          { id: 'title' as LayerId,  top: '4%',  left: '3%',   w: '31%', h: '27%', label: '标题' },
          { id: 'drum'  as LayerId,  top: '30%', left: '5%',   w: '58%', h: '62%', label: '转盘' },
          { id: 'button' as LayerId, top: '42%', left: '66%',  w: '27%', h: '33%', label: '按钮' },
        ].map(z => (
          <div key={z.id} onClick={() => onLayerClick(z.id)}
            style={{
              position: 'absolute', top: z.top, left: z.left, width: z.w, height: z.h,
              cursor: 'pointer', border: '1.5px dashed rgba(255,255,255,0.15)', borderRadius: 6,
              display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start',
              padding: '3px 5px', zIndex: 2,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1.5px solid rgba(45,120,244,0.7)'; (e.currentTarget as HTMLElement).style.background = 'rgba(45,120,244,0.08)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1.5px dashed rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.4)', borderRadius: 2, padding: '1px 4px' }}>{z.label}</span>
          </div>
        ))}

        {/* 演示动画层 */}
        {demo === 'spinning' && (
          <div style={{
            position: 'absolute', top: '28%', left: '4%', width: '60%', height: '64%',
            background: 'rgba(0,0,0,0.5)', borderRadius: 10, zIndex: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {/* 转动条 */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 56, height: 56, borderRadius: 10, background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: `slotSpin 0.2s linear infinite`, animationDelay: `${i * 0.07}s`,
                  fontSize: 24 }}>
                  {PRIZE_EMOJIS[i]}
                </div>
              ))}
            </div>
            <style>{`@keyframes slotSpin { 0%{transform:translateY(0)} 25%{transform:translateY(-8px)} 75%{transform:translateY(8px)} 100%{transform:translateY(0)} }`}</style>
          </div>
        )}

        {/* 中奖展示 */}
        {demo === 'won' && (
          <div style={{
            position: 'absolute', top: '28%', left: '4%', width: '60%', height: '64%',
            background: 'rgba(0,0,0,0.6)', borderRadius: 10, zIndex: 5,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <div style={{ fontSize: 32 }}>{prizeImg ? '🎁' : PRIZE_EMOJIS[wonIdx]}</div>
            <div style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>🎉 {prizeName}</div>
          </div>
        )}

        {/* 弹窗模拟 */}
        {demo === 'dialog' && (
          <div style={{
            position: 'absolute', inset: -20, background: 'rgba(0,0,0,0.75)', borderRadius: 16,
            zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: `linear-gradient(160deg, ${config.slotTintFrom}, ${config.slotTintTo})`,
              borderRadius: 20, padding: '28px 32px', minWidth: 200, textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎊</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>恭喜中奖！</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>{prizeName}</div>
              <button onClick={() => setDemo('idle')}
                style={{ padding: '8px 28px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(90deg,${config.btnActiveFrom},${config.btnActiveTo})`,
                  color: config.btnTextColor || '#fff', fontSize: 13, fontWeight: 700 }}>
                确认领奖
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 演示按钮 */}
      <button onClick={startDemo}
        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-all"
        style={{
          background: demo === 'idle'
            ? `linear-gradient(90deg,${config.btnActiveFrom},${config.btnActiveTo})`
            : 'rgba(255,255,255,0.1)',
          color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: demo === 'idle' ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
        }}>
        {demo === 'idle' ? '▶  点击体验演示效果' : '✕  停止演示'}
      </button>
    </div>
  )
}

// ── 右侧：属性/素材/逻辑面板 ────────────────────────────────────────────────
type RightTab = 'attr' | 'asset' | 'logic'

function RightPanel({ selected }: { selected: LayerId | null }) {
  const [tab, setTab] = useState<RightTab>('attr')
  const { config, setPrize } = useSlot()
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  const configKey = selected
    ? SLOT_LAYERS.flatMap(l => l.children ? [l, ...l.children] : [l]).find(l => l.id === selected)?.configKey
    : null

  return (
    <div className="flex flex-col h-full border-l"
      style={{ background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>
      {/* Tab 切换 */}
      <div className="flex border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        {([['attr', '属性'], ['asset', '素材'], ['logic', '逻辑']] as [RightTab, string][]).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-3 text-[11px] font-semibold transition-all"
            style={{
              color: tab === t ? '#6AA3FF' : 'rgba(255,255,255,0.35)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === t ? '2px solid #2D78F4' : '2px solid transparent',
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-y-auto">

        {/* 属性 Tab */}
        {tab === 'attr' && (
          <div className="py-2">
            {!selected && (
              <div className="px-4 pt-4 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                在左侧结构树选中一个层级，这里显示该层的全部属性配置。
              </div>
            )}
            {(configKey === 'color' || selected === 'button' || selected === 'links' || selected === 'bg') && (
              <InlineConfigSection label="配色预设" defaultOpen>
                <SlotColorConfig />
              </InlineConfigSection>
            )}
            {(configKey === 'text' || selected === 'title') && (
              <InlineConfigSection label="文案设置" defaultOpen>
                <SlotTextConfig />
              </InlineConfigSection>
            )}
            {(configKey === 'prize' || selected?.startsWith('prize') || selected === 'drum') && (
              <InlineConfigSection label="奖品图设置" defaultOpen>
                <SlotPrizeConfig />
              </InlineConfigSection>
            )}
            {(configKey === 'dialog' || selected === 'dialog') && (
              <>
                <InlineConfigSection label="弹窗按钮配色" defaultOpen>
                  <SlotDialogBtnConfig />
                </InlineConfigSection>
                <InlineConfigSection label="弹窗结果页配色">
                  <SlotDialogBgConfig />
                </InlineConfigSection>
              </>
            )}
          </div>
        )}

        {/* 素材 Tab */}
        {tab === 'asset' && (
          <div className="p-4 space-y-4">
            <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              奖品图素材
            </div>
            {config.prizes.map((prize, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {prize.imageUrl
                    ? <img src={prize.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '0 4px' }}>未上传</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>奖品图 {idx+1}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{prize.tag || '未设置标签'}</div>
                </div>
                <button onClick={() => fileRefs.current[idx]?.click()}
                  className="px-3 py-1.5 text-[10px] font-semibold rounded-lg"
                  style={{ background: 'rgba(45,120,244,0.15)', color: '#6AA3FF', border: '1px solid rgba(45,120,244,0.25)', cursor: 'pointer' }}>
                  {prize.imageUrl ? '替换' : '上传'}
                </button>
                <input ref={el => { fileRefs.current[idx] = el }} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]; if (!file) return
                    const reader = new FileReader()
                    reader.onload = ev => setPrize(idx, { imageUrl: ev.target?.result as string })
                    reader.readAsDataURL(file)
                  }} />
              </div>
            ))}
          </div>
        )}

        {/* 逻辑 Tab */}
        {tab === 'logic' && (
          <div className="p-4 space-y-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              交互逻辑
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>当点击「立即抽奖」时</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>▸ 触发转盘旋转动画</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>▸ 3秒后停止，显示奖品</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>▸ 弹出对应弹窗</div>
            </div>
            <div className="flex items-center justify-center py-6 rounded-xl"
              style={{ background: 'rgba(255,180,0,0.06)', border: '1px dashed rgba(255,180,0,0.15)' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,180,0,0.5)' }}>逻辑配置编辑器 · 待开发</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
interface Props {
  onBack: () => void
}

export default function SlotStudio({ onBack }: Props) {
  const { config } = useSlot()
  const [selectedLayer, setSelectedLayer] = useState<LayerId | null>(null)
  const [bannerUrl, setBannerUrl]         = useState('')

  // 实时生成 banner
  const buildBanner = useCallback(async () => {
    try {
      await preloadFonts()
      const pcs = await Promise.all(
        config.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle))
      )
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

  const handleLayerClick = (id: LayerId) => setSelectedLayer(id)

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080C14' }}>

      {/* 顶部工具栏 */}
      <div className="flex items-center gap-3 px-5 h-12 shrink-0 border-b"
        style={{ background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>
        {/* 返回 */}
        <button onClick={onBack}
          className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-xl text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)', border: 'none', cursor: 'pointer' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          完成并返回画布
        </button>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
        <span className="text-sm font-bold" style={{ color: '#fff' }}>老虎机工作室</span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3060' }} />
        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>改动实时同步</span>
        <div style={{ flex: 1 }} />

        {/* 工具栏按钮 */}
        {[
          { label: '保存为模板', icon: '⭐' },
          { label: '版本对比', icon: '⟺' },
          { label: '导出资源包', icon: '↓' },
        ].map(btn => (
          <button key={btn.label}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
            <span>{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* 三栏主体 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 左40%：结构树 */}
        <div className="flex flex-col shrink-0 border-r overflow-y-auto"
          style={{ width: '38%', background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="px-4 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-widest shrink-0"
            style={{ color: 'rgba(255,255,255,0.2)' }}>
            组件结构 · 老虎机
          </div>
          <div className="flex-1 pb-4">
            <LayerTree layers={SLOT_LAYERS} selected={selectedLayer} onSelect={setSelectedLayer} />
          </div>
          {/* 提示 */}
          <div className="px-4 py-3 border-t shrink-0 text-[10px] leading-relaxed"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' }}>
            点击层级选中 → 右侧属性面板同步
          </div>
        </div>

        {/* 中40%：画布 */}
        <StudioCanvas
          bannerUrl={bannerUrl}
          config={config}
          onLayerClick={handleLayerClick}
        />

        {/* 右20%：属性面板 */}
        <div className="shrink-0 overflow-hidden"
          style={{ width: '22%', minWidth: 220 }}>
          <RightPanel selected={selectedLayer} />
        </div>
      </div>
    </div>
  )
}
