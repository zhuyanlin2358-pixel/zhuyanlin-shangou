/**
 * 首页（重构版 2026-06-23）
 * 全屏居中，无侧边栏，两个任务入口
 */
import { useEffect } from 'react'
import { gsap } from 'gsap'
import { Layers, Smartphone } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
  const { enterComp, goVenue } = useApp()

  useEffect(() => {
    gsap.from('.hp-title',  { opacity: 0, y: -14, duration: 0.5, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.hp-cards',  { opacity: 0, y: 20,  duration: 0.45, delay: 0.1, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.hp-soon',   { opacity: 0,          duration: 0.4,  delay: 0.3, ease: 'power2.out', clearProps: 'all' })
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
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '4px', marginBottom: 12, textTransform: 'uppercase' }}>
          美团闪购
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 10, letterSpacing: '-0.5px' }}>
          设计工作台
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
          选择你要完成的任务
        </div>
      </div>

      {/* 两个主入口 */}
      <div className="hp-cards" style={{ display: 'flex', gap: 16, maxWidth: 660, width: '100%', marginBottom: 16 }}>

        {/* 制作活动素材 */}
        <button
          onClick={() => enterComp('slot')}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 16,
            padding: '36px 28px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,48,96,0.07)'
            el.style.borderColor = 'rgba(255,48,96,0.3)'
            el.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,255,255,0.03)'
            el.style.borderColor = 'rgba(255,255,255,0.09)'
            el.style.transform = 'none'
          }}
        >
          {/* 图标 */}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,48,96,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Layers size={20} color="#FF6080" strokeWidth={1.5} />
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            快速制作活动素材
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
            适合制作老虎机、楼层条、红包等独立素材<br />
            可批量导出多状态切图
          </div>

          <div style={{ marginTop: 24, fontSize: 12, color: '#FF8FAA', display: 'flex', alignItems: 'center', gap: 4 }}>
            选择组件
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </button>

        {/* 搭建活动页面 */}
        <button
          onClick={goVenue}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 16,
            padding: '36px 28px',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(45,120,244,0.07)'
            el.style.borderColor = 'rgba(45,120,244,0.3)'
            el.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'rgba(255,255,255,0.03)'
            el.style.borderColor = 'rgba(255,255,255,0.09)'
            el.style.transform = 'none'
          }}
        >
          {/* 图标 */}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(45,120,244,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Smartphone size={20} color="#6AA3FF" strokeWidth={1.5} />
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            拖拽搭建活动页面
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>
            适合将多个组件组合成完整的 H5 活动页<br />
            所见即所得预览
          </div>

          <div style={{ marginTop: 24, fontSize: 12, color: '#6AA3FF', display: 'flex', alignItems: 'center', gap: 4 }}>
            进入会场
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </button>

      </div>

      {/* 场景方案库（待开发）*/}
      <div
        className="hp-soon"
        style={{
          maxWidth: 660,
          width: '100%',
          border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: 12,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: 0.55,
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(255,200,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,180,0,0.6)" strokeWidth={1.5}>
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>场景方案库</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 1 }}>大促 / 日常 / 节日，一键套用完整活动配置</div>
        </div>
        <span style={{ fontSize: 10, color: 'rgba(255,180,0,0.5)', padding: '2px 8px', border: '1px solid rgba(255,180,0,0.15)', borderRadius: 4 }}>
          待开发
        </span>
      </div>

    </div>
  )
}
