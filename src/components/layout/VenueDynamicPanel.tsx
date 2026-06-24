/**
 * 高达会场 · 右侧动态属性面板（无跳转版）
 *
 * 三种状态：
 *   pendingComp ≠ null  → 配置尚未加入画布的组件（底部显示「加入会场」按钮）
 *   selectedLayer = 'header' → 头图配置
 *   selectedLayer = item.id  → 已在画布组件的全量配置（配置变化 → 画布自动刷新）
 *   全部 null             → 页面级设置
 *
 * 画布自动刷新逻辑：
 *   floor / h-tab / coupon → 监听 context 变化，debounce 500ms 重新生成 canvas → updatePreview
 *   slot                   → 手动点「更新预览」按钮
 */
import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react'
import { ImageIcon, Trash2, RefreshCw } from 'lucide-react'
import { useVenue }  from '@/contexts/VenueContext'
import { useFloor }  from '@/contexts/FloorContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useCoupon } from '@/contexts/CouponContext'
import { useSlot }   from '@/contexts/SlotContext'
import { useApp }    from '@/contexts/AppContext'
import type { ComponentId, VenueHeaderSize, VenueItem } from '@/types'
import {
  drawFloorCanvas, drawHTabCanvas, drawCouponPreview,
  drawSlotBannerCanvas, drawPrizeCanvas, preloadFonts,
} from '@/utils/exportUtils'
import type { PrizeInfo, XfTransform, BannerConfig } from '@/utils/exportUtils'
import type { SlotConfig } from '@/types'

const FloorPanel  = lazy(() => import('@/components/panels/FloorPanel'))
const HTabPanel   = lazy(() => import('@/components/panels/HTabPanel'))
const CouponPanel = lazy(() => import('@/components/panels/CouponPanel'))
const SlotPanel   = lazy(() => import('@/components/panels/SlotPanel'))

function PLoader() {
  return <div className="flex items-center justify-center h-24 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>加载中…</div>
}

// ── 生成各组件的预览 URL ───────────────────────────────────────────────────────

async function genFloorUrl(cfg: Parameters<typeof drawFloorCanvas>[0]): Promise<string> {
  await preloadFonts()
  const c = await drawFloorCanvas(cfg)
  return c.toDataURL('image/png')
}

async function genHTabUrl(cfg: Parameters<typeof drawHTabCanvas>[0]): Promise<string> {
  await preloadFonts()
  const c = await drawHTabCanvas(cfg)
  return c.toDataURL('image/png')
}

async function genCouponUrl(cfg: Parameters<typeof drawCouponPreview>[0]): Promise<string> {
  await preloadFonts()
  const c = await drawCouponPreview(cfg)
  return c.toDataURL('image/png')
}

async function genSlotUrl(config: SlotConfig): Promise<string> {
  await preloadFonts()
  const prizeCanvases = await Promise.all(
    config.prizes.map((p, i) =>
      drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)
    )
  )
  const bannerCfg: BannerConfig = {
    slotTintFrom: config.slotTintFrom,
    slotTintTo:   config.slotTintTo,
    slotRect7From: config.slotRect7From,
    slotRect7To:   config.slotRect7To,
    titleText:    config.titleText,
    titleColor:   config.titleColor,
    linksColor:   config.linksColor,
    btnActiveFrom: config.btnActiveFrom,
    btnActiveTo:   config.btnActiveTo,
    btnTextColor:  config.btnTextColor,
    slotStyle:     config.slotStyle,
  }
  const c = await drawSlotBannerCanvas(bannerCfg, prizeCanvases)
  return c.toDataURL('image/png')
}

// ── 自动同步 canvas（floor / htab / coupon）─────────────────────────────────

