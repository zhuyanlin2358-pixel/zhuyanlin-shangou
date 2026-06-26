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
import Spinner from '@/components/ui/Spinner'
import { useVenue }  from '@/contexts/VenueContext'
import { useFloor }  from '@/contexts/FloorContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useCoupon } from '@/contexts/CouponContext'
import { useSlot }   from '@/contexts/SlotContext'
import type { ComponentId, VenueHeaderSize, VenueItem, HTabColorKey } from '@/types'
import { H_TAB_COLORS } from '@/types'
import {
  drawFloorCanvas, drawHTabCanvas, drawCouponPreview,
  drawSlotBannerCanvas, drawPrizeCanvas, preloadFonts,
} from '@/utils/exportUtils'
import type { PrizeInfo, XfTransform, BannerConfig } from '@/utils/exportUtils'
import {
  SlotColorConfig  as InlineSlotColorConfig,
  SlotTextConfig   as InlineSlotTextConfig,
  SlotPrizeConfig  as InlineSlotPrizeConfig,
  InlineConfigSection,
} from '@/components/panels/SlotConfigBlocks'

const FloorPanel  = lazy(() => import('@/components/panels/FloorPanel'))
const CouponPanel = lazy(() => import('@/components/panels/CouponPanel'))

function PLoader() {
  return (
    <div className="flex items-center justify-center h-24">
      <Spinner size="sm" />
    </div>
  )
}

// ── 红包热区内联编辑（模块顶层，防 re-mount 失焦）────────────────────────────
function CouponZoneInline({ zone }: { zone: string }) {
  const { config, setTitleText, setBtnText } = useCoupon()
  const inp = {
    width: '100%', boxSizing: 'border-box' as const,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '7px 10px', fontSize: 12,
    color: '#ebe9fc', outline: 'none',
  }
  const label = { fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)' as const,
    textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 }
  return (
    <div>
      {zone === 'title' && (
        <>
          <div style={label}>主文案</div>
          <input style={inp} value={config.titleText} maxLength={24}
            onChange={e => setTitleText(e.target.value)} placeholder="领618好店券 下单更优惠" />
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>最多 24 字</div>
        </>
      )}
      {zone === 'btn' && (
        <>
          <div style={label}>按钮文案</div>
          <input style={inp} value={config.btnText} maxLength={10}
            onChange={e => setBtnText(e.target.value)} placeholder="一键领取" />
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>最多 10 字</div>
        </>
      )}
    </div>
  )
}

// ── 生成各组件预览 URL（从共享文件导入）──────────────────────────────────────
import { genFloorUrl, genHTabUrl, genCouponUrl, genSlotUrl } from '@/utils/venuePreviewUrls'

// ── 自动同步 canvas（所有组件，debounce）─────────────────────────────────────

