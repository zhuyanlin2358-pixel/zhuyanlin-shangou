import { useCoupon } from '@/contexts/CouponContext'
import { COUPON_COLORS, type CouponColorKey } from '@/types'
import { PanelInput, DisclosureGroup } from '@/components/ui/PanelField'

const COLOR_KEYS = Object.keys(COUPON_COLORS) as CouponColorKey[]

export default function CouponPanel() {
  const { config, setColorKey, setTitleText } = useCoupon()

  return (
    <div className="py-1">

      {/* 款式选择 */}
      <DisclosureGroup title="款式配色" defaultOpen>
        <div className="px-4 pb-3 space-y-1.5">
          {COLOR_KEYS.map(k => {
            const def = COUPON_COLORS[k]
            const active = config.colorKey === k
            return (
              <button
                key={k}
                onClick={() => setColorKey(k)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
                style={{
                  border: `1px solid ${active ? '#FF5050' : 'rgba(255,255,255,0.08)'}`,
                  background: active ? 'rgba(255,80,80,0.06)' : 'rgba(255,255,255,0.02)',
                }}
              >
                {/* 色块（券卡背景色） */}
                <span
                  className="w-5 h-5 rounded shrink-0"
                  style={{
                    background: `linear-gradient(179deg, ${def.cardBgFrom} 1%, ${def.cardBgTo} 100%)`,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
                <span className="text-xs text-white/80 flex-1">{def.name}</span>
                {/* 按钮色预览 */}
                <span
                  className="w-10 h-4 rounded"
                  style={{
                    background: `linear-gradient(90deg, ${def.btnFrom} 0%, ${def.btnTo} 100%)`,
                  }}
                />
                {active && <span className="text-[10px] text-red-400">当前</span>}
              </button>
            )
          })}
        </div>
      </DisclosureGroup>

      {/* 文案设置 */}
      <DisclosureGroup title="文案设置" defaultOpen>
        <div className="px-4 pb-3">
          <PanelInput
            value={config.titleText}
            onChange={e => setTitleText(e.target.value)}
            placeholder="请填写主文案"
            maxLength={24}
          />
          <p className="text-[10px] text-white/30 mt-1.5 leading-snug">
            Figma 原版：领618好店券 下单更优惠
          </p>
        </div>
      </DisclosureGroup>

    </div>
  )
}
