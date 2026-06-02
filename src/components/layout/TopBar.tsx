import { useApp } from '@/contexts/AppContext'
import { COMPONENT_REGISTRY } from '@/types'

export default function TopBar() {
  const { darkMode, toggleDarkMode, enterComp, goAssets } = useApp()

  return (
    <header className="topbar fixed top-0 left-0 right-0 h-14 flex items-center px-4 gap-4 bg-white border-b border-gray-200 z-50 transition-all duration-250"
      style={{ left: 260 }}
    >
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm font-semibold text-gray-800">闪购会场</span>
        <span className="text-gray-300">·</span>
        <nav className="flex items-center gap-1">
          {COMPONENT_REGISTRY.filter(c => c.status === 'done').map(c => (
            <button
              key={c.id}
              onClick={() => enterComp(c.id)}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {c.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={goAssets}
          className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          我的资产
        </button>
        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
          title={darkMode ? '切换浅色' : '切换深色'}
        >
          {darkMode ? '☀' : '🌙'}
        </button>
      </div>
    </header>
  )
}
