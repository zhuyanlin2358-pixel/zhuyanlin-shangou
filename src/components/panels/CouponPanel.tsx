import { useCoupon } from '@/contexts/CouponContext'
import { COUPON_COLORS, type CouponColorKey } from '@/types'
import { PanelInput, DisclosureGroup } from '@/components/ui/PanelField'

const COLOR_KEYS = Object.keys(COUPON_COLORS) as CouponColorKey[]

export default function CouponPanel() {
  const { config, setColorKey, setTitleText, setBtnText } = useCoupon()

  return (
    <div className="py-1">

      {/* 款式选择（横排药丸，对齐老虎机配色预设风格）*/}
      <DisclosureGroup title="款式配色" defaultOpen>
        <div className="px-4 pb-3">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {COLOR_KEYS.map(k => {
              const def = COUPON_COLORS[k]
              const active = config.colorKey === k
              return (
                <button key={k} onClick={() => setColorKey(k)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
                    border: `1px solid ${active ? 'rgba(255,48,96,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    background: active ? 'rgba(255,48,96,0.12)' : 'rgba(255,255,255,0.04)',
                    color:      active ? '#FF8FAA' : 'rgba(255,255,255,0.5)',
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.12s',
                  }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    flexShrink: 0, display: 'inline-block',
                    background: def.cardBgFrom,
                  }} />
                  {def.name}
                </button>
              )
            })}
          </div>
        </div>
      </DisclosureGroup>

      {/* 文案设置 */}
      <DisclosureGroup title="文案设置" defaultOpen>
        <div className="px-4 pb-3 space-y-3">
          <div>
            <p className="text-[10px] text-white/40 mb-1">主文案</p>
            <PanelInput
              value={config.titleText}
              onChange={e => setTitleText(e.target.value)}
              placeholder="请填写主文案"
              maxLength={24}
            />
            <p className="text-[10px] text-white/30 mt-1 leading-snug">
              默认：领618好店券 下单更优惠
            </p>
          </div>
          <div>
            <p className="text-[10px] text-white/40 mb-1">按钮文案</p>
            <PanelInput
              value={config.btnText}
              onChange={e => setBtnText(e.target.value)}
              placeholder="请填写按钮文案"
              maxLength={10}
            />
            <p className="text-[10px] text-white/30 mt-1 leading-snug">
              默认：一键领取
            </p>
          </div>
        </div>
      </DisclosureGroup>

    </div>
  )
}
