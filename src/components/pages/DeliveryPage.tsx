/**
 * 交付中心（第三站）
 *
 * 独立页面，用户点「完成设计」后跳转。
 * 左侧：素材仓库（按组件分类，每个素材单独预览/下载）
 * 右侧：页面画布预览（手机帧）
 * 底部：一键全部打包 ZIP
 */
import { useState, useCallback, useRef } from 'react'
import JSZip from 'jszip'
import { X, Download, Package, Eye, RefreshCw, ImageIcon } from 'lucide-react'
import { useVenue }  from '@/contexts/VenueContext'
import { useSlot }   from '@/contexts/SlotContext'
import { useCoupon } from '@/contexts/CouponContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useFloor }  from '@/contexts/FloorContext'
import { useApp }    from '@/contexts/AppContext'
import {
  preloadFonts,
  drawSlotBannerCanvas, drawSlotBgCanvas, drawButtonCanvas,
  drawEmptyStateCanvas, drawPrizeCanvas, drawDialogButtonCanvas,
  drawCouponBg, drawCouponWaistband, drawCouponButton,
  drawHTabCanvas, drawFloorCanvas,
} from '@/utils/exportUtils'
import type { PrizeInfo, XfTransform } from '@/utils/exportUtils'
import type { VenueHeaderSize } from '@/types'

// ── 工具 ──────────────────────────────────────────────────────────────────────
function canvasToBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise(res => c.toBlob(b => res(b!), 'image/png'))
}
function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = filename; a.click()
  URL.revokeObjectURL(a.href)
}

// ── 大图预览 Modal ──────────────────────────────────────────────────────────
function PreviewModal({ url, label, onClose, onDownload }: {
  url: string; label: string; onClose: () => void; onDownload: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex items-center justify-between w-full px-6 py-4 shrink-0"
        style={{ maxWidth: 900 }}>
        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</span>
        <div className="flex items-center gap-3">
          <button onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white"
            style={{ background: 'rgba(45,120,244,0.8)', border: 'none', cursor: 'pointer' }}>
            <Download size={13} /> 下载此图
          </button>
          <button onClick={onClose}
            className="p-2 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 w-full overflow-auto">
        <img src={url} alt={label}
          style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, objectFit: 'contain',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }} />
      </div>
    </div>
  )
}

