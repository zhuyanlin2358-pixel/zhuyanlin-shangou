import { useApp } from '@/contexts/AppContext'
import Grainient  from '@/components/ui/Grainient'
import TiltedCard from '@/components/ui/TiltedCard'

export default function HomePage() {
  const { goVenue, goStudio } = useApp()

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* ── Grainient 全屏背景 ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Grainient
          color1="#ecd100"
          color2="#ff9729"
          color3="#ff8de8"
          colorBalance={-0.02}
          grainAmount={0.08}
          timeSpeed={0.2}
          warpStrength={1.2}
          contrast={1.4}
          saturation={1.1}
        />
      </div>

      {/* ── 内容层 ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
        animation: 'fadeUp 0.5s ease both',
      }}>

        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, letterSpacing: '3px', color: 'rgba(0,0,0,0.35)', fontWeight: 600 }}>
            美团闪购
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: 44, fontWeight: 800, color: '#1a0a00', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            设计工作台
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: 'rgba(0,0,0,0.4)' }}>
            选择你要完成的任务
          </p>
        </div>

        {/* ── 两大主入口（TiltedCard） ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, width: 'min(680px, 100%)', alignItems: 'stretch' }}>

          {/* 搭建活动页面 */}
          <TiltedCard
            onClick={goVenue}
            containerWidth="50%"
            rotateAmplitude={10}
            scaleOnHover={1.04}
            borderRadius={18}
            style={{ flex: 1 }}
          >
            <div style={{
              padding: '24px 22px',
              background: 'rgba(0,0,0,0.82)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}>
              {/* 图标 */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #FF3060, #FF6030)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#fff' }}>
                搭建活动页面
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                老虎机 · 楼层条<br />横滑Tab · 一键领券
              </div>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                三列画布编辑器
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </TiltedCard>

          {/* 设计独立素材 */}
          <TiltedCard
            onClick={goStudio}
            containerWidth="50%"
            rotateAmplitude={10}
            scaleOnHover={1.04}
            borderRadius={18}
            style={{ flex: 1 }}
          >
            <div style={{
              padding: '24px 22px',
              background: 'rgba(255,255,255,0.38)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.55)',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              height: '100%',
              boxSizing: 'border-box',
            }}>
              {/* 图标 */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a0a00" strokeWidth={2}>
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M9 13h6M9 17h4"/>
                </svg>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#1a0a00' }}>
                设计独立素材
              </div>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', lineHeight: 1.5 }}>
                N4 文字标签 · N2<br />一拖四 · Banner
              </div>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(0,0,0,0.3)' }}>
                素材设计工作室
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </TiltedCard>
        </div>

        {/* 场景方案库占位 */}
        <div style={{
          width: 'min(680px, 100%)',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', fontWeight: 600 }}>场景方案库</div>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.28)', marginTop: 2 }}>
              大促 / 日常 / 节日，一键套用完整方案包
            </div>
          </div>
          <span style={{
            fontSize: 9, fontWeight: 600,
            color: 'rgba(100,60,0,0.5)',
            background: 'rgba(255,180,0,0.2)',
            border: '1px solid rgba(180,120,0,0.2)',
            borderRadius: 4, padding: '2px 8px', flexShrink: 0,
          }}>
            待开发
          </span>
        </div>

      </div>
    </div>
  )
}
