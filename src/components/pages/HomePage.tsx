import { useEffect } from 'react'
import { gsap } from 'gsap'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
  const { goVenue } = useApp()

  useEffect(() => {
    gsap.from(['.hp-label', '.hp-title', '.hp-sub'], {
      opacity: 0, y: -10, duration: 0.5, stagger: 0.08, ease: 'power2.out', clearProps: 'all',
    })
    gsap.from('.hp-btn', { opacity: 0, y: 14, duration: 0.45, delay: 0.2, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.hp-soon', { opacity: 0, duration: 0.4, delay: 0.35, ease: 'power2.out', clearProps: 'all' })
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
      gap: 0,
    }}>

      {/* 标题区 */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div className="hp-label" style={{
          fontSize: 11, letterSpacing: '2px',
          color: 'rgba(255,255,255,0.2)', marginBottom: 14,
        }}>
          美团闪购
        </div>
        <h1 className="hp-title" style={{
          fontSize: 36, fontWeight: 700, color: '#fff',
          margin: 0, marginBottom: 12, letterSpacing: '-0.5px',
        }}>
          设计工作台
        </h1>
        <p className="hp-sub" style={{
          fontSize: 14, color: 'rgba(255,255,255,0.35)', margin: 0,
        }}>
          选择组件，配置参数，导出上线素材
        </p>
      </div>

      {/* 主入口按钮 */}
      <button
        className="hp-btn"
        onClick={goVenue}
        style={{
          width: 320,
          padding: '20px 28px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 14,
          cursor: 'pointer',
          textAlign: 'left',
          marginBottom: 12,
          transition: 'all 0.18s',
          display: 'block',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'rgba(255,48,96,0.08)'
          el.style.borderColor = 'rgba(255,48,96,0.3)'
          el.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'rgba(255,255,255,0.05)'
          el.style.borderColor = 'rgba(255,255,255,0.12)'
          el.style.transform = 'none'
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
          打开设计工具
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          配置老虎机、楼层条、红包等组件<br />
          导出全套切图，或拼成完整会场页
        </div>
      </button>

      {/* 场景方案库（待开发）*/}
      <div
        className="hp-soon"
        style={{
          width: 320,
          padding: '14px 20px',
          border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: 0.5,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>场景方案库</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>大促 / 日常 / 节日，一键套用</div>
        </div>
        <span style={{ fontSize: 10, color: 'rgba(255,180,0,0.5)', border: '1px solid rgba(255,180,0,0.15)', borderRadius: 4, padding: '2px 7px' }}>
          待开发
        </span>
      </div>

    </div>
  )
}
