/**
 * 会场全局主题色选择器
 * 点击圆点 → 更新所有组件 context config + 刷新 phone canvas 预览图
 */
import { useState } from 'react'
import { useSlot, SLOT_PRESETS } from '@/contexts/SlotContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useCoupon } from '@/contexts/CouponContext'
import { useVenue }  from '@/contexts/VenueContext'
import { useFloor }  from '@/contexts/FloorContext'
import { useApp }    from '@/contexts/AppContext'
import { GLOBAL_THEMES } from '@/utils/globalThemes'
import { genFloorUrl, genHTabUrl, genCouponUrl, genSlotUrl } from '@/utils/venuePreviewUrls'

export default function GlobalThemePills() {
  const { config: slotCfg, applyPreset } = useSlot()
  const { config: hTabCfg, items: hTabItems, setColor } = useHTab()
  const { config: couponCfg, setColorKey } = useCoupon()
  const { config: floorCfg, floors } = useFloor()
  const { items, updatePreview } = useVenue()
  const { showToast } = useApp()
  const [active, setActive] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const apply = async (theme: typeof GLOBAL_THEMES[0]) => {
    if (loading) return
    setLoading(true)

    // ① 更新各组件 context config
    applyPreset(theme.slotPreset)
    setColor(theme.htabColor)
    setColorKey(theme.couponColor)
    setActive(theme.key)

    // ② 直接用 preset 值构造新 config（不依赖 setState flush）
    const preset = SLOT_PRESETS[theme.slotPreset]
    const newSlotCfg = preset ? {
      ...slotCfg,
      btnActiveFrom: preset.from, btnActiveTo: preset.to,
      btnDisabledFrom: preset.disFrom, btnDisabledTo: preset.disTo,
      slotTintFrom: preset.slotFrom, slotTintTo: preset.slotTo,
      slotRect7From: preset.rect7From, slotRect7To: preset.rect7To,
      linksColor: preset.linksColor, titleColor: preset.titleColor,
      btnTextColor: preset.btnTextColor ?? '#FFFFFF',
    } : slotCfg

    // ③ 逐个刷新 phone canvas 预览 URL
    for (const item of items) {
      try {
        let url = ''
        switch (item.componentId) {
          case 'slot': {
            url = await genSlotUrl(newSlotCfg)
            break
          }
          case 'h-tab': {
            const hi = hTabItems[0]
            url = await genHTabUrl({
              colorKey: theme.htabColor,
              tabs: hi?.tabs ?? hTabCfg.tabs ?? ['Tab 1', 'Tab 2'],
              activeIndex: 0,
            })
            break
          }
          case 'coupon': {
            url = await genCouponUrl({
              colorKey: theme.couponColor,
              titleText: couponCfg.titleText,
              btnText: couponCfg.btnText,
            })
            break
          }
          case 'floor': {
            const fi = floors.find(f => f.id === item.sourceId) ?? floors[0]
            if (fi) url = await genFloorUrl({ ...floorCfg, text: fi.text })
            break
          }
        }
        if (url) updatePreview(
          { sourceId: item.sourceId ?? undefined, label: item.label },
          url
        )
      } catch { /* 单个失败不中断 */ }
    }

    showToast(`✅ 已切换「${theme.name}」主题`)
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {GLOBAL_THEMES.map(t => (
        <button
          key={t.key}
          title={t.name}
          onClick={() => apply(t)}
          disabled={loading}
          style={{
            width: 18, height: 18, borderRadius: '50%',
            background: t.dot,
            border: active === t.key
              ? '2px solid rgba(255,255,255,0.9)'
              : '2px solid transparent',
            outline: active === t.key ? '1px solid rgba(255,255,255,0.3)' : 'none',
            outlineOffset: 1,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            flexShrink: 0,
            transition: 'border 0.12s, transform 0.12s',
            padding: 0,
            transform: active === t.key ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  )
}