function useAutoSync(item: VenueItem | null) {
  const { updatePreview } = useVenue()
  const { config: floorCfg, floors } = useFloor()
  const { config: hTabCfg, items: hTabItems } = useHTab()
  const { config: couponCfg } = useCoupon()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleUpdate = useCallback((gen: () => Promise<string>, key: { sourceId?: string; label?: string }) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const url = await gen()
        updatePreview(key, url)
      } catch { /* ignore */ }
    }, 500)
  }, [updatePreview])

  // Floor
  useEffect(() => {
    if (!item || item.componentId !== 'floor') return
    const fi = floors.find(f => f.id === item.sourceId)
    if (!fi) return
    scheduleUpdate(
      () => genFloorUrl({ ...floorCfg, text: fi.text }),
      { sourceId: item.sourceId }
    )
  }, [floorCfg, floors, item?.id])

  // HTab
  useEffect(() => {
    if (!item || item.componentId !== 'h-tab') return
    const hi = hTabItems.find(h => h.id === item.sourceId)
    if (!hi) return
    scheduleUpdate(
      () => genHTabUrl({ colorKey: hTabCfg.colorKey, tabs: hi.tabs, activeIndex: hi.activeIndex }),
      { sourceId: item.sourceId }
    )
  }, [hTabCfg, hTabItems, item?.id])

  // Coupon
  useEffect(() => {
    if (!item || item.componentId !== 'coupon') return
    scheduleUpdate(
      () => genCouponUrl(couponCfg),
      { sourceId: item.sourceId ?? undefined, label: item.label }
    )
  }, [couponCfg, item?.id])
}

// ── 头图配置 ──────────────────────────────────────────────────────────────────
const HEADER_SIZES: { key: VenueHeaderSize; label: string; h: number }[] = [
  { key: '424', label: '标准', h: 424 },
  { key: '624', label: '大图', h: 624 },
  { key: '274', label: '极矮', h: 274 },
]

