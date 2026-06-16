/**
 * 高达会场拼装页
 * 布局：薄导航(64px) | 内容区(flex-1) | 手机预览(380px)
 * 内容区内部自己管理子页面切换（不走全局路由）
 */
import { Suspense, lazy } from 'react'
import { useVenue }  from '@/contexts/VenueContext'
import { useApp }    from '@/contexts/AppContext'
import { findComponent, type ComponentId } from '@/types'
import VenueManager      from './VenueManager'
import VenuePhonePreview from './VenuePhonePreview'

// 已完成组件列表（导航只显示这些）
const VENUE_COMPS: ComponentId[] = ['slot', 'floor', 'h-tab', 'n4', 'n2']

// 图标 SVG（简洁线条）
const CompIcon = ({ id, active }: { id: ComponentId | 'home'; active: boolean }) => {
  const c = active ? '#FF5050' : 'rgba(255,255,255,0.4)'
  if (id === 'home') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
  if (id === 'slot') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  )
  if (id === 'floor') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="6" x2="22" y2="6"/><line x1="2" y1="18" x2="22" y2="18"/>
    </svg>
  )
  if (id === 'h-tab') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <rect x="2" y="8" width="8" height="8" rx="2"/><rect x="13" y="8" width="9" height="8" rx="2"/>
    </svg>
  )
  if (id === 'n4') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <path d="M4 7h3l5 5V7h3v10h-3l-5-5v5H4z"/><line x1="17" y1="7" x2="17" y2="17"/>
    </svg>
  )
  if (id === 'n2') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
  return null
}

// 懒加载各组件页
const SlotPage  = lazy(() => import('./SlotPage'))
const FloorPage = lazy(() => import('./FloorPage'))
const HTabPage  = lazy(() => import('./HTabPage'))
const N4Page    = lazy(() => import('./N4Page'))
const N2Page    = lazy(() => import('./N2Page'))

function SubPageLoader() {
  return <div className="flex items-center justify-center h-64 text-xs" style={{ color: 'var(--text-3)' }}>加载中…</div>
}

export default function VenuePage() {
  const { activeSub, setActiveSub } = useVenue()
  const { goHome } = useApp()

  const subContent = (() => {
    if (activeSub === 'home') return <VenueManager />
    return (
      <Suspense fallback={<SubPageLoader />}>
        {activeSub === 'slot'  && <SlotPage  />}
        {activeSub === 'floor' && <FloorPage />}
        {activeSub === 'h-tab' && <HTabPage  />}
        {activeSub === 'n4'    && <N4Page    />}
        {activeSub === 'n2'    && <N2Page    />}
      </Suspense>
    )
  })()

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── 薄导航 ──────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col items-center py-4 gap-1 shrink-0 border-r"
        style={{ width: 64, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {/* 返回首页 */}
        <button
          onClick={goHome}
          className="w-10 h-10 flex items-center justify-center rounded-xl mb-2 transition-all hover:opacity-70"
          title="返回首页"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        {/* 会场管理 home */}
        <NavBtn active={activeSub === 'home'} label="会场" onClick={() => setActiveSub('home')}>
          <CompIcon id="home" active={activeSub === 'home'} />
        </NavBtn>

        <div className="w-6 border-t my-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* 各组件 */}
        {VENUE_COMPS.map(id => {
          const comp = findComponent(id)
          return (
            <NavBtn key={id} active={activeSub === id}
              label={comp?.name ?? id} onClick={() => setActiveSub(id)}>
              <CompIcon id={id} active={activeSub === id} />
            </NavBtn>
          )
        })}
      </aside>

      {/* ── 内容区 ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginRight: 380 }}>
        {/* 子页面标题栏 */}
        <div
          className="h-12 flex items-center px-5 border-b shrink-0 text-sm font-semibold"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-1)' }}
        >
          {activeSub === 'home'
            ? '高达会场搭建'
            : findComponent(activeSub as ComponentId)?.name ?? activeSub}
          {activeSub !== 'home' && (
            <span
              className="ml-3 text-xs font-normal px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,80,80,0.1)', color: '#FF8080' }}
            >
              配置完成后点「加入会场」→
            </span>
          )}
        </div>
        <main className="flex-1 overflow-y-auto">
          {subContent}
        </main>
      </div>

      {/* ── 右侧手机预览（持久）────────────────────────────────────────── */}
      <VenuePhonePreview />

    </div>
  )
}

// 薄导航按钮（模块顶层）
function NavBtn({
  active, label, onClick, children,
}: {
  active: boolean; label: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all"
      style={{
        background: active ? 'rgba(255,80,80,0.12)' : 'transparent',
        border: `1px solid ${active ? 'rgba(255,80,80,0.3)' : 'transparent'}`,
      }}
    >
      {children}
      <span className="text-[9px]" style={{ color: active ? '#FF8080' : 'rgba(255,255,255,0.3)' }}>
        {label.slice(0, 3)}
      </span>
    </button>
  )
}
