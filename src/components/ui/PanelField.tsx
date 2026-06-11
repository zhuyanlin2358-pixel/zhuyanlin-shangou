/**
 * 侧边栏配置面板通用字段组件
 */
import { useRef, useEffect, useState, startTransition, useCallback } from 'react'
import {
  Disclosure, DisclosureButton, DisclosurePanel,
  Listbox, ListboxButton, ListboxOptions, ListboxOption,
} from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'
import { clsx } from 'clsx'

const inputBase = [
  'w-full rounded-lg px-3 py-2 text-xs',
  'border border-white/10 bg-white/[0.06]',
  'text-white/85 placeholder:text-white/25',
  'outline-none',
  'focus:border-white/30 focus:bg-white/[0.09]',
  'hover:border-white/[0.18]',
  'transition-colors duration-150',
].join(' ')

/* ── 字段行 ── */
export function PF({
  label, desc, children, horizontal,
}: {
  label: string; desc?: string; children: React.ReactNode; horizontal?: boolean
}) {
  if (horizontal) {
    return (
      <div className="flex items-center gap-3">
        <span className="w-20 shrink-0 text-[10.5px] font-medium text-white/48 tracking-[0.25px]">{label}</span>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    )
  }
  return (
    <div className="space-y-1">
      <label className="text-[10.5px] font-medium text-white/48 block tracking-[0.25px]">{label}</label>
      {desc && <p className="text-[10px] text-white/30 leading-snug">{desc}</p>}
      {children}
    </div>
  )
}

/* ── 文本输入（controlled + IME 保护 + startTransition）── */
export function PanelInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, value, onChange, ...rest } = props
  const [local, setLocal] = useState(String(value ?? ''))
  const composing = useRef(false)
  const extRef = useRef(String(value ?? ''))

  useEffect(() => {
    const ext = String(value ?? '')
    if (ext !== extRef.current && !composing.current) {
      extRef.current = ext
      setLocal(ext)
    }
  }, [value])

  const commit = (val: string) => {
    if (composing.current) return
    extRef.current = val  // 防止 useEffect 重复触发 setLocal
    startTransition(() => {
      onChange?.({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>)
    })
  }

  return (
    <input
      {...rest}
      value={local}
      onChange={e => { setLocal(e.target.value); commit(e.target.value) }}
      onCompositionStart={() => { composing.current = true }}
      onCompositionEnd={e => {
        composing.current = false
        setLocal(e.currentTarget.value)
        commit(e.currentTarget.value)
      }}
      className={clsx(inputBase, className)}
    />
  )
}

/* ── 原生下拉（保留备用） ── */
export function PanelSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={clsx(inputBase, props.className)}>
      {props.children}
    </select>
  )
}

