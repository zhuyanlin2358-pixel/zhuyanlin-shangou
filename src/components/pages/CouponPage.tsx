import { useState, useEffect, useCallback } from 'react'
import { Download } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useCoupon } from '@/contexts/CouponContext'
import {
  drawCouponNoTab, drawCouponWithTab,
  drawCouponWaistband, drawCouponButton,
  downloadCanvas, downloadZip,
} from '@/utils/exportUtils'
import { COUPON_COLORS, type CouponColorKey } from '@/types'

const COLOR_KEYS = Object.keys(COUPON_COLORS) as CouponColorKey[]

export default function CouponPage() {
  const { showToast, registerExportAll } = useApp()
  const { config } = useCoupon()

  const [prevNoTab,   setPrevNoTab]   = useState('')
  const [prevWithTab, setPrevWithTab] = useState('')
  const [exporting, setExporting] = useState(false)

  // 实时预览
  useEffect(() => {
    let cancelled = false
    Promise.all([
      drawCouponNoTab(config).then(c => c.toDataURL()),
      drawCouponWithTab(config).then(c => c.toDataURL()),
    ]).then(([noTab, withTab]) => {
      if (cancelled) return
      setPrevNoTab(noTab)
      setPrevWithTab(withTab)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [config])

  // 导出全部
  const handleExportAll = useCallback(async () => {
    setExporting(true)
    showToast('正在渲染一键领券红包…')
    try {
      const [noTab, withTab, waistband, button] = await Promise.all([
        drawCouponNoTab(config),
        drawCouponWithTab(config),
        drawCouponWaistband(config),
        drawCouponButton(config),
      ])
      const colorName = COUPON_COLORS[config.colorKey].name
      await downloadZip([
        { canvas: noTab,     name: `券红包_${colorName}_不带Tab_702x352.png` },
        { canvas: withTab,   name: `券红包_${colorName}_带Tab_710x416.png` },
        { canvas: waistband, name: `券红包_${colorName}_腰封图_710x168.png` },
        { canvas: button,    name: `券红包_${colorName}_按钮图_480x80.png` },
      ], `一键领券红包_${colorName}`)
      showToast('✅ 已导出 4 张切图 ZIP')
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知'}`)
    }
    setExporting(false)
  }, [config, showToast])

  useEffect(() => { registerExportAll(handleExportAll) }, [handleExportAll, registerExportAll])

  const colorName = COUPON_COLORS[config.colorKey].name

  return (
    <div className="p-8" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* 标题 */}
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
          一键领券红包
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-3)' }}>
          高达组件 B 类 · 7 种配色 · 4 张切图 · 透明底 PNG
        </p>
      </div>

      {/* 导出按钮 */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={handleExportAll}
          disabled={exporting}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)' }}
        >
          <Download size={13} />
          {exporting ? '导出中…' : '导出全部 4 张 ZIP'}
        </button>
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
          {colorName} · 不带Tab / 带Tab / 腰封图 / 按钮图
        </span>
      </div>

      {/* ── 不带 Tab（优先显示）── */}
      <Section
        title="不带 Tab"
        size="702 × 352 px"
        priority
        previewUrl={prevNoTab}
        previewW={702}
        onExport={async () => {
          const canvas = await drawCouponNoTab(config)
          downloadCanvas(canvas, `券红包_${colorName}_不带Tab_702x352.png`)
          showToast('✅ 已导出不带Tab')
        }}
      />

      {/* ── 带 Tab ── */}
      <Section
        title="带 Tab"
        size="710 × 416 px"
        previewUrl={prevWithTab}
        previewW={710}
        onExport={async () => {
          const canvas = await drawCouponWithTab(config)
          downloadCanvas(canvas, `券红包_${colorName}_带Tab_710x416.png`)
          showToast('✅ 已导出带Tab')
        }}
      />

      {/* ── 全部颜色快览 ── */}
      <div className="mt-8">
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-1)' }}>
          全部配色快览
        </div>
        <ColorGallery />
      </div>
    </div>
  )
}

// ── 切图预览 Section（模块顶层）───────────────────────────────────────────────
function Section({
  title, size, priority, previewUrl, previewW, onExport,
}: {
  title: string; size: string; priority?: boolean
  previewUrl: string; previewW: number
  onExport: () => void
}) {
  return (
    <div
      className="mb-5 rounded-2xl p-4"
      style={{
        background: 'var(--bg-subtle)',
        border: `1px solid ${priority ? '#FF5050' : 'var(--border)'}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{title}</span>
          {priority && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,80,80,0.12)', color: '#FF8080' }}
            >
              优先
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>{size}</span>
          <button
            onClick={onExport}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg text-white"
            style={{ background: 'rgba(255,80,80,0.8)' }}
          >
            <Download size={11} /> 导出
          </button>
        </div>
      </div>
      <div
        className="overflow-hidden rounded-lg"
        style={{ maxWidth: Math.min(previewW, 600), background: '#f5f5f5' }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={title}
            className="w-full block slot-card-preview"
            draggable={false}
          />
        ) : (
          <div
            className="flex items-center justify-center text-xs"
            style={{ height: 80, color: '#bbb' }}
          >
            渲染中…
          </div>
        )}
      </div>
    </div>
  )
}

// ── 颜色快览（模块顶层）──────────────────────────────────────────────────────
function ColorGallery() {
  const { config } = useCoupon()
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadAll = async () => {
      const result: Record<string, string> = {}
      for (const k of COLOR_KEYS) {
        const canvas = await drawCouponWaistband({ colorKey: k, titleText: config.titleText })
        result[k] = canvas.toDataURL()
      }
      setUrls(result)
    }
    loadAll().catch(() => {})
  }, [config.titleText])

  return (
    <div className="flex flex-col gap-2" style={{ maxWidth: 620 }}>
      {COLOR_KEYS.map(k => {
        const def = COUPON_COLORS[k]
        return (
          <div key={k} className="flex items-center gap-3">
            <span className="text-xs w-10 shrink-0" style={{ color: 'var(--text-2)' }}>{def.name}</span>
            <div className="flex-1 overflow-hidden rounded" style={{ height: 24, background: '#eee' }}>
              {urls[k] && (
                <img src={urls[k]} alt={def.name} style={{ width: '100%', height: 24, objectFit: 'cover', display: 'block' }} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
