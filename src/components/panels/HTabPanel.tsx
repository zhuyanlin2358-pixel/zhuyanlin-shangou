import { useHTab } from '@/contexts/HTabContext'
import { H_TAB_COLORS, type HTabColorKey } from '@/types'
import { DisclosureGroup } from '@/components/ui/PanelField'

const COLOR_KEYS = Object.keys(H_TAB_COLORS) as HTabColorKey[]

export default function HTabPanel() {
  const { config, setColor } = useHTab()

  return (
    <div className="py-1">

      {/* 配色选择 */}
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
                <span
                  className="w-5 h-5 rounded-full shrink-0"
                  style={{ background: def.inactiveBg, boxShadow: '0 0 0 1.5px rgba(255,255,255,0.2)' }}
                />
                <span className="text-xs text-white/80">{def.name}</span>
                {active && <span className="ml-auto text-[10px] text-red-400">当前</span>}
              </button>
            )
          })}
        </div>
      </DisclosureGroup>

    </div>
  )
}
