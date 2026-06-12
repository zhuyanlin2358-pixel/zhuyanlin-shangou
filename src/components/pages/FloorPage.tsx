import { useState, useEffect, useRef, useCallback } from 'react'
import { Download, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useFloor } from '@/contexts/FloorContext'
import { drawFloorCanvas, downloadCanvas, downloadZip } from '@/utils/exportUtils'
import { type FloorConfig, type FloorDecoStyle } from '@/types'

// ── 装饰图形库 ────────────────────────────────────────────────────────────────
const DECO_LIBRARY: {
  style: FloorDecoStyle
  label: string
  desc: string
  swatches: { bgColor: string; textColor: string; decoColor1: string; decoColor2: string }[]
}[] = [
  {
    style: 'arrow', label: '箭头形', desc: '闪电 + 双燕形，适合大促活动',
    swatches: [
      { bgColor: '#FF9000', textColor: '#950E0F', decoColor1: '#FFCA60', decoColor2: '#FF7399' },
      { bgColor: '#CC2000', textColor: '#FFFFFF', decoColor1: '#FFFFFF', decoColor2: '#FFFFFF' },
      { bgColor: '#FFAA00', textColor: '#7A2500', decoColor1: '#FFF0A0', decoColor2: '#FF9966' },
    ],
  },
  {
    style: 'heart', label: '爱心', desc: '大小两颗心，适合情人节',
    swatches: [
      { bgColor: '#FFCDDB', textColor: '#FF5274', decoColor1: '#FF6B8A', decoColor2: '#FF6B8A' },
      { bgColor: '#FF4C6E', textColor: '#FFFFFF', decoColor1: '#FFCCD8', decoColor2: '#FFCCD8' },
      { bgColor: '#FFF0F3', textColor: '#CC2244', decoColor1: '#E83060', decoColor2: '#E83060' },
    ],
  },
  {
    style: 'coin', label: '古铜钱', desc: '圆形镂空，适合年货节',
    swatches: [
      { bgColor: '#ED0004', textColor: '#FFFFFF', decoColor1: '#FFCA00', decoColor2: '#FFCA00' },
      { bgColor: '#8B0000', textColor: '#FFCA00', decoColor1: '#FFE066', decoColor2: '#FFE066' },
      { bgColor: '#FF6600', textColor: '#FFFFFF', decoColor1: '#FFE066', decoColor2: '#FFE066' },
    ],
  },
]

