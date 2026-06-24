/**
 * 交付中心弹窗
 *
 * 用户搭建完成后点「完成 · 下载素材」弹出。
 * 按组件分组展示所有切图，每组一个下载按钮，底部一键全部打包 ZIP。
 * 面向非设计师，只显示"预览 + 下载"，不暴露技术细节。
 */
import { useState, useCallback } from 'react'
import JSZip from 'jszip'
import { X, Download, Package, CheckCircle2 } from 'lucide-react'
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

// ── 工具：canvas → blob ─────────────────────────────────────────────────────
function canvasToBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise(res => c.toBlob(b => res(b!), 'image/png'))
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

// ── 各组件的批量导出函数 ────────────────────────────────────────────────────

type FileEntry = { canvas: HTMLCanvasElement; name: string }

/** 老虎机 — 全套切图（8类，含弹窗） */
async function generateSlotFiles(
  config: ReturnType<typeof useSlot>['config']
): Promise<FileEntry[]> {
  await preloadFonts()

  const prizeCanvases = await Promise.all(
    config.prizes.map((p, i) =>
      drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)
    )
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
    Promise.resolve(drawButtonCanvas('立即抽奖',   config.btnActiveFrom,   config.btnActiveTo,   config.btnTextColor)),
    Promise.resolve(drawButtonCanvas('活动已结束', config.btnDisabledFrom, config.btnDisabledTo, config.btnTextColor)),
    Promise.resolve(drawLinkCanvas([{ text: '我的奖品' }], config.linksColor, 186, 44, 45, 2)),
    Promise.resolve(drawLinkCanvas([{ text: '|', opacity: 0.6 }, { text: '抽奖规则' }], config.linksColor, 218, 44, 45, 2)),
  ])

  const dialogBtns = ['确认', '领奖品', '查看收货地址', '重新加载', '关闭', '查看详情', '分享给朋友'].map((text, i) =>
    ({ canvas: drawDialogButtonCanvas(text, config.btnActiveFrom, config.btnActiveTo, undefined, config.btnTextColor),
       name: `slot_7_弹窗按钮_${i+1}_${text}.png` })
  )

  return [
    { canvas: c1,  name: 'slot_1_未抽奖状态_750x242.png' },
    { canvas: c2,  name: 'slot_2_背景_750x242.png' },
    { canvas: c3,  name: 'slot_3_空态页_854x284.png' },
    { canvas: c4a, name: 'slot_4_按钮立即抽奖.png' },
    { canvas: c4d, name: 'slot_4_按钮活动结束.png' },
    { canvas: c5p, name: 'slot_5_链接我的奖品.png' },
    { canvas: c5r, name: 'slot_5_链接抽奖规则.png' },
    ...prizeCanvases.map((c, i) => ({ canvas: c, name: `slot_6_奖品${i+1}_124x124.png` })),
    ...dialogBtns,
  ]
}

/** 一键领券红包 — 3张切图 */
async function generateCouponFiles(
  config: ReturnType<typeof useCoupon>['config']
): Promise<FileEntry[]> {
  await preloadFonts()
  const [bg, waistband, button] = await Promise.all([
    drawCouponBg(config),
    drawCouponWaistband(config),
    drawCouponButton(config),
  ])
  const name = config.colorKey
  return [
    { canvas: bg,        name: `红包_背景_702x352_${name}.png` },
    { canvas: waistband, name: `红包_腰封_702x168_${name}.png` },
    { canvas: button,    name: `红包_按钮_480x80_${name}.png` },
  ]
}

/** 横滑 Tab — 按组合出图 */
async function generateHTabFiles(
  config: ReturnType<typeof useHTab>['config'],
  hTabItems: ReturnType<typeof useHTab>['items']
): Promise<FileEntry[]> {
  await preloadFonts()
  const files: FileEntry[] = []
  for (const item of hTabItems) {
    const canvas = await drawHTabCanvas({ colorKey: config.colorKey, tabs: item.tabs, activeIndex: item.activeIndex })
    files.push({ canvas, name: `横滑Tab_${config.colorKey}_${item.tabs.join('-')}.png` })
  }
  return files
}