// 素材定义（不含 onPreview，由 ComponentSection 注入）
interface AssetDef {
  label: string
  size: string
  generate: () => Promise<HTMLCanvasElement>
  canReplace?: boolean
  onReplace?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// ── 单个素材行 ────────────────────────────────────────────────────────────────
function AssetRow({
  label, size, generate, onPreview, canReplace, onReplace,
}: AssetDef & {
  onPreview: (url: string, label: string, gen: () => Promise<HTMLCanvasElement>) => void
}) {
  const [dlStatus, setDlStatus] = useState<'idle'|'loading'|'done'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDownload = async () => {
    setDlStatus('loading')
    try {
      const c = await generate()
      downloadBlob(await canvasToBlob(c), label + '.png')
      setDlStatus('done')
    } catch { setDlStatus('idle') }
    setTimeout(() => setDlStatus('idle'), 2500)
  }

  const handlePreview = () => onPreview('', label, generate)

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group"
      style={{ background: 'rgba(255,255,255,0.03)' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</div>
        <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{size}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {canReplace && onReplace && (
          <>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer' }}>
              <RefreshCw size={9} /> 替换
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onReplace} />
          </>
        )}
        <button onClick={handlePreview}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer' }}>
          <Eye size={10} /> 预览
        </button>
        <button onClick={handleDownload} disabled={dlStatus === 'loading'}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all"
          style={{
            background: dlStatus === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(45,120,244,0.15)',
            color: dlStatus === 'done' ? '#4ade80' : '#6AA3FF',
            border: 'none', cursor: dlStatus === 'loading' ? 'not-allowed' : 'pointer',
          }}>
          <Download size={10} />
          {dlStatus === 'loading' ? '…' : dlStatus === 'done' ? '✓' : '下载'}
        </button>
      </div>
    </div>
  )
}

// ── 组件素材分组 ──────────────────────────────────────────────────────────────
function ComponentSection({
  label, icon, assets, onDownloadAll, onPreview,
}: {
  label: string; icon: React.ReactNode
  assets: AssetDef[]
  onDownloadAll: () => Promise<void>
  onPreview: (url: string, label: string, gen: () => Promise<HTMLCanvasElement>) => void
}) {
  const [dlStatus, setDlStatus] = useState<'idle'|'loading'|'done'>('idle')
  const handleAll = async () => {
    setDlStatus('loading')
    try { await onDownloadAll(); setDlStatus('done') } catch { setDlStatus('idle') }
    setTimeout(() => setDlStatus('idle'), 3000)
  }

  return (
    <div className="rounded-2xl overflow-hidden mb-4"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#111827' }}>
      {/* 分组标题 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <span style={{ opacity: 0.6 }}>{icon}</span>
        <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{label}</span>
        <span className="text-[10px] ml-auto" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {assets.length} 个素材
        </span>
      </div>
      {/* 素材列表 */}
      <div className="p-3 space-y-1">
        {assets.map((asset, i) => (
          <AssetRow key={i} {...asset} onPreview={onPreview} />
        ))}
      </div>
      {/* 下载全套 */}
      <div className="px-3 pb-3">
        <button onClick={handleAll} disabled={dlStatus === 'loading'}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all"
          style={{
            background: dlStatus === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
            color: dlStatus === 'done' ? '#4ade80' : 'rgba(255,255,255,0.5)',
            border: `1px solid ${dlStatus === 'done' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`,
            cursor: dlStatus === 'loading' ? 'not-allowed' : 'pointer',
          }}>
          <Download size={12} />
          {dlStatus === 'loading' ? '生成中…' : dlStatus === 'done' ? `✅ 已下载 ${label} 全套` : `下载 ${label} 全套 ZIP`}
        </button>
      </div>
    </div>
  )
}

// ── 页面右侧：手机预览（精简版）────────────────────────────────────────────────
const HEADER_H: Record<VenueHeaderSize, number> = { '424': 212, '624': 312, '274': 137 }

function PhonePreview() {
  const { items, headerUrl, headerSize, bgColor } = useVenue()
  const h = HEADER_H[headerSize]
  return (
    <div className="flex flex-col items-center overflow-y-auto py-6 px-4 flex-1">
      <div className="text-[11px] mb-4 font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>页面预览 · 375px</div>
      <div className="rounded-[22px] overflow-hidden shadow-2xl"
        style={{ width: 320, background: bgColor, border: '2px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-4" style={{ height: 22, background: bgColor }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#333' }}>9:41</span>
        </div>
        {headerUrl ? (
          <img src={headerUrl} style={{ width: '100%', height: h, objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: Math.max(h, 40), background: 'rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageIcon size={16} style={{ color: 'rgba(0,0,0,0.2)' }} />
          </div>
        )}
        {items.map(item => {
          const isCoupon = item.componentId === 'coupon'
          return (
            <div key={item.id} style={{ padding: `0 ${isCoupon ? 16 : 6}px`, background: bgColor, marginTop: 3 }}>
              <img src={item.previewUrl} alt={item.label} draggable={false}
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: isCoupon ? 8 : 0 }} />
            </div>
          )
        })}
        <div style={{ height: 10, background: bgColor }} />
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────────────────
export default function DeliveryPage() {
  const { goVenue, showToast } = useApp()
  const { items }  = useVenue()
  const slotCtx    = useSlot()
  const couponCtx  = useCoupon()
  const hTabCtx    = useHTab()
  const floorCtx   = useFloor()

  // 大图预览弹窗状态
  const [preview, setPreview] = useState<{
    url: string; label: string; gen: () => Promise<HTMLCanvasElement>
  } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const handlePreview = useCallback(async (
    _url: string,
    label: string,
    gen: () => Promise<HTMLCanvasElement>,
  ) => {
    setPreviewLoading(true)
    try {
      await preloadFonts()
      const c = await gen()
      setPreview({ url: c.toDataURL(), label, gen })
    } catch { showToast('预览生成失败') }
    setPreviewLoading(false)
  }, [showToast])

  // 全部打包
  const [allStatus, setAllStatus] = useState<'idle'|'loading'|'done'>('idle')
  const handleDownloadAll = useCallback(async () => {
    if (!items.length) { showToast('没有组件'); return }
    setAllStatus('loading'); showToast('正在生成素材…')
    try {
      await preloadFonts()
      const zip = new JSZip()
      for (const item of items) {
        const f = zip.folder(item.label) ?? zip
        const slot = slotCtx.config
        const sc = { slotTintFrom: slot.slotTintFrom, slotTintTo: slot.slotTintTo,
          slotRect7From: slot.slotRect7From, slotRect7To: slot.slotRect7To,
          titleText: slot.titleText, titleColor: slot.titleColor, linksColor: slot.linksColor,
          btnActiveFrom: slot.btnActiveFrom, btnActiveTo: slot.btnActiveTo,
          btnTextColor: slot.btnTextColor, slotStyle: slot.slotStyle }

        if (item.componentId === 'slot') {
          const pcs = await Promise.all(slot.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, slot.prizeTransforms[i] as XfTransform, slot.slotStyle)))
          const [c1, c2] = await Promise.all([drawSlotBannerCanvas(sc, pcs), drawSlotBgCanvas(slot as any)])
          f.file('主视觉.png', await canvasToBlob(c1))
          f.file('背景图.png', await canvasToBlob(c2))
          for (let i = 0; i < pcs.length; i++) f.file(`奖品图${i+1}.png`, await canvasToBlob(pcs[i]))
          const fb = zip.folder(`${item.label}/弹窗按钮`) ?? zip
          for (const text of ['确认','领奖品','查看收货地址'])
            fb.file(`弹窗按钮_${text}.png`, await canvasToBlob(drawDialogButtonCanvas(text, slot.btnActiveFrom, slot.btnActiveTo, undefined, slot.btnTextColor)))
        } else if (item.componentId === 'coupon') {
          const [bg, w, b] = await Promise.all([drawCouponBg(couponCtx.config), drawCouponWaistband(couponCtx.config), drawCouponButton(couponCtx.config)])
          f.file('背景图.png', await canvasToBlob(bg)); f.file('腰封.png', await canvasToBlob(w)); f.file('按钮.png', await canvasToBlob(b))
        } else if (item.componentId === 'h-tab') {
          for (const it of hTabCtx.items) {
            const c = await drawHTabCanvas({ colorKey: hTabCtx.config.colorKey, tabs: it.tabs, activeIndex: it.activeIndex })
            f.file(`${it.tabs.join('-')}.png`, await canvasToBlob(c))
          }
        } else if (item.componentId === 'floor') {
          for (const fl of floorCtx.floors) {
            const c = await drawFloorCanvas({ ...floorCtx.config, text: fl.text })
            f.file(`${fl.text || '楼层条'}.png`, await canvasToBlob(c))
          }
        }
      }
      downloadBlob(await zip.generateAsync({ type: 'blob' }), '会场素材全包.zip')
      setAllStatus('done'); showToast('✅ 全部素材已打包！')
    } catch { showToast('❌ 打包失败') }
    setTimeout(() => setAllStatus('idle'), 3000)
  }, [items, slotCtx, couponCtx, hTabCtx, floorCtx, showToast])

  // 为每个 VenueItem 构建素材列表
  const buildAssets = useCallback((item: typeof items[0]) => {
    const slot = slotCtx.config
    const sc = { slotTintFrom: slot.slotTintFrom, slotTintTo: slot.slotTintTo,
      slotRect7From: slot.slotRect7From, slotRect7To: slot.slotRect7To,
      titleText: slot.titleText, titleColor: slot.titleColor, linksColor: slot.linksColor,
      btnActiveFrom: slot.btnActiveFrom, btnActiveTo: slot.btnActiveTo,
      btnTextColor: slot.btnTextColor, slotStyle: slot.slotStyle }

    if (item.componentId === 'slot') {
      const genBanner = async () => { const pcs = await Promise.all(slot.prizes.map((p, idx) => drawPrizeCanvas(p as PrizeInfo, slot.prizeTransforms[idx] as XfTransform, slot.slotStyle))); return drawSlotBannerCanvas(sc, pcs) }
      const assetList: AssetDef[] = [
        { label: '主视觉（未抽奖状态）', size: '750 × 242 px', generate: genBanner },
        { label: '老虎机背景图', size: '750 × 242 px', generate: () => drawSlotBgCanvas(slot as any) },
        { label: '空态页', size: '854 × 284 px', generate: () => drawEmptyStateCanvas(slot.emptyImageUrl, slot.emptyTransform as XfTransform, slot.emptyText) },
        { label: '按钮 · 立即抽奖', size: '194 × 80 px', generate: () => Promise.resolve(drawButtonCanvas('立即抽奖', slot.btnActiveFrom, slot.btnActiveTo, slot.btnTextColor)) },
        { label: '按钮 · 活动结束', size: '194 × 80 px', generate: () => Promise.resolve(drawButtonCanvas('活动已结束', slot.btnDisabledFrom, slot.btnDisabledTo, slot.btnTextColor)) },
        { label: '弹窗按钮（确认示例）', size: '276 × 80 px', generate: () => Promise.resolve(drawDialogButtonCanvas('确认领奖', slot.btnActiveFrom, slot.btnActiveTo, undefined, slot.btnTextColor)) },
        ...slot.prizes.map((p, idx) => ({
          label: `奖品图 ${idx+1}（${p.tag || '商品图'}）`,
          size: '124 × 124 px',
          generate: () => drawPrizeCanvas(p as PrizeInfo, slot.prizeTransforms[idx] as XfTransform, slot.slotStyle),
          canReplace: p.type === 'product-tag' || p.type === 'product-dashed',
          onReplace: (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]; if (!file) return
            const reader = new FileReader()
            reader.onload = ev => slotCtx.setPrize(idx, { imageUrl: ev.target?.result as string })
            reader.readAsDataURL(file)
          },
        })),
      ]
      const downloadAll = async () => {
        await preloadFonts()
        const pcs = await Promise.all(slot.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, slot.prizeTransforms[i] as XfTransform, slot.slotStyle)))
        const [c1, c2, c3, c4a, c4d] = await Promise.all([drawSlotBannerCanvas(sc, pcs), drawSlotBgCanvas(slot as any), drawEmptyStateCanvas(slot.emptyImageUrl, slot.emptyTransform as XfTransform, slot.emptyText), Promise.resolve(drawButtonCanvas('立即抽奖', slot.btnActiveFrom, slot.btnActiveTo, slot.btnTextColor)), Promise.resolve(drawButtonCanvas('活动已结束', slot.btnDisabledFrom, slot.btnDisabledTo, slot.btnTextColor))])
        const zip = new JSZip()
        zip.file('主视觉.png', await canvasToBlob(c1)); zip.file('背景图.png', await canvasToBlob(c2)); zip.file('空态页.png', await canvasToBlob(c3)); zip.file('按钮_立即抽奖.png', await canvasToBlob(c4a)); zip.file('按钮_活动结束.png', await canvasToBlob(c4d))
        for (let i = 0; i < pcs.length; i++) zip.file(`奖品图${i+1}.png`, await canvasToBlob(pcs[i]))
        downloadBlob(await zip.generateAsync({ type: 'blob' }), '老虎机_切图包.zip')
      }
      return { assetList, downloadAll }
    }