// ── 页面 ─────────────────────────────────────────────────────────────────────
export default function FloorPage() {
  const { showToast, registerExportAll } = useApp()
  const { config, patchConfig, floors, addFloor } = useFloor()
  const [exporting, setExporting] = useState(false)

  // 导出全部楼层
  const handleExportAll = useCallback(async () => {
    setExporting(true)
    showToast(`正在渲染 ${floors.length} 条楼层条…`)
    try {
      const canvases = await Promise.all(
        floors.map(f => drawFloorCanvas({ ...config, text: f.text }))
      )
      if (floors.length === 1) {
        downloadCanvas(canvases[0], `楼层条_${floors[0].text}_750x60.png`)
        showToast('✅ 已导出：楼层条 PNG')
      } else {
        await downloadZip(
          canvases.map((c, i) => ({ canvas: c, name: `楼层条_${String(i + 1).padStart(2, '0')}_${floors[i].text}_750x60.png` })),
          `楼层条_${floors.length}条_750x60`
        )
        showToast(`✅ 已导出 ${floors.length} 条楼层条 ZIP`)
      }
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
    setExporting(false)
  }, [config, floors, showToast])

  // 注册一键导出
  useEffect(() => {
    registerExportAll(handleExportAll)
  }, [handleExportAll, registerExportAll])

  return (
    <div className="p-8" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* 页面标题 */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
          楼层条
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          高达组件 C 类 · 750 × 60 px · 透明底 PNG（背景色仅预览用）
        </p>
      </div>

      {/* ── 楼层列表 ── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
            楼层列表
            <span
              className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
            >
              {floors.length} 条
            </span>
          </span>

          {/* 导出按钮 */}
          <button
            onClick={handleExportAll}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
          >
            <Download size={12} />
            {exporting
              ? '导出中…'
              : floors.length > 1
                ? `导出 ${floors.length} 条 ZIP`
                : '导出 PNG'}
          </button>
        </div>

        {/* 楼层条目列表 */}
        <div className="flex flex-col gap-2">
          {floors.map((floor, idx) => (
            <FloorListItem
              key={floor.id}
              id={floor.id}
              text={floor.text}
              index={idx}
              total={floors.length}
              config={config}
            />
          ))}
        </div>

        {/* + 楼层 按钮 */}
        <button
          onClick={addFloor}
          className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-xl transition-all hover:opacity-80"
          style={{
            border: '1.5px dashed var(--border)',
            color: 'var(--text-3)',
          }}
        >
          <Plus size={13} />
          添加楼层
        </button>
      </div>

      {/* ── 装饰图形选择库 ── */}
      <div className="mt-8">
        <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-1)' }}>
          装饰图形选择库
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
          点击配色缩略图快速应用，配色可在左侧继续调整
        </p>
        <div className="flex flex-col gap-6">
          {DECO_LIBRARY.map(entry => (
            <DecoGroup
              key={entry.style}
              entry={entry}
              activeStyle={config.decoStyle}
              onApply={(style, swatch) => {
                patchConfig({
                  showDeco: true, decoStyle: style,
                  bgColor: swatch.bgColor, textColor: swatch.textColor,
                  decoColor1: swatch.decoColor1, decoColor2: swatch.decoColor2,
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

// ── 单条楼层（模块顶层，防止 re-mount）─────────────────────────────────────
function FloorListItem({
  id, text, index, total, config,
}: {
  id: string; text: string; index: number; total: number; config: FloorConfig
}) {
  const { updateFloor, removeFloor, moveFloor } = useFloor()
  const [previewUrl, setPreviewUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 当文案或样式变化时重绘预览
  const configKey = `${config.bgColor}|${config.bgTransparent}|${config.textColor}|${config.showDeco}|${config.decoStyle}|${config.decoColor1}|${config.decoColor2}`
  useEffect(() => {
    let cancelled = false
    drawFloorCanvas({ ...config, text }).then(c => {
      if (cancelled) return
      setPreviewUrl(c.toDataURL('image/png'))
    }).catch(() => {})
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, configKey])

  // 外部 text 变化时同步 input（如预设切换）
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== text) {
      inputRef.current.value = text
    }
  }, [text])

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
    >
      {/* 预览条 */}
      <div
        className="relative w-full overflow-hidden"
        style={{ background: config.bgTransparent ? undefined : config.bgColor }}
      >
        {config.bgTransparent && (
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-conic-gradient(#d0d0d0 0% 25%, #f5f5f5 0% 50%)',
            backgroundSize: '12px 12px',
          }} />
        )}
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={text}
            className="relative w-full block slot-card-preview"
            draggable={false}
          />
        ) : (
          <div
            className="relative w-full flex items-center justify-center"
            style={{ height: 40, color: 'var(--text-3)', fontSize: 11 }}
          >渲染中…</div>
        )}
      </div>

      {/* 文案输入 + 操作按钮 */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* 序号 */}
        <span
          className="text-[10px] font-mono shrink-0 w-5 text-center"
          style={{ color: 'var(--text-3)' }}
        >
          {index + 1}
        </span>

        {/* 文案输入框（非受控，防止失焦） */}
        <input
          ref={inputRef}
          defaultValue={text}
          onChange={e => updateFloor(id, e.target.value)}
          placeholder="请输入楼层文案"
          maxLength={20}
          className="flex-1 min-w-0 rounded-lg px-2.5 py-1.5 text-xs bg-transparent outline-none"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-1)',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
        />

        {/* 上移 / 下移 */}
        <button
          onClick={() => moveFloor(id, 'up')}
          disabled={index === 0}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors disabled:opacity-20"
          style={{ color: 'var(--text-3)' }}
        >
          <ChevronUp size={13} />
        </button>
        <button
          onClick={() => moveFloor(id, 'down')}
          disabled={index === total - 1}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors disabled:opacity-20"
          style={{ color: 'var(--text-3)' }}
        >
          <ChevronDown size={13} />
        </button>

        {/* 删除 */}
        <button
          onClick={() => removeFloor(id)}
          disabled={total === 1}
          className="w-6 h-6 flex items-center justify-center rounded transition-colors disabled:opacity-20 hover:text-red-400"
          style={{ color: 'var(--text-3)' }}
        >
          <Trash2 size={12} />
        </button>
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
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-medium"
          style={{ color: activeStyle === entry.style ? '#FF5050' : 'var(--text-1)' }}
        >
          {entry.label}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>{entry.desc}</span>
        {activeStyle === entry.style && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
            style={{ background: 'rgba(255,80,80,0.12)', color: '#FF5050' }}
          >当前款式</span>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        {entry.swatches.map((swatch, i) => (
          <DecoSwatch key={i} style={entry.style} swatch={swatch} onApply={() => onApply(entry.style, swatch)} />
        ))}
      </div>
    </div>
  )
}

// ── 配色缩略图（模块顶层）────────────────────────────────────────────────────
function DecoSwatch({
  style, swatch, onApply,
}: {
  style: FloorDecoStyle
  swatch: { bgColor: string; textColor: string; decoColor1: string; decoColor2: string }
  onApply: () => void
}) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    const cfg: FloorConfig = {
      variant: 'custom', bgColor: swatch.bgColor, bgTransparent: false,
      text: '领好券 下单更优惠',
      textColor: swatch.textColor, showDeco: true, decoStyle: style,
      decoColor1: swatch.decoColor1, decoColor2: swatch.decoColor2,
    }
    drawFloorCanvas(cfg).then(c => setUrl(c.toDataURL('image/png'))).catch(() => {})
  }, [])

  return (
    <button
      onClick={onApply}
      className="overflow-hidden rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{
        width: 180, height: 15, background: swatch.bgColor,
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)', flexShrink: 0,
      }}
      title={`${swatch.bgColor} · 点击应用`}
    >
      {url && <img src={url} alt="" style={{ width: 180, height: 15, display: 'block' }} />}
    </button>
  )
}
