/**
 * 素材设计工作室
 *
 * 三列布局：
 *   [素材类型选择器 220px] | [尺寸锁定画布/内容 flex-1] | [属性配置面板 280px]
 *
 * 任务 B 专用：独立、特定尺寸的切图素材生产
 * 用户流：选择类型 → 调整属性 → 预览 → 导出
 */
import { Suspense, lazy, useState } from 'react'
import { useApp } from '@/contexts/AppContext'

// 懒加载各素材的页面内容 + 配置面板
const N4Page       = lazy(() => import('./N4Page'))
const N2Page       = lazy(() => import('./N2Page'))
const YituosiPage  = lazy(() => import('./YituosiPage'))
const N4ConfigPanel   = lazy(() => import('@/components/panels/N4ConfigPanel'))
const N2ConfigPanel   = lazy(() => import('@/components/panels/N2ConfigPanel'))
const YituosiPanel    = lazy(() => import('@/components/panels/YituosiPanel'))

function Loader() {
  return <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>加载中…</div>
}

// ── 素材类型数据 ───────────────────────────────────────────────────────────────
type MaterialStatus = 'done' | 'coming'
type MaterialId = 'yituosi' | 'n4' | 'n2' | 'po-header' | 'logo' | 'popup' | 'banner'

interface MaterialItem {
  id: MaterialId
  name: string
  size: string
  status: MaterialStatus
}

interface MaterialCategory {
  id: string
  label: string
  icon: React.ReactNode
  items: MaterialItem[]
}

function IconFrequency() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
}
function IconTag() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
}
function IconLogo() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="10"/><path d="M8 12s1.5-3 4-3 4 3 4 3M8 12s1.5 3 4 3 4-3 4-3"/></svg>
}
function IconPopup() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h4"/></svg>
}
function IconBanner() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="7" width="20" height="10" rx="2"/></svg>
}


const CATEGORIES: MaterialCategory[] = [
  {
    id: 'channel',
    label: '频道页头图',
    icon: <IconFrequency />,
    items: [
      { id: 'yituosi',  name: '一拖四（PO首图）', size: '各异',    status: 'done' },
      { id: 'po-header',name: '独立频道头图',      size: '750×…',  status: 'coming' },
    ],
  },
  {
    id: 'tag',
    label: '文字标签',
    icon: <IconTag />,
    items: [
      { id: 'n4', name: 'N4 文字标签', size: '240×156', status: 'done' },
      { id: 'n2', name: 'N2 品牌 Logo', size: '各异',   status: 'done' },
    ],
  },
  {
    id: 'logo',
    label: 'Logo 与图标',
    icon: <IconLogo />,
    items: [
      { id: 'logo', name: '品牌 Logo 变体', size: '各异', status: 'coming' },
    ],
  },
  {
    id: 'popup',
    label: '弹窗与浮层',
    icon: <IconPopup />,
    items: [
      { id: 'popup', name: '弹窗 / 天降', size: '750×…', status: 'coming' },
    ],
  },
  {
    id: 'banner',
    label: 'Banner 通栏',
    icon: <IconBanner />,
    items: [
      { id: 'banner', name: 'Banner 通栏', size: '750×…', status: 'coming' },
    ],
  },
]

