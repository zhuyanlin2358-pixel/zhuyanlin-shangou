import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { VENUE_COMP_IDS } from '@/types'
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
  goVenue: () => void
  goStudio: () => void
  goDelivery: () => void
  toast: string
  toastUndo: (() => void) | null
  showToast: (msg: string) => void
  showToastWithUndo: (msg: string, undo: () => void, duration?: number) => void
  // 当前组件页注册的导出全部回调
  registerExportAll: (fn: (() => void) | null) => void
  triggerExportAll: () => void
  hasExportAll: boolean
  // 场景方案库：待应用的模板 key
  pendingTemplate: string | null
  setPendingTemplate: (key: string | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const [hasPreview, setHasPreview] = useState(false)
  const [page, setPage] = useState<PageId>('home')
  const [currentComp, setCurrentComp] = useState<ComponentId | null>(null)
  const [toast, setToast] = useState('')
  const [toastUndo, setToastUndo] = useState<(() => void) | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exportAllRef = useRef<(() => void) | null>(null)
  const [hasExportAll, setHasExportAll] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
    // 组件页面所有面板都用 text-white/* 写死白色文字，必须强制深色模式；
    // 非组件页面按用户偏好切换。
    const forceDark = page === 'comp' || page === 'venue' || page === 'studio'
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
    if (VENUE_COMP_IDS.includes(id)) {
      // P4 高达组件 → 统一三列工作区
      setPage('venue')
      setHasPreview(false)
    } else {
      setPage('comp')
      setHasPreview(false)  // 只有老虎机有手机预览，但现在老虎机走venue
    }
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

  const goVenue = () => {
    setPage('venue')
    setCurrentComp(null)
    setHasPreview(false)
  }

  const goStudio = () => {
    setPage('studio')
    setCurrentComp(null)
    setHasPreview(false)
  }

  const goDelivery = () => {
    setPage('delivery')
    setCurrentComp(null)
    setHasPreview(false)
  }

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    setToastUndo(null)
    toastTimerRef.current = setTimeout(() => { setToast(''); setToastUndo(null) }, 2500)
  }, [])

  const showToastWithUndo = useCallback((msg: string, undo: () => void, duration = 5000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    setToastUndo(() => undo)   // 用箭头函数包裹，防止 React 将其当作 state updater
    toastTimerRef.current = setTimeout(() => { setToast(''); setToastUndo(null) }, duration)
  }, [])

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
      goHome, enterComp, goAssets, goReview, goVenue, goStudio, goDelivery,
      toast, toastUndo, showToast, showToastWithUndo,
      registerExportAll, triggerExportAll, hasExportAll,
      pendingTemplate, setPendingTemplate,
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
