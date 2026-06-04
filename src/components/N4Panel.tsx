import { useState, useRef, useCallback } from 'react'
import html2canvas from 'html2canvas'

type N4VariantId =
  | 'text-only' | 'price-3digit' | 'price-2digit' | 'price-1digit'
  | 'discount-2digit' | 'discount-1digit' | 'fullcut-2digit' | 'fullcut-1digit'

const VARIANTS: Record<N4VariantId, { label: string; hint: string; maxLen: number }> = {
  'text-only':       { label: '纯汉字',   hint: '最多3字，如：免单',  maxLen: 3 },
  'price-3digit':    { label: '￥三位数', hint: '3位数字，如：200',   maxLen: 3 },
  'price-2digit':    { label: '￥两位数', hint: '2位数字，如：20',    maxLen: 2 },
  'price-1digit':    { label: '￥一位数', hint: '1位数字，如：8',     maxLen: 1 },
  'discount-2digit': { label: '折扣两位', hint: '折扣数，如：88',     maxLen: 4 },
  'discount-1digit': { label: '折扣一位', hint: '折扣数，如：8',      maxLen: 1 },
  'fullcut-2digit':  { label: '满减两位', hint: '减后数字，如：80',   maxLen: 3 },
  'fullcut-1digit':  { label: '满减一位', hint: '减后数字，如：8',    maxLen: 2 },
}

const VARIANT_IDS = Object.keys(VARIANTS) as N4VariantId[]

const DEFAULT_CONTENTS: Record<N4VariantId, string> = {
  'text-only': '免单', 'price-3digit': '200', 'price-2digit': '20',
  'price-1digit': '8', 'discount-2digit': '88', 'discount-1digit': '8',
  'fullcut-2digit': '80', 'fullcut-1digit': '8',
}

const NUM_FONT = "'MeituanDigitalType','PingFang SC',sans-serif"
const CH_FONT  = "'PingFang SC','Microsoft YaHei',sans-serif"
const RED      = '#E63129'
const BW       = { fontWeight: 700, lineHeight: 1 } as const

function N4Preview({ variant, value }: { variant: N4VariantId; value: string }) {
  const v = value || DEFAULT_CONTENTS[variant]
  const s = { color: RED, ...BW }

  const content = (() => {
    switch (variant) {
      case 'text-only':
        return <span style={{ ...s, fontSize: 70, letterSpacing: 6, fontFamily: CH_FONT }}>{v}</span>
      case 'price-3digit':
        return <div style={{ display: 'flex', alignItems: 'flex-end', color: RED }}>
          <span style={{ ...BW, fontSize: 38, fontFamily: NUM_FONT, paddingBottom: 8 }}>¥</span>
          <span style={{ ...BW, fontSize: 100, fontFamily: NUM_FONT }}>{v}</span>
        </div>
      case 'price-2digit':
        return <div style={{ display: 'flex', alignItems: 'flex-end', color: RED }}>
          <span style={{ ...BW, fontSize: 42, fontFamily: NUM_FONT, paddingBottom: 10 }}>¥</span>
          <span style={{ ...BW, fontSize: 110, fontFamily: NUM_FONT }}>{v}</span>
        </div>
      case 'price-1digit':
        return <div style={{ display: 'flex', alignItems: 'flex-end', color: RED }}>
          <span style={{ ...BW, fontSize: 46, fontFamily: NUM_FONT, paddingBottom: 10 }}>¥</span>
          <span style={{ ...BW, fontSize: 116, fontFamily: NUM_FONT }}>{v}</span>
        </div>
      case 'discount-2digit':
        return <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, color: RED }}>
          <span style={{ ...BW, fontSize: 78, fontFamily: NUM_FONT }}>{v}</span>
          <span style={{ ...BW, fontSize: 42, fontFamily: CH_FONT }}>折</span>
        </div>
      case 'discount-1digit':
        return <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, color: RED }}>
          <span style={{ ...BW, fontSize: 96, fontFamily: NUM_FONT }}>{v}</span>
          <span style={{ ...BW, fontSize: 50, fontFamily: CH_FONT }}>折</span>
        </div>
      case 'fullcut-2digit':
        return <div style={{ display: 'flex', alignItems: 'flex-end', color: RED }}>
          <span style={{ ...BW, fontSize: 38, fontFamily: CH_FONT, paddingBottom: 8 }}>减</span>
          <span style={{ ...BW, fontSize: 100, fontFamily: NUM_FONT }}>{v}</span>
        </div>
      case 'fullcut-1digit':
        return <div style={{ display: 'flex', alignItems: 'flex-end', color: RED }}>
          <span style={{ ...BW, fontSize: 46, fontFamily: CH_FONT, paddingBottom: 10 }}>减</span>
          <span style={{ ...BW, fontSize: 116, fontFamily: NUM_FONT }}>{v}</span>
        </div>
    }
  })()

  return (
    <div style={{ width: 240, height: 156, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {content}
    </div>
  )
}

export default function N4Panel() {
  const [variant, setVariant] = useState<N4VariantId>('text-only')
  const [contents, setContents] = useState<Record<N4VariantId, string>>(DEFAULT_CONTENTS)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)

  const isFullcut = variant.startsWith('fullcut')
  const currentValue = contents[variant]

  const handleVariantChange = (v: N4VariantId) => setVariant(v)

  const handleInput = useCallback((val: string) => {
    setContents(prev => ({ ...prev, [variant]: val }))
  }, [variant])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleExport = async () => {
    if (!canvasRef.current) return
    setExporting(true)
    const name = `N4_${VARIANTS[variant].label}_240x156`
    showToast(`正在渲染 ${name}…`)
    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 1, width: 240, height: 156,
        useCORS: true, allowTaint: true,
        backgroundColor: null, logging: false,
      })
      const link = document.createElement('a')
      link.download = `${name}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      showToast(`✅ 已导出：${name}.png`)
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
    setExporting(false)
  }

  return (
    <div className="flex h-full">
      {/* 左侧配置面板 */}
      <div className="w-64 shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4 space-y-5">
        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">标签样式</div>
          <div className="grid grid-cols-2 gap-1.5">
            {VARIANT_IDS.map(id => (
              <button
                key={id}
                onClick={() => handleVariantChange(id)}
                className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all ${
                  variant === id
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500'
                }`}
              >
                {VARIANTS[id].label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            {isFullcut ? '减后金额' : '文案内容'}
          </div>
          {isFullcut ? (
            <div className="space-y-2">
              <label className="text-xs text-gray-400">减后数字</label>
              <input
                type="text"
                value={currentValue}
                onChange={e => handleInput(e.target.value)}
                placeholder={VARIANTS[variant].hint}
                maxLength={VARIANTS[variant].maxLen}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <input
                type="text"
                value={currentValue}
                onChange={e => handleInput(e.target.value)}
                placeholder={VARIANTS[variant].hint}
                maxLength={VARIANTS[variant].maxLen}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100"
              />
              <p className="text-xs text-gray-400">{VARIANTS[variant].hint}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {exporting ? '导出中…' : '⬇ 导出 PNG'}
        </button>
      </div>

      {/* 右侧预览 */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs text-gray-400">预览 · 240 × 156 px · 透明底</div>
          <div className="relative">
            {/* 棋盘格背景表示透明 */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%)',
                backgroundSize: '16px 16px',
              }}
            />
            <div
              ref={canvasRef}
              className="relative"
              style={{ width: 240, height: 156 }}
            >
              <N4Preview variant={variant} value={currentValue} />
            </div>
          </div>
          <div className="text-xs text-gray-400">N4 — {VARIANTS[variant].label}</div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
