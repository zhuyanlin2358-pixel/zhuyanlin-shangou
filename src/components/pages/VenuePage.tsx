/**
 * 高达会场统一工作区
 *
 * 老虎机路由（新架构）：
 *   studioMode = false → SlotCanvasView（三列画布：组件库 | 画布预览 | 属性面板）
 *   studioMode = true  → SlotPage（设计工作室：步骤导航 + 精细配置 + 导出）
 *
 * 其他组件：保持原有四列布局
 *   currentComp = null   → VenueManager（会场搭建）
 *   currentComp = floor  → FloorPage + FloorPanel
 *   currentComp = h-tab  → HTabPage + HTabPanel
 *   currentComp = coupon → CouponPage + CouponPanel
 */
import { Suspense, lazy, useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { findComponent, DONE_COMP_IDS, VENUE_COMP_IDS } from '@/types'
import VenueHeaderEditor from './VenueHeaderEditor'
import VenuePhonePreview from './VenuePhonePreview'
import SlotCanvasView    from './SlotCanvasView'
import FloorPanel  from '@/components/panels/FloorPanel'
import HTabPanel   from '@/components/panels/HTabPanel'
import CouponPanel from '@/components/panels/CouponPanel'

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

  // 老虎机专属：画布模式 ↔ 设计工作室模式
  const [studioMode, setStudioMode] = useState(false)

  // 切换组件时重置 studio 模式
  useEffect(() => {
    setStudioMode(false)
  }, [currentComp])

  // ── 老虎机：全屏接管（两种子模式）──────────────────────────────────────
  if (currentComp === 'slot') {
    if (!studioMode) {
      // 画布模式：三列布局，不显示 VenuePhonePreview
      return (
        <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>
          {/* 顶部标题栏 */}
          <div
            className="h-11 flex items-center px-4 border-b shrink-0 gap-3"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <button
              onClick={goHome}
              className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70 shrink-0"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              返回首页
            </button>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>老虎机</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,120,244,0.12)', color: '#6AA3FF' }}>
              点击元素直接配置
            </span>
            <div style={{ flex: 1 }} />
            {hasExportAll && (
              <button
                onClick={triggerExportAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white"
                style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                完成设计并下载
              </button>
            )}
          </div>

          {/* 三列画布内容 */}
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={<Loader />}>
              <SlotCanvasView onEnterStudio={() => setStudioMode(true)} />
            </Suspense>
          </div>
        </div>
      )
    }

    // 设计工作室模式：SlotPage 接管全屏 + 右侧保留 VenuePhonePreview
    return (
      <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
        <div className="flex-1 flex flex-col overflow-hidden" style={{ marginRight: 380 }}>
          {/* 工作室顶部 */}
          <div
            className="h-11 flex items-center px-4 border-b shrink-0 gap-3"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
          >
            <button
              onClick={() => setStudioMode(false)}
              className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70 shrink-0"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              返回画布
            </button>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
              正在设计：老虎机
            </span>
            <div style={{ width: 6, height: 6, background: '#FF3060', borderRadius: '50%' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              所有改动实时同步
            </span>
            <div style={{ flex: 1 }} />
            {hasExportAll && (
              <button
                onClick={triggerExportAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white"
                style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
              >
                完成设计并下载
              </button>
            )}
          </div>
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={<Loader />}>
              <SlotPage />
            </Suspense>
          </main>
        </div>
        <VenuePhonePreview />
      </div>
    )
  }

  // ── 其他组件：原有四列布局 ────────────────────────────────────────────
  const configPanel = (() => {
    switch (currentComp) {
      case 'floor':  return <div className="h-full overflow-y-auto"><FloorPanel /></div>
      case 'h-tab':  return <div className="h-full overflow-y-auto"><HTabPanel /></div>
      case 'coupon': return <div className="h-full overflow-y-auto"><CouponPanel /></div>
      default:       return null
    }
  })()

  const centerContent = currentComp ? (
    <Suspense fallback={<Loader />}>
      {currentComp === 'floor'  && <FloorPage  />}
      {currentComp === 'h-tab'  && <HTabPage   />}
      {currentComp === 'coupon' && <CouponPage />}
    </Suspense>
  ) : <VenueHeaderEditor />

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>

      {/* ① 文字导航 */}
      <aside
        className="flex flex-col shrink-0 border-r h-screen"
        style={{ width: 140, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}
      >
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
          <TextNavBtn active={!currentComp} onClick={goVenue}>活动头图</TextNavBtn>
          <div className="mx-4 my-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
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

      {/* ② 组件配置面板 */}
      {configPanel && (
        <div
          className="flex flex-col shrink-0 border-r h-screen"
          style={{ width: 260, background: 'var(--sidebar-bg)', borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}
        >
          <div
            className="h-11 flex items-center px-4 border-b shrink-0 text-xs font-semibold"
            style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
          >
            {findComponent(currentComp!)?.name}
          </div>
          <div className="flex-1 overflow-y-auto">{configPanel}</div>
        </div>
      )}

      {/* ③ 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ marginRight: 380 }}>
        <div
          className="h-11 flex items-center px-5 border-b shrink-0 gap-3"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            {currentComp ? (findComponent(currentComp)?.name ?? currentComp) : '活动头图'}
          </span>
          {currentComp && (
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(45,120,244,0.12)', color: '#6AA3FF' }}>
              配置完成后点「加入会场」↗
            </span>
          )}
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
              完成设计并下载
            </button>
          )}
        </div>
        <main className="flex-1 overflow-y-auto">{centerContent}</main>
      </div>

      {/* ④ 右侧画布预览 */}
      <VenuePhonePreview />
    </div>
  )
}

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
