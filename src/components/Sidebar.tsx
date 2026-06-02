import type { ComponentId } from '@/App'

interface Props {
  components: { id: ComponentId; label: string; desc: string }[]
  activeId: ComponentId
  onSelect: (id: ComponentId) => void
}

export default function Sidebar({ components, activeId, onSelect }: Props) {
  return (
    <aside className="w-52 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="text-xs text-gray-400 font-medium">闪购会场</div>
        <div className="text-sm font-semibold text-gray-900 mt-0.5">组件自助设计工具</div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {components.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
              activeId === c.id
                ? 'bg-yellow-50 text-yellow-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="text-sm">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.desc}</div>
          </button>
        ))}
      </nav>
    </aside>
  )
}
