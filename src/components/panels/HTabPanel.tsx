import { useHTab } from '@/contexts/HTabContext'
import { H_TAB_COLORS, type HTabColorKey } from '@/types'
import { PanelInput, DisclosureGroup } from '@/components/ui/PanelField'

const COLOR_KEYS = Object.keys(H_TAB_COLORS) as HTabColorKey[]
const TAB_COUNTS = [2, 3, 4, 5, 6]

export default function HTabPanel() {
  const { config, setColor, setActiveIndex, setTab, setTabCount } = useHTab()

  return (
    <div className="py-1">

      {/* ① 配色 */}
      <DisclosureGroup title="配色选择" defaultOpen>
        <div className="px-4 pb-3 space-y-1.5">
          {COLOR_KEYS.map(k => {
            const def = H_TAB_COLORS[k]
            const active = config.colorKey === k
            return (
              <button
                key={k}
                onClick={() => setColor(k)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
                style={{
                  border: `1px solid ${active ? '#FF5050' : 'rgba(255,255,255,0.08)'}`,
                  background: active ? 'rgba(255,80,80,0.06)' : 'rgba(255,255,255,0.02)',
                }}
              >
                {/* 色块 */}
                <span
                  className="w-5 h-5 rounded-full shrink-0"
                  style={{ background: def.bg, boxShadow: '0 0 0 1.5px rgba(255,255,255,0.2)' }}
                />
                <span className="text-xs text-white/80">{def.name}</span>
                {active && (
                  <span className="ml-auto text-[10px] text-red-400">当前</span>
                )}
              </button>
            )
          })}
        </div>
      </DisclosureGroup>

      {/* ② Tab 数量 */}
      <DisclosureGroup title="Tab 数量" defaultOpen>
        <div className="px-4 pb-3">
          <div className="flex gap-1.5">
            {TAB_COUNTS.map(n => (
              <button
                key={n}
                onClick={() => setTabCount(n)}
                className="flex-1 py-1.5 text-xs rounded-lg transition-all"
                style={{
                  border: `1px solid ${config.tabs.length === n ? '#FF5050' : 'rgba(255,255,255,0.1)'}`,
                  background: config.tabs.length === n ? 'rgba(255,80,80,0.1)' : 'transparent',
                  color: config.tabs.length === n ? '#FF8080' : 'rgba(255,255,255,0.5)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </DisclosureGroup>

      {/* ③ 标签文案 */}
      <DisclosureGroup title="标签文案" defaultOpen>
        <div className="px-4 pb-3 space-y-2">
          {config.tabs.map((tab, i) => (
            <TabInput
              key={i}
              index={i}
              value={tab}
              active={config.activeIndex === i}
              onChange={text => setTab(i, text)}
              onSetActive={() => setActiveIndex(i)}
            />
          ))}
          <p className="text-[10px] text-white/30 leading-snug pt-1">
            点击序号可切换预览中的选中状态
          </p>
        </div>
      </DisclosureGroup>

    </div>
  )
}

// ── 单个标签输入（模块顶层，防止 re-mount）────────────────────────────────
function TabInput({
  index, value, active, onChange, onSetActive,
}: {
  index: number; value: string; active: boolean
  onChange: (v: string) => void; onSetActive: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onSetActive}
        className="w-6 h-6 shrink-0 text-[10px] font-mono rounded-full flex items-center justify-center transition-all"
        style={{
          background: active ? '#FF5050' : 'rgba(255,255,255,0.08)',
          color: active ? '#fff' : 'rgba(255,255,255,0.4)',
        }}
        title="点击设为选中状态"
      >
        {index + 1}
      </button>
      <PanelInput
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`标签 ${index + 1}`}
        maxLength={8}
      />
    </div>
  )
}
