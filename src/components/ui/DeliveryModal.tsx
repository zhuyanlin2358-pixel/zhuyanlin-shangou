/**
 * 交付中心弹窗（刘小排「交付中心」MVP）
 *
 * 用户搭建完成后点「完成 · 下载素材」弹出。
 * 按组件分组展示所有切图，每组可展开查看详情：
 *   - 老虎机：展示弹窗预览 + 奖品图（支持「替换」上传）
 *   - 红包 / Tab / 楼层条：预览 + 下载
 * 底部：一键全部打包 ZIP
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import JSZip from 'jszip'
import { X, Download, Package, CheckCircle2, ChevronDown, RefreshCw } from 'lucide-react'
import { useVenue }  from '@/contexts/VenueContext'
import { useSlot }   from '@/contexts/SlotContext'
import { useCoupon } from '@/contexts/CouponContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useFloor }  from '@/contexts/FloorContext'
import { useApp }    from '@/contexts/AppContext'
import {
  preloadFonts,
  drawSlotBannerCanvas, drawSlotBgCanvas, drawButtonCanvas, drawLinkCanvas,
  drawEmptyStateCanvas, drawPrizeCanvas, drawDialogButtonCanvas,
  drawCouponBg, drawCouponWaistband, drawCouponButton,
  drawHTabCanvas, drawFloorCanvas,
} from '@/utils/exportUtils'
import type { PrizeInfo, XfTransform } from '@/utils/exportUtils'

// ── 工具 ──────────────────────────────────────────────────────────────────────
function canvasToBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise(res => c.toBlob(b => res(b!), 'image/png'))
}
function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = filename; a.click()
  URL.revokeObjectURL(a.href)
}
type FileEntry = { canvas: HTMLCanvasElement; name: string }

// ── 生成各组件全套文件 ─────────────────────────────────────────────────────────
async function generateSlotFiles(config: ReturnType<typeof useSlot>['config']): Promise<FileEntry[]> {
  await preloadFonts()
  const prizeCanvases = await Promise.all(
    config.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle))
  )
  const bannerCfg = {
    slotTintFrom: config.slotTintFrom, slotTintTo: config.slotTintTo,
    slotRect7From: config.slotRect7From, slotRect7To: config.slotRect7To,
    titleText: config.titleText, titleColor: config.titleColor,
    linksColor: config.linksColor,
    btnActiveFrom: config.btnActiveFrom, btnActiveTo: config.btnActiveTo,
    btnTextColor: config.btnTextColor, slotStyle: config.slotStyle,
  }
  const [c1, c2, c3, c4a, c4d, c5p, c5r] = await Promise.all([
    drawSlotBannerCanvas(bannerCfg, prizeCanvases),
    drawSlotBgCanvas(config as any),
    drawEmptyStateCanvas(config.emptyImageUrl, config.emptyTransform as XfTransform, config.emptyText),
    Promise.resolve(drawButtonCanvas('立即抽奖',   config.btnActiveFrom, config.btnActiveTo, config.btnTextColor)),
    Promise.resolve(drawButtonCanvas('活动已结束', config.btnDisabledFrom, config.btnDisabledTo, config.btnTextColor)),
    Promise.resolve(drawLinkCanvas([{ text: '我的奖品' }], config.linksColor, 186, 44, 45, 2)),
    Promise.resolve(drawLinkCanvas([{ text: '|', opacity: 0.6 }, { text: '抽奖规则' }], config.linksColor, 218, 44, 45, 2)),
  ])
  const dialogBtns = ['确认', '领奖品', '查看收货地址', '重新加载', '关闭', '查看详情', '分享'].map((text, i) => ({
    canvas: drawDialogButtonCanvas(text, config.btnActiveFrom, config.btnActiveTo, undefined, config.btnTextColor),
    name: `slot_7_弹窗按钮_${i+1}_${text}.png`,
  }))
  return [
    { canvas: c1, name: 'slot_1_未抽奖状态_750x242.png' },
    { canvas: c2, name: 'slot_2_背景_750x242.png' },
    { canvas: c3, name: 'slot_3_空态页_854x284.png' },
    { canvas: c4a, name: 'slot_4_按钮立即抽奖.png' },
    { canvas: c4d, name: 'slot_4_按钮活动结束.png' },
    { canvas: c5p, name: 'slot_5_链接我的奖品.png' },
    { canvas: c5r, name: 'slot_5_链接抽奖规则.png' },
    ...prizeCanvases.map((c, i) => ({ canvas: c, name: `slot_6_奖品${i+1}_124x124.png` })),
    ...dialogBtns,
  ]
}
async function generateCouponFiles(config: ReturnType<typeof useCoupon>['config']): Promise<FileEntry[]> {
  await preloadFonts()
  const [bg, waist, btn] = await Promise.all([drawCouponBg(config), drawCouponWaistband(config), drawCouponButton(config)])
  return [
    { canvas: bg,    name: `红包_背景_702x352_${config.colorKey}.png` },
    { canvas: waist, name: `红包_腰封_702x168_${config.colorKey}.png` },
    { canvas: btn,   name: `红包_按钮_480x80_${config.colorKey}.png` },
  ]
}
async function generateHTabFiles(config: ReturnType<typeof useHTab>['config'], items: ReturnType<typeof useHTab>['items']): Promise<FileEntry[]> {
  await preloadFonts()
  return Promise.all(items.map(async it => ({
    canvas: await drawHTabCanvas({ colorKey: config.colorKey, tabs: it.tabs, activeIndex: it.activeIndex }),
    name: `横滑Tab_${config.colorKey}_${it.tabs.join('-')}.png`,
  })))
}
async function generateFloorFiles(config: ReturnType<typeof useFloor>['config'], floors: ReturnType<typeof useFloor>['floors']): Promise<FileEntry[]> {
  await preloadFonts()
  return Promise.all(floors.map(async f => ({
    canvas: await drawFloorCanvas({ ...config, text: f.text }),
    name: `楼层条_${f.text || '楼层'}_750x60.png`,
  })))
}

// ── 老虎机专用：展开卡片 ──────────────────────────────────────────────────────
function SlotCard({ previewUrl, onDownload }: { previewUrl: string; onDownload: () => Promise<void> }) {
  const slotCtx = useSlot()
  const { config, setPrize } = slotCtx
  const [open, setOpen]         = useState(false)
  const [status, setStatus]     = useState<'idle'|'loading'|'done'>('idle')
  const [dialogUrl, setDialogUrl] = useState('')
  const fileRefs = useRef<(HTMLInputElement|null)[]>([])

  // 生成弹窗按钮预览
  useEffect(() => {
    if (!open) return
    try {
      const c = drawDialogButtonCanvas('确认领奖', config.btnActiveFrom, config.btnActiveTo, undefined, config.btnTextColor)
      setDialogUrl(c.toDataURL())
    } catch {}
  }, [open, config.btnActiveFrom, config.btnActiveTo, config.btnTextColor])

  const handleDownload = async () => {
    setStatus('loading')
    try { await onDownload(); setStatus('done') } catch { setStatus('idle') }
    setTimeout(() => setStatus('idle'), 3000)
  }

  // 替换奖品图
  const handlePrizeReplace = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setPrize(idx, { imageUrl: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      {/* 主行 */}
      <div className="flex items-center gap-4 px-6 py-4">
        <div style={{ width: 88, height: 48, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
          {previewUrl && <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>老虎机</div>
          <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            主视觉 · 弹窗 · 奖品图 · 按钮等全套切图
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg transition-all"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer' }}>
          {open ? '收起' : '查看详情'}
          <ChevronDown size={11} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        <button onClick={handleDownload} disabled={status === 'loading'}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0"
          style={{
            background: status === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(45,120,244,0.15)',
            color: status === 'done' ? '#4ade80' : '#6AA3FF',
            border: `1px solid ${status === 'done' ? 'rgba(74,222,128,0.3)' : 'rgba(45,120,244,0.25)'}`,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer', minWidth: 92, justifyContent: 'center',
          }}>
          <Download size={11} />
          {status === 'loading' ? '生成中…' : status === 'done' ? '✅ 已下载' : '下载全套'}
        </button>
      </div>

      {/* 展开详情 */}
      {open && (
        <div className="px-6 pb-5 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>

          {/* 弹窗预览 */}
          <div className="pt-4">
            <div className="text-[12px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              弹窗按钮（含 7 种文案 × 配色）
            </div>
            <div className="flex items-center gap-3">
              {dialogUrl && (
                <img src={dialogUrl} alt="弹窗按钮预览"
                  style={{ height: 36, borderRadius: 18, display: 'block', background: 'rgba(255,255,255,0.05)' }} />
              )}
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                配色跟随老虎机主题，已包含在下载包中
              </span>
            </div>
          </div>

          {/* 奖品图 */}
          <div>
            <div className="text-[12px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              奖品图（可单独替换图片）
            </div>
            <div className="flex gap-3 flex-wrap">
              {config.prizes.map((prize, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  {/* 奖品图预览区 */}
                  <div style={{
                    width: 60, height: 60, borderRadius: 8,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', position: 'relative',
                  }}>
                    {prize.imageUrl ? (
                      <img src={prize.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '0 4px' }}>
                        {prize.type === 'thanks' ? '谢谢\n参与' : '未上传\n商品图'}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>奖品 {idx+1}</span>
                  {/* 替换按钮（仅需要图片的类型显示） */}
                  {(prize.type === 'product-tag' || prize.type === 'product-dashed') && (
                    <>
                      <button
                        onClick={() => fileRefs.current[idx]?.click()}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-all"
                        style={{ background: 'rgba(45,120,244,0.12)', color: '#6AA3FF', border: '1px solid rgba(45,120,244,0.2)', cursor: 'pointer' }}
                      >
                        <RefreshCw size={8} /> 替换
                      </button>
                      <input
                        ref={el => { fileRefs.current[idx] = el }}
                        type="file" accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handlePrizeReplace(idx)}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              替换后再点「下载全套」即可获得最新图片
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 通用组件卡片 ──────────────────────────────────────────────────────────────
function ComponentCard({ label, previewUrl, componentId, onDownload }: {
  label: string; previewUrl: string; componentId: string; onDownload: () => Promise<void>
}) {
  const [status, setStatus] = useState<'idle'|'loading'|'done'>('idle')
  const handle = async () => {
    setStatus('loading')
    try { await onDownload(); setStatus('done') } catch { setStatus('idle') }
    setTimeout(() => setStatus('idle'), 3000)
  }
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div style={{ width: 88, height: 48, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
        {previewUrl
          ? <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>无预览</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{label}</div>
        <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {componentId === 'coupon' && '背景图 · 腰封 · 按钮 共 3 张'}
          {componentId === 'h-tab'  && '全套 Tab 切图'}
          {componentId === 'floor'  && '楼层条切图'}
        </div>
      </div>
      <button onClick={handle} disabled={status === 'loading'}
        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0"
        style={{
          background: status === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(45,120,244,0.15)',
          color: status === 'done' ? '#4ade80' : '#6AA3FF',
          border: `1px solid ${status === 'done' ? 'rgba(74,222,128,0.3)' : 'rgba(45,120,244,0.25)'}`,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer', minWidth: 92, justifyContent: 'center',
        }}>
        <Download size={11} />
        {status === 'loading' ? '生成中…' : status === 'done' ? '✅ 已下载' : '下载这组图'}
      </button>
    </div>
  )
}

// ── 主弹窗 ────────────────────────────────────────────────────────────────────
export default function DeliveryModal({ onClose }: { onClose: () => void }) {
  const { items }    = useVenue()
  const slotCtx      = useSlot()
  const couponCtx    = useCoupon()
  const hTabCtx      = useHTab()
  const floorCtx     = useFloor()
  const { showToast } = useApp()
  const [allStatus, setAllStatus] = useState<'idle'|'loading'|'done'>('idle')

  const makeDownloader = useCallback((compId: string) => async () => {
    let files: FileEntry[] = []
    let name = '素材包'
    switch (compId) {
      case 'slot':   files = await generateSlotFiles(slotCtx.config);                             name = '老虎机_切图包'; break
      case 'coupon': files = await generateCouponFiles(couponCtx.config);                         name = `红包_${couponCtx.config.colorKey}`; break
      case 'h-tab':  files = await generateHTabFiles(hTabCtx.config, hTabCtx.items);             name = `横滑Tab_${hTabCtx.config.colorKey}`; break
      case 'floor':  files = await generateFloorFiles(floorCtx.config, floorCtx.floors);         name = '楼层条_切图包'; break
    }
    if (!files.length) return
    if (files.length === 1) { downloadBlob(await canvasToBlob(files[0].canvas), files[0].name); return }
    const zip = new JSZip()
    for (const f of files) zip.file(f.name, await canvasToBlob(f.canvas))
    downloadBlob(await zip.generateAsync({ type: 'blob' }), name + '.zip')
  }, [slotCtx, couponCtx, hTabCtx, floorCtx])

  const handleAll = useCallback(async () => {
    if (!items.length) { showToast('画布上没有组件'); return }
    setAllStatus('loading'); showToast('正在生成所有素材…')
    try {
      const zip = new JSZip()
      for (const item of items) {
        const folder = zip.folder(item.label) ?? zip
        let files: FileEntry[] = []
        switch (item.componentId) {
          case 'slot':   files = await generateSlotFiles(slotCtx.config); break
          case 'coupon': files = await generateCouponFiles(couponCtx.config); break
          case 'h-tab':  files = await generateHTabFiles(hTabCtx.config, hTabCtx.items); break
          case 'floor':  files = await generateFloorFiles(floorCtx.config, floorCtx.floors); break
        }
        for (const f of files) folder.file(f.name, await canvasToBlob(f.canvas))
      }
      downloadBlob(await zip.generateAsync({ type: 'blob' }), '会场素材全包.zip')
      setAllStatus('done'); showToast('✅ 全部素材已打包！')
    } catch { showToast('❌ 打包失败，请重试') }
    setTimeout(() => setAllStatus('idle'), 3000)
  }, [items, slotCtx, couponCtx, hTabCtx, floorCtx, showToast])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: 560, maxHeight: '85vh', background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)' }}>

        {/* 标题栏 */}
        <div className="flex items-center gap-3 px-6 py-5 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <CheckCircle2 size={22} style={{ color: '#4ade80', flexShrink: 0 }} />
          <div className="flex-1">
            <div className="text-base font-bold" style={{ color: '#fff' }}>会场素材已就绪</div>
            <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {items.length} 个组件 · 按需下载或一键打包
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* 组件列表 */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div style={{ fontSize: 32 }}>🎨</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>画布上还没有组件</div>
            </div>
          ) : items.map(item => (
            item.componentId === 'slot'
              ? <SlotCard key={item.id} previewUrl={item.previewUrl} onDownload={makeDownloader('slot')} />
              : <ComponentCard key={item.id} label={item.label} previewUrl={item.previewUrl}
                  componentId={item.componentId} onDownload={makeDownloader(item.componentId)} />
          ))}
        </div>

        {/* 全部打包 */}
        {items.length > 0 && (
          <div className="shrink-0 px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <button onClick={handleAll} disabled={allStatus === 'loading'}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background: allStatus === 'done' ? 'rgba(34,197,94,0.8)' : 'linear-gradient(90deg,#FF3060,#FF6030)',
                cursor: allStatus === 'loading' ? 'not-allowed' : 'pointer',
                opacity: allStatus === 'loading' ? 0.8 : 1,
              }}>
              <Package size={15} />
              {allStatus === 'loading' ? '生成中，请稍候…' : allStatus === 'done' ? '✅ 全部素材已下载！' : '一键全部打包下载 ZIP'}
            </button>
            <div className="text-center mt-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              包含所有组件的完整切图素材
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
