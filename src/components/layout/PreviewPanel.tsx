import { useSlot } from '@/contexts/SlotContext'
import { PrizeCardFull } from '@/components/pages/SlotPage'

const PF = "'PingFang SC','Microsoft YaHei',sans-serif"
const SCALE = 296 / 750  // 原版 panel-slot-inner 296px / slot 750px = 0.3947

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
        <div style={{
          width: 320, borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          background: '#f5f5f5', flexShrink: 0,
        }}>
          {/* 导航条 */}
          <div style={{
            height: 44, display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 8,
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd' }} />
            <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginRight: 24 }}>
              闪购会场
            </div>
          </div>

          {/* 会场背景 */}
          <div style={{ background: config.bgColor || '#FFF5F8', minHeight: Math.round(1624 * 320 / 750) }}>
            {/* 老虎机缩放版 — 对齐原版 scale(0.3947) */}
            <div style={{
              overflow: 'hidden', position: 'relative',
              height: Math.round(242 * SCALE),
            }}>
              <div style={{
                width: 750,
                transform: `scale(${SCALE})`,
                transformOrigin: 'top left',
                position: 'absolute', top: 0, left: 0,
                pointerEvents: 'none',
              }}>
                {/* ── 完整 asset-slot-ready 克隆（与 Section 1 完全一致）── */}
                <div style={{
                  width: 750, height: 242, position: 'relative', overflow: 'hidden',
                  background: `linear-gradient(120deg, ${config.slotTintFrom}, ${config.slotTintTo})`,
                  borderRadius: 20,
                }}>
                  {/* 标题 */}
                  <div style={{
                    position: 'absolute', left: 42, top: 25,
                    fontSize: 33, fontWeight: 500, color: config.titleColor,
                    fontFamily: PF, whiteSpace: 'nowrap', zIndex: 3,
                  }}>
                    {config.titleText}
                  </div>
                  {/* 链接 */}
                  <div style={{
                    position: 'absolute', top: 24, right: 48,
                    display: 'flex', alignItems: 'center',
                    fontSize: 22, color: config.linksColor,
                    fontFamily: PF, zIndex: 3,
                  }}>
                    <span>我的奖品</span>
                    <span style={{ margin: '0 8px', opacity: 0.6 }}>|</span>
                    <span>抽奖规则</span>
                  </div>
                  {/* 奖品框 */}
                  <div style={{
                    position: 'absolute', left: 43, top: 76,
                    width: 441, height: 142, borderRadius: 20,
                    background: '#fff', border: '1px solid rgba(0,0,0,0.1)', zIndex: 1,
                  }} />
                  {/* 奖品层 — 使用 PrizeCardFull，传入 prizeTransforms */}
                  <div style={{
                    position: 'absolute', left: 43, top: 76,
                    width: 441, height: 142, zIndex: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, padding: '0 12px',
                  }}>
                    {config.prizes.map((p, i) => (
                      <PrizeCardFull
                        key={i}
                        prize={p}
                        transform={config.prizeTransforms[i]}
                      />
                    ))}
                  </div>
                  {/* 按钮 */}
                  <div style={{
                    position: 'absolute', right: 46, top: 106,
                    width: 194, height: 80, borderRadius: 40, zIndex: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(90deg, ${config.btnActiveFrom}, ${config.btnActiveTo})`,
                    fontSize: 30, color: '#fff', fontFamily: PF,
                  }}>
                    立即抽奖
                  </div>
                  {/* 剩余次数 */}
                  <div style={{
                    position: 'absolute', right: 46, bottom: 14,
                    fontSize: 14, color: config.linksColor,
                    textAlign: 'center', width: 194, zIndex: 3,
                  }}>
                    还剩 999 次抽奖机会
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          配置变更后实时同步
        </div>
      </div>
    </aside>
  )
}