function useAutoSync(item: VenueItem | null) {
  const { updatePreview } = useVenue()
  const { config: floorCfg, floors }   = useFloor()
  const { config: hTabCfg, items: hTabItems } = useHTab()
  const { config: couponCfg }          = useCoupon()
  const { config: slotCfg }            = useSlot()

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleUpdate = useCallback((
    gen: () => Promise<string>,
    key: { sourceId?: string; label?: string },
    delay = 500,
  ) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try { updatePreview(key, await gen()) } catch { /* ignore */ }
    }, delay)
  }, [updatePreview])

  // Floor
  useEffect(() => {
    if (!item || item.componentId !== 'floor') return
    const fi = floors.find(f => f.id === item.sourceId)
    if (!fi) return
    scheduleUpdate(() => genFloorUrl({ ...floorCfg, text: fi.text }), { sourceId: item.sourceId })
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
    scheduleUpdate(() => genCouponUrl(couponCfg), { sourceId: item.sourceId ?? undefined, label: item.label })
  }, [couponCfg, item?.id])

  // Slot — 配色/文案变化自动刷新（800ms 防抖，避免频繁绘制）
  useEffect(() => {
    if (!item || item.componentId !== 'slot') return
    scheduleUpdate(() => genSlotUrl(slotCfg), { sourceId: item.sourceId ?? undefined, label: item.label }, 800)
  }, [
    slotCfg.slotTintFrom, slotCfg.slotTintTo, slotCfg.titleText, slotCfg.titleColor,
    slotCfg.btnActiveFrom, slotCfg.btnActiveTo, slotCfg.slotStyle,
    slotCfg.linksColor, item?.id,
  ])
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
        <div className="text-[12px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>头图图片</div>
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
            <div className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
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
        <div className="text-[12px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>头图高度</div>
        <div className="flex gap-1.5">
          {HEADER_SIZES.map(s => (
            <button key={s.key} onClick={() => setHeaderSize(s.key)}
              className="flex-1 py-2 text-[12px] rounded-xl transition-all"
              style={{
                border: `1px solid ${headerSize === s.key ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: headerSize === s.key ? 'rgba(255,80,80,0.1)' : 'rgba(255,255,255,0.03)',
                color: headerSize === s.key ? '#FF8080' : 'rgba(255,255,255,0.4)',
                fontWeight: headerSize === s.key ? 600 : 400, cursor: 'pointer',
              }}>
              <div>{s.label}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 1 }}>{s.h}px</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[12px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>会场背景色</div>
        <div className="flex items-center gap-3">
          <label className="relative cursor-pointer">
            <div style={{ width: 28, height: 28, borderRadius: 6, background: bgColor, border: '1px solid rgba(255,255,255,0.15)' }} />
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
          </label>
          <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>{bgColor.toUpperCase()}</span>
        </div>
      </div>

      {/* 待开发占位 */}
      <div className="space-y-2">
        {[{ label: '头图动效', desc: '入场动效、循环动效', icon: '✦' }, { label: '文案叠加', desc: '在头图上叠加活动标题', icon: 'T' }].map(it => (
          <div key={it.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.55 }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,200,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, color: 'rgba(255,180,0,0.5)' }}>{it.icon}</span>
            <div className="flex-1">
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{it.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>{it.desc}</div>
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,180,0,0.45)', border: '1px solid rgba(255,180,0,0.12)', borderRadius: 3, padding: '1px 5px' }}>待开发</span>
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
      <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
        点击左侧图层或画布中的组件来配置。
      </p>
      <div>
        <div className="text-[12px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>会场背景色</div>
        <div className="flex items-center gap-3">
          <label className="relative cursor-pointer">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: bgColor, border: '1px solid rgba(255,255,255,0.15)' }} />
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
          </label>
          <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>{bgColor.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}

// ── 通用刷新按钮（所有组件）─────────────────────────────────────────────────
function RefreshButton({ item }: { item: VenueItem }) {
  const { updatePreview } = useVenue()
  const { config: slotCfg } = useSlot()
  const { config: floorCfg, floors } = useFloor()
  const { config: hTabCfg, items: hTabItems } = useHTab()
  const { config: couponCfg } = useCoupon()
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    try {
      let url = ''
      if (item.componentId === 'slot') {
        url = await genSlotUrl(slotCfg)
      } else if (item.componentId === 'floor') {
        const fi = floors.find(f => f.id === item.sourceId) ?? floors[0]
        if (fi) url = await genFloorUrl({ ...floorCfg, text: fi.text })
      } else if (item.componentId === 'h-tab') {
        const hi = hTabItems.find(h => h.id === item.sourceId) ?? hTabItems[0]
        if (hi) url = await genHTabUrl({ colorKey: hTabCfg.colorKey, tabs: hi.tabs, activeIndex: hi.activeIndex })
      } else if (item.componentId === 'coupon') {
        url = await genCouponUrl(couponCfg)
      }
      if (url) updatePreview({ sourceId: item.sourceId ?? undefined, label: item.label }, url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all"
      style={{
        background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(255,255,255,0.1)', cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      <RefreshCw size={11} style={{ opacity: loading ? 0.4 : 1, animation: loading ? 'btnSpin 0.8s linear infinite' : 'none' }} />
      {loading ? '更新中…' : '更新画布预览'}
    </button>
  )
}

// ── 组件预览卡（组件工坊点击后右侧显示，替代配置） ────────────────────────────
const COMP_PREVIEW_META: Record<string, { desc: string; items: string[] }> = {
  slot:    { desc: '大促核心玩法，用户点击转盘抽奖，增强互动。', items: ['主视觉 750×242', '弹窗结果页 × 6种', '弹窗按钮 × 7种', '奖品图（动态数量）'] },
  floor:   { desc: '楼层分隔条，区分页面不同内容区域。',       items: ['750 × 60 px', '3款预设', '自定义配色'] },
  'h-tab': { desc: '横向滑动标签，快速切换商品或活动分类。',   items: ['2 / 3 / 4 个 Tab', '7种配色', '每个 Tab 单独切图'] },
  coupon:  { desc: '一键领取优惠券红包，引导领券提升转化。',   items: ['无tab背景 702×352', '券包预览 702×352', '腰封 702×168', '按钮 480×80', '单券背景 702×236'] },
}

function ComponentPreviewCard({ compId }: { compId: ComponentId }) {
  const meta    = COMP_PREVIEW_META[compId]
  const slotCtx = useSlot()
  const coupon  = useCoupon()
  const htab    = useHTab()
  const floor   = useFloor()
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    let cancelled = false
    const generate = async () => {
      setLoading(true)
      try {
        await preloadFonts()
        let canvas: HTMLCanvasElement | null = null
        const slot = slotCtx.config
        const sc: BannerConfig = {
          slotTintFrom: slot.slotTintFrom, slotTintTo: slot.slotTintTo,
          slotRect7From: slot.slotRect7From, slotRect7To: slot.slotRect7To,
          titleText: slot.titleText, titleColor: slot.titleColor, linksColor: slot.linksColor,
          btnActiveFrom: slot.btnActiveFrom, btnActiveTo: slot.btnActiveTo,
          btnTextColor: slot.btnTextColor, slotStyle: slot.slotStyle,
        }
        if (compId === 'slot') {
          const pcs = await Promise.all(slot.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, slot.prizeTransforms[i] as XfTransform, slot.slotStyle)))
          canvas = await drawSlotBannerCanvas(sc, pcs)
        } else if (compId === 'coupon') {
          canvas = await drawCouponPreview(coupon.config)
        } else if (compId === 'h-tab') {
          const it = htab.items[0]
          canvas = await drawHTabCanvas({ colorKey: htab.config.colorKey, tabs: it?.tabs ?? ['Tab 1', 'Tab 2'], activeIndex: 0 })
        } else if (compId === 'floor') {
          canvas = await drawFloorCanvas({ ...floor.config, text: floor.floors[0]?.text ?? '领好店券 下单更优惠' })
        }
        if (!cancelled && canvas) setPreviewUrl(canvas.toDataURL())
      } catch {}
      if (!cancelled) setLoading(false)
    }
    generate()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compId, coupon.config, slotCtx.config, htab.config, floor.config])

  if (!meta) return null

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* 实际渲染预览图 */}
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {loading ? (
          <Spinner size="sm" />
        ) : previewUrl ? (
          <img src={previewUrl} alt={compId} style={{ width: '100%', height: 'auto', display: 'block' }} />
        ) : (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: 16 }}>预览暂不可用</div>
        )}
      </div>

      {/* 描述 */}
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>
        {meta.desc}
      </p>

      {/* 素材清单 */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          包含素材
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {meta.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.55 }}>
        加入会场后，点击左侧图层列表选中该组件即可配置。
      </div>
    </div>
  )
}

// ── HTab 内联编辑（颜色 + Tab数量 + Tab文案）─────────────────────────────────
function HTabInlinePanel({ sourceId }: { sourceId?: string }) {
  const { config, setColor, items, updateItem } = useHTab()
  const item = items.find(it => it.id === sourceId) ?? items[0]
  if (!item) return null

  const tabCount = item.tabs.length

  const setTabCount = (n: number) => {
    const newTabs = Array.from({ length: n }, (_, i) => item.tabs[i] ?? `Tab ${i + 1}`)
    updateItem(item.id, { tabs: newTabs })
  }

  const setTabText = (i: number, v: string) => {
    const newTabs = [...item.tabs]
    newTabs[i] = v
    updateItem(item.id, { tabs: newTabs })
  }

  return (
    <div className="py-2 space-y-1">
      {/* 配色 */}
      <div className="px-4 pt-3 pb-1">
        <div className="text-[10px] font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>配色</div>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(H_TAB_COLORS) as HTabColorKey[]).map(k => {
            const def = H_TAB_COLORS[k]
            const active = config.colorKey === k
            return (
              <button key={k} onClick={() => setColor(k)}
                className="flex flex-col items-center gap-1 py-2 rounded-lg transition-all"
                style={{
                  border: `1.5px solid ${active ? '#FF5050' : 'rgba(255,255,255,0.07)'}`,
                  background: active ? 'rgba(255,80,80,0.06)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: def.inactiveBg, boxShadow: '0 0 0 1.5px rgba(255,255,255,0.15)' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{def.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab 数量 */}
      <div className="px-4 pt-2 pb-1">
        <div className="text-[10px] font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>数量</div>
        <div className="flex gap-1.5">
          {[2, 3, 4].map(n => (
            <button key={n} onClick={() => setTabCount(n)}
              className="flex-1 py-2 text-[12px] rounded-xl transition-all"
              style={{
                border: `1px solid ${tabCount === n ? 'rgba(255,80,80,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: tabCount === n ? 'rgba(255,80,80,0.1)' : 'rgba(255,255,255,0.03)',
                color: tabCount === n ? '#FF8080' : 'rgba(255,255,255,0.4)',
                fontWeight: tabCount === n ? 600 : 400, cursor: 'pointer',
              }}>
              {n}个
            </button>
          ))}
        </div>
      </div>

      {/* Tab 文案 */}
      <div className="px-4 pt-2 pb-3">
        <div className="text-[10px] font-semibold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>文案</div>
        <div className="space-y-1.5">
          {item.tabs.map((tab, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', width: 16, textAlign: 'center' }}>{i + 1}</span>
              <input
                value={tab}
                onChange={e => setTabText(i, e.target.value)}
                className="flex-1 px-2 py-1.5 rounded-lg text-[12px] transition-all outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                }}
                placeholder={`Tab ${i + 1} 文案`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 主面板 ────────────────────────────────────────────────────────────────────
interface Props {
  selectedLayer: 'header' | string | null
  pendingComp:   ComponentId | null
  activeZone:    string           // 双击热区选中的配置区域（'text'|'prize'|'color'|''）
  onZoneClear:   () => void       // 清空热区选中
  onPendingDone: () => void
  onAdvanced:    (compId: ComponentId) => void
}

export default function VenueDynamicPanel({ selectedLayer, pendingComp, activeZone, onZoneClear, onPendingDone, onAdvanced }: Props) {
  const { items } = useVenue()

  const selectedItem = selectedLayer && selectedLayer !== 'header'
    ? items.find(it => it.id === selectedLayer) ?? null
    : null

  // 自动同步 floor/htab/coupon 的画布预览
  useAutoSync(selectedItem)

  // 当前活跃的组件 id（pending 优先）
  const activeCompId: ComponentId | null = pendingComp ?? selectedItem?.componentId ?? null

  const ZONE_LABEL: Record<string, string> = {
    text: '标题文案', prize: '奖品图设置',
    title: '主文案',  btn: '按钮文案',
  }
  const isZoneMode = !!(activeZone && (selectedItem?.componentId === 'slot' || selectedItem?.componentId === 'coupon'))
  // 面板标题
  const panelTitle = pendingComp
    ? (COMP_LABEL[pendingComp] ?? pendingComp)
    : !selectedLayer ? '页面设置'
    : selectedLayer === 'header' ? '活动头图'
    : isZoneMode
      ? ZONE_LABEL[activeZone] ?? '组件配置'
      : selectedItem?.label ?? '组件配置'

  return (
    <div className="flex flex-col h-full shrink-0 border-l"
      style={{ width: 360, background: 'var(--sl-panel)', borderColor: 'var(--sl-border)', boxShadow: 'var(--shadow-panel-l)', zIndex: 5, position: 'relative' }}>

      {/* 标题栏 */}
      <div className="h-11 flex items-center px-4 border-b shrink-0 gap-2"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <span className="text-xs font-semibold flex-1 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {panelTitle}
        </span>

        {/* 取消（pending 模式） */}
        {pendingComp && (
          <button onClick={onPendingDone}
            className="text-[10px] px-2 py-0.5 rounded transition-all hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
            取消
          </button>
        )}

        {/* 热区模式：返回全部配置（slot + coupon） */}
        {isZoneMode && (
          <button onClick={onZoneClear}
            className="text-[10px] px-2 py-0.5 rounded transition-all hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← 全部
          </button>
        )}

        {/* 所有已在画布的组件都显示「更新画布预览」按钮 */}
        {selectedItem && !activeZone && (
          <RefreshButton item={selectedItem} />
        )}

      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        {/* pending 模式：只显示组件简介+预览，不显示配置 */}
        {pendingComp && (
          <ComponentPreviewCard compId={pendingComp} />
        )}

        {/* 已在画布的组件配置 */}
        {!pendingComp && selectedItem && (
          <>
            {/* slot / coupon 热区激活 → 只显示对应配置 */}
            {selectedItem.componentId === 'slot' && activeZone ? (
              <div className="pt-2">
                <div className="px-4 py-2">
                  {activeZone === 'text'  && <InlineSlotTextConfig />}
                  {activeZone === 'prize' && <InlineSlotPrizeConfig />}
                </div>
              </div>
            ) : selectedItem.componentId === 'coupon' && activeZone ? (
              <div className="pt-2 px-4 py-3">
                <CouponZoneInline zone={activeZone} />
              </div>
            ) : (
              <>
                {/* slot 单击：只显示三个核心配置区，双击标题/奖品图可精准跳转 */}
                {selectedItem.componentId === 'slot' && (
                  <div className="py-2">
                    <div className="px-4 pt-2 pb-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      双击预览标题/奖品图可精准配置
                    </div>
                    <div className="px-4 space-y-1">
                      <InlineConfigSection label="配色预设" badge="风格" defaultOpen>
                        <InlineSlotColorConfig />
                      </InlineConfigSection>
                      <InlineConfigSection label="标题文案" badge="文案" defaultOpen>
                        <InlineSlotTextConfig />
                      </InlineConfigSection>
                      <InlineConfigSection label="奖品图设置" badge="商品图">
                        <InlineSlotPrizeConfig />
                      </InlineConfigSection>
                    </div>
                  </div>
                )}
                <Suspense fallback={<PLoader />}>
                  {selectedItem.componentId === 'floor'  && <FloorPanel />}
                  {selectedItem.componentId === 'h-tab'  && <HTabInlinePanel sourceId={selectedItem.sourceId} />}
                  {selectedItem.componentId === 'coupon' && (
                    <>
                      <div className="px-4 pt-2 pb-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        双击预览文案/按钮可精准配置
                      </div>
                      <CouponPanel />
                    </>
                  )}
                </Suspense>
              </>
            )}
          </>
        )}

        {/* 头图配置 */}
        {!pendingComp && selectedLayer === 'header' && <HeaderConfig />}

        {/* 页面设置 */}
        {!pendingComp && !selectedLayer && <PageSettings />}
      </div>

      {/* 底部：「进入工作室」（已选组件，藏得较深的深度编辑入口）*/}
      {!pendingComp && activeCompId && (
        <div className="shrink-0 px-3 pb-3 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => onAdvanced(activeCompId)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-xl transition-all hover:opacity-90"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.45)',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            进入工作室（深度编辑）
          </button>
        </div>
      )}

      {/* 「加入会场」已移至左侧侧边栏行内按钮，右侧不再重复显示 */}
    </div>
  )
}

const COMP_LABEL: Partial<Record<ComponentId, string>> = {
  slot:   '老虎机',
  floor:  '楼层条',
  'h-tab': '横滑 Tab',
  coupon: '一键领券红包',
}
