import { useRef } from 'react'
import { useState } from 'react'
import { useSlot, SLOT_PRESETS } from '@/contexts/SlotContext'
import type { PrizeType, PrizeConfig } from '@/types'
import {
  PF, PanelInput, PanelSection,
  DisclosureGroup, ColorField, PanelListbox,
} from '@/components/ui/PanelField'

/* ── 配色预设 ── */
const LIGHT_PRESETS = ['pink','rose','orange','yellow','green','teal','purple']
const DARK_PRESETS  = ['dark-red','dark-orange','dark-green','dark-blue','dark-purple']
const PRESET_DOTS: Record<string,string> = {
  pink:'#FF5518', rose:'#FF1C18', orange:'#FF5E00', yellow:'#FF4560',
  green:'#27D365', teal:'#06B1FF', purple:'#9771FF',
  'dark-red':'#FF6B8A','dark-orange':'#FFB347','dark-green':'#4ADE80',
  'dark-blue':'#60A5FA','dark-purple':'#C084FC',
}

const BG_SWATCHES_LIGHT = ['#ffdceb','#ffdcdc','#d9f8ff','#efe9ff','#f9fed2','#fff6a8','#ffe3c7']
const BG_SWATCHES_PROMO = ['#ff1d5e','#ff0000','#ffdf04']
const BG_SWATCHES_DARK  = ['#01732b','#331200','#000679']

function PresetGrid({ keys, active, onSelect }: { keys: string[]; active: string|null; onSelect: (k:string)=>void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keys.map(k => (
        <button
          key={k}
          onClick={() => onSelect(k)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all"
          style={{
            borderColor: active === k ? 'rgba(255,48,96,0.6)' : 'rgba(255,255,255,0.1)',
            background:  active === k ? 'rgba(255,48,96,0.12)' : 'rgba(255,255,255,0.04)',
            color:       active === k ? '#FF8FAA' : 'rgba(255,255,255,0.5)',
            fontWeight:  active === k ? 600 : 400,
          }}
        >
          <span style={{ width:8, height:8, borderRadius:'50%', background: PRESET_DOTS[k], display:'inline-block', flexShrink:0 }} />
          {SLOT_PRESETS[k].label}
        </button>
      ))}
    </div>
  )
}

function SwatchRow({ colors, active, onSelect }: { colors:string[]; active:string; onSelect:(c:string)=>void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {colors.map(c => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
          style={{ background: c, borderColor: active === c ? '#fff' : 'transparent' }}
        />
      ))}
    </div>
  )
}

/* ── 奖品图配置块 ── */
const PRIZE_TYPE_OPTIONS: { value: PrizeType; label: string }[] = [
  { value: 'product-tag',    label: '产品图 + 标签' },
  { value: 'product-dashed', label: '产品图 + 虚线' },
  { value: 'amount',         label: '金额券' },
  { value: 'thanks',         label: '谢谢参与' },
]

