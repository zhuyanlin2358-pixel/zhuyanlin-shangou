/**
 * 老虎机配置子组件（共享）
 * 同时被 SlotPanel（左侧面板）和 SlotPage（行内配置区）使用
 */
import { useRef, useState, useEffect } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { useSlot, SLOT_PRESETS } from '@/contexts/SlotContext'
import { useVenue } from '@/contexts/VenueContext'
import type { PrizeType, PrizeConfig } from '@/types'
import {
  PF, PanelInput,
  ColorField,
} from '@/components/ui/PanelField'

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
      {/* 配色预设（按会场背景色智能推荐） */}
      <div>
        <div className="text-[12px] font-medium text-white/40 mb-1.5">
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
      <div className="text-[12px] text-white/35 leading-relaxed">跟随老虎机激活按钮配色</div>
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
      <div className="text-[12px] text-white/35 leading-relaxed">跟随老虎机主题背景色</div>
      <div style={{ height:48, borderRadius:10, background:`linear-gradient(120deg,${config.slotTintFrom},${config.slotTintTo})` }} />
      <ColorField label="背景起始色" value={config.slotTintFrom} onChange={c => setConfig({ slotTintFrom: c })} />
      <ColorField label="背景结束色" value={config.slotTintTo}   onChange={c => setConfig({ slotTintTo: c })} />
    </div>
  )
}

/* ── 奖品图设置（Section 6 下方）── */
const PRIZE_TYPE_OPTS: { value: PrizeType; label: string }[] = [
  { value: 'product-tag',    label: '产品+标签' },
  { value: 'product-dashed', label: '产品图'   },
  { value: 'amount',         label: '金额券'   },
  { value: 'thanks',         label: '谢谢参与' },
]

