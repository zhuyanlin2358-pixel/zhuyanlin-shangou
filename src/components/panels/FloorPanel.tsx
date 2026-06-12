/**
 * 楼层条配置面板（读写 FloorContext）
 * 注意：所有子组件必须定义在模块顶层，不得在 FloorPanel 函数体内嵌套，避免 re-mount 导致失焦。
 */
import {
  PF, PanelInput, ColorField, DisclosureGroup,
} from '@/components/ui/PanelField'
import {
  type FloorConfig, type FloorVariant,
} from '@/types'
import { useFloor } from '@/contexts/FloorContext'

// ── 款式选项（模块顶层常量）────────────────────────────────────────────────
const VARIANT_OPTIONS: { value: FloorVariant; label: string; sub: string }[] = [
  { value: 'dachao',    label: '大促款',   sub: '金橙渐变 · 深红文字 · 装饰图形' },
  { value: 'valentine', label: '情人节款', sub: '粉色底 · 玫红文字' },
  { value: 'newyear',   label: '年货节款', sub: '红色底 · 白色文字' },
  { value: 'custom',    label: '自定义',   sub: '自由配色，不受限于预设' },
]

// ── 组件 ─────────────────────────────────────────────────────────────────────
export default function FloorPanel() {
  const { config, setConfig, applyVariant } = useFloor()

  const set = <K extends keyof FloorConfig>(key: K, val: FloorConfig[K]) =>
    setConfig({ ...config, [key]: val })

  return (
    <div className="py-1">

      {/* ① 款式选择 */}
      <DisclosureGroup title="款式选择" defaultOpen>
        <div className="px-4 pb-3 space-y-1.5">
          {VARIANT_OPTIONS.map(opt => (
            <VariantOption
              key={opt.value}
              opt={opt}
              active={config.variant === opt.value}
              onSelect={() => applyVariant(opt.value)}
            />
          ))}
        </div>
      </DisclosureGroup>

      {/* ② 背景配色 */}
      <DisclosureGroup title="背景配色" defaultOpen>
        <div className="px-4 pb-3 space-y-3">
          <ColorField label="起色" value={config.bgFrom} onChange={v => set('bgFrom', v)} />
          <ColorField label="终色" value={config.bgTo}   onChange={v => set('bgTo', v)} />
          <p className="text-[10px] text-white/30 leading-snug">
            起色 = 终色时为纯色底；不同时为横向渐变
          </p>
        </div>
      </DisclosureGroup>

      {/* ③ 文案设置 */}
      <DisclosureGroup title="文案设置" defaultOpen>
        <div className="px-4 pb-3 space-y-3">
          <PF label="楼层文案">
            <PanelInput
              value={config.text}
              onChange={e => set('text', e.target.value)}
              placeholder="请填写文案"
              maxLength={20}
            />
          </PF>
          <ColorField label="文字颜色" value={config.textColor} onChange={v => set('textColor', v)} />
        </div>
      </DisclosureGroup>

      {/* ④ 装饰图形 */}
      <DisclosureGroup title="装饰图形" badge={config.showDeco ? '开' : '关'}>
        <div className="px-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/55">显示两侧装饰</span>
            <button
              onClick={() => set('showDeco', !config.showDeco)}
              className="relative w-9 h-5 rounded-full transition-colors"
              style={{ background: config.showDeco ? '#FF5050' : 'rgba(255,255,255,0.1)' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: config.showDeco ? '18px' : '2px' }}
              />
            </button>
          </div>
          {config.showDeco && (
            <>
              <ColorField label="色①（闪电形）" value={config.decoColor1} onChange={v => set('decoColor1', v)} />
              <ColorField label="色②（双燕形）" value={config.decoColor2} onChange={v => set('decoColor2', v)} />
              <p className="text-[10px] text-white/30 leading-snug">
                原版：闪电 #FFCA60（金黄），双燕 #FF7399（粉色）
              </p>
            </>
          )}
        </div>
      </DisclosureGroup>

    </div>
  )
}

// ── 单个款式选项（模块顶层，防止 re-mount）────────────────────────────────
function VariantOption({
  opt, active, onSelect,
}: {
  opt: { value: FloorVariant; label: string; sub: string }
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all"
      style={{
        border: `1px solid ${active ? '#FF5050' : 'rgba(255,255,255,0.08)'}`,
        background: active ? 'rgba(255,80,80,0.06)' : 'rgba(255,255,255,0.02)',
      }}
    >
      <span
        className="mt-0.5 w-3 h-3 rounded-full border shrink-0 flex items-center justify-center"
        style={{
          borderColor: active ? '#FF5050' : 'rgba(255,255,255,0.3)',
          background: active ? '#FF5050' : 'transparent',
        }}
      >
        {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
      <div>
        <div className="text-xs font-medium text-white/80">{opt.label}</div>
        <div className="text-[10px] text-white/35 mt-0.5">{opt.sub}</div>
      </div>
    </button>
  )
}
