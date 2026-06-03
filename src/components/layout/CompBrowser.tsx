import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { COMPONENT_REGISTRY, type ComponentId, type ComponentDef } from '@/types'

const GROUP_SVG: Record<string, React.ReactNode> = {
  P0: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{ width:18,height:18,flexShrink:0,opacity:0.7 }}>
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
    <path d="M20 2v4M22 4h-4"/><circle cx="4" cy="20" r="2"/>
  </svg>,
  P1: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{ width:18,height:18,flexShrink:0,opacity:0.7 }}>
    <path d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z"/>
    <path d="M12 12v.01"/>
  </svg>,
  P2: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{ width:18,height:18,flexShrink:0,opacity:0.7 }}>
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 0 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <path d="M7 10.754a8 8 0 0 1 10 0"/><path d="M9.5 13.866a4 4 0 0 1 5 .01"/><path d="M12 17h.01"/>
  </svg>,
  P3: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{ width:18,height:18,flexShrink:0,opacity:0.7 }}>
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/>
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/>
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>
  </svg>,
  P4: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{ width:18,height:18,flexShrink:0,opacity:0.7 }}>
    <path d="M10 22V7c0-.6-.4-1-1-1H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-.6-.4-1-1-1H2"/>
    <path d="M15 2H21a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
  </svg>,
  P6: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{ width:18,height:18,flexShrink:0,opacity:0.7 }}>
    <path d="M18,21c0-4.4-3.6-8-8-8s-8,3.6-8,8"/>
    <path d="M18,12c2.2-1.7,2.7-4.8,1-7-.4-.5-.9-1-1.4-1.3"/>
    <path d="M22,20c0-3.4-2-6.5-4-8"/>
    <circle cx="10" cy="8" r="5"/>
  </svg>,
}

export default function CompBrowser() {
  const { enterComp } = useApp()
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ P0: false, P4: false })

  const toggle = (key: string) =>
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  // 搜索过滤
  if (query.trim()) {
    const q = query.toLowerCase()
    const matched = COMPONENT_REGISTRY.flatMap(g => {
      const items = g.subgroups
        ? g.subgroups.flatMap(sg => sg.items)
        : (g.items || [])
      return items.filter(c => c.name.includes(q) || c.id.includes(q))
    })
    return (
      <div className="flex flex-col h-full">
        <SearchBar query={query} setQuery={setQuery} />
        <div className="flex-1 overflow-y-auto py-1">
          {matched.length === 0
            ? <div className="px-4 py-8 text-center text-xs" style={{ color: 'var(--text-3)' }}>未找到组件</div>
            : matched.map(c => <CompItem key={c.id} comp={c} onClick={() => c.status === 'done' && enterComp(c.id as ComponentId)} />)
          }
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <SearchBar query={query} setQuery={setQuery} />
      <div className="flex-1 overflow-y-auto">
        {COMPONENT_REGISTRY.map(g => {
          const isOpen = expanded[g.group] ?? false
          const allItems = g.subgroups
            ? g.subgroups.flatMap(sg => sg.items)
            : (g.items || [])
          const doneCount = allItems.filter(c => c.status === 'done').length

          return (
            <div key={g.group}>
              {/* 分组标题 */}
              <button
                className="w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors hover:opacity-80"
                onClick={() => toggle(g.group)}
              >
                {GROUP_SVG[g.group] || <span style={{ width:18,height:18,flexShrink:0 }}>○</span>}
                <span className="flex-1 text-xs font-medium truncate" style={{ color: 'var(--text-1)' }}>
                  {g.groupLabel}
                </span>
                {doneCount > 0 && (
                  <span className="text-xs shrink-0" style={{ color: '#27D365' }}>{doneCount} 可用</span>
                )}
                <span
                  className="text-xs shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--text-3)', transform: isOpen ? '' : 'rotate(-90deg)' }}
                >▾</span>
              </button>

              {/* 展开内容 */}
              {isOpen && (
                <div className="pb-1">
                  {g.subgroups ? (
                    g.subgroups.map(sg => (
                      <div key={sg.label}>
                        <div className="px-4 py-1 text-xs" style={{ color: 'var(--text-3)', fontSize: 11 }}>
                          {sg.label}
                        </div>
                        {sg.items.map(c => (
                          <CompItem key={c.id} comp={c} indent
                            onClick={() => c.status === 'done' && enterComp(c.id as ComponentId)} />
                        ))}
                      </div>
                    ))
                  ) : (
                    (g.items || []).map(c => (
                      <CompItem key={c.id} comp={c} indent
                        onClick={() => c.status === 'done' && enterComp(c.id as ComponentId)} />
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SearchBar({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  return (
    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
      <input
        type="text"
        placeholder="搜索组件..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="w-full px-3 py-1.5 text-xs rounded-lg outline-none placeholder-gray-400 transition-colors"
        style={{ background: 'var(--bg-subtle)', color: 'var(--text-1)' }}
      />
    </div>
  )
}

function CompItem({ comp, indent = false, onClick }: {
  comp: ComponentDef; indent?: boolean; onClick: () => void
}) {
  const isDone = comp.status === 'done'
  return (
    <button
      onClick={onClick}
      disabled={!isDone}
      className="w-full text-left flex items-center justify-between transition-colors"
      style={{ padding: `6px ${indent ? '16px' : '16px'} 6px ${indent ? '28px' : '16px'}` }}
    >
      <div className="flex-1 min-w-0">
        <span
          className="text-xs truncate block"
          style={{ color: isDone ? 'var(--text-1)' : 'var(--text-3)' }}
        >
          {comp.name}
        </span>
        {comp.desc && isDone && (
          <span className="text-xs block truncate" style={{ color: 'var(--text-3)', fontSize: 11 }}>
            {comp.desc}
          </span>
        )}
        {!isDone && (
          <span className="text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)', fontSize: 10 }}>
            规划中
          </span>
        )}
      </div>
      {isDone && <span className="text-xs shrink-0 ml-2" style={{ color: 'var(--text-3)' }}>›</span>}
    </button>
  )
}
