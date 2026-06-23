import { useEffect } from 'react'
import { gsap } from 'gsap'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
  const { goVenue } = useApp()

  useEffect(() => {
    gsap.from('.hp-head',  { opacity: 0, y: -16, duration: 0.5, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.hp-entry', { opacity: 0, y: 20,  duration: 0.45, delay: 0.15, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.hp-later', { opacity: 0,          duration: 0.4,  delay: 0.35, ease: 'power2.out', clearProps: 'all' })
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
    }}>

      {/* ── 标题 ── */}
      <div className="hp-head" style={{ textAlign: 'center', marginBottom: 56 }}>
        <p style={{ margin: '0 0 16px', fontSize: 12, letterSpacing: '2px', color: 'rgba(255,255,255,0.22)' }}>
          美团闪购
        </p>
        <h1 style={{ margin: '0 0 12px', fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: '-1px', lineHeight: 1.2 }}>
          设计工作台
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.38)' }}>
          选择你要完成的任务
        </p>
      </div>

      {/* ── 主入口 ── */}
      <button
        className="hp-entry"
        onClick={goVenue}
        style={{
          width: 340,
          padding: '24px 28px',
          background: '#161B22',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          cursor: 'pointer',
          textAlign: 'left',
          marginBottom: 12,
          transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
          display: 'block',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'rgba(255,48,96,0.45)'
          el.style.transform = 'translateY(-2px)'
          el.style.boxShadow = '0 8px 32px rgba(255,48,96,0.1)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'rgba(255,255,255,0.1)'
          el.style.transform = 'none'
          el.style.boxShadow = 'none'
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          打开设计工具
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>
          配置老虎机、楼层条、红包等组件<br />
          导出切图，或拼成完整活动页
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,80,100,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
          点击进入
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </button>

      {/* ── 场景方案库（待开发）── */}
      <div
        className="hp-later"
        style={{
          width: 340,
          padding: '12px 20px',
          border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>场景方案库</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 2 }}>大促 / 日常 / 节日，一键套用</div>
        </div>
        <span style={{ fontSize: 10, color: 'rgba(255,180,0,0.4)', border: '1px solid rgba(255,180,0,0.12)', borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>
          待开发
        </span>
      </div>

    </div>
  )
}