/* ── 奖品类型弹出选择器（fixed 定位，不被父层 overflow 裁剪）── */
function TypePopover({ type, onChange }: { type: PrizeType; onChange: (t: PrizeType) => void }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const label = PRIZE_TYPE_OPTS.find(o => o.value === type)?.label ?? type

  const handleToggle = () => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 6, left: r.left })
    setOpen(o => !o)
  }

  useEffect(() => {
    if (!open) return
    const fn = (e: MouseEvent) => {
      if (dropRef.current?.contains(e.target as Node)) return
      if (btnRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [open])

  return (
    <>
      <button ref={btnRef} onClick={handleToggle} style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 9px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
        background: open ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.65)',
        border: '1px solid rgba(255,255,255,0.14)',
        transition: 'background 0.12s',
      }}>
        {label}
        <svg width="8" height="8" viewBox="0 0 16 16" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }}>
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>

      {open && (
        <div ref={dropRef} style={{
          position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999,
          padding: 5, borderRadius: 12,
          background: '#141520',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.65)',
          minWidth: 128,
        }}>
          {PRIZE_TYPE_OPTS.map(opt => {
            const active = type === opt.value
            return (
              <button key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', textAlign: 'left',
                  padding: '8px 10px', borderRadius: 8,
                  fontSize: 12.5, cursor: 'pointer', border: 'none',
                  background: active ? 'rgba(250,217,0,0.1)' : 'transparent',
                  color: active ? '#fad900' : 'rgba(255,255,255,0.65)',
                  fontWeight: active ? 600 : 400,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: active ? '#fad900' : 'rgba(255,255,255,0.18)',
                }}/>
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

/* 行内字段标签（比 PF 更轻量）*/
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 5 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export function PrizeBlock({ idx, prize, onChange, onImgChange, onDelete }: {
  idx: number; prize: PrizeConfig
  onChange: (p: Partial<PrizeConfig>) => void
  onImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDelete?: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const showImg    = prize.type === 'product-tag' || prize.type === 'product-dashed'
  const showAmount = prize.type === 'amount'
  const showThanks = prize.type === 'thanks'

  return (
    <div style={{ paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      className="last:border-b-0 last:pb-0">

      {/* 标题行：奖品图 N · [类型下拉] · 删除 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
            奖品图 {idx + 1}
          </div>
          <TypePopover type={prize.type} onChange={t => onChange({ type: t })} />
        </div>
        {onDelete && (
          <button onClick={onDelete}
            style={{ fontSize: 10, color: 'rgba(239,68,68,0.7)', background: 'rgba(239,68,68,0.08)',
              border: 'none', borderRadius: 4, padding: '2px 9px', cursor: 'pointer' }}>
            删除
          </button>
        )}
      </div>

      {/* 顶部标签：产品图（product-dashed）不带标签，其余类型显示 */}
      {!showThanks && prize.type !== 'product-dashed' && (
        <FieldRow label="顶部标签">
          <PanelInput value={prize.tag} onChange={e => onChange({ tag: e.target.value })} placeholder="如：无门槛优惠券" />
        </FieldRow>
      )}

      {/* 产品图：缩略图 + 白底黑字上传按钮 */}
      {showImg && (
        <FieldRow label="产品图">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* 缩略图 */}
            <div style={{
              width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {prize.imageUrl
                ? <img src={prize.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l5-5 4 4 3-3 6 6"/></svg>
              }
            </div>
            {/* 白底黑字上传按钮 */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: '#ffffff', color: '#111111', border: 'none',
                cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f0f0f0'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#ffffff'}
            >
              {prize.imageUrl ? '更换图片' : '↑ 上传图片'}
            </button>
            {prize.imageUrl && (
              <span style={{ fontSize: 10, color: 'rgba(34,197,94,0.9)', fontWeight: 600 }}>✓</span>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImgChange} />
        </FieldRow>
      )}

      {showAmount && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <FieldRow label="金额"><PanelInput value={prize.amount} onChange={e => onChange({ amount: e.target.value })} placeholder="30" /></FieldRow>
          <FieldRow label="单位"><PanelInput value={prize.unit}   onChange={e => onChange({ unit:   e.target.value })} placeholder="元" /></FieldRow>
        </div>
      )}
      {showThanks && (
        <FieldRow label="大字文案">
          <PanelInput value={prize.thanksText} onChange={e => onChange({ thanksText: e.target.value })} placeholder="谢谢参与" />
        </FieldRow>
      )}
      {!showThanks && (
        <FieldRow label="底部文字">
          <PanelInput value={prize.bottomText} onChange={e => onChange({ bottomText: e.target.value })} placeholder="如：迪奥口红免单券" />
        </FieldRow>
      )}
    </div>
  )
}

/* ── 奖品图配置整体（Section 6 下方 / 会场面板奖品区）── */
export function SlotPrizeConfig() {
  const { config, setPrize, addPrize, removePrize } = useSlot()

  const handlePrizeImg = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPrize(idx, { imageUrl: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {/* 顶部：数量 + 增加 */}
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
          共 {config.prizes.length} 张奖品图
        </span>
        <button onClick={addPrize}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg"
          style={{ background: 'rgba(250,217,0,0.1)', color: '#fad900',
            border: '1px solid rgba(250,217,0,0.2)', cursor: 'pointer' }}>
          <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10"/>
          </svg>
          增加奖品图
        </button>
      </div>

      <div className="space-y-4">
        {config.prizes.map((prize, idx) => (
          <PrizeBlock key={idx} idx={idx} prize={prize}
            onChange={patch => setPrize(idx, patch)}
            onImgChange={handlePrizeImg(idx)}
            onDelete={config.prizes.length > 1 ? () => removePrize(idx) : undefined}
          />
        ))}
      </div>
    </div>
  )
}

/* ── 行内配置容器（折叠面板，干净卡片风格）── */
export function InlineConfigSection({
  label, badge, defaultOpen = true, children,
}: { label: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
      >
        <ChevronDown size={11}
          style={{ color: 'rgba(255,255,255,0.3)', transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.18s', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{label}</span>
        {badge && (
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {children}
        </div>
      )}
    </div>
  )
}
