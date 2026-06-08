/**
 * 侧边栏配置面板通用字段组件
 * Input / Textarea 用 Headless UI v2（data-[focus]/data-[hover] 状态）
 */
import { useRef, useState, useEffect } from 'react'
import {
  Input,
  Disclosure, DisclosureButton, DisclosurePanel,
  Listbox, ListboxButton, ListboxOptions, ListboxOption,
} from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'
import { clsx } from 'clsx'

/* ── 输入框基础样式 ── */
const inputBase = [
  'w-full rounded-lg px-3 py-2 text-xs',
  'border border-white/10 bg-white/[0.06]',
  'text-white/85 placeholder:text-white/25',
  'outline-none',
  'data-[focus]:border-white/30 data-[focus]:bg-white/[0.09]',
  'data-[hover]:border-white/18',
  'transition-colors duration-150',
].join(' ')

/* ── 字段行：label + 可选说明 + 子内容 ── */
export function PF({
  label, desc, children, horizontal,
}: {
  label: string
  desc?: string
  children: React.ReactNode
  horizontal?: boolean
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

/* ── 文本输入（带 IME composition 保护，解决中文输入卡顿）── */
export function PanelInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, value, onChange, ...rest } = props

  // 本地 state：输入法组合阶段只更新本地，不触发全局 setConfig
  const [local, setLocal] = useState(value ?? '')
  const composing = useRef(false)

  // 外部 value 变化时同步（如重置、preset 切换等）
  useEffect(() => {
    if (!composing.current) setLocal(value ?? '')
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocal(e.target.value)
    if (!composing.current) onChange?.(e)
  }

  const handleCompositionStart = () => { composing.current = true }

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    composing.current = false
    // 组合结束（选字完成）时同步到全局
    const synth = { ...e, target: e.target, currentTarget: e.currentTarget } as unknown as React.ChangeEvent<HTMLInputElement>
    onChange?.(synth)
  }

  return (
    <Input
      {...(rest as React.ComponentPropsWithoutRef<typeof Input>)}
      value={local}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
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

/* ── 自定义下拉（Headless UI Listbox）── */
export function PanelListbox<T extends string>({
  value, onChange, options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
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

/* ── 多行文本（带 IME 保护）── */
export function PanelTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { value, onChange, className, ...rest } = props
  const [local, setLocal] = useState(value ?? '')
  const composing = useRef(false)
  useEffect(() => { if (!composing.current) setLocal(value ?? '') }, [value])
  return (
    <textarea
      {...rest}
      value={local}
      className={clsx(inputBase, 'resize-none', className)}
      onChange={e => { setLocal(e.target.value); if (!composing.current) onChange?.(e) }}
      onCompositionStart={() => { composing.current = true }}
      onCompositionEnd={e => {
        composing.current = false
        onChange?.(e as unknown as React.ChangeEvent<HTMLTextAreaElement>)
      }}
    />
  )
}

/* ── 分组标题区 ── */
export function PanelSection({
  legend, desc, children, className,
}: {
  legend: string
  desc?: string
  children: React.ReactNode
  className?: string
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

/* ── 可折叠分组（Headless UI Disclosure）── */
export function DisclosureGroup({
  title, badge, defaultOpen = false, children,
}: {
  title: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
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

/* ── 颜色选择行：彩色色块 + 可编辑 Hex 文本框 ── */
export function ColorField({
  label, value, onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const handleHex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v)
  }

  return (
    <PF label={label} horizontal>
      <div className="flex items-center gap-2">
        {/* 彩色色块：点击打开 picker，onInput 保证拖动时实时更新 */}
        <label className="relative w-6 h-6 rounded-md cursor-pointer flex-shrink-0 overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.15)' }}>
          <div className="w-full h-full" style={{ background: value }} />
          <input
            type="color" value={value}
            onInput={e => onChange((e.target as HTMLInputElement).value)}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
        {/* 可编辑 Hex 文本框 */}
        <Input
          value={value}
          onChange={handleHex}
          maxLength={7}
          placeholder="#RRGGBB"
          className={clsx(
            'flex-1 min-w-0 rounded-lg px-2 py-1.5 text-xs font-mono',
            'border border-white/10 bg-white/[0.06]',
            'text-white/65 placeholder:text-white/20',
            'outline-none data-[focus]:border-white/30 data-[focus]:bg-white/[0.09]',
            'data-[hover]:border-white/18 transition-colors duration-150',
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
