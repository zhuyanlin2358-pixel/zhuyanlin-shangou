import { useEffect } from 'react'
import { AppProvider, useApp } from '@/contexts/AppContext'
import { N4Provider } from '@/contexts/N4Context'
import { N2Provider } from '@/contexts/N2Context'
import { SlotProvider } from '@/contexts/SlotContext'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import PreviewPanel from '@/components/layout/PreviewPanel'
import HomePage from '@/components/pages/HomePage'
import SlotPage from '@/components/pages/SlotPage'
import N4Page from '@/components/pages/N4Page'
import N2Page from '@/components/pages/N2Page'
import YituosiPage from '@/components/pages/YituosiPage'
import GenericPage from '@/components/pages/GenericPage'
import AssetsPage from '@/components/pages/AssetsPage'

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

function MainContent() {
  const { page, currentComp, toast, hasPreview } = useApp()
  useGlobalScrollVisible()

  const pageContent = (() => {
    if (page === 'home') return <div className="page-enter"><HomePage /></div>
    if (page === 'assets') return <div className="page-enter"><AssetsPage /></div>
    if (page === 'comp') {
      const inner = (() => {
        switch (currentComp) {
          case 'slot':    return <SlotPage />
          case 'n4':      return <N4Page />
          case 'n2':      return <N2Page />
          case 'yituosi': return <YituosiPage />
          default:        return <GenericPage />
        }
      })()
      return <div key={currentComp} className="page-enter">{inner}</div>
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
        {page !== 'home' && <TopBar />}
        <main
          className="flex-1 overflow-y-auto"
          style={{ marginTop: page !== 'home' ? 56 : 0 }}
        >
          {pageContent}
        </main>
      </div>

      {/* 右侧手机预览面板（老虎机专属） */}
      {hasPreview && <PreviewPanel />}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 text-sm px-4 py-2 rounded-full shadow-lg z-50"
          style={{ background: '#1a1a1a', color: '#fff', whiteSpace: 'nowrap' }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <SlotProvider>
        <N4Provider>
          <N2Provider>
            <MainContent />
          </N2Provider>
        </N4Provider>
      </SlotProvider>
    </AppProvider>
  )
}
