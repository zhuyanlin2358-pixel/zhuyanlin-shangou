import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import type { ComponentId, PageId } from '@/types'

interface AppContextValue {
  darkMode: boolean
  toggleDarkMode: () => void
  hasPreview: boolean
  setHasPreview: (v: boolean) => void
  page: PageId
  currentComp: ComponentId | null
  goHome: () => void
  enterComp: (id: ComponentId) => void
  goAssets: () => void
  goReview: () => void
  toast: string
  showToast: (msg: string) => void
  // 当前组件页注册的导出全部回调
  registerExportAll: (fn: (() => void) | null) => void
  triggerExportAll: () => void
  hasExportAll: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const [hasPreview, setHasPreview] = useState(false)
  const [page, setPage] = useState<PageId>('home')
  const [currentComp, setCurrentComp] = useState<ComponentId | null>(null)
  const [toast, setToast] = useState('')
  const exportAllRef = useRef<(() => void) | null>(null)
  const [hasExportAll, setHasExportAll] = useState(false)

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    // 组件页面所有面板都用 text-white/* 写死白色文字，必须强制深色模式；
    // 非组件页面按用户偏好切换。
    const forceDark = page === 'comp'
    document.body.classList.toggle('dark-mode', forceDark || darkMode)
  }, [darkMode, page])

  useEffect(() => {
    document.body.classList.toggle('has-preview', hasPreview)
  }, [hasPreview])

  const toggleDarkMode = () => setDarkMode(d => !d)

  const goHome = () => {
    setPage('home')
    setCurrentComp(null)
    setHasPreview(false)
  }

  const enterComp = (id: ComponentId) => {
    setCurrentComp(id)
    setPage('comp')
    setHasPreview(id === 'slot')
  }

  const goAssets = () => {
    setPage('assets')
    setCurrentComp(null)
    setHasPreview(false)
  }

  const goReview = () => {
    setPage('review')
    setCurrentComp(null)
    setHasPreview(false)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const registerExportAll = (fn: (() => void) | null) => {
    exportAllRef.current = fn
    setHasExportAll(fn !== null)
  }

  const triggerExportAll = () => exportAllRef.current?.()

  return (
    <AppContext.Provider value={{
      darkMode, toggleDarkMode,
      hasPreview, setHasPreview,
      page, currentComp,
      goHome, enterComp, goAssets, goReview,
      toast, showToast,
      registerExportAll, triggerExportAll, hasExportAll,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
