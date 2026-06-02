import { AppProvider, useApp } from '@/contexts/AppContext'
import { N4Provider } from '@/contexts/N4Context'
import { N2Provider } from '@/contexts/N2Context'
import { SlotProvider } from '@/contexts/SlotContext'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import HomePage from '@/components/pages/HomePage'
import SlotPage from '@/components/pages/SlotPage'
import N4Page from '@/components/pages/N4Page'
import N2Page from '@/components/pages/N2Page'
import YituosiPage from '@/components/pages/YituosiPage'
import GenericPage from '@/components/pages/GenericPage'
import AssetsPage from '@/components/pages/AssetsPage'

function MainContent() {
  const { page, currentComp, toast } = useApp()

  const PageContent = () => {
    if (page === 'home') return <HomePage />
    if (page === 'assets') return <AssetsPage />
    if (page === 'comp') {
      switch (currentComp) {
        case 'slot':    return <SlotPage />
        case 'n4':      return <N4Page />
        case 'n2':      return <N2Page />
        case 'yituosi': return <YituosiPage />
        default:        return <GenericPage />
      }
    }
    return <HomePage />
  }

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />

      {/* 主内容区 */}
      <div
        className="flex-1 flex flex-col overflow-hidden"
        style={{ marginLeft: 260 }}
      >
        {/* 首页时顶栏隐藏 */}
        {page !== 'home' && <TopBar />}

        <main
          className="flex-1 overflow-y-auto"
          style={{ marginTop: page !== 'home' ? 56 : 0 }}
        >
          <PageContent />
        </main>
      </div>

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
