/**
 * 一键领券红包配置页
 * UI 完全对齐老虎机：SectionTitle 编号 + ExportCard 暗色导出按钮
 * 顶部已通过 registerExportAll 挂载「一键导出 ZIP」，页面内不重复
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Download } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { useCoupon } from '@/contexts/CouponContext'
import {
  drawCouponBg, drawCouponWaistband, drawCouponButton, drawCouponPreview,
  downloadCanvas, downloadZip, isFontsReady, preloadFonts,
} from '@/utils/exportUtils'
import { COUPON_COLORS } from '@/types'
import VenueAddButton from '@/components/ui/VenueAddButton'

export default function CouponPage() {
  const { showToast, registerExportAll } = useApp()
  const { config } = useCoupon()

  // 各 section 预览 URL
  const [prevFull,  setPrevFull]  = useState('')   // 完整预览（加入会场 + 导出用）
  const [prevBg,    setPrevBg]    = useState('')   // ① 券包背景
  const [prevWaist, setPrevWaist] = useState('')   // ② 券包腰封
  const [prevBtn,   setPrevBtn]   = useState('')   // ③ 组件按钮

  useEffect(() => {
    let cancelled = false
    const render = () => Promise.all([
      drawCouponPreview(config).then(c => c.toDataURL()),
      drawCouponBg(config).then(c => c.toDataURL()),
      drawCouponWaistband(config).then(c => c.toDataURL()),
      drawCouponButton(config).then(c => c.toDataURL()),
    ]).then(([full, bg, waist, btn]) => {
      if (cancelled) return
      setPrevFull(full); setPrevBg(bg); setPrevWaist(waist); setPrevBtn(btn)
    }).catch(() => {})

    render()   // 立即渲染（字体已缓存时 0ms，否则等字体）

    // 首次访问字体未就绪时：字体加载完后自动刷新一次，确保文字正确
    if (!isFontsReady()) {
      preloadFonts().then(() => { if (!cancelled) render() })
    }
    return () => { cancelled = true }
  }, [config])

  const colorName = COUPON_COLORS[config.colorKey].name

  // 注册顶部「一键导出 ZIP」
  const handleExportAll = useCallback(async () => {
    showToast('正在渲染一键领券红包…')
    try {
      const [bg, waistband, button] = await Promise.all([
        drawCouponBg(config),
        drawCouponWaistband(config),
        drawCouponButton(config),
      ])
      await downloadZip([
        { canvas: bg,        name: `券红包_${colorName}_背景图_702x352.png` },
        { canvas: waistband, name: `券红包_${colorName}_腰封图_702x168.png` },
        { canvas: button,    name: `券红包_${colorName}_按钮图_480x80.png` },
      ], `一键领券红包_${colorName}`)
      showToast('✅ 已导出 3 张切图 ZIP')
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知'}`)
    }
  }, [config, colorName, showToast])

  useEffect(() => { registerExportAll(handleExportAll) }, [handleExportAll, registerExportAll])

  const exportOne = async (fn: () => Promise<HTMLCanvasElement>, filename: string, label: string) => {
    try {
      const canvas = await fn()
      downloadCanvas(canvas, filename)
      showToast(`✅ 已导出${label}`)
    } catch (e: unknown) {
      showToast(`❌ ${e instanceof Error ? e.message : '导出失败'}`)
    }
  }

  // 占位符背景色（彩色渐变 = 用户感知"已加载"，而不是灰框"白屏"）
  const c = COUPON_COLORS[config.colorKey]
  const cardGrad = `linear-gradient(179deg, ${c.cardBgFrom} 1%, ${c.cardBgTo} 100%)`
  const btnGrad  = `linear-gradient(90deg, ${c.btnFrom}, ${c.btnTo})`

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── ① 完整预览（加入会场 + 仅供参考，不单独导出）── */}
      <div>
        <SectionTitle num={1} label="完整预览" sub={`${colorName} · 合成效果图，不单独导出`} badge="预览" />
        <ExportCard
          label="一键领券红包 — 完整预览"
          sub="702 × 352 px"
          previewUrl={prevFull}
          placeholderBg={cardGrad}
          placeholderH={214}
          onExport={() => exportOne(
            () => drawCouponPreview(config),
            `券红包_${colorName}_完整预览_702x352.png`,
            '完整预览'
          )}
        />
        {/* 加入会场（在会场页时显示，紧跟第①节） */}
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

      {/* ── ② 券包背景 ── */}
      <div>
        <SectionTitle num={2} label="券包背景" sub="渐变底 + 标题文案 · 702 × 352 px" badge="素材 1" />
        <ExportCard
          label="券包背景图"
          sub="702 × 352 px · PNG"
          previewUrl={prevBg}
          placeholderBg={cardGrad}
          placeholderH={214}
          onExport={() => exportOne(
            () => drawCouponBg(config),
            `券红包_${colorName}_背景图_702x352.png`,
            '券包背景'
          )}
        />
      </div>

      {/* ── ③ 券包腰封 ── */}
      <div>
        <SectionTitle num={3} label="券包腰封" sub="渐变条 + 底部白 fade · 702 × 168 px" badge="素材 2" />
        <ExportCard
          label="券包腰封图"
          sub="702 × 168 px · PNG"
          previewUrl={prevWaist}
          placeholderBg={cardGrad}
          placeholderH={103}
          onExport={() => exportOne(
            () => drawCouponWaistband(config),
            `券红包_${colorName}_腰封图_702x168.png`,
            '券包腰封'
          )}
        />
      </div>

      {/* ── ④ 组件按钮 ── */}
      <div>
        <SectionTitle num={4} label="组件按钮" sub="90° 渐变胶囊 · 480 × 80 px" badge="素材 3" />
        <ExportCard
          label="组件按钮图"
          sub="480 × 80 px · PNG"
          previewUrl={prevBtn}
          imgW={360}
          placeholderBg={btnGrad}
          placeholderH={56}
          onExport={() => exportOne(
            () => drawCouponButton(config),
            `券红包_${colorName}_按钮图_480x80.png`,
            '组件按钮'
          )}
        />
      </div>

    </div>
  )
}

// ── SectionTitle（与老虎机完全一致）────────────────────────────────────────────
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
          fontSize: 11, padding: '2px 8px', borderRadius: 4,
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
        }}>{badge}</span>
      )}
    </div>
  )
}

// ── ExportCard（复用 slot-export-card / slot-btn-export CSS）──────────────────
function ExportCard({ label, sub, previewUrl, imgW = 460, placeholderH = 120, placeholderBg, onExport }: {
  label: string; sub: string
  previewUrl: string; imgW?: number
  placeholderH?: number          // 占位符高度（px）
  placeholderBg?: string         // 占位符背景（彩色渐变 = 用户感知"已加载"）
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
            // 渐变占位：没有闪烁动画，视觉上像"已加载"
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

