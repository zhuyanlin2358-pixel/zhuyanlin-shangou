import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { COMPONENT_REGISTRY, type ComponentDef } from '@/types'

const PRIORITY_LABELS: Record<string, string> = {
  P0: '核心组件', P1: '标签/素材', P2: '布局组件',
  P3: '营销组件', P4: '功能组件',
}

const grouped = COMPONENT_REGISTRY.reduce<Record<string, ComponentDef[]>>((acc, c) => {
  const p = c.priority
  if (!acc[p]) acc[p] = []
  acc[p].push(c)
  return acc
}, {})

export default function CompBrowser() {
  const { enterComp } = useApp()
  const [query, setQuery] = useState('')

  const filtered = query
    ? COMPONENT_REGISTRY.filter(c =>
        c.label.includes(query) || c.desc.includes(query) || c.id.includes(query)
      )
    : null

  return (
    <div className="flex flex-col h-full">
      {/* 搜索 */}
      <div className="px-3 py-2 border-b border-gray-100">
        <input
          type="text"
          placeholder="搜索组件..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full px-3 py-1.5 text-xs bg-gray-100 rounded-lg outline-none placeholder-gray-400 focus:bg-gray-50 transition-colors"
        />
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto py-2">
        {filtered ? (
          <div className="px-2">
            {filtered.map(c => <CompItem key={c.id} comp={c} onSelect={() => enterComp(c.id)} />)}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-400">未找到组件</div>
            )}
          </div>
        ) : (
          Object.entries(grouped).map(([priority, comps]) => (
            <div key={priority} className="mb-1">
              <div className="px-4 py-1.5 text-xs font-medium text-gray-400 flex items-center gap-2">
                <span className="text-gray-300 font-mono">{priority}</span>
                {PRIORITY_LABELS[priority]}
              </div>
              <div className="px-2">
                {comps.map(c => (
                  <CompItem key={c.id} comp={c} onSelect={() => c.status === 'done' && enterComp(c.id)} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function CompItem({ comp, onSelect }: { comp: ComponentDef; onSelect: () => void }) {
  const isDone = comp.status === 'done'
  return (
    <button
      onClick={onSelect}
      disabled={!isDone}
      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
        isDone
          ? 'hover:bg-gray-100 cursor-pointer'
          : 'opacity-40 cursor-not-allowed'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-800 truncate">{comp.label}</span>
          {!isDone && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded text-[10px] shrink-0">
              即将上线
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 truncate mt-0.5">{comp.desc}</div>
      </div>
      {isDone && <span className="text-gray-300 text-xs shrink-0">›</span>}
    </button>
  )
}
