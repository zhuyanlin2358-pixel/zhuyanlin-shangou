import { useRef, useState } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { useSlot, SLOT_PRESETS } from '@/contexts/SlotContext'
import type { PrizeType, PrizeConfig } from '@/types'
import {
  PF, PanelInput, PanelSection,
  ColorField, PanelListbox,
} from '@/components/ui/PanelField'
import { SLOT_STYLE_LIST } from '@/utils/slotStyles'

/* ── 配色预设（全部来自 Figma API 精确色值）── */
const LIGHT_PRESETS = ['qinrenfen','dacuhong','huang','ju','lan','lv','qing']
const DARK_PRESETS  = ['nianhuo','zi']
const WARM_PRESETS  = ['qinrenfen','dacuhong','ju']
const PRESET_DOTS: Record<string,string> = {
  qinrenfen: '#F952FF',
  dacuhong:  '#FF3048',
  huang:     '#FFECAD',
  ju:        '#FF7632',
  lan:       '#88F4FE',
  lv:        '#46E800',
  qing:      '#46E800',
  nianhuo:   '#FF5F5F',
  zi:        '#6E4BC3',
}

const BG_SWATCHES_LIGHT = ['#ffdceb','#ffdcdc','#d9f8ff','#efe9ff','#f9fed2','#fff6a8','#ffe3c7']
const BG_SWATCHES_PROMO = ['#ff1d5e','#ff0000','#ffdf04']
const BG_SWATCHES_DARK  = ['#331200','#000679']

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
  { value: 'product-dashed', label: '产品图' },
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
        className="w-full py-1.5 rounded-lg text-xs border border-white/10 text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1.5"
      >
        <RotateCcw size={11} className="shrink-0" />重置位置与大小
      </button>
    </div>
  )
}

