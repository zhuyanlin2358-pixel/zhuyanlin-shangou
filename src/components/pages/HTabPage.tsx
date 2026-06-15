import { useState, useEffect, useCallback } from 'react'
import { Download } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useHTab } from '@/contexts/HTabContext'
import { drawHTabCanvas, downloadCanvas, downloadZip } from '@/utils/exportUtils'
import { H_TAB_COLORS, type HTabColorKey, type HTabConfig } from '@/types'

const COLOR_KEYS = Object.keys(H_TAB_COLORS) as HTabColorKey[]

export default function HTabPage() {
  const { showToast, registerExportAll } = useApp()
  const { config, setColor } = useHTab()
  const [previewUrl, setPreviewUrl] = useState('')
  const [exporting, setExporting] = useState(false)

  // 实时预览
  useEffect(() => {
    let cancelled = false
    drawHTabCanvas(config).then(c => {
      if (cancelled) return
      setPreviewUrl(c.toDataURL('image/png'))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [config])

  // 导出全部 7 种颜色（当前选中 Tab 位置）
  const handleExportAll = useCallback(async () => {
    setExporting(true)
    showToast('正在渲染 7 种颜色 Tab…')
    try {
      const canvases = await Promise.all(
        COLOR_KEYS.map(k =>
          drawHTabCanvas({ ...config, colorKey: k })
        )
      )
      await downloadZip(
        canvases.map((c, i) => ({
          canvas: c,
          name: `横滑Tab_${H_TAB_COLORS[COLOR_KEYS[i]].name}_750x88.png`,
        })),
        '横滑Tab_全色_750x88'
      )
      showToast('✅ 已导出 7 种颜色 ZIP')
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
    setExporting(false)
  }, [config, showToast])

  const handleExportSingle = useCallback(async () => {
    setExporting(true)
    showToast('正在渲染…')
    try {
      const canvas = await drawHTabCanvas(config)
      const name = `横滑Tab_${H_TAB_COLORS[config.colorKey].name}_750x88.png`
      downloadCanvas(canvas, name)
      showToast(`✅ 已导出：${name}`)
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
    setExporting(false)
  }, [config, showToast])

  // 注册「一键导出 ZIP」
  useEffect(() => {
    registerExportAll(handleExportAll)
  }, [handleExportAll, registerExportAll])

  return (
    <div className="p-8" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* 标题 */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
          横滑 Tab
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          高达组件 C 类 · 750 × 88 px · 7 种配色 · 透明底 PNG
        </p>
      </div>

      {/* 当前预览 */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            预览 · 750 × 88 px
          </span>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: H_TAB_COLORS[config.colorKey].bg + '33', color: H_TAB_COLORS[config.colorKey].bg, border: `1px solid ${H_TAB_COLORS[config.colorKey].bg}66` }}
            >
              {H_TAB_COLORS[config.colorKey].name}
            </span>
          </div>
        </div>

        {/* 预览图（透明底，不叠背景色） */}
        <div
          className="w-full overflow-hidden rounded-lg"
          style={{
            maxWidth: 750,
            backgroundImage: 'repeating-conic-gradient(#d0d0d0 0% 25%, #f5f5f5 0% 50%)',
            backgroundSize: '12px 12px',
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="横滑Tab预览"
              className="w-full block slot-card-preview"
              draggable={false}
            />
          ) : (
            <div
              className="w-full flex items-center justify-center text-xs"
              style={{ height: 88, color: 'var(--text-3)' }}
            >
              渲染中…
            </div>
          )}
        </div>

        {/* 导出按钮 */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleExportSingle}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
          >
            <Download size={13} />
            {exporting ? '渲染中…' : '导出当前色 PNG'}
          </button>
          <button
            onClick={handleExportAll}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg disabled:opacity-50"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
          >
            <Download size={13} />
            {exporting ? '渲染中…' : '导出全部 7 色 ZIP'}
          </button>
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>750 × 88 · 透明底</span>
        </div>
      </div>

      {/* 全部颜色预览库 */}
      <div>
        <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-1)' }}>
          全部配色预览
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
          点击切换当前配色，标签文案和选中状态可在左侧面板调整
        </p>
        <div className="flex flex-col gap-2" style={{ maxWidth: 750 }}>
          {COLOR_KEYS.map(k => (
            <ColorRow
              key={k}
              colorKey={k}
              config={config}
              active={config.colorKey === k}
              onSelect={() => setColor(k)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 单行颜色预览（模块顶层）──────────────────────────────────────────────────
function ColorRow({
  colorKey, config, active, onSelect,
}: {
  colorKey: HTabColorKey
  config: HTabConfig
  active: boolean
  onSelect: () => void
}) {
  const [url, setUrl] = useState('')
  const def = H_TAB_COLORS[colorKey]

  useEffect(() => {
    drawHTabCanvas({ ...config, colorKey })
      .then(c => setUrl(c.toDataURL('image/png')))
      .catch(() => {})
    // 重绘当 tabs / activeIndex 变化时
  }, [colorKey, config.tabs.join('|'), config.activeIndex])

  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
      style={{
        border: `1px solid ${active ? '#FF5050' : 'var(--border)'}`,
        background: active ? 'rgba(255,80,80,0.04)' : 'var(--bg-subtle)',
      }}
    >
      {/* 色标 */}
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ background: def.bg }}
      />
      <span className="text-xs w-10 shrink-0" style={{ color: active ? '#FF5050' : 'var(--text-2)' }}>
        {def.name}
      </span>
      {/* 缩略图 */}
      <div
        className="flex-1 overflow-hidden rounded"
        style={{ height: 18, background: 'transparent' }}
      >
        {url && (
          <img src={url} alt={def.name} style={{ width: '100%', height: 18, display: 'block' }} />
        )}
      </div>
    </button>
  )
}
