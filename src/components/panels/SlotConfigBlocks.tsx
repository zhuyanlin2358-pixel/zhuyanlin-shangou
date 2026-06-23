/**
 * 老虎机配置子组件（共享）
 * 同时被 SlotPanel（左侧面板）和 SlotPage（行内配置区）使用
 */
import { useRef, useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { useSlot, SLOT_PRESETS } from '@/contexts/SlotContext'
import { useVenue } from '@/contexts/VenueContext'
import type { PrizeType, PrizeConfig } from '@/types'
import {
  PF, PanelInput, PanelSection,
  ColorField, PanelListbox,
} from '@/components/ui/PanelField'
import { SLOT_STYLE_LIST } from '@/utils/slotStyles'

/* ── 配色预设常量 ── */
export const LIGHT_PRESETS = ['qinrenfen','dacuhong','huang','ju','lan','lv','qing']
export const DARK_PRESETS  = ['nianhuo','zi']
export const WARM_PRESETS  = ['qinrenfen','dacuhong','ju']
export const PRESET_DOTS: Record<string,string> = {
  qinrenfen: '#F952FF', dacuhong: '#FF3048', huang: '#FFECAD',
  ju: '#FF7632', lan: '#88F4FE', lv: '#46E800', qing: '#46E800',
  nianhuo: '#FF5F5F', zi: '#6E4BC3',
}
export const BG_SWATCHES_LIGHT = ['#ffdceb','#ffdcdc','#d9f8ff','#efe9ff','#f9fed2','#fff6a8','#ffe3c7']
export const BG_SWATCHES_PROMO = ['#ff1d5e','#ff0000','#ffdf04']
export const BG_SWATCHES_DARK  = ['#331200','#000679']

/** 简单亮度检测 */
export function hexLuminance(hex: string): number {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return 0.5
  const r = parseInt(hex.slice(1,3),16)/255
  const g = parseInt(hex.slice(3,5),16)/255
  const b = parseInt(hex.slice(5,7),16)/255
  return 0.299*r + 0.587*g + 0.114*b
}

/* ── 配色预设选择网格 ── */
export function PresetGrid({ keys, active, onSelect }: {
  keys: string[]; active: string|null; onSelect: (k:string)=>void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keys.map(k => (
        <button key={k} onClick={() => onSelect(k)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border transition-all"
          style={{
            borderColor: active===k ? 'rgba(255,48,96,0.6)' : 'rgba(255,255,255,0.1)',
            background:  active===k ? 'rgba(255,48,96,0.12)' : 'rgba(255,255,255,0.04)',
            color:       active===k ? '#FF8FAA' : 'rgba(255,255,255,0.5)',
            fontWeight:  active===k ? 600 : 400,
          }}
        >
          <span style={{ width:8, height:8, borderRadius:'50%', background: PRESET_DOTS[k], display:'inline-block', flexShrink:0 }} />
          {SLOT_PRESETS[k].label}
        </button>
      ))}
    </div>
  )
}

/* ── 风格 + 配色预设（Section 1 下方）── */
export function SlotColorConfig() {
  const { config, activePreset, setConfig, applyPreset } = useSlot()
  const { bgColor: venueBgColor } = useVenue()

  const darkBgSet  = new Set(BG_SWATCHES_DARK)
  const promoBgSet = new Set(BG_SWATCHES_PROMO)
  const lightBgSet = new Set(BG_SWATCHES_LIGHT)
  const bgTone = darkBgSet.has(venueBgColor)  ? 'dark'
               : promoBgSet.has(venueBgColor) ? 'promo'
               : lightBgSet.has(venueBgColor) ? 'light'
               : hexLuminance(venueBgColor) < 0.35 ? 'dark' : 'light'

  return (
    <div className="space-y-3">
      {/* 风格版本 */}
      <div>
        <div className="text-[10.5px] font-medium text-white/40 mb-1.5">风格版本</div>
        <div className="flex flex-wrap gap-1.5">
          {SLOT_STYLE_LIST.filter(s => s.id !== 'minimal').map(style => {
            const isActive = config.slotStyle === style.id
            return (
              <button key={style.id} onClick={() => setConfig({ slotStyle: style.id })}
                className="px-3 py-1 rounded-full text-xs border transition-all"
                style={{
                  borderColor: isActive ? 'rgba(255,48,96,0.6)' : 'rgba(255,255,255,0.1)',
                  background:  isActive ? 'rgba(255,48,96,0.12)' : 'rgba(255,255,255,0.04)',
                  color:       isActive ? '#FF8FAA' : 'rgba(255,255,255,0.45)',
                  fontWeight:  isActive ? 600 : 400,
                }}
              >{style.label}</button>
            )
          })}
        </div>
      </div>

      {/* 配色预设（按会场背景色智能推荐） */}
      <div>
        <div className="text-[10.5px] font-medium text-white/40 mb-1.5">
          配色预设
          <span className="ml-1.5 text-white/25 font-normal">
            {bgTone === 'dark' ? '· 推荐深色系' : bgTone === 'promo' ? '· 推荐同色系' : '· 推荐浅色系'}
          </span>
        </div>
        {bgTone === 'dark'  && <PresetGrid keys={DARK_PRESETS}  active={activePreset} onSelect={applyPreset} />}
        {bgTone === 'light' && <PresetGrid keys={LIGHT_PRESETS} active={activePreset} onSelect={applyPreset} />}
        {bgTone === 'promo' && <PresetGrid keys={WARM_PRESETS}  active={activePreset} onSelect={applyPreset} />}
      </div>
    </div>
  )
}

/* ── 文案设置（Section 2 下方）── */
export function SlotTextConfig() {
  const { config, setConfig } = useSlot()
  return (
    <div className="space-y-3">
      <PF label="主标题文案">
        <PanelInput value={config.titleText} onChange={e => setConfig({ titleText: e.target.value })} placeholder="天天抽免单" />
      </PF>
      <ColorField label="标题文字色" value={config.titleColor} onChange={c => setConfig({ titleColor: c })} />
    </div>
  )
}

/* ── 空态页设置（Section 3 下方）── */
export function SlotEmptyConfig() {
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
        <button onClick={() => fileRef.current?.click()}
          className="w-full py-1.5 rounded-lg text-xs border border-white/10 bg-white/[0.05] text-white/50 hover:bg-white/10 transition-colors">
          选择 PNG 图片
        </button>
        <input ref={fileRef} type="file" accept="image/png,image/*" className="hidden" onChange={handleFile} />
      </PF>
      <PF label="插图大小" desc={`${scale}%`}>
        <input type="range" min={0} max={200} value={scale}
          onChange={e => setEmptyTransform({ scale: Number(e.target.value)/100 })}
          className="w-full accent-red-400" />
      </PF>
      <button onClick={resetEmptyTransform}
        className="w-full py-1.5 rounded-lg text-xs border border-white/10 text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1.5">
        <RotateCcw size={11} className="shrink-0" />重置位置与大小
      </button>
    </div>
  )
}