/* ── 手风琴 section（必须在组件外定义，否则每次 re-render 创建新函数引用导致 unmount/remount，输入框失焦）── */
function Section({
  id, badge, children, openSection, toggle,
}: { id: string; badge?: string; children: React.ReactNode; openSection: string; toggle: (s: string) => void }) {
  return (
    <div>
      <AccordionHeader title={id} badge={badge} open={openSection === id} onClick={() => toggle(id)} />
      {openSection === id && (
        <div className="px-4 py-3 space-y-3 border-b border-white/[0.07]">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── 手风琴 section 头 ── */
function AccordionHeader({
  title, badge, open, onClick,
}: { title: string; badge?: string; open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-colors border-b border-white/[0.07]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-400/70 shrink-0" />
      <span className="flex-1 text-xs font-medium text-white/80">{title}</span>
      {badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.07] text-white/35 shrink-0">
          {badge}
        </span>
      )}
      <ChevronDown size={13} className={`text-white/25 transition-transform duration-200 shrink-0 ${open ? '' : '-rotate-90'}`} />
    </button>
  )
}

/** 简单亮度检测：返回 0（纯黑）~1（纯白） */
function hexLuminance(hex: string): number {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return 0.5
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/* ── 主面板 ── */
export default function SlotPanel() {
  const { config, activePreset, setConfig, applyPreset, setPrize } = useSlot()
  const [openSection, setOpenSection] = useState<string>('配色预设')

  const toggle = (s: string) => setOpenSection(prev => prev === s ? '' : s)

  // 根据会场背景色决定推荐哪组配色预设
  const darkBgSet  = new Set(BG_SWATCHES_DARK)
  const promoBgSet = new Set(BG_SWATCHES_PROMO)
  const lightBgSet = new Set(BG_SWATCHES_LIGHT)
  const bgTone = darkBgSet.has(config.bgColor)  ? 'dark'
               : promoBgSet.has(config.bgColor) ? 'promo'
               : lightBgSet.has(config.bgColor) ? 'light'
               : hexLuminance(config.bgColor) < 0.35 ? 'dark' : 'light'  // 自定义颜色按亮度自动判断

  const handlePrizeImg = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPrize(idx, { imageUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {/* 组件标题 */}
      <div className="px-4 py-3.5 border-b border-white/[0.07]">
        <span className="text-sm font-semibold text-white/90 tracking-tight">老虎机</span>
      </div>

      {/* 风格选择 */}
      <div className="px-4 py-3 border-b border-white/[0.07]">
        <div className="text-[10.5px] font-medium text-white/40 tracking-[0.25px] mb-2">风格版本</div>
        <div className="flex flex-wrap gap-1.5">
          {SLOT_STYLE_LIST.filter(s => s.id !== 'minimal').map(style => {
            const isActive = config.slotStyle === style.id
            return (
              <button
                key={style.id}
                onClick={() => setConfig({ slotStyle: style.id })}
                className="px-3 py-1 rounded-full text-xs border transition-all"
                style={{
                  borderColor: isActive ? 'rgba(255,48,96,0.6)' : 'rgba(255,255,255,0.1)',
                  background:  isActive ? 'rgba(255,48,96,0.12)' : 'rgba(255,255,255,0.04)',
                  color:       isActive ? '#FF8FAA' : 'rgba(255,255,255,0.45)',
                  fontWeight:  isActive ? 600 : 400,
                }}
              >
                {style.label}
              </button>
            )
          })}
        </div>
      </div>

      <Section id="配色预设" badge="素材 1–5" openSection={openSection} toggle={toggle}>
        {bgTone === 'dark' && (
          <PF label="推荐 · 深色系">
            <PresetGrid keys={DARK_PRESETS} active={activePreset} onSelect={applyPreset} />
          </PF>
        )}
        {bgTone === 'light' && (
          <PF label="推荐 · 浅色系">
            <PresetGrid keys={LIGHT_PRESETS} active={activePreset} onSelect={applyPreset} />
          </PF>
        )}
        {bgTone === 'promo' && (
          <PF label="推荐 · 同色系">
            <PresetGrid keys={WARM_PRESETS} active={activePreset} onSelect={applyPreset} />
          </PF>
        )}
      </Section>

      <Section id="会场背景色" badge="预览面板" openSection={openSection} toggle={toggle}>
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
      </Section>

      <Section id="文案设置" badge="素材 2" openSection={openSection} toggle={toggle}>
        <PF label="主标题文案">
          <PanelInput value={config.titleText} onChange={e => setConfig({ titleText: e.target.value })} placeholder="天天抽免单" />
        </PF>
        <ColorField label="标题文字色" value={config.titleColor} onChange={c => setConfig({ titleColor: c })} />
      </Section>

      <Section id="空态页设置" badge="素材 3" openSection={openSection} toggle={toggle}>
        <EmptySection />
      </Section>

      <Section id="奖品图设置" badge="素材 6" openSection={openSection} toggle={toggle}>
        <div className="space-y-4">
          {config.prizes.map((prize, idx) => (
            <PrizeBlock
              key={idx} idx={idx} prize={prize}
              onChange={patch => setPrize(idx, patch)}
              onImgChange={handlePrizeImg(idx)}
            />
          ))}
        </div>
      </Section>

      {/* ── 老虎机弹窗 父标题 ── */}
      <div className="px-4 py-3.5 border-t border-b border-white/[0.07] mt-1">
        <span className="text-sm font-semibold text-white/90 tracking-tight">老虎机弹窗</span>
      </div>

      <Section id="弹窗按钮配色" badge="素材 7" openSection={openSection} toggle={toggle}>
        <div className="text-[11px] text-white/35 leading-relaxed mb-1">
          跟随老虎机激活按钮配色
        </div>
        <div style={{ height: 40, borderRadius: 20, background: `linear-gradient(90deg, ${config.btnActiveFrom}, ${config.btnActiveTo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', marginBottom: 8 }}>
          弹窗按钮预览
        </div>
        <ColorField label="渐变起始色" value={config.btnActiveFrom} onChange={c => setConfig({ btnActiveFrom: c })} />
        <ColorField label="渐变结束色" value={config.btnActiveTo} onChange={c => setConfig({ btnActiveTo: c })} />
      </Section>

      <Section id="弹窗结果页配色" badge="素材 8" openSection={openSection} toggle={toggle}>
        <div className="text-[11px] text-white/35 leading-relaxed mb-1">
          跟随老虎机主题背景色
        </div>
        <div style={{ height: 48, borderRadius: 10, background: `linear-gradient(120deg, ${config.slotTintFrom}, ${config.slotTintTo})`, marginBottom: 8 }} />
        <ColorField label="背景起始色" value={config.slotTintFrom} onChange={c => setConfig({ slotTintFrom: c })} />
        <ColorField label="背景结束色" value={config.slotTintTo} onChange={c => setConfig({ slotTintTo: c })} />
      </Section>
    </div>
  )
}
