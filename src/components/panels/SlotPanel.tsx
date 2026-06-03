import { useState, useRef } from 'react'
import { useSlot, SLOT_PRESETS } from '@/contexts/SlotContext'
import type { PrizeType, PrizeConfig } from '@/types'

const LIGHT_PRESETS = ['pink','rose','orange','yellow','green','teal','purple']
const DARK_PRESETS  = ['dark-red','dark-orange','dark-green','dark-blue','dark-purple']

const PRESET_DOT_COLORS: Record<string, string> = {
  pink: '#FF5518', rose: '#FF1C18', orange: '#FF5E00', yellow: '#FF4560',
  green: '#27D365', teal: '#06B1FF', purple: '#9771FF',
  'dark-red': '#FF6B8A', 'dark-orange': '#FFB347', 'dark-green': '#4ADE80',
  'dark-blue': '#60A5FA', 'dark-purple': '#C084FC',
}

const BG_SWATCHES_LIGHT = ['#ffdceb','#ffdcdc','#d9f8ff','#efe9ff','#f9fed2','#fff6a8','#ffe3c7']
const BG_SWATCHES_PROMO = ['#ff1d5e','#ff0000','#ffdf04']
const BG_SWATCHES_DARK  = ['#01732b','#331200','#000679']


function PanelGroup({ title, badge, children, defaultOpen = false }: {
  title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        className="w-full flex items-center gap-2 px-4 py-3 text-left transition-colors hover:opacity-70"
        onClick={() => setOpen(o => !o)}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
        <span className="text-xs font-medium flex-1" style={{ color: 'var(--text-1)' }}>{title}</span>
        {badge && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,48,96,0.08)', color: 'rgba(255,48,96,0.65)' }}>{badge}</span>}
        <span className="text-xs transition-transform" style={{ color: 'var(--text-3)', transform: open ? '' : 'rotate(-90deg)' }}>▾</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

export default function SlotPanel() {
  const { config, activePreset, setConfig, applyPreset, setPrize } = useSlot()
  const prizes = config.prizes

  const handlePrizeImg = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPrize(idx, { imageUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {/* 组件标题 */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span>🎰</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>老虎机</span>
        </div>
      </div>

      {/* 配色预设 */}
      <PanelGroup title="配色预设" badge="素材 1–5" defaultOpen>
        <div className="space-y-3">
          <div>
            <div className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>☀ 浅色系</div>
            <div className="flex flex-wrap gap-1">
              {LIGHT_PRESETS.map(key => (
                <button key={key}
                  onClick={() => applyPreset(key)}
                  className="px-2.5 py-1 rounded text-xs border transition-all"
                  style={{
                    borderColor: activePreset === key ? '#FF3060' : 'var(--border)',
                    background: activePreset === key ? 'rgba(255,48,96,0.08)' : 'var(--bg)',
                    color: activePreset === key ? '#FF3060' : 'var(--text-2)',
                    fontWeight: activePreset === key ? 600 : 400,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRESET_DOT_COLORS[key], display: 'inline-block', marginRight: 4, verticalAlign: 'middle', flexShrink: 0 }} />
                  {SLOT_PRESETS[key].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>🌙 深色系</div>
            <div className="flex flex-wrap gap-1">
              {DARK_PRESETS.map(key => (
                <button key={key}
                  onClick={() => applyPreset(key)}
                  className="px-2.5 py-1 rounded text-xs border transition-all"
                  style={{
                    borderColor: activePreset === key ? '#FF3060' : 'var(--border)',
                    background: activePreset === key ? 'rgba(255,48,96,0.08)' : 'var(--bg)',
                    color: activePreset === key ? '#FF3060' : 'var(--text-2)',
                    fontWeight: activePreset === key ? 600 : 400,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRESET_DOT_COLORS[key], display: 'inline-block', marginRight: 4, verticalAlign: 'middle', flexShrink: 0 }} />
                  {SLOT_PRESETS[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PanelGroup>

      {/* 会场背景色 */}
      <PanelGroup title="会场背景色" badge="预览面板">
        <div className="space-y-3">
          <div>
            <div className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>浅色系</div>
            <div className="flex gap-1.5 flex-wrap">
              {BG_SWATCHES_LIGHT.map(c => (
                <button key={c} onClick={() => setConfig({ bgColor: c })}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: config.bgColor === c ? '#333' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>大促色</div>
            <div className="flex gap-1.5">
              {BG_SWATCHES_PROMO.map(c => (
                <button key={c} onClick={() => setConfig({ bgColor: c })}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: config.bgColor === c ? '#fff' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs mb-1.5" style={{ color: 'var(--text-3)' }}>深色系</div>
            <div className="flex gap-1.5">
              {BG_SWATCHES_DARK.map(c => (
                <button key={c} onClick={() => setConfig({ bgColor: c })}
                  className="w-7 h-7 rounded-full border-2 transition-all"
                  style={{ background: c, borderColor: config.bgColor === c ? '#fff' : 'transparent' }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>自定义</span>
            <input type="color" value={config.bgColor}
              onChange={e => setConfig({ bgColor: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border"
              style={{ borderColor: 'var(--border)' }} />
          </div>
        </div>
      </PanelGroup>

      {/* 文案设置 */}
      <PanelGroup title="文案设置" badge="素材 2" defaultOpen>
        <div className="space-y-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-2)' }}>主标题文案</label>
            <input type="text" value={config.titleText}
              onChange={e => setConfig({ titleText: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg outline-none"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: 'var(--text-2)' }}>标题文字色</label>
            <input type="color" value={config.titleColor}
              onChange={e => setConfig({ titleColor: e.target.value })}
              className="w-7 h-7 rounded cursor-pointer border"
              style={{ borderColor: 'var(--border)' }} />
          </div>
        </div>
      </PanelGroup>

      {/* 空态页 */}
      <PanelGroup title="空态页设置" badge="素材 3">
        <div className="space-y-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-2)' }}>空态文案</label>
            <input type="text" value={config.emptyText}
              onChange={e => setConfig({ emptyText: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg outline-none"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs" style={{ color: 'var(--text-2)' }}>插图大小</label>
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>{config.emptyScale}%</span>
            </div>
            <input type="range" min={0} max={200} value={config.emptyScale}
              onChange={e => setConfig({ emptyScale: Number(e.target.value) })}
              className="w-full" />
          </div>
        </div>
      </PanelGroup>

      {/* 奖品图设置 */}
      <PanelGroup title="奖品图设置" badge="素材 6" defaultOpen>
        <div className="space-y-4">
          {prizes.map((prize, idx) => (
            <PrizeBlock key={idx} idx={idx} prize={prize}
              onChange={patch => setPrize(idx, patch)}
              onImgChange={handlePrizeImg(idx)} />
          ))}
        </div>
      </PanelGroup>
    </div>
  )
}

function PrizeBlock({ idx, prize, onChange, onImgChange }: {
  idx: number
  prize: PrizeConfig
  onChange: (patch: Partial<PrizeConfig>) => void
  onImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const showImg = prize.type === 'product-tag' || prize.type === 'product-dashed'
  const showAmount = prize.type === 'amount'
  const showThanks = prize.type === 'thanks'

  return (
    <div className="space-y-2 pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
      <div className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>奖品图 {idx + 1}</div>

      <div className="flex items-center gap-2">
        <label className="text-xs w-14 shrink-0" style={{ color: 'var(--text-3)' }}>类型</label>
        <select value={prize.type} onChange={e => onChange({ type: e.target.value as PrizeType })}
          className="flex-1 text-xs px-2 py-1 rounded outline-none"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }}>
          <option value="product-tag">产品图+标签</option>
          <option value="product-dashed">产品图+虚线</option>
          <option value="amount">金额券</option>
          <option value="thanks">谢谢参与</option>
        </select>
      </div>

      {!showThanks && (
        <div className="flex items-center gap-2">
          <label className="text-xs w-14 shrink-0" style={{ color: 'var(--text-3)' }}>顶部标签</label>
          <input type="text" value={prize.tag} onChange={e => onChange({ tag: e.target.value })}
            className="flex-1 text-xs px-2 py-1 rounded outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} />
        </div>
      )}

      {showImg && (
        <div className="flex items-center gap-2">
          <label className="text-xs w-14 shrink-0" style={{ color: 'var(--text-3)' }}>产品图</label>
          <button onClick={() => fileRef.current?.click()}
            className="flex-1 text-xs py-1 rounded border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--bg)' }}>
            {prize.imageUrl ? '已上传' : '上传图片'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImgChange} />
        </div>
      )}

      {showAmount && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-xs w-14 shrink-0" style={{ color: 'var(--text-3)' }}>金额</label>
            <input type="text" value={prize.amount} onChange={e => onChange({ amount: e.target.value })}
              className="flex-1 text-xs px-2 py-1 rounded outline-none"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs w-14 shrink-0" style={{ color: 'var(--text-3)' }}>单位</label>
            <input type="text" value={prize.unit} onChange={e => onChange({ unit: e.target.value })}
              className="flex-1 text-xs px-2 py-1 rounded outline-none"
              style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} />
          </div>
        </>
      )}

      {showThanks && (
        <div className="flex items-center gap-2">
          <label className="text-xs w-14 shrink-0" style={{ color: 'var(--text-3)' }}>大字文案</label>
          <input type="text" value={prize.thanksText} onChange={e => onChange({ thanksText: e.target.value })}
            className="flex-1 text-xs px-2 py-1 rounded outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} />
        </div>
      )}

      {!showThanks && (
        <div className="flex items-center gap-2">
          <label className="text-xs w-14 shrink-0" style={{ color: 'var(--text-3)' }}>底部文字</label>
          <input type="text" value={prize.bottomText} onChange={e => onChange({ bottomText: e.target.value })}
            className="flex-1 text-xs px-2 py-1 rounded outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} />
        </div>
      )}
    </div>
  )
}
