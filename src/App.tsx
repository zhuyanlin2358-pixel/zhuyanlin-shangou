import { useEffect, lazy, Suspense } from 'react'
import { AppProvider, useApp } from '@/contexts/AppContext'
import { warmupFonts } from '@/utils/exportUtils'

// 应用启动后立即在后台开始加载字体（不阻塞 UI），
// 等用户点进组件页开始渲染时字体大概率已缓存，无需等待
warmupFonts()
import { N4Provider } from '@/contexts/N4Context'
import { N2Provider } from '@/contexts/N2Context'
import { SlotProvider } from '@/contexts/SlotContext'
import { FloorProvider } from '@/contexts/FloorContext'
import { HTabProvider } from "@/contexts/HTabContext"
import { CouponProvider } from "@/contexts/CouponContext"
import { VenueProvider } from '@/contexts/VenueContext'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import PreviewPanel from '@/components/layout/PreviewPanel'
import HomePage from '@/components/pages/HomePage'

// 按需加载：只有用户点进对应组件时才下载该模块，首屏不打包进来
const SlotPage    = lazy(() => import('@/components/pages/SlotPage'))
const N4Page      = lazy(() => import('@/components/pages/N4Page'))
const N2Page      = lazy(() => import('@/components/pages/N2Page'))
const FloorPage   = lazy(() => import('@/components/pages/FloorPage'))
const HTabPage    = lazy(() => import('@/components/pages/HTabPage'))
const CouponPage  = lazy(() => import('@/components/pages/CouponPage'))
const VenuePage          = lazy(() => import('@/components/pages/VenuePage'))
const MaterialStudioPage = lazy(() => import('@/components/pages/MaterialStudioPage'))
const DeliveryPage       = lazy(() => import('@/components/pages/DeliveryPage'))
const YituosiPage        = lazy(() => import('@/components/pages/YituosiPage'))
const GenericPage = lazy(() => import('@/components/pages/GenericPage'))
const AssetsPage  = lazy(() => import('@/components/pages/AssetsPage'))
const ReviewPage  = lazy(() => import('@/components/pages/ReviewPage'))

// ── 全局 Toast（支持撤销按钮）────────────────────────────────────────────────
function AppToast() {
  const { toast, toastUndo, showToast } = useApp()
  if (!toast) return null
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 16px', borderRadius: 24,
        background: '#1a1a1a', color: '#fff',
        fontSize: 13, whiteSpace: 'nowrap',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      <span>{toast}</span>
      {toastUndo && (
        <>
          <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.2)' }} />
          <button
            onClick={() => { toastUndo(); showToast('✅ 已撤销') }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: '#fad900', padding: 0,
            }}
          >
            撤销
          </button>
        </>
      )}
    </div>
  )
}

// 全局滚动检测：给正在滚动的元素加 is-scrolling，900ms 后移除
function useGlobalScrollVisible() {
  useEffect(() => {
    const timers = new Map<EventTarget, ReturnType<typeof setTimeout>>()
    const onScroll = (e: Event) => {
      const el = e.target as HTMLElement
      if (!el || !el.classList) return
      el.classList.add('is-scrolling')
      const prev = timers.get(el)
      if (prev) clearTimeout(prev)
      timers.set(el, setTimeout(() => {
        el.classList.remove('is-scrolling')
        timers.delete(el)
      }, 900))
    }
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [])
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64 text-white/20 text-sm">
      加载中…
    </div>
  )
}

function MainContent() {
  const { page, currentComp, hasPreview } = useApp()
  useGlobalScrollVisible()

  // 首页：全屏独立布局，跳过 Sidebar + TopBar
  if (page === 'home') {
    return (
      <>
        <HomePage />
        <AppToast />
      </>
    )
  }

  // 会场页：全屏独立布局，跳过 Sidebar + TopBar
  if (page === 'venue') {
    return (
      <>
        <Suspense fallback={<PageLoader />}><VenuePage /></Suspense>
        <AppToast />
      </>
    )
  }

  // 交付中心：全屏独立布局
  if (page === 'delivery') {
    return (
      <>
        <Suspense fallback={<PageLoader />}><DeliveryPage /></Suspense>
        <AppToast />
      </>
    )
  }

  // 素材设计工作室：全屏独立布局，跳过 Sidebar + TopBar
  if (page === 'studio') {
    return (
      <>
        <Suspense fallback={<PageLoader />}><MaterialStudioPage /></Suspense>
        <AppToast />
      </>
    )
  }

  const pageContent = (() => {
    if (page === 'assets') return <div className="page-enter"><Suspense fallback={<PageLoader />}><AssetsPage /></Suspense></div>
    if (page === 'review') return <div className="page-enter"><Suspense fallback={<PageLoader />}><ReviewPage /></Suspense></div>
    if (page === 'comp') {
      const inner = (() => {
        switch (currentComp) {
          case 'slot':    return <SlotPage />
          case 'n4':      return <N4Page />
          case 'n2':      return <N2Page />
          case 'floor':   return <FloorPage />
          case 'h-tab':   return <HTabPage />
          case 'coupon':  return <CouponPage />
          case 'yituosi': return <YituosiPage />
          default:        return <GenericPage />
        }
      })()
      return (
        <div key={currentComp} className="page-enter">
          <Suspense fallback={<PageLoader />}>{inner}</Suspense>
        </div>
      )
    }
    return <div className="page-enter"><HomePage /></div>
  })()

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />

      {/* 主内容区 */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ marginLeft: 260, marginRight: hasPreview ? 360 : 0 }}
      >
        <TopBar />
        <main
          className="flex-1 overflow-y-auto"
          style={{ marginTop: 56 }}
        >
          {pageContent}
        </main>
      </div>

      {/* 右侧手机预览面板（老虎机专属） */}
      {hasPreview && <PreviewPanel />}

      {/* Toast */}
      <AppToast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <SlotProvider>
        <N4Provider>
          <N2Provider>
            <FloorProvider>
              <HTabProvider>
                <CouponProvider>
                  <VenueProvider>
                    <MainContent />
                  </VenueProvider>
                </CouponProvider>
              </HTabProvider>
            </FloorProvider>
          </N2Provider>
        </N4Provider>
      </SlotProvider>
    </AppProvider>
  )
}