// ── 左侧：类型选择器 ──────────────────────────────────────────────────────────
function TypeSelector({
  selected, onSelect,
}: {
  selected: MaterialId | null
  onSelect: (id: MaterialId) => void
}) {
  return (
    <aside className="flex flex-col h-screen shrink-0 border-r overflow-y-auto"
      style={{ width: 220, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}>

      {/* 区块标题 */}
      <div className="px-4 pt-5 pb-2 text-[10px] font-semibold tracking-widest uppercase"
        style={{ color: 'rgba(255,255,255,0.2)' }}>
        素材类型
      </div>

      {CATEGORIES.map(cat => (
        <div key={cat.id} className="mb-3">
          {/* 类别标题 */}
          <div className="flex items-center gap-2 px-4 py-1.5"
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600 }}>
            <span style={{ opacity: 0.6 }}>{cat.icon}</span>
            {cat.label}
          </div>

          {/* 素材条目 */}
          {cat.items.map(item => (
            <button
              key={item.id}
              onClick={() => item.status === 'done' && onSelect(item.id)}
              disabled={item.status === 'coming'}
              className="w-full flex items-center gap-2 px-5 py-2 text-left transition-all"
              style={{
                background: selected === item.id ? 'rgba(45,120,244,0.12)' : 'transparent',
                borderLeft: selected === item.id ? '2px solid #2D78F4' : '2px solid transparent',
                color: item.status === 'coming'
                  ? 'rgba(255,255,255,0.2)'
                  : selected === item.id
                  ? '#6AA3FF'
                  : 'rgba(255,255,255,0.5)',
                cursor: item.status === 'coming' ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
              onMouseEnter={e => {
                if (item.status === 'done' && selected !== item.id)
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                if (item.status === 'done' && selected !== item.id)
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span className="flex-1 text-[12px] truncate">{item.name}</span>
              {item.status === 'coming' ? (
                <span className="text-[9px] px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: 'rgba(255,200,0,0.08)', color: 'rgba(255,180,0,0.4)', border: '1px solid rgba(255,180,0,0.12)' }}>
                  待开发
                </span>
              ) : (
                <span className="text-[9px] px-1 rounded shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }}>
                  {item.size}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </aside>
  )
}

// ── 中间：内容区（已完成素材显示对应页面，待开发显示占位）────────────────────
function StudioContent({ selected }: { selected: MaterialId | null }) {
  if (!selected) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4"
        style={{ background: '#080C14' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: 'rgba(45,120,244,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(45,120,244,0.5)" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 3v18M3 9h18"/>
          </svg>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            选择左侧素材类型开始设计
          </div>
          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            选择类型 → 调整属性 → 预览 → 导出
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <Suspense fallback={<Loader />}>
        {selected === 'n4'      && <N4Page />}
        {selected === 'n2'      && <N2Page />}
        {selected === 'yituosi' && <YituosiPage />}
      </Suspense>
    </div>
  )
}

// ── 右侧：属性配置面板 ────────────────────────────────────────────────────────
function StudioPanel({ selected }: { selected: MaterialId | null }) {
  const label = (() => {
    switch (selected) {
      case 'n4':      return 'N4 文字标签'
      case 'n2':      return 'N2 品牌 Logo'
      case 'yituosi': return '一拖四'
      default:        return '属性配置'
    }
  })()

  return (
    <div className="flex flex-col h-screen shrink-0 border-l"
      style={{ width: 280, background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="h-11 flex items-center px-4 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {!selected && (
          <div className="p-4 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
            选中左侧素材类型后，此处显示专属配置项。
          </div>
        )}
        <Suspense fallback={<Loader />}>
          {selected === 'n4'      && <N4ConfigPanel />}
          {selected === 'n2'      && <N2ConfigPanel />}
          {selected === 'yituosi' && <YituosiPanel />}
        </Suspense>
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────────────────
export default function MaterialStudioPage() {
  const { goHome } = useApp()
  const [selected, setSelected] = useState<MaterialId | null>(null)

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>

      {/* 左：素材类型选择器 */}
      <div className="flex flex-col h-screen shrink-0 border-r"
        style={{ width: 220, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}>
        {/* 返回首页 */}
        <button
          onClick={goHome}
          className="flex items-center gap-2 px-4 h-11 text-xs transition-opacity hover:opacity-70 shrink-0"
          style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          返回首页
        </button>

        <div className="flex-1 overflow-y-auto">
          <TypeSelector selected={selected} onSelect={setSelected} />
        </div>
      </div>

      {/* 中：内容区 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 顶部工具栏 */}
        <div className="h-11 flex items-center px-5 border-b shrink-0 gap-3"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
            素材设计工作室
          </span>
          {selected && (
            <span className="text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(45,120,244,0.12)', color: '#6AA3FF' }}>
              {selected === 'n4'      ? 'N4 文字标签 · 240×156 px'
                : selected === 'n2'      ? 'N2 品牌 Logo'
                : selected === 'yituosi' ? '一拖四 · PO 频道首图'
                : ''}
            </span>
          )}
        </div>
        <StudioContent selected={selected} />
      </div>

      {/* 右：属性面板 */}
      <StudioPanel selected={selected} />

    </div>
  )
}