function HeaderConfig() {
  const { headerUrl, setHeaderUrl, headerSize, setHeaderSize, bgColor, setBgColor } = useVenue()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setHeaderUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-4 space-y-5">
      <div>
        <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>头图图片</div>
        <div
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
          style={{ border: '1px dashed rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,48,96,0.4)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'}
        >
          {headerUrl
            ? <img src={headerUrl} alt="头图" className="rounded shrink-0"
                style={{ width: 48, height: Math.round(48 * parseInt(headerSize) / 750), objectFit: 'cover' }} />
            : <div className="rounded shrink-0 flex items-center justify-center"
                style={{ width: 48, height: 28, background: 'rgba(255,255,255,0.05)' }}>
                <ImageIcon size={14} style={{ color: 'rgba(255,255,255,0.25)' }} />
              </div>
          }
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {headerUrl ? '点击更换头图' : '上传头图'}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              750 × {HEADER_SIZES.find(s => s.key === headerSize)?.h ?? 424} px
            </div>
          </div>
          {headerUrl && (
            <button onClick={e => { e.stopPropagation(); setHeaderUrl('') }}
              className="shrink-0 p-1 rounded" style={{ color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <div>
        <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>头图高度</div>
        <div className="flex gap-1.5">
          {HEADER_SIZES.map(s => (
            <button key={s.key} onClick={() => setHeaderSize(s.key)}
              className="flex-1 py-2 text-[11px] rounded-xl transition-all"
              style={{
                border: `1px solid ${headerSize === s.key ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: headerSize === s.key ? 'rgba(255,80,80,0.1)' : 'rgba(255,255,255,0.03)',
                color: headerSize === s.key ? '#FF8080' : 'rgba(255,255,255,0.4)',
                fontWeight: headerSize === s.key ? 600 : 400, cursor: 'pointer',
              }}>
              <div>{s.label}</div>
              <div style={{ fontSize: 9, opacity: 0.7, marginTop: 1 }}>{s.h}px</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>会场背景色</div>
        <div className="flex items-center gap-3">
          <label className="relative cursor-pointer">
            <div style={{ width: 28, height: 28, borderRadius: 6, background: bgColor, border: '1px solid rgba(255,255,255,0.15)' }} />
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
          </label>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>{bgColor.toUpperCase()}</span>
        </div>
      </div>

      {/* 待开发占位 */}
      <div className="space-y-2">
        {[{ label: '头图动效', desc: '入场动效、循环动效', icon: '✦' }, { label: '文案叠加', desc: '在头图上叠加活动标题', icon: 'T' }].map(it => (
          <div key={it.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.55 }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,200,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, color: 'rgba(255,180,0,0.5)' }}>{it.icon}</span>
            <div className="flex-1">
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{it.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>{it.desc}</div>
            </div>
            <span style={{ fontSize: 9, color: 'rgba(255,180,0,0.45)', border: '1px solid rgba(255,180,0,0.12)', borderRadius: 3, padding: '1px 5px' }}>待开发</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 页面设置 ──────────────────────────────────────────────────────────────────
function PageSettings() {
  const { bgColor, setBgColor } = useVenue()
  return (
    <div className="p-4 space-y-5">
      <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
        点击左侧图层或画布中的组件来配置。
      </p>
      <div>
        <div className="text-[11px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>会场背景色</div>
        <div className="flex items-center gap-3">
          <label className="relative cursor-pointer">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: bgColor, border: '1px solid rgba(255,255,255,0.15)' }} />
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
          </label>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>{bgColor.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}

// ── 「加入会场」按钮（pending 状态）─────────────────────────────────────────
function AddToCanvasButton({ compId, onDone }: { compId: ComponentId; onDone: () => void }) {
  const { addItem, items } = useVenue()
  const { config: floorCfg, floors } = useFloor()
  const { config: hTabCfg, items: hTabItems } = useHTab()
  const { config: couponCfg } = useCoupon()
  const { config: slotCfg } = useSlot()
  const { showToast } = useApp()
  const [loading, setLoading] = useState(false)

  // 已加入判断
  const isAdded = items.some(it => it.componentId === compId)

  const handle = async () => {
    setLoading(true)
    try {
      let url = ''; let label = ''; let origH = 100
      switch (compId) {
        case 'floor': {
          const fi = floors[0]
          if (!fi) { showToast('请先在楼层配置里添加至少一条楼层'); setLoading(false); return }
          url   = await genFloorUrl({ ...floorCfg, text: fi.text })
          label = fi.text || '楼层条'
          origH = 60
          addItem({ componentId: 'floor', label, previewUrl: url, origW: 750, origH, sourceId: fi.id })
          showToast(`✅ 「${label}」已加入会场`)
          break
        }
        case 'h-tab': {
          const hi = hTabItems[0]
          if (!hi) { showToast('请先配置 Tab 内容'); setLoading(false); return }
          const tabCount = items.filter(it => it.componentId === 'h-tab').length
          label = `Tab ${tabCount + 1}`
          url   = await genHTabUrl({ colorKey: hTabCfg.colorKey, tabs: hi.tabs, activeIndex: 0 })
          origH = 88
          addItem({ componentId: 'h-tab', label, previewUrl: url, origW: 750, origH, sourceId: hi.id })
          showToast(`✅ 「${label}」已加入会场`)
          break
        }
        case 'coupon': {
          url   = await genCouponUrl(couponCfg)
          label = '一键领券红包'
          origH = 352
          addItem({ componentId: 'coupon', label, previewUrl: url, origW: 702, origH })
          showToast('✅ 「一键领券红包」已加入会场')
          break
        }
        case 'slot': {
          url   = await genSlotUrl(slotCfg)
          label = '老虎机'
          origH = 242
          addItem({ componentId: 'slot', label, previewUrl: url, origW: 750, origH })
          showToast('✅ 「老虎机」已加入会场')
          break
        }
      }
      onDone()
    } catch (e) {
      showToast('预览生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all"
      style={{
        background: loading ? 'rgba(45,120,244,0.3)' : 'linear-gradient(90deg,#2D78F4,#4A90FF)',
        color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? '生成预览中…' : isAdded ? '再次加入会场' : '加入会场'}
    </button>
  )
}

// ── Slot 手动刷新按钮 ─────────────────────────────────────────────────────────
function SlotRefreshButton({ item }: { item: VenueItem }) {
  const { updatePreview } = useVenue()
  const { config } = useSlot()
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    try {
      const url = await genSlotUrl(config)
      updatePreview({ sourceId: item.sourceId ?? undefined, label: item.label }, url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all"
      style={{
        background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(255,255,255,0.1)', cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      <RefreshCw size={11} style={{ opacity: loading ? 0.4 : 1 }} />
      {loading ? '更新中…' : '更新画布预览'}
    </button>
  )
}

// ── 主面板 ────────────────────────────────────────────────────────────────────
interface Props {
  selectedLayer: 'header' | string | null
  pendingComp:   ComponentId | null
  onPendingDone: () => void
}

export default function VenueDynamicPanel({ selectedLayer, pendingComp, onPendingDone }: Props) {
  const { items } = useVenue()

  const selectedItem = selectedLayer && selectedLayer !== 'header'
    ? items.find(it => it.id === selectedLayer) ?? null
    : null

  // 自动同步 floor/htab/coupon 的画布预览
  useAutoSync(selectedItem)

  // 面板标题
  const panelTitle = pendingComp
    ? `配置：${COMP_LABEL[pendingComp] ?? pendingComp}`
    : !selectedLayer ? '页面设置'
    : selectedLayer === 'header' ? '活动头图'
    : selectedItem?.label ?? '组件配置'

  return (
    <div className="flex flex-col h-full shrink-0 border-l"
      style={{ width: 280, background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>

      {/* 标题栏 */}
      <div className="h-11 flex items-center px-4 border-b shrink-0 gap-2"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <span className="text-xs font-semibold flex-1 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {panelTitle}
        </span>
        {/* pending 状态：显示取消 */}
        {pendingComp && (
          <button onClick={onPendingDone}
            className="text-[10px] px-2 py-0.5 rounded transition-all hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
            取消
          </button>
        )}
        {/* 老虎机：手动刷新按钮 */}
        {selectedItem?.componentId === 'slot' && (
          <SlotRefreshButton item={selectedItem} />
        )}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        {/* pending 配置模式 */}
        {pendingComp && (
          <>
            <div className="px-4 pt-3 pb-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              配置好后点下方「加入会场」
            </div>
            <Suspense fallback={<PLoader />}>
              {pendingComp === 'floor'  && <FloorPanel />}
              {pendingComp === 'h-tab'  && <HTabPanel />}
              {pendingComp === 'coupon' && <CouponPanel />}
              {pendingComp === 'slot'   && <SlotPanel />}
            </Suspense>
          </>
        )}

        {/* 已在画布的组件配置 */}
        {!pendingComp && selectedItem && (
          <Suspense fallback={<PLoader />}>
            {selectedItem.componentId === 'floor'  && <FloorPanel />}
            {selectedItem.componentId === 'h-tab'  && <HTabPanel />}
            {selectedItem.componentId === 'coupon' && <CouponPanel />}
            {selectedItem.componentId === 'slot'   && <SlotPanel />}
          </Suspense>
        )}

        {/* 头图配置 */}
        {!pendingComp && selectedLayer === 'header' && <HeaderConfig />}

        {/* 页面设置 */}
        {!pendingComp && !selectedLayer && <PageSettings />}
      </div>

      {/* 底部：「加入会场」（pending 模式）*/}
      {pendingComp && (
        <div className="shrink-0 p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <AddToCanvasButton compId={pendingComp} onDone={onPendingDone} />
        </div>
      )}
    </div>
  )
}

const COMP_LABEL: Partial<Record<ComponentId, string>> = {
  slot:   '老虎机',
  floor:  '楼层条',
  'h-tab': '横滑 Tab',
  coupon: '一键领券红包',
}
