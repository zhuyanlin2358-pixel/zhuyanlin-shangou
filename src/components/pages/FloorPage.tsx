import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useFloor } from '@/contexts/FloorContext'
import { drawFloorCanvas, downloadCanvas } from '@/utils/exportUtils'
import { FLOOR_PRESETS, type FloorConfig, type FloorVariant } from '@/types'

const VARIANT_LABELS: Record<FloorVariant, string> = {
  dachao:    '大促款',
  valentine: '情人节款',
  newyear:   '年货节款',
  custom:    '自定义',
}

export default function FloorPage() {
  const { showToast, registerExportAll } = useApp()
  const { config, applyVariant } = useFloor()
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [exporting, setExporting] = useState(false)

  // 实时预览：config 变化时重绘
  useEffect(() => {
    let cancelled = false
    drawFloorCanvas(config).then(canvas => {
      if (cancelled) return
      setPreviewUrl(canvas.toDataURL('image/png'))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [config])

  // 注册「一键导出 ZIP」（只有 1 个文件，直接下 PNG 即可）
  useEffect(() => {
    registerExportAll(async () => {
      showToast('正在渲染楼层条…')
      const canvas = await drawFloorCanvas(config)
      downloadCanvas(canvas, `楼层条_750x60.png`)
      showToast('✅ 已导出：楼层条_750x60.png')
    })
  }, [config, registerExportAll, showToast])

  const handleExport = async () => {
    setExporting(true)
    showToast('正在渲染楼层条…')
    try {
      const canvas = await drawFloorCanvas(config)
      downloadCanvas(canvas, '楼层条_750x60.png')
      showToast('✅ 已导出：楼层条_750x60.png')
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
    setExporting(false)
  }

  return (
    <div className="p-8" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* 页面标题 */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
          楼层条
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          高达组件 C 类 · 750 × 60 px · 会场楼层分隔条
        </p>
      </div>

      {/* 预览卡片 */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            预览 · 750 × 60 px
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'var(--bg)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
          >
            {VARIANT_LABELS[config.variant]}
          </span>
        </div>

        {/* 预览图（全宽等比；透明背景时叠加棋盘格）*/}
        <div className="relative w-full overflow-hidden rounded-lg" style={{ maxWidth: 750 }}>
          {/* 棋盘格底层（透明时可见，有底色时被图片遮住） */}
          {config.bgTransparent && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'repeating-conic-gradient(#d0d0d0 0% 25%, #f5f5f5 0% 50%)',
                backgroundSize: '12px 12px',
              }}
            />
          )}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="楼层条预览"
              className="relative w-full block slot-card-preview"
              draggable={false}
            />
          ) : (
            <div
              className="relative w-full flex items-center justify-center text-xs"
              style={{ height: 60, background: 'var(--bg)', color: 'var(--text-3)' }}
            >
              渲染中…
            </div>
          )}
        </div>

        {/* 导出区 */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
          >
            <Download size={13} />
            {exporting ? '导出中…' : '导出 PNG'}
          </button>
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            750 × 60 · 含背景色
          </span>
        </div>
      </div>

      {/* 全部预设快览 */}
      <div>
        <div className="text-xs mb-3" style={{ color: 'var(--text-2)' }}>全部预设快览</div>
        <div className="flex flex-col gap-2" style={{ maxWidth: 640 }}>
          {(['dachao', 'valentine', 'newyear'] as FloorVariant[]).map(v => (
            <VariantThumb
              key={v}
              variant={v}
              label={VARIANT_LABELS[v]}
              active={config.variant === v}
              onClick={() => applyVariant(v)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 预设缩略图按钮（模块顶层，防止 re-mount）────────────────────────────────
function VariantThumb({
  variant, label, active, onClick,
}: {
  variant: FloorVariant
  label: string
  active: boolean
  onClick: () => void
}) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    const cfg: FloorConfig = { variant, ...FLOOR_PRESETS[variant] }
    drawFloorCanvas(cfg).then(c => setUrl(c.toDataURL('image/png'))).catch(() => {})
  }, []) // mount 时渲染一次即可

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all"
      style={{
        border: `1px solid ${active ? '#FF5050' : 'var(--border)'}`,
        background: active ? 'rgba(255,80,80,0.04)' : 'var(--bg-subtle)',
      }}
    >
      {/* 缩略预览条 */}
      <div
        className="overflow-hidden rounded shrink-0"
        style={{ width: 160, height: 13, background: 'var(--bg)' }}
      >
        {url && (
          <img
            src={url}
            alt={label}
            style={{ width: 160, height: 13, display: 'block' }}
          />
        )}
      </div>
      <span className="text-xs" style={{ color: active ? '#FF5050' : 'var(--text-2)' }}>
        {label}
      </span>
    </button>
  )
}
