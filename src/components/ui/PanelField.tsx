/**
 * 侧边栏配置面板的通用字段组件
 * 基于 @headlessui/react 的 Field / Fieldset / Label / Description
 * 风格：深色背景 + 白色标签 + 灰色说明文字
 */
import {
  Field, Fieldset, Label, Description,
  Input, Select, Textarea,
  Disclosure, DisclosureButton, DisclosurePanel,
} from '@headlessui/react'

// headlessui v2 没有独立 Legend，用原生 legend 包装
function Legend({ children, className }: { children: React.ReactNode; className?: string }) {
  return <legend className={className}>{children}</legend>
}
import { clsx } from 'clsx'

/* ── 设计 token ── */
const T = {
  label:  'text-xs font-medium text-white/80 select-none',
  desc:   'text-xs text-white/35 mt-0.5 leading-snug',
  input:  [
    'w-full rounded-lg border border-white/10 bg-white/[0.06]',
    'px-3 py-2 text-xs text-white/85 placeholder:text-white/25',
    'focus:outline-none focus:border-white/25 focus:bg-white/[0.09]',
    'transition-colors duration-150',
  ].join(' '),
  select: [
    'w-full rounded-lg border border-white/10 bg-white/[0.06]',
    'px-3 py-2 text-xs text-white/85',
    'focus:outline-none focus:border-white/25',
    'transition-colors duration-150',
  ].join(' '),
}

/* ── Field 行（label + input）── */
interface PanelFieldProps {
  label: string
  desc?: string
  children: React.ReactNode
  horizontal?: boolean  // label 和 input 横排
}
export function PF({ label, desc, children, horizontal }: PanelFieldProps) {
  return (
    <Field className={clsx('space-y-1', horizontal && 'flex items-center gap-3 space-y-0')}>
      <div className={horizontal ? 'w-20 shrink-0' : undefined}>
        <Label className={T.label}>{label}</Label>
        {desc && !horizontal && <Description className={T.desc}>{desc}</Description>}
      </div>
      <div className={horizontal ? 'flex-1' : undefined}>{children}</div>
    </Field>
  )
}

/* ── 文本输入 ── */
export function PanelInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} className={clsx(T.input, props.className)} />
}

/* ── 下拉选择 ── */
export function PanelSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Select {...props} className={clsx(T.select, props.className)}>
      {props.children}
    </Select>
  )
}

/* ── 多行文本 ── */
export function PanelTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <Textarea {...props} className={clsx(T.input, 'resize-none', props.className)} />
}

/* ── Fieldset 分组（带标题和描述）── */
interface PanelSectionProps {
  legend: string
  desc?: string
  children: React.ReactNode
  className?: string
}
export function PanelSection({ legend, desc, children, className }: PanelSectionProps) {
  return (
    <Fieldset className={clsx('space-y-3', className)}>
      <div>
        <Legend className="text-xs font-semibold text-white/90">{legend}</Legend>
        {desc && <Description className={T.desc}>{desc}</Description>}
      </div>
      {children}
    </Fieldset>
  )
}

/* ── 可折叠分组（带红点 + 徽章）── */
interface DisclosureGroupProps {
  title: string
  badge?: string
  defaultOpen?: boolean
  children: React.ReactNode
}
export function DisclosureGroup({ title, badge, defaultOpen = false, children }: DisclosureGroupProps) {
  return (
    <Disclosure as="div" defaultOpen={defaultOpen}
      className="border-b border-white/[0.07]">
      {({ open }) => (
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
              className={clsx('w-3 h-3 text-white/30 transition-transform duration-200 shrink-0', open ? '' : '-rotate-90')}
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

/* ── 颜色选择行（label + color picker）── */
interface ColorFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}
export function ColorField({ label, value, onChange }: ColorFieldProps) {
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

