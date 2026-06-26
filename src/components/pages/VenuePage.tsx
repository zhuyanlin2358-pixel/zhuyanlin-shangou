/**
 * 高达会场统一工作区
 *
 * 两种模式：
 *
 * ① 画布布局模式（默认三列）
 *   [图层面板 216px] | [手机画布 flex-1] | [核心属性面板 360px]
 *   右侧面板：只放当前选中组件的核心属性 + 底部「高级设置 →」按钮
 *
 * ② 高级设置模式（点击「高级设置」进入）
 *   [返回条 40px] | [组件完整配置页 flex-1] | [手机预览 380px]
 *   包含：弹窗、导出、Tab文案、奖品图等深度配置
 */
import { Suspense, lazy, useState, useEffect, useRef } from 'react'
import { useApp }    from '@/contexts/AppContext'
import { useVenue }  from '@/contexts/VenueContext'
import { useSlot, SLOT_PRESETS } from '@/contexts/SlotContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useCoupon } from '@/contexts/CouponContext'
import { useFloor }  from '@/contexts/FloorContext'
import { COUPON_COLORS } from '@/types'
import type { ComponentId } from '@/types'
import type { ZoomOpt } from '@/components/layout/VenueCanvasCenter'
import { SCENE_TEMPLATES } from '@/utils/sceneTemplates'
import { GLOBAL_THEMES }   from '@/utils/globalThemes'
import { genFloorUrl, genHTabUrl, genCouponUrl, genSlotUrl } from '@/utils/venuePreviewUrls'

const ZOOM_OPTS: ZoomOpt[] = [50, 75, 100, 125, 150]

