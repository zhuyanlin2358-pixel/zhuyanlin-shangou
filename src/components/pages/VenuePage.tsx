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

  // 中间内容：null → 会场管理，否则 → 对应组件配置页
  const centerContent = (() => {
    if (!currentComp) return <VenueManager />
    return (
      <Suspense fallback={<Loader />}>
        {currentComp === 'slot'  && <SlotPage  />}
        {currentComp === 'floor' && <FloorPage />}
        {currentComp === 'h-tab' && <HTabPage  />}
      </Suspense>
    )
  })()

  const isHome = !currentComp

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── 左侧组件导航 200px ────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 border-r h-screen"
        style={{ width: 200, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {/* 顶部：返回首页 */}
        <button
          onClick={goHome}
          className="flex items-center gap-2 px-4 h-12 border-b hover:opacity-70 transition-opacity shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          <span className="text-xs">返回首页</span>
        </button>

        {/* 导航列表 */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* 会场管理 */}
          <NavItem
            icon={icons.home}
            label="会场管理"
            sub="头图 · 背景 · 预览"
            active={isHome}
            onClick={goVenue}
          />

          <div className="mx-4 my-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          <div className="px-4 mb-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            高达组件 · 配置后加入会场
          </div>

          {VENUE_COMPS.map(id => {
            const comp = findComponent(id)
            const isDone = DONE_COMP_IDS.includes(id)
            return (
              <NavItem
                key={id}
                icon={icons[id]}
                label={comp?.name ?? id}
                sub={comp?.desc ?? ''}
                active={currentComp === id}
                disabled={!isDone}
                onClick={() => isDone && enterComp(id)}
              />
            )
          })}
        </nav>

        {/* 底部说明 */}
        <div
          className="px-4 py-3 text-[10px] border-t leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          配置完成后点「加入会场」
          <br />右侧预览将同步显示
        </div>
      </aside>

      {/* ── 中间配置区 ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginRight: 380 }}>
        {/* 标题栏 */}
        <div
          className="h-12 flex items-center px-5 border-b shrink-0"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            {isHome ? '会场管理' : (findComponent(currentComp!)?.name ?? currentComp)}
          </span>
          {!isHome && (
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

      {/* ── 右侧手机预览（持久）────────────────────────────────────────────── */}
      <VenuePhonePreview />
    </div>
  )
}

// ── 侧边栏导航项（模块顶层）──────────────────────────────────────────────────
function NavItem({
  icon, label, sub, active, disabled, onClick,
}: {
  icon?: (color: string) => React.ReactNode
  label: string; sub?: string
  active: boolean; disabled?: boolean
  onClick: () => void
}) {
  const color = active ? '#FF5050' : disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
      style={{
        background: active ? 'rgba(255,80,80,0.1)' : 'transparent',
        borderLeft: active ? '2px solid #FF5050' : '2px solid transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {icon && <span className="shrink-0">{icon(color)}</span>}
      <div className="min-w-0">
        <div className="text-xs font-medium truncate" style={{ color }}>
          {label}
        </div>
        {sub && (
          <div className="text-[10px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {sub}
          </div>
        )}
      </div>
    </button>
  )
}
