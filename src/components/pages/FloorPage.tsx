import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useFloor } from '@/contexts/FloorContext'
import { drawFloorCanvas, downloadCanvas } from '@/utils/exportUtils'
import { type FloorConfig, type FloorVariant, type FloorDecoStyle } from '@/types'

const VARIANT_LABELS: Record<FloorVariant, string> = {
  dachao:    '大促款',
  valentine: '情人节款',
  newyear:   '年货节款',
  custom:    '自定义',
}

// ── 装饰图形库定义 ────────────────────────────────────────────────────────────
// 每种样式提供 3 种配色预览
const DECO_LIBRARY: {
  style: FloorDecoStyle
  label: string
  desc: string
  swatches: { bgColor: string; textColor: string; decoColor1: string; decoColor2: string }[]
}[] = [
  {
    style: 'arrow',
    label: '箭头形',
    desc: '闪电 + 双燕形，适合大促活动',
    swatches: [
      { bgColor: '#FF9000', textColor: '#950E0F', decoColor1: '#FFCA60', decoColor2: '#FF7399' },
      { bgColor: '#CC2000', textColor: '#FFFFFF', decoColor1: '#FFFFFF', decoColor2: '#FFFFFF' },
      { bgColor: '#FFAA00', textColor: '#7A2500', decoColor1: '#FFF0A0', decoColor2: '#FF9966' },
    ],
  },
  {
    style: 'heart',
    label: '爱心',
    desc: '大小两颗心，适合情人节',
    swatches: [
      { bgColor: '#FFCDDB', textColor: '#FF5274', decoColor1: '#FF6B8A', decoColor2: '#FF6B8A' },
      { bgColor: '#FF4C6E', textColor: '#FFFFFF', decoColor1: '#FFCCD8', decoColor2: '#FFCCD8' },
      { bgColor: '#FFF0F3', textColor: '#CC2244', decoColor1: '#E83060', decoColor2: '#E83060' },
    ],
  },
  {
    style: 'coin',
    label: '古铜钱',
    desc: '圆形镂空，适合年货节',
    swatches: [
      { bgColor: '#ED0004', textColor: '#FFFFFF', decoColor1: '#FFCA00', decoColor2: '#FFCA00' },
      { bgColor: '#8B0000', textColor: '#FFCA00', decoColor1: '#FFE066', decoColor2: '#FFE066' },
      { bgColor: '#FF6600', textColor: '#FFFFFF', decoColor1: '#FFE066', decoColor2: '#FFE066' },
    ],
  },
]

// ── 页面主体 ─────────────────────────────────────────────────────────────────
export default function FloorPage() {
  const { showToast, registerExportAll } = useApp()
  const { config, patchConfig } = useFloor()
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [exporting, setExporting] = useState(false)

  // 实时预览
  useEffect(() => {
    let cancelled = false
    drawFloorCanvas(config).then(canvas => {
      if (cancelled) return
      setPreviewUrl(canvas.toDataURL('image/png'))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [config])

  // 注册一键导出
  useEffect(() => {
    registerExportAll(async () => {
      showToast('正在渲染楼层条…')
      const canvas = await drawFloorCanvas(config)
      downloadCanvas(canvas, '楼层条_750x60.png')
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

      {/* ── 预览卡片 ── */}
      <div
        className="rounded-2xl p-6 mb-8"
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

        {/* 预览图 */}
        <div className="relative w-full overflow-hidden rounded-lg" style={{ maxWidth: 750 }}>
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

        {/* 导出 */}
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
            750 × 60 · {config.bgTransparent ? '透明背景' : '含背景色'}
          </span>
        </div>
      </div>

      {/* ── 装饰图形选择库 ── */}
      <div>
        <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-1)' }}>
          装饰图形选择库
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
          点击配色缩略图快速应用，配色和文案可在左侧继续调整
        </p>

        <div className="flex flex-col gap-6">
          {DECO_LIBRARY.map(entry => (
            <DecoGroup
              key={entry.style}
              entry={entry}
              activeStyle={config.decoStyle}
              onApply={(style, swatch) => {
                patchConfig({
                  showDeco: true,
                  decoStyle: style,
                  bgColor:    swatch.bgColor,
                  textColor:  swatch.textColor,
                  decoColor1: swatch.decoColor1,
                  decoColor2: swatch.decoColor2,
                  bgTransparent: false,
                })
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 装饰分组（模块顶层）─────────────────────────────────────────────────────
function DecoGroup({
  entry, activeStyle, onApply,
}: {
  entry: typeof DECO_LIBRARY[0]
  activeStyle: FloorDecoStyle
  onApply: (style: FloorDecoStyle, swatch: typeof DECO_LIBRARY[0]['swatches'][0]) => void
}) {
  const isActive = activeStyle === entry.style
  return (
    <div>
      {/* 分组标题 */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-medium"
          style={{ color: isActive ? '#FF5050' : 'var(--text-1)' }}
        >
          {entry.label}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
          {entry.desc}
        </span>
        {isActive && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
            style={{ background: 'rgba(255,80,80,0.12)', color: '#FF5050' }}
          >
            当前款式
          </span>
        )}
      </div>

      {/* 配色缩略图行 */}
      <div className="flex gap-2 flex-wrap">
        {entry.swatches.map((swatch, i) => (
          <DecoSwatch
            key={i}
            style={entry.style}
            swatch={swatch}
            onApply={() => onApply(entry.style, swatch)}
          />
        ))}
      </div>
    </div>
  )
}

// ── 单个配色缩略图（模块顶层）────────────────────────────────────────────────
function DecoSwatch({
  style, swatch, onApply,
}: {
  style: FloorDecoStyle
  swatch: { bgColor: string; textColor: string; decoColor1: string; decoColor2: string }
  onApply: () => void
}) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    // 用一个简短文案展示装饰图形效果
    const cfg: FloorConfig = {
      variant: 'custom',
      bgColor: swatch.bgColor,
      bgTransparent: false,
      text: '领好券 下单更优惠',
      textColor: swatch.textColor,
      showDeco: true,
      decoStyle: style,
      decoColor1: swatch.decoColor1,
      decoColor2: swatch.decoColor2,
    }
    drawFloorCanvas(cfg).then(c => setUrl(c.toDataURL('image/png'))).catch(() => {})
  }, []) // mount 时渲染一次

  return (
    <button
      onClick={onApply}
      className="overflow-hidden rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        width: 180,
        height: 15,
        background: swatch.bgColor,
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        flexShrink: 0,
      }}
      title={`${swatch.bgColor} · 点击应用`}
    >
      {url && (
        <img
          src={url}
          alt=""
          style={{ width: 180, height: 15, display: 'block' }}
        />
      )}
    </button>
  )
}
