/**
 * 会场全局主题色选择器
 * 点击一个色点 → 老虎机 / 横滑Tab / 一键领券红包 同步换色
 */
import { useState } from 'react'
import { useSlot }   from '@/contexts/SlotContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useCoupon } from '@/contexts/CouponContext'
import { useApp }    from '@/contexts/AppContext'
import { GLOBAL_THEMES } from '@/utils/globalThemes'

export default function GlobalThemePills() {
  const { applyPreset } = useSlot()
  const { setColor }    = useHTab()
  const { setColorKey } = useCoupon()
  const { showToast }   = useApp()
  const [active, setActive] = useState<string | null>(null)

  const apply = (theme: typeof GLOBAL_THEMES[0]) => {
    applyPreset(theme.slotPreset)
    setColor(theme.htabColor)
    setColorKey(theme.couponColor)
    setActive(theme.key)
    showToast(`✅ 已切换「${theme.name}」主题`)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', flexShrink: 0, letterSpacing: '0.05em' }}>
        主题
      </span>
      {GLOBAL_THEMES.map(t => (
        <button
          key={t.key}
          title={t.name}
          onClick={() => apply(t)}
          style={{
            width: 18, height: 18, borderRadius: '50%',
            background: t.dot,
            border: active === t.key
              ? '2px solid rgba(255,255,255,0.9)'
              : '2px solid transparent',
            outline: active === t.key
              ? '1px solid rgba(255,255,255,0.3)'
              : 'none',
            outlineOffset: 1,
            cursor: 'pointer',
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
