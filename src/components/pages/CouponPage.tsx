/**
 * 一键领券红包配置页（无tab类）
 * 5 种导出：领取前无tab-背景图 / 券包预览图 / 组件腰封图 / 组件按钮图 / 仅剩一张券背景图
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Download } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useCoupon } from '@/contexts/CouponContext'
import {
  drawCouponBg, drawCouponWaistband, drawCouponButton,
  drawCouponPreview, drawCouponSingleBg,
  downloadCanvas, downloadZip, isFontsReady, preloadFonts,
} from '@/utils/exportUtils'
import { COUPON_COLORS } from '@/types'
import VenueAddButton from '@/components/ui/VenueAddButton'

export default function CouponPage() {
  const { showToast, registerExportAll } = useApp()
  const { config } = useCoupon()

  // 5 个 section 的预览 URL
  const [prevBg,     setPrevBg]     = useState('')  // ① 领取前无tab-背景图
  const [prevFull,   setPrevFull]   = useState('')  // ② 券包预览图
  const [prevWaist,  setPrevWaist]  = useState('')  // ③ 组件腰封图
  const [prevBtn,    setPrevBtn]    = useState('')  // ④ 组件按钮图
  const [prevSingle, setPrevSingle] = useState('')  // ⑤ 仅剩一张券背景图

  useEffect(() => {
    let cancelled = false

    const render = async () => {
      // ② 完整预览优先出，加入会场立刻可用
      const full = await drawCouponPreview(config).then(c => c.toDataURL()).catch(() => '')
      if (cancelled) return
      setPrevFull(full)

      await new Promise<void>(r => requestAnimationFrame(() => r()))
      if (cancelled) return

      const [bg, waist, btn, single] = await Promise.all([
        drawCouponBg(config).then(c => c.toDataURL()),
        drawCouponWaistband(config).then(c => c.toDataURL()),
        drawCouponButton(config).then(c => c.toDataURL()),
        drawCouponSingleBg(config).then(c => c.toDataURL()),
      ]).catch(() => ['', '', '', ''] as [string, string, string, string])
      if (cancelled) return
      setPrevBg(bg as string)
      setPrevWaist(waist as string)
      setPrevBtn(btn as string)
      setPrevSingle(single as string)
    }

    render()

    if (!isFontsReady()) {
      preloadFonts().then(() => { if (!cancelled) render() })
    }
    return () => { cancelled = true }
  }, [config])

  const colorName = COUPON_COLORS[config.colorKey].name
  const c = COUPON_COLORS[config.colorKey]
  const cardGrad = `linear-gradient(179deg, ${c.cardBgFrom} 1%, ${c.cardBgTo} 100%)`
  const btnGrad  = `linear-gradient(90deg, ${c.btnFrom}, ${c.btnTo})`

  // 顶部「一键导出 ZIP」— 5 张全部打包
  const handleExportAll = useCallback(async () => {
    showToast('正在渲染一键领券红包…')
    try {
      const [bg, full, waistband, button, single] = await Promise.all([
        drawCouponBg(config),
        drawCouponPreview(config),
        drawCouponWaistband(config),
        drawCouponButton(config),
        drawCouponSingleBg(config),
      ])
      await downloadZip([
        { canvas: bg,       name: `券红包_${colorName}_领取前无tab背景图_702x352.png` },
        { canvas: full,     name: `券红包_${colorName}_券包预览图_702x352.png` },
        { canvas: waistband,name: `券红包_${colorName}_组件腰封图_702x168.png` },
        { canvas: button,   name: `券红包_${colorName}_组件按钮图_480x80.png` },
        { canvas: single,   name: `券红包_${colorName}_仅剩一张券背景图_702x236.png` },
      ], `一键领券红包_无tab_${colorName}`)
      showToast('✅ 已导出 5 张切图 ZIP')
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知'}`)
    }
  }, [config, colorName, showToast])

  useEffect(() => { registerExportAll(handleExportAll) }, [handleExportAll, registerExportAll])

  const exportOne = async (fn: () => Promise<HTMLCanvasElement>, filename: string, label: string) => {
    try {
      downloadCanvas(await fn(), filename)
      showToast(`✅ 已导出${label}`)
    } catch (e: unknown) {
      showToast(`❌ ${e instanceof Error ? e.message : '导出失败'}`)
    }
  }

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── ① 领取前无tab-背景图 ── */}
      <div>
        <SectionTitle num={1} label="领取前无tab-背景图" sub="渐变底 + 标题文案 · 702 × 352 px" badge="素材 1" />
        <ExportCard
          label="领取前无tab-背景图"
          sub="702 × 352 px · PNG"
          previewUrl={prevBg}
          placeholderBg={cardGrad}
          placeholderH={214}
          onExport={() => exportOne(
            () => drawCouponBg(config),
            `券红包_${colorName}_领取前无tab背景图_702x352.png`,
            '领取前无tab-背景图'
          )}
        />
      </div>

      {/* ── ② 券包预览图 ── */}
      <div>
        <SectionTitle num={2} label="券包预览图" sub="完整合成效果图 · 702 × 352 px" badge="素材 2" />
        <ExportCard
          label="券包预览图"
          sub="702 × 352 px · PNG"
          previewUrl={prevFull}
          placeholderBg={cardGrad}
          placeholderH={214}
          onExport={() => exportOne(
            () => drawCouponPreview(config),
            `券红包_${colorName}_券包预览图_702x352.png`,
            '券包预览图'
          )}
        />
        {/* 加入会场（在会场页时显示） */}
        {prevFull && (
          <div style={{ marginTop: 8 }}>
            <VenueAddButton
              componentId="coupon"
              label={`券红包·${colorName}`}
              previewUrl={prevFull}
              origW={750}
              origH={352}
            />
          </div>
        )}
      </div>

      {/* ── ③ 组件腰封图 ── */}
      <div>
        <SectionTitle num={3} label="组件腰封图" sub="弧形渐变条 + 按钮 · 702 × 168 px" badge="素材 3" />
        <ExportCard
          label="组件腰封图"
          sub="702 × 168 px · PNG"
          previewUrl={prevWaist}
          placeholderBg={cardGrad}
          placeholderH={103}
          onExport={() => exportOne(
            () => drawCouponWaistband(config),
            `券红包_${colorName}_组件腰封图_702x168.png`,
            '组件腰封图'
          )}
        />
      </div>

      {/* ── ④ 组件按钮图 ── */}
      <div>
        <SectionTitle num={4} label="组件按钮图" sub="90° 渐变胶囊 · 480 × 80 px" badge="素材 4" />
        <ExportCard
          label="组件按钮图"
          sub="480 × 80 px · PNG"
          previewUrl={prevBtn}
          imgW={360}
          placeholderBg={btnGrad}
          placeholderH={56}
          onExport={() => exportOne(
            () => drawCouponButton(config),
            `券红包_${colorName}_组件按钮图_480x80.png`,
            '组件按钮图'
          )}
        />
      </div>

      {/* ── ⑤ 仅剩一张券背景图 ── */}
      <div>
        <SectionTitle num={5} label="仅剩一张券背景图" sub="单券剩余状态 · 702 × 236 px" badge="素材 5" />
        <ExportCard
          label="仅剩一张券背景图"
          sub="702 × 236 px · PNG"
          previewUrl={prevSingle}
          placeholderBg={cardGrad}
          placeholderH={144}
          onExport={() => exportOne(
            () => drawCouponSingleBg(config),
            `券红包_${colorName}_仅剩一张券背景图_702x236.png`,
            '仅剩一张券背景图'
          )}
        />
      </div>

    </div>
  )
}

