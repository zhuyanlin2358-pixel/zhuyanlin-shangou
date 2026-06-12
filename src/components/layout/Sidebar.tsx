import { ArrowLeft, Package, Sun, Moon, ClipboardCheck } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import CompBrowser from './CompBrowser'
import SlotPanel from '@/components/panels/SlotPanel'
import N4ConfigPanel from '@/components/panels/N4ConfigPanel'
import N2ConfigPanel from '@/components/panels/N2ConfigPanel'
import GenericPanel from '@/components/panels/GenericPanel'
import YituosiPanel from '@/components/panels/YituosiPanel'
import FloorPanel from '@/components/panels/FloorPanel'

export default function Sidebar() {
  const { page, currentComp, goHome, goAssets, goReview, darkMode, toggleDarkMode } = useApp()
  const isConfig = page === 'comp' && currentComp !== null

  const panel = (() => {
    switch (currentComp) {
      case 'slot':  return <SlotPanel />
      case 'n4':    return <N4ConfigPanel />
      case 'n2':    return <N2ConfigPanel />
      case 'floor': return <FloorPanel />
      case 'yituosi': return <YituosiPanel />
      default:      return <GenericPanel />
    }
  })()

  return (
    <aside
      className="fixed top-0 left-0 w-[260px] h-screen flex flex-col z-40 border-r transition-colors duration-300"
      style={{
        background: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
      }}
    >
      {/* 顶部：logo 或 返回按钮 */}
      {isConfig ? (
        <div
          className="flex items-center gap-2 px-4 h-14 border-b cursor-pointer hover:opacity-70 transition-opacity shrink-0"
          style={{ borderColor: 'var(--sidebar-border)' }}
          onClick={goHome}
        >
          <ArrowLeft size={14} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>返回首页</span>
        </div>
      ) : (
        <div
          className="flex items-center px-4 h-14 border-b shrink-0"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <div>
            <div className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>闪购会场</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>组件自助设计工具</div>
          </div>
        </div>
      )}

      {/* 内容区 */}
      <div className="flex-1 overflow-hidden">
        {isConfig ? (
          <div className="h-full overflow-y-auto">
            {panel}
          </div>
        ) : (
          <CompBrowser />
        )}
      </div>

      {/* 底部导航（仅浏览模式） */}
      {!isConfig && (
        <div
          className="border-t shrink-0"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <button
            onClick={goAssets}
            className="w-full flex items-center gap-2 px-4 py-3 text-xs transition-colors hover:opacity-80"
            style={{ color: page === 'assets' ? 'var(--accent)' : 'var(--text-2)' }}
          >
            <Package size={14} style={{ flexShrink: 0 }} />
            <span>我的资产</span>
          </button>
          <button
            onClick={goReview}
            className="w-full flex items-center gap-2 px-4 py-3 text-xs transition-colors hover:opacity-80 border-t"
            style={{ color: page === 'review' ? 'var(--accent)' : 'var(--text-2)', borderColor: 'var(--sidebar-border)' }}
          >
            <ClipboardCheck size={14} style={{ flexShrink: 0 }} />
            <span>提交审核</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-2 px-4 py-3 text-xs transition-colors hover:opacity-80 border-t"
            style={{ color: 'var(--text-2)', borderColor: 'var(--sidebar-border)' }}
          >
            {darkMode ? <Sun size={14} style={{ flexShrink: 0 }} /> : <Moon size={14} style={{ flexShrink: 0 }} />}
            <span>{darkMode ? '浅色模式' : '深色模式'}</span>
          </button>
        </div>
      )}
    </aside>
  )
}
