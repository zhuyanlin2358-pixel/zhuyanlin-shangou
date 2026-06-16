import { useState, useEffect, useCallback, useRef } from 'react'
import { Download, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useHTab, type HTabItem } from '@/contexts/HTabContext'
import { drawHTabCanvas, drawHTabSingleTabCanvas, downloadCanvas, downloadZip } from '@/utils/exportUtils'
import { H_TAB_COLORS, type HTabConfig } from '@/types'
import VenueAddButton from '@/components/ui/VenueAddButton'

const TAB_COUNTS = [2, 3, 4]

export default function HTabPage() {
  const { showToast, registerExportAll } = useApp()
  const { config, items, addItem } = useHTab()
  const [exporting, setExporting] = useState(false)

  // 导出全部条目
  // 每个 Tab → 2张：选中版（带箭头，Figma 精确尺寸）+ 未选中版
  // 尺寸：2tab=336×88，3tab=226×88，4tab=180×88
  const handleExportAll = useCallback(async () => {
    setExporting(true)
    const totalPngs = items.reduce((sum, it) => sum + it.tabs.length * 2, 0)
    showToast(`正在渲染 ${totalPngs} 张横滑 Tab…`)
    try {
      const colorName = H_TAB_COLORS[config.colorKey].name
      const files: { canvas: HTMLCanvasElement; name: string }[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const N = item.tabs.length
        const W = N === 2 ? 336 : N === 3 ? 226 : 180
        const prefix = items.length > 1 ? `${String(i + 1).padStart(2, '0')}_` : ''

        // 子文件夹按 Tab 数量分类，防止不同尺寸素材混在一起
        const folder = `${N}tab_${W}x88/`

        for (let k = 0; k < N; k++) {
          const label = item.tabs[k]
          const suffix = `${prefix}${colorName}_${k + 1}${label}`

          // 选中版：渐变背景 + 箭头指示器
          const selCanvas = await drawHTabSingleTabCanvas(label, true,  N, config.colorKey)
          files.push({ canvas: selCanvas, name: `${folder}横滑Tab_${suffix}_选中.png` })

          // 未选中版：饱和色实色
          const unselCanvas = await drawHTabSingleTabCanvas(label, false, N, config.colorKey)
          files.push({ canvas: unselCanvas, name: `${folder}横滑Tab_${suffix}_未选中.png` })
        }
      }

      if (files.length === 1) {
        downloadCanvas(files[0].canvas, files[0].name)
        showToast('✅ 已导出 PNG')
      } else {
        const firstN = items[0].tabs.length
        const wLabel = firstN === 2 ? 336 : firstN === 3 ? 226 : 180
        await downloadZip(files, `横滑Tab_${colorName}_${wLabel}x88`)
        showToast(`✅ 已导出 ${files.length} 张 ZIP`)
      }
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
    setExporting(false)
  }, [config, items, showToast])

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
          高达组件 C 类 · 750 × 88 px · 透明底 PNG · 配色在左侧面板切换
        </p>
      </div>

      {/* 条目列表标题行 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
          Tab 列表
          <span
            className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)', border: '1px solid var(--border)' }}
          >
            {items.length} 条
          </span>
        </span>
        <button
          onClick={handleExportAll}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
        >
          <Download size={12} />
          {exporting ? '导出中…' : (() => {
            const total = items.reduce((s, it) => s + it.tabs.length * 2, 0)
            return total <= 2 ? '导出 PNG × 2' : `导出 ${total} 张 ZIP`
          })()}
        </button>
      </div>

      {/* 条目列表 */}
      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <HTabListItem
            key={item.id}
            item={item}
            index={idx}
            total={items.length}
            config={config}
          />
        ))}
      </div>

      {/* + 添加按钮 */}
      <button
        onClick={addItem}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 text-xs rounded-xl transition-all hover:opacity-80"
        style={{ border: '1.5px dashed var(--border)', color: 'var(--text-3)' }}
      >
        <Plus size={13} />
        添加横滑 Tab
      </button>
    </div>
  )
}