/** 楼层条 — 每条出图 */
async function generateFloorFiles(
  config: ReturnType<typeof useFloor>['config'],
  floors: ReturnType<typeof useFloor>['floors']
): Promise<FileEntry[]> {
  await preloadFonts()
  const files: FileEntry[] = []
  for (const floor of floors) {
    const canvas = await drawFloorCanvas({ ...config, text: floor.text })
    files.push({ canvas, name: `楼层条_${floor.text || '楼层'}_750x60.png` })
  }
  return files
}

// ── 组件卡片 ─────────────────────────────────────────────────────────────────
type Status = 'idle' | 'loading' | 'done' | 'error'

function ComponentCard({
  label, previewUrl, componentId, onDownload,
}: {
  label: string
  previewUrl: string
  componentId: string
  onDownload: () => Promise<void>
}) {
  const [status, setStatus] = useState<Status>('idle')

  const handle = async () => {
    setStatus('loading')
    try { await onDownload(); setStatus('done') }
    catch { setStatus('error') }
    finally { setTimeout(() => setStatus('idle'), 3000) }
  }

  const statusLabel = { idle: '下载这组图', loading: '生成中…', done: '✅ 已下载', error: '❌ 失败，重试' }

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* 预览图 */}
      <div style={{
        width: 88, height: 48, borderRadius: 8, overflow: 'hidden',
        background: 'rgba(255,255,255,0.05)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {previewUrl
          ? <img src={previewUrl} alt={label}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>无预览</span>
        }
      </div>

      {/* 名称 + 素材数说明 */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {label}
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {componentId === 'slot'   && '含未抽奖状态、背景、空态、按钮、奖品图、弹窗等'}
          {componentId === 'coupon' && '含背景图、腰封、按钮 共 3 张'}
          {componentId === 'h-tab'  && '含全套 Tab 切图'}
          {componentId === 'floor'  && '含全部楼层条切图'}
        </div>
      </div>

      {/* 下载按钮 */}
      <button
        onClick={handle}
        disabled={status === 'loading'}
        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shrink-0"
        style={{
          background: status === 'done'  ? 'rgba(34,197,94,0.15)'
                    : status === 'error' ? 'rgba(239,68,68,0.15)'
                    : 'rgba(45,120,244,0.15)',
          color: status === 'done'  ? '#4ade80'
               : status === 'error' ? '#f87171'
               : '#6AA3FF',
          border: `1px solid ${status === 'done' ? 'rgba(74,222,128,0.3)' : status === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(45,120,244,0.25)'}`,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.7 : 1,
          minWidth: 100,
          justifyContent: 'center',
        }}
      >
        <Download size={11} />
        {statusLabel[status]}
      </button>
    </div>
  )
}

// ── 主弹窗 ────────────────────────────────────────────────────────────────────
interface Props { onClose: () => void }