// ── 场景方案库应用器（无 UI，监听 pendingTemplate 并异步执行）────────────────
function TemplateApplier() {
  const { pendingTemplate, setPendingTemplate, showToast } = useApp()
  const { addItem, clearItems } = useVenue()
  const { config: slotCfg, applyPreset } = useSlot()
  const { config: hTabCfg, items: hTabItems, setColor } = useHTab()
  const { config: couponCfg, setColorKey } = useCoupon()
  const { config: floorCfg, floors } = useFloor()
  const applyingRef = useRef(false) // 防止 Strict Mode 双执行

  useEffect(() => {
    if (!pendingTemplate || applyingRef.current) return
    const tpl = SCENE_TEMPLATES.find(t => t.key === pendingTemplate)
    if (!tpl) { setPendingTemplate(null); return }

    applyingRef.current = true

    const run = async () => {
      const theme = GLOBAL_THEMES.find(t => t.key === tpl.themeKey)

      // ① 用 preset 值直接构造 slot config（不依赖 setState flush）
      const preset = theme ? SLOT_PRESETS[theme.slotPreset] : null
      const newSlotCfg = preset ? {
        ...slotCfg,
        btnActiveFrom: preset.from,    btnActiveTo: preset.to,
        btnDisabledFrom: preset.disFrom, btnDisabledTo: preset.disTo,
        slotTintFrom: preset.slotFrom,  slotTintTo: preset.slotTo,
        slotRect7From: preset.rect7From, slotRect7To: preset.rect7To,
        linksColor: preset.linksColor,  titleColor: preset.titleColor,
        btnTextColor: preset.btnTextColor ?? '#FFFFFF',
      } : slotCfg

      // ② 异步生成所有预览 URL（先全部 ready，再统一写入 canvas）
      type ItemDef = Parameters<typeof addItem>[0]
      const newItems: ItemDef[] = []

      for (const compId of tpl.components) {
        try {
          switch (compId) {
            case 'slot': {
              const url = await genSlotUrl(newSlotCfg)
              newItems.push({ componentId: 'slot', label: '老虎机', previewUrl: url, origW: 750, origH: 242 })
              break
            }
            case 'floor': {
              const fi = floors[0]
              const text = fi?.text ?? '领好店券 下单更优惠'
              const url = await genFloorUrl({ ...floorCfg, text })
              newItems.push({ componentId: 'floor', label: text, previewUrl: url, origW: 750, origH: 60, sourceId: fi?.id })
              break
            }
            case 'h-tab': {
              const hi = hTabItems[0]
              const url = await genHTabUrl({
                colorKey: theme?.htabColor ?? hTabCfg.colorKey,
                tabs: hi?.tabs ?? ['分类一', '分类二', '分类三'],
                activeIndex: 0,
              })
              newItems.push({ componentId: 'h-tab', label: 'Tab 1', previewUrl: url, origW: 750, origH: 88 })
              break
            }
            case 'coupon': {
              const colorKey = theme?.couponColor ?? couponCfg.colorKey
              const url = await genCouponUrl({ colorKey, titleText: couponCfg.titleText, btnText: couponCfg.btnText })
              newItems.push({ componentId: 'coupon', label: `券红包·${COUPON_COLORS[colorKey].name}`, previewUrl: url, origW: 702, origH: 352 })
              break
            }
          }
        } catch { /* 单个失败不中断 */ }
      }

      // ③ 所有数据 ready 后，一次性 clear + add（原子操作）
      clearItems()
      newItems.forEach(it => addItem(it))

      // ④ 更新 context 配色（不影响上面已生成的 URL）
      if (theme) {
        applyPreset(theme.slotPreset)
        setColor(theme.htabColor)
        setColorKey(theme.couponColor)
      }

      showToast(`✅ 「${tpl.name}」方案已加载`)
      setPendingTemplate(null)
      applyingRef.current = false
    }

    run().catch(() => { applyingRef.current = false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingTemplate])

  return null
}

import VenueLayerPanel   from '@/components/layout/VenueLayerPanel'
import VenueCanvasCenter from '@/components/layout/VenueCanvasCenter'
import VenueDynamicPanel from '@/components/layout/VenueDynamicPanel'
import GlobalThemePills  from '@/components/ui/GlobalThemePills'

const SlotStudio      = lazy(() => import('./SlotStudio'))
const ComponentStudio = lazy(() => import('./ComponentStudio'))

function Loader() {
  return <div className="flex items-center justify-center h-40 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>加载中…</div>
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
export default function VenuePage() {
  const { goDelivery, goHome } = useApp()
  const { items } = useVenue()

  // 画布缩放（由顶栏统一管理，传给 VenueCanvasCenter）
  const [zoomPct, setZoomPct] = useState<ZoomOpt>(100)

  // 画布模式：选中图层
  const [selectedLayer, setSelectedLayer] = useState<'header' | string | null>(null)
  // 画布模式：正在配置、待加入画布的新组件
  const [pendingComp,   setPendingComp]   = useState<ComponentId | null>(null)
  // 画布模式：双击 slot 后选中的热区（'text' | 'prize' | 'color' | ''）
  const [activeZone,    setActiveZone]    = useState('')
  // 高级设置模式：哪个组件正在全屏精细编辑
  const [advancedComp,  setAdvancedComp]  = useState<ComponentId | null>(null)
  const handleSelectLayer = (layer: 'header' | string | null) => {
    setPendingComp(null)
    setSelectedLayer(layer)
    setActiveZone('')  // 切换图层时清空热区选中
  }

  // 双击 slot 热区 → 右侧切换对应配置
  const handleZoneSelect = (_itemId: string, zone: string) => {
    setActiveZone(zone)
  }

  const handleAddNew = (compId: ComponentId) => {
    setSelectedLayer(null)
    setPendingComp(compId)
  }

  const handleAdvanced = (compId: ComponentId) => {
    setAdvancedComp(compId)
  }

  const exitAdvanced = () => setAdvancedComp(null)

  // ── 工作室模式：老虎机用专属 SlotStudio ─────────────────────────────────────
  if (advancedComp === 'slot') {
    return (
      <Suspense fallback={<Loader />}>
        <SlotStudio onBack={exitAdvanced} />
      </Suspense>
    )
  }

  // ── 其他组件：统一 ComponentStudio（与 SlotStudio 风格一致）────────────────
  if (advancedComp) {
    return (
      <Suspense fallback={<Loader />}>
        <ComponentStudio compId={advancedComp} onBack={exitAdvanced} />
      </Suspense>
    )
  }

  // ── 画布布局模式（默认三列） ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--sl-bg)' }}>
      {/* 场景方案库模板应用器（无 UI） */}
      <TemplateApplier />

      {/* ── 统一顶栏（Figma风格：左固定 + 中绝对居中 + 右固定）── */}
      <div className="flex items-center shrink-0 border-b"
        style={{ height: 48, background: 'var(--sl-panel)', borderColor: 'var(--sl-border)', padding: 0, gap: 0 }}>

        {/* 左段：216px（27×8），与侧边栏等宽，← 首页 + 页面结构 */}
        <div style={{
          width: 216, flexShrink: 0, height: '100%',
          display: 'flex', alignItems: 'center',
          padding: '0 10px',
          borderRight: '1px solid var(--sl-border)',
        }}>
          <button onClick={goHome}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 12, color: 'rgba(235,233,252,0.38)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 6px 0 0', transition: 'color 0.12s', flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(235,233,252,0.65)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(235,233,252,0.38)'}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            首页
          </button>
          <div style={{ width: 1, height: 12, background: 'rgba(235,233,252,0.1)', margin: '0 8px', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(235,233,252,0.4)' }}>
            页面结构
          </span>
        </div>

        {/* 中央标题：绝对居中，不影响两端布局 */}
        {/* 中段：flex-1，标题左 + 缩放右，不重叠 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sl-text-1)', whiteSpace: 'nowrap' }}>
            会场搭建
          </span>
          {items.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 500, color: 'rgba(235,233,252,0.35)',
              background: 'rgba(235,233,252,0.07)', borderRadius: 4, padding: '1px 5px',
            }}>
              {items.length}
            </span>
          )}
          {/* 全局主题色：有组件时显示 */}
          {items.length > 0 && (
            <>
              <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
              <GlobalThemePills />
            </>
          )}
          <div style={{ flex: 1 }} />
          {ZOOM_OPTS.map(z => (
            <button key={z} onClick={() => setZoomPct(z)}
              style={{
                padding: '3px 7px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                background: zoomPct === z ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: zoomPct === z ? '#fff' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${zoomPct === z ? 'rgba(255,255,255,0.18)' : 'transparent'}`,
                fontWeight: zoomPct === z ? 600 : 400,
                lineHeight: 1,
              }}>
              {z}%
            </button>
          ))}
        </div>

        {/* 右段：360px（45×8），与右侧配置面板等宽，包含 CTA */}
        <div style={{
          width: 360, flexShrink: 0, height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 16px',
          borderLeft: '1px solid var(--sl-border)',
        }}>
          <button
            onClick={goDelivery}
            className="flex items-center gap-2 text-[12px] font-bold rounded-xl transition-all hover:opacity-90"
            style={{ background: 'var(--sl-primary-grad)', color: 'var(--sl-cta-text)', padding: '7px 16px', border: 'none', cursor: 'pointer' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            完成 · 下载素材
          </button>
        </div>
      </div>

      {/* 三列主体 */}
      <div className="flex flex-1 overflow-hidden">
        <VenueLayerPanel
          selectedLayer={selectedLayer}
          onSelect={handleSelectLayer}
          onAddNew={handleAddNew}
        />
        <VenueCanvasCenter
          selectedLayer={selectedLayer}
          onSelectLayer={handleSelectLayer}
          onZoneSelect={handleZoneSelect}
          activeZone={activeZone}
          zoomPct={zoomPct}
        />
        <VenueDynamicPanel
          selectedLayer={selectedLayer}
          pendingComp={pendingComp}
          activeZone={activeZone}
          onZoneClear={() => setActiveZone('')}
          onPendingDone={() => setPendingComp(null)}
          onAdvanced={handleAdvanced}
        />
      </div>
    </div>
  )
}