// ── 单条 Tab 条目（模块顶层，防止 re-mount）─────────────────────────────────
function HTabListItem({
  item, index, total, config,
}: {
  item: HTabItem; index: number; total: number; config: HTabConfig
}) {
  const { updateItem, removeItem, moveItem } = useHTab()
  const [previewUrl, setPreviewUrl] = useState('')
  const color = H_TAB_COLORS[config.colorKey]

  // 样式或内容变化时重绘预览
  const configKey = config.colorKey
  useEffect(() => {
    let cancelled = false
    drawHTabCanvas({ colorKey: configKey, tabs: item.tabs, activeIndex: item.activeIndex })
      .then(c => { if (!cancelled) setPreviewUrl(c.toDataURL('image/png')) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [configKey, item.tabs.join('|'), item.activeIndex])

  const setTabText = (i: number, text: string) => {
    const tabs = [...item.tabs]
    tabs[i] = text
    updateItem(item.id, { tabs })
  }

  const setTabCount = (n: number) => {
    const tabs = Array.from({ length: n }, (_, i) => item.tabs[i] ?? `标签 ${i + 1}`)
    updateItem(item.id, { tabs, activeIndex: Math.min(item.activeIndex, n - 1) })
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-subtle)' }}
    >
      {/* 预览条 */}
      <div
        className="w-full overflow-hidden"
        style={{
          backgroundImage: 'repeating-conic-gradient(#d0d0d0 0% 25%, #f5f5f5 0% 50%)',
          backgroundSize: '12px 12px',
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt=""
            className="w-full block slot-card-preview"
            draggable={false}
          />
        ) : (
          <div
            className="w-full flex items-center justify-center"
            style={{ height: 44, color: 'var(--text-3)', fontSize: 11 }}
          >
            渲染中…
          </div>
        )}
      </div>

      {/* 编辑区 */}
      <div className="p-3 space-y-2.5">
        {/* Tab 数量 + 序号 + 操作 */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono w-5 text-center shrink-0" style={{ color: 'var(--text-3)' }}>
            {index + 1}
          </span>
          {/* Tab 数量选择 */}
          <div className="flex gap-1">
            {TAB_COUNTS.map(n => (
              <button
                key={n}
                onClick={() => setTabCount(n)}
                className="w-7 h-6 text-[10px] rounded transition-all"
                style={{
                  border: `1px solid ${item.tabs.length === n ? color.inactiveBg : 'rgba(255,255,255,0.1)'}`,
                  background: item.tabs.length === n ? color.inactiveBg + '22' : 'transparent',
                  color: item.tabs.length === n ? color.inactiveBg : 'rgba(255,255,255,0.4)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="text-[10px] ml-1" style={{ color: 'var(--text-3)' }}>个</span>

          {/* 弹性空白 */}
          <div className="flex-1" />

          {/* 上移/下移/删除 */}
          <button onClick={() => moveItem(item.id, 'up')} disabled={index === 0}
            className="w-6 h-6 flex items-center justify-center rounded disabled:opacity-20"
            style={{ color: 'var(--text-3)' }}>
            <ChevronUp size={13} />
          </button>
          <button onClick={() => moveItem(item.id, 'down')} disabled={index === total - 1}
            className="w-6 h-6 flex items-center justify-center rounded disabled:opacity-20"
            style={{ color: 'var(--text-3)' }}>
            <ChevronDown size={13} />
          </button>
          <button onClick={() => removeItem(item.id)} disabled={total === 1}
            className="w-6 h-6 flex items-center justify-center rounded disabled:opacity-20 hover:text-red-400"
            style={{ color: 'var(--text-3)' }}>
            <Trash2 size={12} />
          </button>
          {/* 加入会场（仅在会场页显示）*/}
          <VenueAddButton
            componentId="h-tab"
            label={`横滑Tab · ${H_TAB_COLORS[config.colorKey].name} · ${item.tabs.length}tab`}
            previewUrl={previewUrl}
            origW={750}
            origH={88}
            sourceId={item.id}
          />
        </div>

        {/* Tab 标签文案 + 点击切换选中 */}
        <div className="flex gap-1.5 flex-wrap">
          {item.tabs.map((tab, i) => (
            <TabLabelInput
              key={i}
              index={i}
              value={tab}
              active={item.activeIndex === i}
              bgColor={color.inactiveBg}
              onChangeText={text => setTabText(i, text)}
              onSetActive={() => updateItem(item.id, { activeIndex: i })}
            />
          ))}
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>
          点击标签序号切换预览选中状态
        </p>
      </div>
    </div>
  )
}

// ── 单个标签输入（模块顶层）──────────────────────────────────────────────────
function TabLabelInput({
  index, value, active, bgColor, onChangeText, onSetActive,
}: {
  index: number; value: string; active: boolean; bgColor: string
  onChangeText: (v: string) => void; onSetActive: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value
    }
  }, [value])

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onSetActive}
        className="w-5 h-5 text-[9px] font-mono rounded-full flex items-center justify-center shrink-0 transition-all"
        style={{
          background: active ? bgColor : 'rgba(255,255,255,0.08)',
          color: active ? '#fff' : 'rgba(255,255,255,0.35)',
        }}
        title="点击设为选中状态"
      >
        {index + 1}
      </button>
      <input
        ref={inputRef}
        defaultValue={value}
        onChange={e => onChangeText(e.target.value)}
        placeholder={`标签 ${index + 1}`}
        maxLength={8}
        className="rounded-lg px-2 py-1 text-xs outline-none"
        style={{
          width: 72,
          border: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text-1)',
        }}
        onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}
