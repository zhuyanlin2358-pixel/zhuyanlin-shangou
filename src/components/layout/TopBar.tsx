import { useApp } from '@/contexts/AppContext'
import { findComponent, type ComponentId } from '@/types'

export default function TopBar() {
  const { darkMode, toggleDarkMode, enterComp, goAssets, goHome, page, currentComp, triggerExportAll, hasExportAll } = useApp()
  const comp = currentComp ? findComponent(currentComp) : undefined
  const isComp = page === 'comp'

  return (
    <header
      className="fixed top-0 right-0 h-14 flex items-center px-5 gap-4 border-b z-50 transition-colors"
      style={{ left: 260, background: 'var(--bg)', borderColor: 'var(--border)' }}
    >
      {/* 左侧 */}
      {isComp ? (
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={goHome}
            className="flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1.5 transition-colors"
            style={{ color: 'var(--text-2)', background: 'var(--bg-subtle)' }}
          >
            ← 返回
          </button>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            {comp?.name || '组件'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>闪购会场</span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <nav className="flex items-center gap-1">
            {(['slot','n4','n2','yituosi'] as ComponentId[]).map(id => {
              const c = findComponent(id)
              if (!c || c.status !== 'done') return null
              return (
                <button key={id} onClick={() => enterComp(id)}
                  className="px-2.5 py-1.5 text-xs rounded-md transition-colors"
                  style={{ color: 'var(--text-2)' }}>
                  {c.name}
                </button>
              )
            })}
          </nav>
        </div>
      )}

      {/* 右侧 */}
      <div className="flex items-center gap-2 shrink-0">
        {isComp && hasExportAll && (
          <button
            onClick={triggerExportAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white"
            style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
          >
            ↓ 一键导出 ZIP
          </button>
        )}
        {!isComp && (
          <button
            onClick={goAssets}
            className="px-2.5 py-1.5 text-xs rounded-md"
            style={{ color: 'var(--text-2)' }}
          >
            我的资产
          </button>
        )}
        <button
          onClick={toggleDarkMode}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
          style={{ color: 'var(--text-2)' }}
        >
          {darkMode ? '☀' : '🌙'}
        </button>
      </div>
    </header>
  )
}
