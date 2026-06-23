/**
 * 首页（重构版 2026-06-23）
 * 只有两个入口：配置组件素材 / 搭建完整会场
 * 去掉「我的资产」「提交审核」入口（移至创作完成后的流程）
 * 「场景方案库」待开发占位
 */
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
  const { enterComp, goVenue } = useApp()

  useEffect(() => {
    gsap.from('.home-hero', { opacity: 0, y: -12, duration: 0.45, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.home-entry-card', { opacity: 0, y: 16, duration: 0.4, stagger: 0.1, delay: 0.1, ease: 'power2.out', clearProps: 'all' })
  }, [])

  return (
    <div style={{ padding: '48px 56px 40px', maxWidth: 720 }}>

      {/* 标题 */}
      <div className="home-hero" style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', margin: 0, marginBottom: 6 }}>
          设计工作台
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
          配置组件参数，导出上线素材；或将多个组件拼成完整会场页面
        </p>
      </div>

      {/* 两个主入口 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>

        {/* 配置组件素材（主要入口）*/}
        <button
          className="home-entry-card"
          onClick={() => enterComp('slot')}
          style={{
            flex: 1,
            background: 'var(--bg)',
            border: '1.5px solid var(--border)',
            borderRadius: 14,
            padding: '28px 24px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(255,48,96,0.12)'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,48,96,0.35)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none'
            ;(e.currentTarget as HTMLElement).style.transform = 'none'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>⚙️</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>
            配置组件素材
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            老虎机 · 楼层条 · 横滑Tab · 红包<br />
            配色 / 文案 / 导出全套切图
          </div>
          <div style={{
            marginTop: 18,
            display: 'inline-block',
            padding: '6px 14px',
            background: 'linear-gradient(90deg,#FF3060,#FF6030)',
            borderRadius: 8,
            fontSize: 12,
            color: '#fff',
            fontWeight: 600,
          }}>
            开始配置 →
          </div>
        </button>

        {/* 搭建完整会场 */}
        <button
          className="home-entry-card"
          onClick={goVenue}
          style={{
            flex: 1,
            background: 'var(--bg)',
            border: '1.5px solid var(--border)',
            borderRadius: 14,
            padding: '28px 24px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(45,120,244,0.12)'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(45,120,244,0.35)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none'
            ;(e.currentTarget as HTMLElement).style.transform = 'none'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>📱</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>
            搭建完整会场
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            组合多个组件<br />
            实时预览整页效果
          </div>
          <div style={{
            marginTop: 18,
            display: 'inline-block',
            padding: '6px 14px',
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
        className="home-entry-card"
        style={{
          background: 'var(--bg-subtle)',
          border: '1.5px dashed var(--border)',
          borderRadius: 14,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: 0.6,
        }}
      >
        <div style={{ fontSize: 24 }}>🗂️</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', marginBottom: 3 }}>
            场景方案库
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
            大促 / 日常 / 节日场景方案包，一键套用完整活动配置
          </div>
        </div>
        <div style={{
          marginLeft: 'auto',
          padding: '4px 10px',
          background: 'rgba(255,200,0,0.1)',
          border: '1px solid rgba(255,200,0,0.2)',
          borderRadius: 6,
          fontSize: 11,
          color: 'rgba(255,180,0,0.7)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          待开发
        </div>
      </div>

    </div>
  )
}
