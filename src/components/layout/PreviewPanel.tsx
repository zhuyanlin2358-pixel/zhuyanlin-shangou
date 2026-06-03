import { useSlot } from '@/contexts/SlotContext'
import type { PrizeConfig } from '@/types'

const PF = "'PingFang SC','Microsoft YaHei',sans-serif"
const SCALE = 320 / 750  // phone width / slot width

function MiniPrizeCard({ prize }: { prize: PrizeConfig }) {
  const isDashed = prize.type === 'product-dashed'
  const isThanks = prize.type === 'thanks'
  const isAmount = prize.type === 'amount'
  const showImg   = prize.type === 'product-tag' || isDashed
  const showBottom = !isThanks

  const cardStyle: React.CSSProperties = isThanks
    ? { width: 111, height: 111, borderRadius: '50%', background: '#FFD060', border: '1px solid rgba(180,120,0,0.2)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', alignSelf: 'center' }
    : { width: 111, height: 119, borderRadius: 14, background: isDashed ? '#FFF4D0' : '#FFE9B0', border: isDashed ? '1.5px dashed #F0A830' : '1px solid rgba(180,120,0,0.15)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', fontFamily: PF }

  return (
    <div style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={cardStyle}>
        {prize.type === 'product-tag' && (
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 81, minHeight: 18, background: '#fff', borderRadius: '0 0 6px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 6px', zIndex: 2 }}>
            <span style={{ fontSize: 12, color: '#812D16', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{prize.tag}</span>
          </div>
        )}
        {showImg && (
          <div style={{ position: 'absolute', bottom: 31, left: '50%', transform: 'translateX(-50%)', width: isDashed ? 77 : 72, height: isDashed ? 78 : 72, background: 'rgba(0,0,0,0.04)', borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {prize.imageUrl ? <img src={prize.imageUrl} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} /> : null}
          </div>
        )}
        {isAmount && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-58%)', display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <span style={{ fontSize: 60, fontWeight: 700, color: '#812D16', fontFamily: "'MeituanDigitalType',sans-serif", lineHeight: 1, letterSpacing: -4 }}>{prize.amount}</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#812D16' }}>{prize.unit}</span>
          </div>
        )}
        {isThanks && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 22, fontWeight: 700, color: '#7B3A00', textAlign: 'center', whiteSpace: 'nowrap' }}>{prize.thanksText || '谢谢参与'}</div>
        )}
        {showBottom && (
          <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 13, color: '#7B3A00', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{prize.bottomText}</div>
        )}
      </div>
    </div>
  )
}

export default function PreviewPanel() {
  const { config } = useSlot()

  return (
    <aside style={{
      position: 'fixed', top: 56, right: 0, width: 360,
      height: 'calc(100vh - 56px)',
      background: '#0C111B', borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', zIndex: 40,
    }}>
      {/* 标题 */}
      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>手机预览</div>
      </div>

      {/* 内容 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* 手机框 */}
        <div style={{ width: 320, borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', background: '#f5f5f5', flexShrink: 0 }}>
          {/* 导航条 */}
          <div style={{ height: 44, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd' }} />
            <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginRight: 24 }}>闪购会场</div>
          </div>

          {/* 内容区 */}
          <div style={{ background: config.bgColor || '#FFF5F8', minHeight: Math.round(1624 * 320 / 750) }}>
            {/* 老虎机缩小版 */}
            <div style={{ overflow: 'hidden', position: 'relative', height: Math.round(242 * SCALE) }}>
              <div style={{ width: 750, transform: `scale(${SCALE})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                {/* 老虎机完整预览 */}
                <div style={{
                  width: 750, height: 242, position: 'relative', overflow: 'hidden',
                  background: `linear-gradient(120deg, ${config.slotTintFrom}, ${config.slotTintTo})`,
                  borderRadius: 20, margin: '0 0',
                }}>
                  <div style={{ position: 'absolute', left: 42, top: 25, fontSize: 33, fontWeight: 500, color: config.titleColor, fontFamily: PF, zIndex: 3 }}>{config.titleText}</div>
                  <div style={{ position: 'absolute', top: 24, right: 48, display: 'flex', alignItems: 'center', fontSize: 22, color: config.linksColor, fontFamily: PF, zIndex: 3 }}>
                    <span>我的奖品</span><span style={{ margin: '0 8px', opacity: 0.6 }}>|</span><span>抽奖规则</span>
                  </div>
                  <div style={{ position: 'absolute', left: 43, top: 76, width: 441, height: 142, borderRadius: 20, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', zIndex: 1 }} />
                  <div style={{ position: 'absolute', left: 43, top: 76, width: 441, height: 142, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 12px' }}>
                    {config.prizes.map((p, i) => <MiniPrizeCard key={i} prize={p} />)}
                  </div>
                  <div style={{
                    position: 'absolute', right: 46, top: 106, width: 194, height: 80, borderRadius: 40, zIndex: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(90deg, ${config.btnActiveFrom}, ${config.btnActiveTo})`,
                    fontSize: 30, color: '#fff', fontFamily: PF,
                  }}>立即抽奖</div>
                  <div style={{ position: 'absolute', right: 46, bottom: 14, fontSize: 14, color: config.linksColor, textAlign: 'center', width: 194, zIndex: 3 }}>还剩 999 次抽奖机会</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          修改配置后实时更新
        </div>
      </div>
    </aside>
  )
}