function PrizeBlock({ idx, prize, onChange, onImgChange }: {
  idx: number
  prize: PrizeConfig
  onChange: (p: Partial<PrizeConfig>) => void
  onImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const showImg    = prize.type === 'product-tag' || prize.type === 'product-dashed'
  const showAmount = prize.type === 'amount'
  const showThanks = prize.type === 'thanks'

  return (
    <PanelSection legend={`奖品图 ${idx + 1}`} className="pb-4 border-b border-white/[0.07] last:border-b-0 last:pb-0">

      <PF label="类型">
        <PanelListbox<PrizeType>
          value={prize.type}
          onChange={v => onChange({ type: v })}
          options={PRIZE_TYPE_OPTIONS}
        />
      </PF>

      {!showThanks && (
        <PF label="顶部标签">
          <PanelInput value={prize.tag} onChange={e => onChange({ tag: e.target.value })} placeholder="如：无门槛优惠券" />
        </PF>
      )}

      {showImg && (
        <PF label="产品图" desc="点击上传商品主图">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-1.5 rounded-lg text-xs border border-white/10 bg-white/[0.05] text-white/50 hover:bg-white/10 transition-colors"
          >
            {prize.imageUrl ? '已上传 · 点击更换' : '上传图片'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImgChange} />
        </PF>
      )}

      {showAmount && (
        <div className="grid grid-cols-2 gap-2">
          <PF label="金额">
            <PanelInput value={prize.amount} onChange={e => onChange({ amount: e.target.value })} placeholder="30" />
          </PF>
          <PF label="单位">
            <PanelInput value={prize.unit} onChange={e => onChange({ unit: e.target.value })} placeholder="元" />
          </PF>
        </div>
      )}

      {showThanks && (
        <PF label="大字文案">
          <PanelInput value={prize.thanksText} onChange={e => onChange({ thanksText: e.target.value })} placeholder="谢谢参与" />
        </PF>
      )}

      {!showThanks && (
        <PF label="底部文字">
          <PanelInput value={prize.bottomText} onChange={e => onChange({ bottomText: e.target.value })} placeholder="如：迪奥口红免单券" />
        </PF>
      )}

    </PanelSection>
  )
}

/* ── EmptySection ── */
function EmptySection() {
  const { config, setConfig, setEmptyTransform, resetEmptyTransform } = useSlot()
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('默认插图')
  const scale = Math.round(config.emptyTransform.scale * 100)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setConfig({ emptyImageUrl: URL.createObjectURL(file) })
    resetEmptyTransform()
    setFileName(file.name)
  }

  return (
    <div className="space-y-3">
      <PF label="空态文案">
        <PanelInput value={config.emptyText} onChange={e => setConfig({ emptyText: e.target.value })} />
      </PF>

      <PF label="替换插图" desc={`当前：${fileName}`}>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-1.5 rounded-lg text-xs border border-white/10 bg-white/[0.05] text-white/50 hover:bg-white/10 transition-colors"
        >
          选择 PNG 图片
        </button>
        <input ref={fileRef} type="file" accept="image/png,image/*" className="hidden" onChange={handleFile} />
      </PF>

      <PF label="插图大小" desc={`${scale}%`}>
        <input
          type="range" min={0} max={200} value={scale}
          onChange={e => setEmptyTransform({ scale: Number(e.target.value) / 100 })}
          className="w-full accent-red-400"
        />
      </PF>

      <button
        onClick={resetEmptyTransform}
        className="w-full py-1.5 rounded-lg text-xs border border-white/10 text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
      >
        ↺ 重置位置与大小
      </button>
    </div>
  )
}

/* ── 主面板 ── */
export default function SlotPanel() {
  const { config, activePreset, setConfig, applyPreset, setPrize } = useSlot()

  const handlePrizeImg = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPrize(idx, { imageUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {/* 组件标题 */}
      <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-2">
        <span>🎰</span>
        <span className="text-xs font-semibold text-white/80">老虎机</span>
      </div>

      {/* 配色预设 */}
      <DisclosureGroup title="配色预设" badge="素材 1–5" defaultOpen>
        <PF label="浅色系">
          <PresetGrid keys={LIGHT_PRESETS} active={activePreset} onSelect={applyPreset} />
        </PF>
        <PF label="深色系">
          <PresetGrid keys={DARK_PRESETS} active={activePreset} onSelect={applyPreset} />
        </PF>
      </DisclosureGroup>

      {/* 会场背景色 */}
      <DisclosureGroup title="会场背景色" badge="预览面板">
        <PF label="浅色系">
          <SwatchRow colors={BG_SWATCHES_LIGHT} active={config.bgColor} onSelect={c => setConfig({ bgColor: c })} />
        </PF>
        <PF label="大促色">
          <SwatchRow colors={BG_SWATCHES_PROMO} active={config.bgColor} onSelect={c => setConfig({ bgColor: c })} />
        </PF>
        <PF label="深色系">
          <SwatchRow colors={BG_SWATCHES_DARK} active={config.bgColor} onSelect={c => setConfig({ bgColor: c })} />
        </PF>
        <ColorField label="自定义" value={config.bgColor} onChange={c => setConfig({ bgColor: c })} />
      </DisclosureGroup>

      {/* 文案设置 */}
      <DisclosureGroup title="文案设置" badge="素材 2" defaultOpen>
        <PF label="主标题文案">
          <PanelInput value={config.titleText} onChange={e => setConfig({ titleText: e.target.value })} placeholder="天天抽免单" />
        </PF>
        <ColorField label="标题文字色" value={config.titleColor} onChange={c => setConfig({ titleColor: c })} />
      </DisclosureGroup>

      {/* 空态页 */}
      <DisclosureGroup title="空态页设置" badge="素材 3">
        <EmptySection />
      </DisclosureGroup>

      {/* 奖品图 */}
      <DisclosureGroup title="奖品图设置" badge="素材 6" defaultOpen>
        <div className="space-y-4">
          {config.prizes.map((prize, idx) => (
            <PrizeBlock
              key={idx} idx={idx} prize={prize}
              onChange={patch => setPrize(idx, patch)}
              onImgChange={handlePrizeImg(idx)}
            />
          ))}
        </div>
      </DisclosureGroup>
    </div>
  )
}
