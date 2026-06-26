import { useApp } from '@/contexts/AppContext'
import Aurora    from '@/components/ui/Aurora'
import TiltedCard from '@/components/ui/TiltedCard'
import { SCENE_TEMPLATES } from '@/utils/sceneTemplates'

export default function HomePage() {
  const { goVenue, goStudio, setPendingTemplate } = useApp()

  const applyTemplate = (key: string) => {
    setPendingTemplate(key)
    goVenue()
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden', background: '#08010f' }}>

      {/* ── Aurora 全屏背景 ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Aurora
          colorStops={['#ffe100', '#8449ff', '#ff27b2']}
          amplitude={1.0}
          blend={1.0}
          speed={0.8}
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
          <p style={{ margin: '0 0 12px', fontSize: 11, letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
            美团闪购
          </p>
          <h1 style={{ margin: '0 0 12px', fontSize: 36, fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1.15 }}>
            闪购营销设计工作台
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>
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
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}>
              {/* 图标 */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18M9 21V9"/>
                </svg>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#ffffff' }}>
                搭建活动页面
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                老虎机 · 楼层条<br />横滑Tab · 一键领券
              </div>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
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
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              height: '100%',
              boxSizing: 'border-box',
            }}>
              {/* 图标 */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={2}>
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M9 13h6M9 17h4"/>
                </svg>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#ffffff' }}>
                设计独立素材
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                N4 文字标签 · N2<br />一拖四 · Banner
              </div>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
                素材设计工作室
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </TiltedCard>
        </div>

        {/* 场景方案库 */}
        <div style={{ width: 'min(680px, 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>场景方案库</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>一键套用完整方案包</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {SCENE_TEMPLATES.map(t => (
              <button
                key={t.key}
                onClick={() => applyTemplate(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  textAlign: 'left', transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
                }}
              >
                {/* 色条 */}
                <div style={{
                  width: 4, alignSelf: 'stretch', borderRadius: 3, flexShrink: 0,
                  background: `linear-gradient(180deg, ${t.bgColor}, ${t.bgColor2})`,
                }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.emoji} {t.name}</span>
                    <span style={{
                      fontSize: 9, padding: '1px 5px', borderRadius: 3,
                      background: `${t.bgColor}22`, color: t.bgColor,
                      border: `1px solid ${t.bgColor}44`, flexShrink: 0,
                    }}>{t.tag}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
