import { useRef, useState } from 'react'
import { useN4, N4_VARIANTS, N4_VARIANT_IDS } from '@/contexts/N4Context'
import { useApp } from '@/contexts/AppContext'
import { captureElement, downloadCanvas } from '@/utils/exportUtils'

const NUM_FONT = "'MeituanDigitalType','PingFang SC',sans-serif"
const CH_FONT  = "'PingFang SC','Microsoft YaHei',sans-serif"
const RED      = '#E63129'
const BW       = { fontWeight: 700, lineHeight: 1 } as const

function N4Content({ variant, value }: { variant: string; value: string }) {
  const v = value || '...'
  const s = { color: RED, ...BW }

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
    default:
      return null
  }
}

export default function N4Page() {
  const { variant, contents } = useN4()
  const { showToast } = useApp()
  const [exporting, setExporting] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    if (!canvasRef.current) return
    const name = `N4_${N4_VARIANTS[variant].label}_240x156`
    setExporting(true)
    showToast(`正在渲染 ${name}…`)
    try {
      const canvas = await captureElement(canvasRef.current, 240, 156)
      downloadCanvas(canvas, `${name}.png`)
      showToast(`✅ 已导出：${name}.png`)
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
    setExporting(false)
  }

  return (
    <div className="flex flex-col items-center justify-center p-8" style={{ minHeight: 'calc(100vh - 56px)' }}>
      <div className="flex flex-col items-center gap-5">
        <div className="text-xs" style={{ color: 'var(--text-3)' }}>
          预览 · 240 × 156 px · 透明底
        </div>

        {/* 棋盘格 + 预览 */}
        <div className="relative rounded-xl overflow-hidden shadow-sm">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%)',
              backgroundSize: '16px 16px',
            }}
          />
          <div
            ref={canvasRef}
            className="relative flex items-center justify-center"
            style={{ width: 240, height: 156 }}
          >
            <N4Content variant={variant} value={contents[variant]} />
          </div>
        </div>

        <div className="text-xs" style={{ color: 'var(--text-2)' }}>
          N4 — {N4_VARIANTS[variant].label}
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-6 py-2.5 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50"
          style={{ background: '#1a1a1a' }}
        >
          {exporting ? '导出中…' : '⬇ 导出 PNG'}
        </button>

        {/* 所有变体快览 */}
        <div className="mt-4">
          <div className="text-xs mb-3 text-center" style={{ color: 'var(--text-3)' }}>所有变体预览</div>
          <div className="grid grid-cols-4 gap-2">
            {N4_VARIANT_IDS.map(id => (
              <div key={id} className="flex flex-col items-center gap-1">
                <div className="relative rounded overflow-hidden" style={{ width: 80, height: 52 }}>
                  <div className="absolute inset-0"
                    style={{ backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%)', backgroundSize: '8px 8px' }} />
                  <div className="absolute" style={{ width: 240, height: 156, transform: 'scale(0.333)', transformOrigin: 'top left' }}>
                    <div className="flex items-center justify-center" style={{ width: 240, height: 156 }}>
                      <N4Content variant={id} value={contents[id]} />
                    </div>
                  </div>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-3)', fontSize: 10 }}>{N4_VARIANTS[id].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
