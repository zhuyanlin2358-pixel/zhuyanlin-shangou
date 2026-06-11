import { useSlot } from '@/contexts/SlotContext'

const MOCK_BG_MIN_H = Math.round(1624 * 320 / 750) // 693px

export default function PreviewPanel() {
  const { config, slotBannerUrl } = useSlot()

  return (
    <aside style={{
      position: 'fixed', top: 56, right: 0, width: 360,
      height: 'calc(100vh - 56px)',
      background: '#0C111B',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', zIndex: 40,
    }}>
      {/* 标题栏 */}
      <div style={{
        padding: '10px 14px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
          手机预览
        </div>
      </div>

      {/* 预览区 */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        scrollbarWidth: 'none',
      }}>
        {/* 手机框 */}
        <div style={{
          width: 320, borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          background: '#f5f5f5',
          flexShrink: 0,
        }}>
          {/* 导航条 */}
          <div style={{
            height: 44, display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 8,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd' }} />
            <div style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginRight: 24 }}>
              闪购会场
            </div>
          </div>

          {/* 页面内容 */}
          <div style={{
            background: config.bgColor || '#ffdcdc',
            transition: 'background-color 0.3s',
            minHeight: MOCK_BG_MIN_H,
            padding: 12,
          }}>
            {/* 老虎机 banner — 直接复用 canvas 生成图，保证像素级一致 */}
            {slotBannerUrl
              ? <img src={slotBannerUrl} alt="老虎机预览"
                  style={{ width: '100%', display: 'block', borderRadius: 8 }} />
              : <div style={{
                  width: '100%', aspectRatio: '750/242', borderRadius: 8,
                  background: `linear-gradient(90deg, ${config.slotTintFrom}, ${config.slotTintTo})`,
                }} />
            }
          </div>
        </div>
      </div>
    </aside>
  )
}
