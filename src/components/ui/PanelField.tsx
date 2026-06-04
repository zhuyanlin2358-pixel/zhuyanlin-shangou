/**
 * 侧边栏配置面板通用字段组件
 * Disclosure / Listbox 用 Headless UI（有动画），其余字段用原生 HTML
 */
import {
  Disclosure, DisclosureButton, DisclosurePanel,
  Listbox, ListboxButton, ListboxOptions, ListboxOption,
} from '@headlessui/react'
import { clsx } from 'clsx'

/* ── 输入框样式 ── */
const inputCls = [
  'w-full rounded-lg px-3 py-2 text-xs',
  'border border-white/10 bg-white/[0.06]',
  'text-white/85 placeholder:text-white/25',
  'focus:outline-none focus:border-white/25 focus:bg-white/[0.09]',
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
        <span className="w-20 shrink-0 text-xs font-medium text-white/75">{label}</span>
        <div className="flex-1">{children}</div>
      </div>
    )
  }
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-white/75 block">{label}</label>
      {desc && <p className="text-xs text-white/35 leading-snug">{desc}</p>}
      {children}
    </div>
  )
}

/* ── 文本输入 ── */
export function PanelInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputCls, props.className)} />
}

/* ── 原生下拉（保留备用，不推荐新增使用） ── */
export function PanelSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={clsx(inputCls, props.className)}>
      {props.children}
    </select>
  )
}

/* ── 自定义下拉（Headless UI Listbox，样式与面板统一）── */
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
        <ListboxButton
          className={clsx(
            inputCls,
            'flex items-center justify-between cursor-pointer text-left',
          )}
        >
          <span>{selected?.label}</span>
          <svg className="w-3 h-3 text-white/30 shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M2 4l4 4 4-4" />
          </svg>
        </ListboxButton>
        <ListboxOptions
          className={clsx(
            'absolute z-50 mt-1 w-full rounded-lg py-1',
            'border border-white/10 bg-[#1a1f2e] shadow-xl',
            'focus:outline-none',
          )}
        >
          {options.map(opt => (
            <ListboxOption
              key={opt.value}
              value={opt.value}
              className={({ focus }: { focus: boolean }) =>
                clsx(
                  'flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors',
                  focus ? 'bg-white/[0.07] text-white/90' : 'text-white/65',
                )
              }
            >
              <span className="w-3 h-3 shrink-0 flex items-center justify-center">
                {opt.value === value && (
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 text-red-400">
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                )}
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
  return <textarea {...props} className={clsx(inputCls, 'resize-none', props.className)} />
}

/* ── 分组标题区（legend + desc） ── */
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
        <div className="text-xs font-semibold text-white/90">{legend}</div>
        {desc && <p className="text-xs text-white/35 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

/* ── 可折叠分组（Headless UI Disclosure + 动画箭头）── */
export function DisclosureGroup({
  title, badge, defaultOpen = false, children,
}: {
  title: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <Disclosure as="div" defaultOpen={defaultOpen}
      className="border-b border-white/[0.07]">
      {({ open }: { open: boolean }) => (
        <>
          <DisclosureButton className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 shrink-0" />
            <span className="flex-1 text-xs font-medium text-white/80">{title}</span>
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-400/10 text-red-300/70 shrink-0">
                {badge}
              </span>
            )}
            <svg
              className={clsx('w-3 h-3 text-white/30 transition-transform duration-200 shrink-0', !open && '-rotate-90')}
              viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.8}
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
          </DisclosureButton>
          <DisclosurePanel className="px-4 pb-4 space-y-3">
            {children}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  )
}

/* ── 颜色选择行 ── */
export function ColorField({
  label, value, onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <PF label={label} horizontal>
      <div className="flex items-center gap-2">
        <input
          type="color" value={value}
          onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-white/10 bg-transparent"
        />
        <span className="text-xs text-white/35 font-mono">{value}</span>
      </div>
    </PF>
  )
}

/* ── 分割线 ── */
export function Divider() {
  return <hr className="border-white/[0.07] my-1" />
}