export default function DeliveryModal({ onClose }: Props) {
  const { items } = useVenue()
  const slotCtx   = useSlot()
  const couponCtx = useCoupon()
  const hTabCtx   = useHTab()
  const floorCtx  = useFloor()
  const { showToast } = useApp()

  const [allStatus, setAllStatus] = useState<Status>('idle')

  // 根据 componentId 返回对应的下载函数
  const makeDownloader = useCallback((compId: string, label: string) => async () => {
    let files: FileEntry[] = []
    let zipName = label

    switch (compId) {
      case 'slot':
        files   = await generateSlotFiles(slotCtx.config)
        zipName = '老虎机_切图包'
        break
      case 'coupon':
        files   = await generateCouponFiles(couponCtx.config)
        zipName = `一键领券红包_${couponCtx.config.colorKey}`
        break
      case 'h-tab':
        files   = await generateHTabFiles(hTabCtx.config, hTabCtx.items)
        zipName = `横滑Tab_${hTabCtx.config.colorKey}`
        break
      case 'floor':
        files   = await generateFloorFiles(floorCtx.config, floorCtx.floors)
        zipName = '楼层条_切图包'
        break
      default:
        return
    }

    if (files.length === 0) return

    if (files.length === 1) {
      // 单文件直接下载，不打包
      const blob = await canvasToBlob(files[0].canvas)
      downloadBlob(blob, files[0].name)
    } else {
      const zip = new JSZip()
      for (const f of files) {
        zip.file(f.name, await canvasToBlob(f.canvas))
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, zipName + '.zip')
    }
  }, [slotCtx, couponCtx, hTabCtx, floorCtx])

  // 全部打包
  const handleDownloadAll = useCallback(async () => {
    if (items.length === 0) { showToast('画布上没有组件'); return }
    setAllStatus('loading')
    showToast('正在生成所有素材，稍等…')
    try {
      const zip = new JSZip()
      for (const item of items) {
        let files: FileEntry[] = []
        const folder = zip.folder(item.label) ?? zip
        switch (item.componentId) {
          case 'slot':   files = await generateSlotFiles(slotCtx.config); break
          case 'coupon': files = await generateCouponFiles(couponCtx.config); break
          case 'h-tab':  files = await generateHTabFiles(hTabCtx.config, hTabCtx.items); break
          case 'floor':  files = await generateFloorFiles(floorCtx.config, floorCtx.floors); break
        }
        for (const f of files) folder.file(f.name, await canvasToBlob(f.canvas))
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, '会场素材全包.zip')
      setAllStatus('done')
      showToast('✅ 全部素材已打包下载！')
    } catch {
      setAllStatus('error')
      showToast('❌ 打包失败，请重试')
    } finally {
      setTimeout(() => setAllStatus('idle'), 3000)
    }
  }, [items, slotCtx, couponCtx, hTabCtx, floorCtx, showToast])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{
          width: 520, maxHeight: '80vh',
          background: '#0D1117',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* 顶部标题 */}
        <div className="flex items-center gap-3 px-6 py-5 border-b shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <CheckCircle2 size={22} style={{ color: '#4ade80', flexShrink: 0 }} />
          <div className="flex-1">
            <div className="text-base font-bold" style={{ color: '#fff' }}>
              会场素材已就绪
            </div>
            <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {items.length} 个组件 · 按需下载或一键打包
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-opacity hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* 组件列表（可滚动） */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div style={{ fontSize: 32 }}>🎨</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                画布上还没有组件
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
                先添加老虎机、红包等组件再来下载
              </div>
            </div>
          ) : (
            items.map(item => (
              <ComponentCard
                key={item.id}
                label={item.label}
                previewUrl={item.previewUrl}
                componentId={item.componentId}
                onDownload={makeDownloader(item.componentId, item.label)}
              />
            ))
          )}
        </div>

        {/* 底部：一键全部打包 */}
        {items.length > 0 && (
          <div className="shrink-0 px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <button
              onClick={handleDownloadAll}
              disabled={allStatus === 'loading'}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background: allStatus === 'done'
                  ? 'rgba(34,197,94,0.8)'
                  : allStatus === 'loading'
                  ? 'rgba(45,120,244,0.5)'
                  : 'linear-gradient(90deg, #FF3060, #FF6030)',
                cursor: allStatus === 'loading' ? 'not-allowed' : 'pointer',
                opacity: allStatus === 'loading' ? 0.8 : 1,
              }}
            >
              <Package size={15} />
              {allStatus === 'loading' ? '生成中，请稍候…'
               : allStatus === 'done'  ? '✅ 全部素材已下载！'
               : '一键全部打包下载 ZIP'}
            </button>
            <div className="text-center mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              包含所有组件的完整切图素材
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