// ── SectionTitle ──────────────────────────────────────────────────────────────
function SectionTitle({ num, label, sub, badge }: {
  num: number; label: string; sub: string; badge?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: '#FF3060',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
      }}>{num}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>
      </div>
      {badge && (
        <span style={{
          fontSize: 12, padding: '2px 8px', borderRadius: 4,
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
        }}>{badge}</span>
      )}
    </div>
  )
}

// ── ExportCard ────────────────────────────────────────────────────────────────
function ExportCard({ label, sub, previewUrl, imgW = 460, placeholderH = 120, placeholderBg, onExport }: {
  label: string; sub: string
  previewUrl: string; imgW?: number
  placeholderH?: number
  placeholderBg?: string
  onExport: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} className="slot-export-card">
      <div className="slot-card-preview">
        {previewUrl ? (
          <img
            src={previewUrl} alt={label} draggable={false}
            style={{ width: imgW, height: 'auto', borderRadius: 10, display: 'block', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: imgW, height: placeholderH, borderRadius: 10, flexShrink: 0,
            background: placeholderBg ?? 'rgba(255,255,255,0.04)',
            transition: 'opacity 0.3s',
          }} />
        )}
      </div>
      <div className="slot-card-footer">
        <div>
          <div className="slot-card-name">{label}</div>
          <div className="slot-card-size">{sub}</div>
        </div>
        <button className="slot-btn-export" onClick={onExport}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Download size={12} />导出
        </button>
      </div>
    </div>
  )
}
