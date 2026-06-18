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
import { findComponent, DONE_COMP_IDS, VENUE_COMP_IDS } from '@/types'
import VenueManager      from './VenueManager'
import VenuePhonePreview from './VenuePhonePreview'
import SlotPanel   from '@/components/panels/SlotPanel'
import FloorPanel  from '@/components/panels/FloorPanel'
import HTabPanel   from '@/components/panels/HTabPanel'
import CouponPanel from '@/components/panels/CouponPanel'

// 懒加载各组件页
const SlotPage   = lazy(() => import('./SlotPage'))
const FloorPage  = lazy(() => import('./FloorPage'))
const HTabPage   = lazy(() => import('./HTabPage'))
const CouponPage = lazy(() => import('./CouponPage'))

function Loader() {
  return (
    <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'var(--text-3)' }}>
      加载中…
    </div>
  )
}

export default function VenuePage() {
  const { currentComp, goHome, goVenue, enterComp, hasExportAll, triggerExportAll } = useApp()

  // 组件配置面板（与旧 Sidebar 一样）
  const configPanel = (() => {
    switch (currentComp) {
      case 'slot':   return <div className="h-full overflow-y-auto"><SlotPanel /></div>
      case 'floor':  return <div className="h-full overflow-y-auto"><FloorPanel /></div>
      case 'h-tab':  return <div className="h-full overflow-y-auto"><HTabPanel /></div>
      case 'coupon': return <div className="h-full overflow-y-auto"><CouponPanel /></div>
      default:       return null
    }
  })()

  // 主内容区
  const centerContent = currentComp ? (
    <Suspense fallback={<Loader />}>
      {currentComp === 'slot'   && <SlotPage   />}
      {currentComp === 'floor'  && <FloorPage  />}
      {currentComp === 'h-tab'  && <HTabPage   />}
      {currentComp === 'coupon' && <CouponPage />}
    </Suspense>
  ) : <VenueManager />

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── ① 文字导航（140px，纯文字无图标）────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 border-r h-screen"
        style={{ width: 140, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {/* 返回首页 */}
        <button
          onClick={goHome}
          className="flex items-center gap-2 px-4 h-11 border-b hover:opacity-70 transition-opacity shrink-0 text-xs"
          style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          返回首页
        </button>

        <nav className="flex-1 py-2">
          {/* 会场总览 */}
          <TextNavBtn active={!currentComp} onClick={goVenue}>会场</TextNavBtn>

          <div className="mx-4 my-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

          {/* 组件列表 */}
          {VENUE_COMP_IDS.map(id => {
            const comp   = findComponent(id)
            const isDone = DONE_COMP_IDS.includes(id)
            return (
              <TextNavBtn
                key={id}
                active={currentComp === id}
                disabled={!isDone}
                onClick={() => isDone && enterComp(id)}
              >
                {comp?.name ?? id}
              </TextNavBtn>
            )
          })}
        </nav>
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
          className="h-12 flex items-center px-5 border-b shrink-0 gap-3"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            {currentComp ? (findComponent(currentComp)?.name ?? currentComp) : '高达会场'}
          </span>
          {currentComp && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(45,120,244,0.12)', color: '#6AA3FF' }}
            >
              配置完成后点「加入会场」↗
            </span>
          )}
          {/* 一键导出 ZIP（组件注册了 exportAll 时显示） */}
          {hasExportAll && (
            <button
              onClick={triggerExportAll}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white"
              style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              一键导出 ZIP
            </button>
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

// 文字导航按钮（模块顶层，防止 re-mount）
function TextNavBtn({
  active, disabled, onClick, children,
}: {
  active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full px-4 py-2 text-left text-xs transition-all"
      style={{
        color:      active ? '#FF8080' : disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.55)',
        background: active ? 'rgba(255,80,80,0.1)' : 'transparent',
        borderLeft: active ? '2px solid #FF5050' : '2px solid transparent',
        cursor:     disabled ? 'not-allowed' : 'pointer',
        fontWeight: active ? 500 : 400,
      }}
    >
      {children}
    </button>
  )
}