/* ── 自定义下拉 ── */
export function PanelListbox<T extends string>({
  value, onChange, options,
}: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]
}) {
  const selected = options.find(o => o.value === value) ?? options[0]
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <ListboxButton className={clsx(inputBase, 'flex items-center justify-between cursor-pointer text-left')}>
          <span>{selected?.label}</span>
          <ChevronDown size={12} className="text-white/30 shrink-0" />
        </ListboxButton>
        <ListboxOptions className="absolute z-50 mt-1 w-full rounded-lg py-1 border border-white/10 bg-[#1a1f2e] shadow-xl focus:outline-none">
          {options.map(opt => (
            <ListboxOption
              key={opt.value} value={opt.value}
              className={({ focus }: { focus: boolean }) =>
                clsx('flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors',
                  focus ? 'bg-white/[0.07] text-white/90' : 'text-white/65')
              }
            >
              <span className="w-3 h-3 shrink-0 flex items-center justify-center">
                {opt.value === value && <Check size={12} className="text-red-400" />}
              </span>
              {opt.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}

/* ── 多行文本 ── */
export function PanelTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { value, onChange, className, ...rest } = props
  const [local, setLocal] = useState(String(value ?? ''))
  const composing = useRef(false)
  const extRef = useRef(String(value ?? ''))

  useEffect(() => {
    const ext = String(value ?? '')
    if (ext !== extRef.current && !composing.current) {
      extRef.current = ext
      setLocal(ext)
    }
  }, [value])

  const commit = (val: string) => {
    if (composing.current) return
    extRef.current = val
    startTransition(() => {
      onChange?.({ target: { value: val } } as React.ChangeEvent<HTMLTextAreaElement>)
    })
  }

  return (
    <textarea
      {...rest}
      value={local}
      className={clsx(inputBase, 'resize-none', className)}
      onChange={e => { setLocal(e.target.value); commit(e.target.value) }}
      onCompositionStart={() => { composing.current = true }}
      onCompositionEnd={e => {
        composing.current = false
        setLocal(e.currentTarget.value)
        commit(e.currentTarget.value)
      }}
    />
  )
}

/* ── 分组标题区 ── */
export function PanelSection({
  legend, desc, children, className,
}: {
  legend: string; desc?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={clsx('space-y-3', className)}>
      <div>
        <div className="text-[11.5px] font-semibold text-white/80 tracking-[0.1px]">{legend}</div>
        {desc && <p className="text-[10px] text-white/35 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

/* ── 可折叠分组 ── */
export function DisclosureGroup({
  title, badge, defaultOpen = false, children,
}: {
  title: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode
}) {
  return (
    <Disclosure as="div" defaultOpen={defaultOpen} className="border-b border-white/[0.07]">
      {({ open }: { open: boolean }) => (
        <>
          <DisclosureButton className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 shrink-0" />
            <span className="flex-1 text-xs font-medium text-white/80">{title}</span>
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-400/10 text-red-300/70 shrink-0">{badge}</span>
            )}
            <ChevronDown size={13} className={clsx('text-white/30 transition-transform duration-200 shrink-0', !open && '-rotate-90')} />
          </DisclosureButton>
          <DisclosurePanel className="px-4 pb-4 space-y-3">{children}</DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}

/* ── HSV ↔ Hex 转换工具 ── */
function clamp01(v: number) { return Math.max(0, Math.min(1, v)) }

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h = (h * 60 + 360) % 360
  }
  return { h, s: max > 0 ? d / max : 0, v: max }
}

function hsvToHex(h: number, s: number, v: number): string {
  const i = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s)
  let r = 0, g = 0, b = 0
  switch (i) {
    case 0: r = v; g = t; b = p; break
    case 1: r = q; g = v; b = p; break
    case 2: r = p; g = v; b = t; break
    case 3: r = p; g = q; b = v; break
    case 4: r = t; g = p; b = v; break
    case 5: r = v; g = p; b = q; break
  }
  const h2 = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0')
  return `#${h2(r)}${h2(g)}${h2(b)}`
}

function isValidHex(v: string) { return /^#[0-9A-Fa-f]{6}$/.test(v) }

/* ── 自定义颜色拾色器弹窗（position:fixed 防裁切，拖拽完整支持）── */
function ColorPickerPopup({
  value, onChange, onClose, top, left,
}: {
  value: string; onChange: (v: string) => void; onClose: () => void
  top: number; left: number
}) {
  const [hsv, setHsv] = useState(() =>
    isValidHex(value) ? hexToHsv(value) : { h: 0, s: 1, v: 1 }
  )
  const [hexInput, setHexInput] = useState(value)

  // 外部 value 变化时同步（如预设切换）
  useEffect(() => {
    if (isValidHex(value) && value !== hsvToHex(hsv.h, hsv.s, hsv.v)) {
      setHsv(hexToHsv(value))
      setHexInput(value)
    }
  }, [value]) // eslint-disable-line

  const sbRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'sb' | 'hue' | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  // 更新 HSV 并通知父组件
  const applyHsv = useCallback((h: number, s: number, v: number) => {
    setHsv({ h, s, v })
    const hex = hsvToHex(h, s, v)
    setHexInput(hex)
    onChangeRef.current(hex)
  }, [])

  // 全局 mousemove/mouseup（注册一次，用 functional update 读最新 hsv）
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      if (dragging.current === 'sb' && sbRef.current) {
        const r = sbRef.current.getBoundingClientRect()
        const s = clamp01((e.clientX - r.left) / r.width)
        const v = clamp01(1 - (e.clientY - r.top) / r.height)
        setHsv(prev => {
          const hex = hsvToHex(prev.h, s, v)
          setHexInput(hex); onChangeRef.current(hex)
          return { h: prev.h, s, v }
        })
      }
      if (dragging.current === 'hue' && hueRef.current) {
        const r = hueRef.current.getBoundingClientRect()
        const h = Math.max(0, Math.min(360, ((e.clientX - r.left) / r.width) * 360))
        setHsv(prev => {
          const hex = hsvToHex(h, prev.s, prev.v)
          setHexInput(hex); onChangeRef.current(hex)
          return { ...prev, h }
        })
      }
    }
    const onUp = () => { dragging.current = null }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, []) // 只注册一次，通过 functional update + ref 读最新值

  // 点击外部关闭（drag 时不关闭）
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dragging.current) return
      if (!popupRef.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const hueColor = `hsl(${hsv.h}, 100%, 50%)`
  const curHex = hsvToHex(hsv.h, hsv.s, hsv.v)

  return (
    <div
      ref={popupRef}
      onMouseDown={e => e.stopPropagation()} // 阻止冒泡到外部关闭 handler
      style={{
        position: 'fixed', top, left, zIndex: 2000,
        background: '#fff', borderRadius: 10, overflow: 'visible',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        width: 220, userSelect: 'none',
      }}
    >
      {/* SB 渐变区 */}
      <div
        ref={sbRef}
        onMouseDown={e => {
          e.preventDefault()
          dragging.current = 'sb'
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
          applyHsv(hsv.h, clamp01((e.clientX - r.left) / r.width), clamp01(1 - (e.clientY - r.top) / r.height))
        }}
        style={{
          width: '100%', height: 150, position: 'relative',
          cursor: 'crosshair', borderRadius: '10px 10px 0 0', overflow: 'hidden',
          background: hueColor,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #fff, transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #000)' }} />
        <div style={{
          position: 'absolute',
          left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`,
          width: 14, height: 14, borderRadius: '50%',
          border: '2px solid #fff',
          boxShadow: '0 0 3px rgba(0,0,0,0.5)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          background: curHex,
        }} />
      </div>

      {/* 底部控制区 */}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* 色相滑块 */}
        <div
          ref={hueRef}
          onMouseDown={e => {
            e.preventDefault()
            dragging.current = 'hue'
            const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
            const h = Math.max(0, Math.min(360, ((e.clientX - r.left) / r.width) * 360))
            applyHsv(h, hsv.s, hsv.v)
          }}
          style={{
            position: 'relative', height: 12, borderRadius: 6, cursor: 'pointer',
            background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
          }}
        >
          <div style={{
            position: 'absolute',
            left: `${(hsv.h / 360) * 100}%`, top: '50%',
            width: 18, height: 18, borderRadius: '50%',
            border: '2px solid #fff',
            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
            background: hueColor,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* 预览 + Hex 输入 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: curHex,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
          }} />
          <input
            value={hexInput}
            onChange={e => {
              setHexInput(e.target.value)
              if (isValidHex(e.target.value)) {
                const newHsv = hexToHsv(e.target.value)
                setHsv(newHsv)
                onChangeRef.current(e.target.value)
              }
            }}
            maxLength={7}
            style={{
              flex: 1, padding: '4px 8px', fontSize: 12, fontFamily: 'monospace',
              border: '1px solid #ddd', borderRadius: 6, outline: 'none',
              background: '#fafafa', color: '#333',
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ── 颜色选择行（自定义拾色器，position:fixed 防止被 overflow:auto 裁切）── */
export function ColorField({
  label, value, onChange,
}: {
  label: string; value: string; onChange: (v: string) => void
}) {
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null)
  const swatchRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setPopupPos(null), [])

  const handleSwatchClick = () => {
    if (popupPos) { setPopupPos(null); return }
    const rect = swatchRef.current?.getBoundingClientRect()
    if (rect) setPopupPos({ top: rect.bottom + 6, left: rect.left })
  }

  return (
    <PF label={label} horizontal>
      <div className="flex items-center gap-2">
        {/* 色块 */}
        <div
          ref={swatchRef}
          onClick={handleSwatchClick}
          style={{
            width: 24, height: 24, borderRadius: 6,
            background: value, flexShrink: 0, cursor: 'pointer',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.15)',
          }}
        />
        {popupPos && (
          <ColorPickerPopup
            value={value} onChange={onChange} onClose={close}
            top={popupPos.top} left={popupPos.left}
          />
        )}
        {/* Hex 文本框 */}
        <input
          value={value}
          onChange={e => {
            const v = e.target.value
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v)
          }}
          maxLength={7}
          placeholder="#RRGGBB"
          className={clsx(
            'flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono',
            'border border-white/10 bg-white/[0.06]',
            'text-white/65 placeholder:text-white/20',
            'outline-none focus:border-white/30 focus:bg-white/[0.09]',
            'hover:border-white/18 transition-colors duration-150',
          )}
        />
      </div>
    </PF>
  )
}

/* ── 分割线 ── */
export function Divider() {
  return <hr className="border-white/[0.07] my-1" />
}
