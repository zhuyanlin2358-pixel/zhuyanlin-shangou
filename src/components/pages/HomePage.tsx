/**
 * 首页（重构版 2026-06-23）
 * 全屏居中，无侧边栏
 * 2个主入口 + 场景方案库待开发占位
 */
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
  const { enterComp, goVenue } = useApp()

  useEffect(() => {
    gsap.from('.hp-logo',  { opacity: 0, y: -16, duration: 0.5, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.hp-card',  { opacity: 0, y: 20,  duration: 0.45, stagger: 0.1, delay: 0.12, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.hp-soon',  { opacity: 0, y: 8,   duration: 0.4, delay: 0.3, ease: 'power2.out', clearProps: 'all' })
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>

      {/* Logo / 标题 */}
      <div className="hp-logo" style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, marginBottom: 10 }}>
          美团闪购
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 8 }}>
          设计工作台
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          选择你要完成的任务
        </p>
      </div>

      {/* 两个主入口 */}
      <div style={{ display: 'flex', gap: 20, maxWidth: 680, width: '100%', marginBottom: 20 }}>

        {/* 配置组件素材 */}
        <button
          className="hp-card"
          onClick={() => enterComp('slot')}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: '32px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,48,96,0.08)'
            el.style.borderColor = 'rgba(255,48,96,0.4)'
            el.style.transform = 'translateY(-3px)'
            el.style.boxShadow = '0 12px 40px rgba(255,48,96,0.15)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,255,255,0.04)'
            el.style.borderColor = 'rgba(255,255,255,0.1)'
            el.style.transform = 'none'
            el.style.boxShadow = 'none'
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚙️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            配置组件素材
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20 }}>
            配置老虎机、楼层条、红包等组件<br />
            导出全套切图 ZIP
          </div>
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            background: 'rgba(255,48,96,0.15)',
            border: '1px solid rgba(255,48,96,0.35)',
            borderRadius: 8,
            fontSize: 12,
            color: '#FF8FAA',
            fontWeight: 600,
          }}>
            选择组件 →
          </div>
        </button>

        {/* 搭建完整会场 */}
        <button
          className="hp-card"
          onClick={goVenue}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: '32px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(45,120,244,0.08)'
            el.style.borderColor = 'rgba(45,120,244,0.4)'
            el.style.transform = 'translateY(-3px)'
            el.style.boxShadow = '0 12px 40px rgba(45,120,244,0.15)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,255,255,0.04)'
            el.style.borderColor = 'rgba(255,255,255,0.1)'
            el.style.transform = 'none'
            el.style.boxShadow = 'none'
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>📱</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            搭建完整会场
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 20 }}>
            组合多个组件<br />
            实时预览完整会场效果
          </div>
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            background: 'rgba(45,120,244,0.12)',
            border: '1px solid rgba(45,120,244,0.3)',
            borderRadius: 8,
            fontSize: 12,
            color: '#6AA3FF',
            fontWeight: 600,
          }}>
            进入会场 →
          </div>
        </button>

      </div>

      {/* 场景方案库（待开发）*/}
      <div
        className="hp-soon"
        style={{
          maxWidth: 680,
          width: '100%',
          background: 'rgba(255,255,255,0.025)',
          border: '1.5px dashed rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ fontSize: 22, opacity: 0.5 }}>🗂️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>
            场景方案库
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            大促 / 日常 / 节日场景方案包，一键套用完整活动配置
          </div>
        </div>
        <div style={{
          padding: '3px 10px',
          background: 'rgba(255,200,0,0.08)',
          border: '1px solid rgba(255,200,0,0.15)',
          borderRadius: 6,
          fontSize: 11,
          color: 'rgba(255,180,0,0.5)',
          flexShrink: 0,
        }}>
          待开发
        </div>
      </div>

      {/* 底部说明 */}
      <div style={{ marginTop: 32, fontSize: 11, color: 'rgba(255,255,255,0.15)' }}>
        美团闪购会场组件自助设计工具 · 仅供内部使用
      </div>

    </div>
  )
}
