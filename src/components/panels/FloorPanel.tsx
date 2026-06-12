/**
 * 楼层条配置面板（读写 FloorContext）
 * 注意：所有子组件必须定义在模块顶层，不得在 FloorPanel 函数体内嵌套，避免 re-mount 导致失焦。
 */
import {
  PF, PanelInput, ColorField, DisclosureGroup,
} from '@/components/ui/PanelField'
import {
  type FloorConfig, type FloorVariant, type FloorDecoStyle,
} from '@/types'
import { useFloor } from '@/contexts/FloorContext'

// ── 款式选项 ─────────────────────────────────────────────────────────────────
const VARIANT_OPTIONS: { value: FloorVariant; label: string; sub: string }[] = [
  { value: 'dachao',    label: '大促款',   sub: '橙色底 · 深红文字 · 箭头装饰' },
  { value: 'valentine', label: '情人节款', sub: '粉色底 · 玫红文字 · 爱心装饰' },
  { value: 'newyear',   label: '年货节款', sub: '红色底 · 白色文字 · 钱币装饰' },
  { value: 'custom',    label: '自定义',   sub: '自由配色，不受限于预设' },
]

// ── 装饰样式选项 ──────────────────────────────────────────────────────────────
const DECO_STYLE_OPTIONS: { value: FloorDecoStyle; label: string }[] = [
  { value: 'arrow', label: '箭头形（大促）' },
  { value: 'heart', label: '爱心（情人节）' },
  { value: 'coin',  label: '钱币（年货节）' },
]

// ── 主面板 ───────────────────────────────────────────────────────────────────
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
          {/* 透明背景开关 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/55">透明背景（无底色）</span>
            <button
              onClick={() => set('bgTransparent', !config.bgTransparent)}
              className="relative w-9 h-5 rounded-full transition-colors"
              style={{ background: config.bgTransparent ? '#FF5050' : 'rgba(255,255,255,0.1)' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: config.bgTransparent ? '18px' : '2px' }}
              />
            </button>
          </div>

          {/* 底色（透明时隐藏） */}
          {!config.bgTransparent && (
            <ColorField
              label="背景色"
              value={config.bgColor}
              onChange={v => set('bgColor', v)}
            />
          )}
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
          <ColorField
            label="文字颜色"
            value={config.textColor}
            onChange={v => set('textColor', v)}
          />
        </div>
      </DisclosureGroup>

      {/* ④ 装饰图形 */}
      <DisclosureGroup title="装饰图形" badge={config.showDeco ? '开' : '关'}>
        <div className="px-4 pb-3 space-y-3">
          {/* 开关 */}
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
              {/* 装饰样式 */}
              <PF label="装饰样式">
                <div className="flex gap-1.5 flex-wrap">
                  {DECO_STYLE_OPTIONS.map(opt => (
                    <DecoStyleBtn
                      key={opt.value}
                      opt={opt}
                      active={config.decoStyle === opt.value}
                      onSelect={() => set('decoStyle', opt.value)}
                    />
                  ))}
                </div>
              </PF>

              {/* 装饰颜色 */}
              <ColorField
                label={config.decoStyle === 'arrow' ? '色①（闪电形）' : '装饰颜色'}
                value={config.decoColor1}
                onChange={v => set('decoColor1', v)}
              />
              {config.decoStyle === 'arrow' && (
                <ColorField
                  label="色②（双燕形）"
                  value={config.decoColor2}
                  onChange={v => set('decoColor2', v)}
                />
              )}
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

// ── 装饰样式按钮（模块顶层）────────────────────────────────────────────────
function DecoStyleBtn({
  opt, active, onSelect,
}: {
  opt: { value: FloorDecoStyle; label: string }
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className="px-2.5 py-1 text-[10.5px] rounded-md transition-all"
      style={{
        border: `1px solid ${active ? '#FF5050' : 'rgba(255,255,255,0.12)'}`,
        background: active ? 'rgba(255,80,80,0.10)' : 'rgba(255,255,255,0.03)',
        color: active ? '#FF8080' : 'rgba(255,255,255,0.5)',
      }}
    >
      {opt.label}
    </button>
  )
}
