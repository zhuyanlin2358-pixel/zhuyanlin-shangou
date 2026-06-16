/**
 * 高达会场统一工作区
 * 布局：左侧组件导航(200px) | 中间配置页(flex-1) | 手机预览(380px)
 * 路由：依赖 AppContext.currentComp 决定中间显示哪个组件配置页
 *       currentComp = null → 会场管理（头图/背景/组件列表）
 *       currentComp = 'slot' → 老虎机配置
 *       以此类推
 */
import { Suspense, lazy } from 'react'
import { useApp }   from '@/contexts/AppContext'
import { findComponent, DONE_COMP_IDS, type ComponentId } from '@/types'
import VenueManager      from './VenueManager'
import VenuePhonePreview from './VenuePhonePreview'
import SlotPanel  from '@/components/panels/SlotPanel'
import FloorPanel from '@/components/panels/FloorPanel'
import HTabPanel  from '@/components/panels/HTabPanel'

// 高达工作区里显示哪些组件（P4 已完成）
const VENUE_COMPS: ComponentId[] = ['slot', 'floor', 'h-tab']

// ── 组件图标 ─────────────────────────────────────────────────────────────────
const icons: Record<string, (c: string) => React.ReactNode> = {
  home: c => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  slot: c => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  floor: c => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <line x1="2" y1="8" x2="22" y2="8"/>
      <line x1="2" y1="14" x2="22" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  'h-tab': c => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <rect x="2" y="8" width="8" height="8" rx="2"/>
      <rect x="13" y="8" width="9" height="8" rx="2"/>
    </svg>
  ),
}

// 懒加载各组件页
const SlotPage  = lazy(() => import('./SlotPage'))
const FloorPage = lazy(() => import('./FloorPage'))
const HTabPage  = lazy(() => import('./HTabPage'))

function Loader() {
  return (
    <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'var(--text-3)' }}>
      加载中…
    </div>
  )
}

export default function VenuePage() {
  const { currentComp, goHome, goVenue, enterComp } = useApp()

  // 组件配置面板（与旧 Sidebar 一样）
  const configPanel = (() => {
    switch (currentComp) {
      case 'slot':  return <div className="h-full overflow-y-auto"><SlotPanel /></div>
      case 'floor': return <div className="h-full overflow-y-auto"><FloorPanel /></div>
      case 'h-tab': return <div className="h-full overflow-y-auto"><HTabPanel /></div>
      default:      return null
    }
  })()

  // 主内容区
  const centerContent = currentComp ? (
    <Suspense fallback={<Loader />}>
      {currentComp === 'slot'  && <SlotPage  />}
      {currentComp === 'floor' && <FloorPage />}
      {currentComp === 'h-tab' && <HTabPage  />}
    </Suspense>
  ) : <VenueManager />

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── ① 薄导航（64px）──────────────────────────────────────────────── */}
      <aside
        className="flex flex-col items-center py-3 gap-1 shrink-0 border-r h-screen"
        style={{ width: 64, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {/* 返回首页 */}
        <button
          onClick={goHome}
          className="w-10 h-10 flex items-center justify-center rounded-xl mb-1 hover:opacity-70 transition-opacity"
          title="返回首页"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        {/* 会场总览（组件列表+导出）*/}
        <button
          onClick={goVenue}
          title="会场总览"
          className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all"
          style={{
            background: !currentComp ? 'rgba(255,80,80,0.12)' : 'transparent',
            border: `1px solid ${!currentComp ? 'rgba(255,80,80,0.3)' : 'transparent'}`,
          }}
        >
          {icons.home(!currentComp ? '#FF5050' : 'rgba(255,255,255,0.4)')}
          <span className="text-[8.5px]" style={{ color: !currentComp ? '#FF8080' : 'rgba(255,255,255,0.3)' }}>会场</span>
        </button>

        <div className="w-6 border-t mb-1" style={{ borderColor: 'rgba(255,255,255,0.07)' }} />

        {/* 组件导航 */}
        {VENUE_COMPS.map(id => {
          const comp  = findComponent(id)
          const isDone = DONE_COMP_IDS.includes(id)
          const active = currentComp === id
          const c      = active ? '#FF5050' : isDone ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.2)'
          return (
            <button
              key={id}
              onClick={() => isDone && enterComp(id)}
              disabled={!isDone}
              title={comp?.name ?? id}
              className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all"
              style={{
                background: active ? 'rgba(255,80,80,0.12)' : 'transparent',
                border: `1px solid ${active ? 'rgba(255,80,80,0.3)' : 'transparent'}`,
                cursor: isDone ? 'pointer' : 'not-allowed',
              }}
            >
              {icons[id]?.(c)}
              <span className="text-[8.5px] leading-none" style={{ color: c }}>
                {(comp?.name ?? id).slice(0, 3)}
              </span>
            </button>
          )
        })}
      </aside>

      {/* ── ② 组件配置面板（260px，与旧 Sidebar 一致）── */}
      {configPanel && (
        <div
          className="flex flex-col shrink-0 border-r h-screen"
          style={{ width: 260, background: 'var(--sidebar-bg)', borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}
        >
          {/* 组件名标题 */}
          <div
            className="h-12 flex items-center px-4 border-b shrink-0 text-xs font-semibold"
            style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
          >
            {findComponent(currentComp!)?.name}
          </div>
          {/* 配置面板滚动区 */}
          <div className="flex-1 overflow-y-auto">
            {configPanel}
          </div>
        </div>
      )}

      {/* ── ③ 主内容区 ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginRight: 380 }}>
        {/* 标题栏 */}
        <div
          className="h-12 flex items-center px-5 border-b shrink-0"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            {currentComp ? (findComponent(currentComp)?.name ?? currentComp) : '高达会场'}
          </span>
          {currentComp && (
            <span
              className="ml-3 text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(45,120,244,0.12)', color: '#6AA3FF' }}
            >
              配置完成后点「加入会场」↗
            </span>
          )}
        </div>
        <main className="flex-1 overflow-y-auto">
          {centerContent}
        </main>
      </div>

      {/* ── ④ 右侧手机预览（持久）────────────────────────────────────────── */}
      <VenuePhonePreview />
    </div>
  )
}