    if (item.componentId === 'coupon') {
      const cfg = couponCtx.config
      const assetList: AssetDef[] = [
        { label: '券包背景', size: '702 × 352 px', generate: () => drawCouponBg(cfg) },
        { label: '腰封图', size: '702 × 168 px', generate: () => drawCouponWaistband(cfg) },
        { label: '领取按钮', size: '480 × 80 px', generate: () => drawCouponButton(cfg) },
      ]
      const downloadAll = async () => {
        await preloadFonts()
        const [bg, w, b] = await Promise.all([drawCouponBg(cfg), drawCouponWaistband(cfg), drawCouponButton(cfg)])
        const zip = new JSZip(); zip.file('背景.png', await canvasToBlob(bg)); zip.file('腰封.png', await canvasToBlob(w)); zip.file('按钮.png', await canvasToBlob(b))
        downloadBlob(await zip.generateAsync({ type: 'blob' }), `红包_${cfg.colorKey}.zip`)
      }
      return { assetList, downloadAll }
    }

    if (item.componentId === 'h-tab') {
      const assetList: AssetDef[] = hTabCtx.items.map(it => ({
        label: `横滑 Tab · ${it.tabs.join(' / ')}`,
        size: '750 × 88 px',
        generate: () => drawHTabCanvas({ colorKey: hTabCtx.config.colorKey, tabs: it.tabs, activeIndex: it.activeIndex }),
      }))
      const downloadAll = async () => {
        await preloadFonts()
        const zip = new JSZip()
        for (const it of hTabCtx.items) { const c = await drawHTabCanvas({ colorKey: hTabCtx.config.colorKey, tabs: it.tabs, activeIndex: it.activeIndex }); zip.file(`Tab_${it.tabs.join('-')}.png`, await canvasToBlob(c)) }
        downloadBlob(await zip.generateAsync({ type: 'blob' }), `横滑Tab_${hTabCtx.config.colorKey}.zip`)
      }
      return { assetList, downloadAll }
    }

