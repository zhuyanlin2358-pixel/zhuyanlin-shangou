/**
 * 会场管理（VenuePage 内部 home 视图）
 * 功能：头图设置 · 背景色 · 已加入组件列表（排序/间距/删除）· 导出会场拼图
 */
import { useRef, useCallback, useState } from 'react'
import { Trash2, ChevronUp, ChevronDown, Download, ImageIcon } from 'lucide-react'
import { useVenue } from '@/contexts/VenueContext'
import { useApp }   from '@/contexts/AppContext'
import { ColorField } from '@/components/ui/PanelField'
import type { VenueHeaderSize } from '@/types'

const HEADER_SIZES: { key: VenueHeaderSize; label: string; h: number }[] = [
  { key: '424', label: '标准头图', h: 424 },
  { key: '624', label: '大头图',   h: 624 },
  { key: '274', label: '极矮头图', h: 274 },
]

export default function VenueManager() {
  const {
    items, removeItem, moveItem, setSpacing,
    headerUrl, setHeaderUrl, headerSize, setHeaderSize,
    bgColor, setBgColor,
  } = useVenue()
  const { showToast } = useApp()
  const [exporting, setExporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // 上传头图
  const handleHeaderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setHeaderUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // 导出会场拼图
  const handleExportVenue = useCallback(async () => {
    if (!headerUrl && items.length === 0) {
      showToast('请先添加头图或组件')
      return
    }
    setExporting(true)
    showToast('正在合成会场拼图…')

    try {
      const W = 750
      const headerH = headerUrl ? parseInt(headerSize) : 0

      // 计算总高度
      let totalH = headerH
      for (const it of items) {
        totalH += it.spacingAbove + it.origH
      }

      const canvas = document.createElement('canvas')
      canvas.width = W; canvas.height = totalH
      const ctx = canvas.getContext('2d')!

      // 背景色
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, W, totalH)

      // 头图
      let curY = 0
      if (headerUrl && headerH > 0) {
        await new Promise<void>(res => {
          const img = new Image()
          img.onload = () => { ctx.drawImage(img, 0, 0, W, headerH); res() }
          img.onerror = () => res()
          img.src = headerUrl
        })
        curY = headerH
      }

      // 各组件
      for (const it of items) {
        curY += it.spacingAbove
        // 间距区域用背景色填充
        ctx.fillStyle = bgColor
        ctx.fillRect(0, curY - it.spacingAbove, W, it.spacingAbove)

        await new Promise<void>(res => {
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(img, 0, curY, W, it.origH)
            res()
          }
          img.onerror = () => res()
          img.src = it.previewUrl
        })
        curY += it.origH
      }

      // 下载
      const link = document.createElement('a')
      link.download = '会场拼图.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast('✅ 已导出：会场拼图.png')
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知'}`)
    }
    setExporting(false)
  }, [headerUrl, headerSize, bgColor, items, showToast])

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text-1)' }}>
        会场搭建
      </h2>

      {/* ── 头图设置 ── */}
      <section className="mb-6">
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>
          头图
        </div>

        {/* 尺寸切换 */}
        <div className="flex gap-2 mb-3">
          {HEADER_SIZES.map(s => (
            <button
              key={s.key}
              onClick={() => setHeaderSize(s.key)}
              className="px-3 py-1.5 text-xs rounded-lg transition-all"
              style={{
                border: `1px solid ${headerSize === s.key ? '#FF5050' : 'var(--border)'}`,
                background: headerSize === s.key ? 'rgba(255,80,80,0.08)' : 'var(--bg-subtle)',
                color: headerSize === s.key ? '#FF8080' : 'var(--text-2)',
              }}
            >
              {s.label}
              <span className="ml-1 opacity-50">750×{s.h}</span>
            </button>
          ))}
        </div>

        {/* 上传区 */}
        <div
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:opacity-80"
          style={{ border: '1.5px dashed var(--border)', background: 'var(--bg-subtle)' }}
        >
          {headerUrl ? (
            <img
              src={headerUrl}
              alt="头图预览"
              className="rounded"
              style={{ width: 80, height: Math.round(80 * parseInt(headerSize) / 750), objectFit: 'cover' }}
            />
          ) : (
            <div className="w-16 h-10 rounded flex items-center justify-center" style={{ background: 'var(--bg)' }}>
              <ImageIcon size={18} style={{ color: 'var(--text-3)' }} />
            </div>
          )}
          <div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>
              {headerUrl ? '点击更换头图' : '上传头图'}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              750 × {HEADER_SIZES.find(s => s.key === headerSize)?.h} px，置顶显示
            </div>
          </div>
          {headerUrl && (
            <button
              onClick={e => { e.stopPropagation(); setHeaderUrl('') }}
              className="ml-auto text-xs px-2 py-1 rounded"
              style={{ color: 'var(--text-3)' }}
            >
              移除
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleHeaderUpload} />
      </section>

      {/* ── 背景色 ── */}
      <section className="mb-6">
        <ColorField label="会场背景色" value={bgColor} onChange={setBgColor} />
      </section>

      {/* ── 已加入组件列表 ── */}
      <section className="mb-6">
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-2)' }}>
          已加入组件
          <span className="ml-2 font-normal" style={{ color: 'var(--text-3)' }}>
            {items.length === 0 ? '暂无，点击左侧导航加入组件' : `共 ${items.length} 个`}
          </span>
        </div>

        {items.length === 0 ? (
          <div
            className="flex items-center justify-center py-10 rounded-xl text-xs"
            style={{ border: '1.5px dashed var(--border)', color: 'var(--text-3)' }}
          >
            左侧点击组件进入配置页，配置好后点「加入会场」
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <VenueItemRow
                key={item.id}
                item={item}
                index={idx}
                total={items.length}
                onMove={dir => moveItem(item.id, dir)}
                onRemove={() => removeItem(item.id)}
                onSpacing={v => setSpacing(item.id, v)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 导出 ── */}
      <section>
        <button
          onClick={handleExportVenue}
          disabled={exporting || (items.length === 0 && !headerUrl)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl text-white disabled:opacity-40 transition-colors"
          style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
        >
          <Download size={14} />
          {exporting ? '合成中…' : '导出会场拼图 PNG'}
        </button>
        <p className="text-[10px] mt-2" style={{ color: 'var(--text-3)' }}>
          头图 + 组件拼合为一张完整大图，组件间距用背景色填充
        </p>
      </section>
    </div>
  )
}

// ── 单个组件行（模块顶层）────────────────────────────────────────────────────
function VenueItemRow({
  item, index, total, onMove, onRemove, onSpacing,
}: {
  item: ReturnType<typeof useVenue>['items'][0]
  index: number; total: number
  onMove: (dir: 'up' | 'down') => void
  onRemove: () => void
  onSpacing: (v: number) => void
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
    >
      {/* 预览缩略图 */}
      {/* 完整比例预览 */}
      <div className="overflow-hidden" style={{ background: '#f0f0f0', lineHeight: 0 }}>
        <img
          src={item.previewUrl}
          alt={item.label}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* 控制行 */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-[10px] font-mono w-4 text-center shrink-0" style={{ color: 'var(--text-3)' }}>
          {index + 1}
        </span>
        <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-1)' }}>
          {item.label}
        </span>
        <span className="text-[10px] shrink-0" style={{ color: 'var(--text-3)' }}>
          间距
        </span>
        <input
          type="range"
          min={0} max={60} step={2}
          value={item.spacingAbove}
          onChange={e => onSpacing(Number(e.target.value))}
          className="w-20 shrink-0"
          style={{ accentColor: '#FF5050' }}
        />
        <span className="text-[10px] w-7 shrink-0 text-right" style={{ color: 'var(--text-2)' }}>
          {item.spacingAbove}px
        </span>
        <button onClick={() => onMove('up')} disabled={index === 0}
          className="w-6 h-6 flex items-center justify-center disabled:opacity-20" style={{ color: 'var(--text-3)' }}>
          <ChevronUp size={13} />
        </button>
        <button onClick={() => onMove('down')} disabled={index === total - 1}
          className="w-6 h-6 flex items-center justify-center disabled:opacity-20" style={{ color: 'var(--text-3)' }}>
          <ChevronDown size={13} />
        </button>
        <button onClick={onRemove}
          className="w-6 h-6 flex items-center justify-center hover:text-red-400" style={{ color: 'var(--text-3)' }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
