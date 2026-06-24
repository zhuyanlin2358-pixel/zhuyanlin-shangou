/**
 * 高达会场 · 右侧动态属性面板
 *
 * 根据当前选中图层动态切换：
 *   null           → 页面级设置（背景色、宽度说明）
 *   'header'       → 活动头图配置（上传/尺寸/背景色/动效占位）
 *   VenueItem.id   → 对应组件配置面板 + 深入编辑入口
 */
import { lazy, Suspense, useRef } from 'react'
import { ImageIcon, Trash2 } from 'lucide-react'
import { useVenue }  from '@/contexts/VenueContext'
import { useApp }    from '@/contexts/AppContext'
import type { ComponentId, VenueHeaderSize } from '@/types'

const FloorPanel  = lazy(() => import('@/components/panels/FloorPanel'))
const HTabPanel   = lazy(() => import('@/components/panels/HTabPanel'))
const CouponPanel = lazy(() => import('@/components/panels/CouponPanel'))
const SlotPanel   = lazy(() => import('@/components/panels/SlotPanel'))

function PanelLoader() {
  return <div className="flex items-center justify-center h-32 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>加载中…</div>
}

// ── 页面级设置 ────────────────────────────────────────────────────────────────
function PageSettings() {
  const { bgColor, setBgColor } = useVenue()
  return (
    <div className="p-4 space-y-5">
      <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
        未选中任何组件时显示页面级设置。<br />
        点击左侧图层列表或画布中的组件来配置。
      </p>

      {/* 背景色 */}
      <div>
        <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>会场背景色</div>
        <div className="flex items-center gap-3">
          <label className="relative cursor-pointer">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: bgColor, border: '1px solid rgba(255,255,255,0.15)' }} />
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
          </label>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
            {bgColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 宽度 */}
      <div>
        <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>页面宽度</div>
        <div className="px-3 py-2 rounded-xl text-[11px]" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)' }}>
          750 px · 标准会场宽度（固定）
        </div>
      </div>
    </div>
  )
}

// ── 头图配置 ──────────────────────────────────────────────────────────────────
const HEADER_SIZES: { key: VenueHeaderSize; label: string; h: number }[] = [
  { key: '424', label: '标准', h: 424 },
  { key: '624', label: '大图', h: 624 },
  { key: '274', label: '极矮', h: 274 },
]

function HeaderConfig() {
  const { headerUrl, setHeaderUrl, headerSize, setHeaderSize, bgColor, setBgColor } = useVenue()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setHeaderUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-4 space-y-5">

      {/* 上传区 */}
      <div>
        <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>头图图片</div>
        <div
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
          style={{ border: '1px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,48,96,0.4)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'}
        >
          {headerUrl ? (
            <img src={headerUrl} alt="头图"
              className="rounded shrink-0"
              style={{ width: 48, height: Math.round(48 * parseInt(headerSize) / 750), objectFit: 'cover' }}
            />
          ) : (
            <div className="rounded shrink-0 flex items-center justify-center"
              style={{ width: 48, height: 28, background: 'rgba(255,255,255,0.05)' }}>
              <ImageIcon size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {headerUrl ? '点击更换头图' : '上传头图'}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              750 × {HEADER_SIZES.find(s => s.key === headerSize)?.h ?? 424} px
            </div>
          </div>
          {headerUrl && (
            <button
              onClick={e => { e.stopPropagation(); setHeaderUrl('') }}
              className="shrink-0 p-1 rounded transition-colors"
              style={{ color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {/* 尺寸 */}
      <div>
        <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>头图高度</div>
        <div className="flex gap-1.5">
          {HEADER_SIZES.map(s => (
            <button
              key={s.key}
              onClick={() => setHeaderSize(s.key)}
              className="flex-1 py-2 text-[11px] rounded-xl transition-all"
              style={{
                border: `1px solid ${headerSize === s.key ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: headerSize === s.key ? 'rgba(255,80,80,0.1)' : 'rgba(255,255,255,0.03)',
                color: headerSize === s.key ? '#FF8080' : 'rgba(255,255,255,0.4)',
                fontWeight: headerSize === s.key ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              <div>{s.label}</div>
              <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>{s.h}px</div>
            </button>
          ))}
        </div>
      </div>

      {/* 背景色 */}
      <div>
        <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>会场背景色</div>
        <div className="flex items-center gap-3">
          <label className="relative cursor-pointer">
            <div style={{ width: 28, height: 28, borderRadius: 6, background: bgColor, border: '1px solid rgba(255,255,255,0.15)' }} />
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
          </label>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
            {bgColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 动效 + 文案（待开发占位） */}
      <div className="space-y-2">
        {[
          { label: '头图动效', desc: '入场动效、循环动效配置', icon: '✦' },
          { label: '文案叠加', desc: '在头图上叠加活动标题', icon: 'T' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.6 }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,200,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, color: 'rgba(255,180,0,0.5)' }}>
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>{item.desc}</div>
            </div>
            <span style={{ fontSize: 9, color: 'rgba(255,180,0,0.45)', border: '1px solid rgba(255,180,0,0.12)', borderRadius: 3, padding: '1px 5px', flexShrink: 0 }}>
              待开发
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 主面板 ────────────────────────────────────────────────────────────────────
interface Props {
  selectedLayer: 'header' | string | null
  onEnterFocus: (compId: ComponentId) => void
}

export default function VenueDynamicPanel({ selectedLayer, onEnterFocus }: Props) {
  const { items, hasExportAll, triggerExportAll } = useVenuePanel()
  const selectedItem = selectedLayer && selectedLayer !== 'header'
    ? items.find(it => it.id === selectedLayer)
    : null

  const panelTitle = !selectedLayer
    ? '页面设置'
    : selectedLayer === 'header'
    ? '活动头图'
    : selectedItem?.label ?? '组件配置'

  return (
    <div
      className="flex flex-col h-screen shrink-0 border-l"
      style={{ width: 280, background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* 标题栏 */}
      <div
        className="h-11 flex items-center px-4 border-b shrink-0 gap-2"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <span className="text-xs font-semibold flex-1 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {panelTitle}
        </span>

        {/* 深入编辑按钮（只对组件项显示） */}
        {selectedItem && (
          <button
            onClick={() => onEnterFocus(selectedItem.componentId)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-lg transition-all hover:opacity-90 shrink-0"
            style={{ background: 'rgba(45,120,244,0.15)', color: '#6AA3FF', border: '1px solid rgba(45,120,244,0.25)' }}
          >
            深入编辑
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        )}

        {/* 导出按钮（全局，总在右上角） */}
        {hasExportAll && (
          <button
            onClick={triggerExportAll}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-lg text-white transition-all hover:opacity-90 shrink-0"
            style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载
          </button>
        )}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        {!selectedLayer && <PageSettings />}
        {selectedLayer === 'header' && <HeaderConfig />}
        {selectedItem && (
          <Suspense fallback={<PanelLoader />}>
            {selectedItem.componentId === 'floor'  && <FloorPanel />}
            {selectedItem.componentId === 'h-tab'  && <HTabPanel />}
            {selectedItem.componentId === 'coupon' && <CouponPanel />}
            {selectedItem.componentId === 'slot'   && <SlotPanel />}
          </Suspense>
        )}
      </div>
    </div>
  )
}

// 合并 items + export 状态的小 hook，避免组件内 useApp + useVenue 重复
function useVenuePanel() {
  const { items } = useVenue()
  const { hasExportAll, triggerExportAll } = useApp()
  return { items, hasExportAll, triggerExportAll }
}