/* ── 弹窗按钮配色（Section 7 下方）── */
export function SlotDialogBtnConfig() {
  const { config, setConfig } = useSlot()
  return (
    <div className="space-y-3">
      <div className="text-[11px] text-white/35 leading-relaxed">跟随老虎机激活按钮配色</div>
      <div style={{ height:40, borderRadius:20, background:`linear-gradient(90deg,${config.btnActiveFrom},${config.btnActiveTo})`,
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff' }}>
        弹窗按钮预览
      </div>
      <ColorField label="渐变起始色" value={config.btnActiveFrom} onChange={c => setConfig({ btnActiveFrom: c })} />
      <ColorField label="渐变结束色" value={config.btnActiveTo}   onChange={c => setConfig({ btnActiveTo: c })} />
    </div>
  )
}

/* ── 弹窗结果页配色（Section 8 下方）── */
export function SlotDialogBgConfig() {
  const { config, setConfig } = useSlot()
  return (
    <div className="space-y-3">
      <div className="text-[11px] text-white/35 leading-relaxed">跟随老虎机主题背景色</div>
      <div style={{ height:48, borderRadius:10, background:`linear-gradient(120deg,${config.slotTintFrom},${config.slotTintTo})` }} />
      <ColorField label="背景起始色" value={config.slotTintFrom} onChange={c => setConfig({ slotTintFrom: c })} />
      <ColorField label="背景结束色" value={config.slotTintTo}   onChange={c => setConfig({ slotTintTo: c })} />
    </div>
  )
}

/* ── 奖品图设置（Section 6 下方）── */
const PRIZE_TYPE_OPTIONS: { value: PrizeType; label: string }[] = [
  { value: 'product-tag',    label: '产品图 + 标签' },
  { value: 'product-dashed', label: '产品图' },
  { value: 'amount',         label: '金额券' },
  { value: 'thanks',         label: '谢谢参与' },
]

export function PrizeBlock({ idx, prize, onChange, onImgChange }: {
  idx: number; prize: PrizeConfig
  onChange: (p: Partial<PrizeConfig>) => void
  onImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const showImg    = prize.type === 'product-tag' || prize.type === 'product-dashed'
  const showAmount = prize.type === 'amount'
  const showThanks = prize.type === 'thanks'

  return (
    <PanelSection legend={`奖品图 ${idx+1}`} className="pb-4 border-b border-white/[0.07] last:border-b-0 last:pb-0">
      <PF label="类型">
        <PanelListbox<PrizeType> value={prize.type} onChange={v => onChange({ type: v })} options={PRIZE_TYPE_OPTIONS} />
      </PF>
      {!showThanks && <PF label="顶部标签"><PanelInput value={prize.tag} onChange={e => onChange({ tag: e.target.value })} placeholder="如：无门槛优惠券" /></PF>}
      {showImg && (
        <PF label="产品图" desc="点击上传商品主图">
          <button onClick={() => fileRef.current?.click()}
            className="w-full py-1.5 rounded-lg text-xs border border-white/10 bg-white/[0.05] text-white/50 hover:bg-white/10 transition-colors">
            {prize.imageUrl ? '已上传 · 点击更换' : '上传图片'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImgChange} />
        </PF>
      )}
      {showAmount && (
        <div className="grid grid-cols-2 gap-2">
          <PF label="金额"><PanelInput value={prize.amount} onChange={e => onChange({ amount: e.target.value })} placeholder="30" /></PF>
          <PF label="单位"><PanelInput value={prize.unit}   onChange={e => onChange({ unit:   e.target.value })} placeholder="元" /></PF>
        </div>
      )}
      {showThanks && <PF label="大字文案"><PanelInput value={prize.thanksText} onChange={e => onChange({ thanksText: e.target.value })} placeholder="谢谢参与" /></PF>}
      {!showThanks && <PF label="底部文字"><PanelInput value={prize.bottomText} onChange={e => onChange({ bottomText: e.target.value })} placeholder="如：迪奥口红免单券" /></PF>}
    </PanelSection>
  )
}

/* ── 奖品图配置整体（Section 6 下方）── */
export function SlotPrizeConfig() {
  const { config, setPrize } = useSlot()
  const fileInputRefs = useRef<(HTMLInputElement|null)[]>([])

  const handlePrizeImg = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPrize(idx, { imageUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      {config.prizes.map((prize, idx) => (
        <PrizeBlock key={idx} idx={idx} prize={prize}
          onChange={patch => setPrize(idx, patch)}
          onImgChange={handlePrizeImg(idx)}
        />
      ))}
    </div>
  )
}

/* ── 行内配置容器（带折叠手风琴）── */
export function InlineConfigSection({
  label, badge, defaultOpen = true, children,
}: { label: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      className="mt-3 rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 shrink-0" />
        <span className="flex-1 text-xs font-medium text-white/70">{label}</span>
        {badge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/30 shrink-0">{badge}</span>
        )}
        <ChevronDown size={12} className={`text-white/25 transition-transform duration-200 shrink-0 ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="px-4 py-3 space-y-3 border-t border-white/[0.07]">
          {children}
        </div>
      )}
    </div>
  )
}
