/**
 * 首页（2026-06-23 最终版）
 * 刘小排：单入口，不要二分法
 * 场景方案（待开发）+ 打开设计工具（直接进画布）
 */
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ArrowRight } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
  const { goVenue } = useApp()

  useEffect(() => {
    gsap.from('.hp-title', { opacity: 0, y: -14, duration: 0.5, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.hp-main',  { opacity: 0, y: 20,  duration: 0.45, delay: 0.1, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.hp-soon',  { opacity: 0,          duration: 0.4,  delay: 0.25, ease: 'power2.out', clearProps: 'all' })
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

      {/* 标题 */}
      <div className="hp-title" style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '4px', marginBottom: 12 }}>
          美团闪购
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '-0.5px' }}>
          设计工作台
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
          从左侧拖入组件，点了就改
        </div>
      </div>

      {/* 主入口：打开设计工具 */}
      <button
        className="hp-main"
        onClick={goVenue}
        style={{
          maxWidth: 400,
          width: '100%',
          background: 'linear-gradient(135deg, rgba(255,48,96,0.12), rgba(255,96,48,0.08))',
          border: '1.5px solid rgba(255,48,96,0.25)',
          borderRadius: 16,
          padding: '32px 36px',
          textAlign: 'left',
          cursor: 'pointer',
          marginBottom: 16,
          transition: 'all 0.18s',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'linear-gradient(135deg, rgba(255,48,96,0.18), rgba(255,96,48,0.12))'
          el.style.borderColor = 'rgba(255,48,96,0.5)'
          el.style.transform = 'translateY(-2px)'
          el.style.boxShadow = '0 12px 40px rgba(255,48,96,0.12)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.background = 'linear-gradient(135deg, rgba(255,48,96,0.12), rgba(255,96,48,0.08))'
          el.style.borderColor = 'rgba(255,48,96,0.25)'
          el.style.transform = 'none'
          el.style.boxShadow = 'none'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            打开设计工具
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            从左侧选择组件开始配置<br/>
            拖入画布，点击元素直接修改
          </div>
        </div>
        <ArrowRight size={20} color="rgba(255,128,160,0.8)" strokeWidth={1.5} />
      </button>

      {/* 场景方案库（待开发）*/}
      <div
        className="hp-soon"
        style={{
          maxWidth: 400,
          width: '100%',
          border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: 0.5,
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,200,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,180,0,0.5)" strokeWidth={1.5}>
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM14 14h6v6h-6zM4 14h6v6H4z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>场景方案库</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 1 }}>
            大促 / 日常 / 节日场景方案，一键套用
          </div>
        </div>
        <span style={{
          fontSize: 10, color: 'rgba(255,180,0,0.45)',
          padding: '2px 8px',
          border: '1px solid rgba(255,180,0,0.12)',
          borderRadius: 4,
        }}>
          待开发
        </span>
      </div>

    </div>
  )
}
