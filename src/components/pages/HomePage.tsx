import { useApp } from '@/contexts/AppContext'
import { COMPONENT_REGISTRY, type ComponentDef } from '@/types'

const PRIORITY_LABELS: Record<string, { label: string; icon: string }> = {
  P0: { label: '核心组件', icon: '⚡' },
  P1: { label: '标签/素材', icon: '🏷' },
  P2: { label: '布局组件', icon: '📐' },
  P3: { label: '营销组件', icon: '🎯' },
  P4: { label: '功能组件', icon: '⚙️' },
}

const grouped = COMPONENT_REGISTRY.reduce<Record<string, ComponentDef[]>>((acc, c) => {
  if (!acc[c.priority]) acc[c.priority] = []
  acc[c.priority].push(c)
  return acc
}, {})

export default function HomePage() {
  const { enterComp } = useApp()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* AI 预留卡片 */}
      <div
        className="rounded-2xl p-6 mb-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}
      >
        <div className="relative z-10">
          <div className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>即将上线</div>
          <div className="text-xl font-bold text-white mb-1">AI 智能生图</div>
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            描述你的会场主题，AI 自动生成匹配素材
          </div>
        </div>
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 text-5xl opacity-10"
          aria-hidden
        >✨</div>
      </div>

      {/* 分类组件卡片 */}
      {Object.entries(grouped).map(([priority, comps]) => {
        const meta = PRIORITY_LABELS[priority] || { label: priority, icon: '📦' }
        return (
          <div key={priority} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{meta.icon}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{meta.label}</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{priority}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {comps.map(comp => (
                <CompCard key={comp.id} comp={comp} onEnter={() => enterComp(comp.id)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CompCard({ comp, onEnter }: { comp: ComponentDef; onEnter: () => void }) {
  const isDone = comp.status === 'done'
  return (
    <button
      onClick={isDone ? onEnter : undefined}
      disabled={!isDone}
      className={`text-left p-4 rounded-xl border transition-all ${
        isDone
          ? 'hover:border-gray-400 hover:shadow-sm cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
      }`}
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-1)' }}>
        {comp.label}
      </div>
      <div className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
        {comp.desc}
      </div>
      {!isDone && (
        <div className="mt-2 text-xs px-2 py-0.5 rounded inline-block"
          style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)' }}>
          即将上线
        </div>
      )}
    </button>
  )
}
