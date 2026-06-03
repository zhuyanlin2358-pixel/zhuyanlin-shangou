import { useEffect } from 'react'
import { gsap } from 'gsap'
import { useApp } from '@/contexts/AppContext'
import { COMPONENT_REGISTRY, type ComponentId, type ComponentDef } from '@/types'

export default function HomePage() {
  const { enterComp } = useApp()

  useEffect(() => {
    gsap.from('.home-greeting, .home-sub', { opacity: 0, y: -14, duration: 0.5, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.home-steps',    { opacity: 0, y: 8,  duration: 0.4, delay: 0.08, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.ai-promo-card', { opacity: 0, y: 10, duration: 0.5, delay: 0.15, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.home-section',  { opacity: 0, y: 22, duration: 0.45, stagger: 0.07, delay: 0.15, ease: 'power2.out', clearProps: 'all' })
  }, [])

  return (
    <div className="home-wrap">
      <h1 className="home-greeting">闪购会场组件库</h1>
      <p className="home-sub">运营自助配置组件参数，一键导出切图素材</p>

      {/* 3步引导 */}
      <div className="home-steps">
        {[['1','选组件'],['2','配置参数'],['3','导出切图']].map(([n,t],i) => (
          <span key={n} style={{ display:'flex', alignItems:'center' }}>
            <span className="home-step">
              <span className="home-step-num">{n}</span>
              <span className="home-step-text">{t}</span>
            </span>
            {i < 2 && <span className="home-step-arrow">→</span>}
          </span>
        ))}
      </div>

      {/* AI 预留卡片 */}
      <div className="ai-promo-card">
        <div>
          <div className="ai-promo-tag">✦ AI 能力预留</div>
          <div className="ai-promo-title">上传商品图，一键生成资源位</div>
          <div className="ai-promo-desc">上传商品主图，AI 自动适配各尺寸资源位规范，批量输出可用素材</div>
        </div>
        <div className="ai-promo-btn">即将上线 →</div>
      </div>

      {/* 分组卡片 */}
      {COMPONENT_REGISTRY.map(g => {
        const allItems = g.subgroups ? g.subgroups.flatMap(sg => sg.items) : (g.items || [])
        const doneCount = allItems.filter(c => c.status === 'done').length
        return (
          <div key={g.group} className="home-section">
            <div className="home-section-header">
              <span className="home-section-title">{g.groupLabel}</span>
              {doneCount > 0 && <span className="home-section-count">{doneCount} 个可用</span>}
            </div>
            <div className="home-card-grid">
              {allItems.map(comp => (
                <CompCard key={comp.id} comp={comp} onEnter={() => enterComp(comp.id as ComponentId)} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CompCard({ comp, onEnter }: { comp: ComponentDef; onEnter: () => void }) {
  const isDone = comp.status === 'done'
  return (
    <button className={`home-card ${isDone ? 'done' : 'coming-soon'}`} onClick={isDone ? onEnter : undefined}>
      {!isDone && (
        <svg className="home-card-plan-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x={3} y={11} width={18} height={11} rx={2}/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      )}
      <div className="home-card-name">{comp.name}</div>
      {comp.desc && isDone && <div className="home-card-tag">{comp.desc}</div>}
      {isDone
        ? <div className="home-card-done-badge">可用</div>
        : <div className="home-card-plan-tag">规划中</div>
      }
    </button>
  )
}