    if (item.componentId === 'floor') {
      const assetList: AssetDef[] = floorCtx.floors.map(f => ({
        label: `楼层条 · ${f.text || '楼层'}`,
        size: '750 × 60 px',
        generate: () => drawFloorCanvas({ ...floorCtx.config, text: f.text }),
      }))
      const downloadAll = async () => {
        await preloadFonts()
        const zip = new JSZip()
        for (const f of floorCtx.floors) { const c = await drawFloorCanvas({ ...floorCtx.config, text: f.text }); zip.file(`${f.text || '楼层'}.png`, await canvasToBlob(c)) }
        downloadBlob(await zip.generateAsync({ type: 'blob' }), '楼层条.zip')
      }
      return { assetList, downloadAll }
    }

    return { assetList: [] as Parameters<typeof AssetRow>[], downloadAll: async () => {} }
  }, [slotCtx, couponCtx, hTabCtx, floorCtx])

  const COMP_ICON: Record<string, React.ReactNode> = {
    slot: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 4v16M16 4v16"/></svg>,
    coupon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/></svg>,
    'h-tab': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="5" width="6" height="14" rx="1.5"/><rect x="10" y="5" width="6" height="14" rx="1.5"/></svg>,
    floor: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080C14' }}>

      {/* 顶栏 */}
      <div className="flex items-center gap-4 px-6 h-14 shrink-0 border-b"
        style={{ background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>
        <button onClick={goVenue}
          className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          返回画布
        </button>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
        <span className="text-base font-bold" style={{ color: '#fff' }}>交付中心</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
          ✅ 素材已就绪
        </span>
        <div style={{ flex: 1 }} />
        {/* 一键打包 */}
        <button onClick={handleDownloadAll} disabled={allStatus === 'loading'}
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl text-white transition-all"
          style={{
            background: allStatus === 'done' ? 'rgba(34,197,94,0.8)' : 'linear-gradient(90deg,#FF3060,#FF6030)',
            cursor: allStatus === 'loading' ? 'not-allowed' : 'pointer', opacity: allStatus === 'loading' ? 0.8 : 1,
          }}>
          <Package size={14} />
          {allStatus === 'loading' ? '生成中…' : allStatus === 'done' ? '✅ 全部已下载' : '一键全部打包下载'}
        </button>
      </div>

      {/* 主体：左侧素材仓库 + 右侧页面预览 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 左侧：素材仓库 */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
            素材仓库
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div style={{ fontSize: 40, opacity: 0.3 }}>📦</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>画布上还没有组件</div>
              <button onClick={goVenue}
                className="px-4 py-2 text-xs rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer' }}>
                ← 返回画布添加组件
              </button>
            </div>
          ) : items.map(item => {
            const { assetList, downloadAll } = buildAssets(item)
            return (
              <ComponentSection
                key={item.id}
                label={item.label}
                icon={COMP_ICON[item.componentId] ?? <Package size={14} />}
                assets={assetList as AssetDef[]}
                onDownloadAll={downloadAll}
                onPreview={handlePreview}
              />
            )
          })}
        </div>

        {/* 右侧：页面预览 */}
        <div className="flex flex-col shrink-0 border-l overflow-hidden"
          style={{ width: 360, borderColor: 'rgba(255,255,255,0.07)', background: '#0A0E18' }}>
          <div className="px-4 py-3 border-b shrink-0 text-[11px] font-semibold"
            style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.25)' }}>
            页面预览
          </div>
          <PhonePreview />
        </div>
      </div>

      {/* 大图预览弹窗 */}
      {previewLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>生成预览中…</div>
        </div>
      )}
      {preview && (
        <PreviewModal
          url={preview.url}
          label={preview.label}
          onClose={() => setPreview(null)}
          onDownload={async () => {
            const c = await preview.gen()
            downloadBlob(await canvasToBlob(c), preview.label + '.png')
          }}
        />
      )}
    </div>
  )
}
