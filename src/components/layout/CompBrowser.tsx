import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ChevronDown } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { COMPONENT_REGISTRY, type ComponentId, type ComponentDef } from '@/types'

/* SVG 图标（与原版完全一致） */
const GROUP_SVG: Record<string, React.ReactNode> = {
  P0: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{width:18,height:18,flexShrink:0,opacity:0.6}}>
    <path className="sp-star" d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
    <path className="sp-plus" d="M20 2v4M22 4h-4"/><circle className="sp-dot" cx="4" cy="20" r="2"/>
  </svg>,
  P1: <svg className="cat-icon cat-icon-fan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{width:18,height:18,flexShrink:0,opacity:0.6}}>
    <path d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z"/>
    <path d="M12 12v.01"/>
  </svg>,
  P2: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{width:18,height:18,flexShrink:0,opacity:0.6}}>
    <path className="hw-house" d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 0 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <path className="hw-w1" d="M7 10.754a8 8 0 0 1 10 0"/>
    <path className="hw-w2" d="M9.5 13.866a4 4 0 0 1 5 .01"/>
    <path className="hw-dot" d="M12 17h.01"/>
  </svg>,
  P3: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{width:18,height:18,flexShrink:0,opacity:0.6}}>
    <path className="ly-p1" d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/>
    <path className="ly-p2" d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/>
    <path className="ly-p3" d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>
  </svg>,
  P4: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{width:18,height:18,flexShrink:0,opacity:0.6}}>
    <path className="bl-p1" d="M10 22V7c0-.6-.4-1-1-1H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-.6-.4-1-1-1H2"/>
    <path className="bl-p2" d="M15 2H21a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
  </svg>,
  P6: <svg className="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} style={{width:18,height:18,flexShrink:0,opacity:0.6}}>
    <path className="ui-p1" d="M18,21c0-4.4-3.6-8-8-8s-8,3.6-8,8"/>
    <path className="ui-p2" d="M18,12c2.2-1.7,2.7-4.8,1-7-.4-.5-.9-1-1.4-1.3"/>
    <path className="ui-p3" d="M22,20c0-3.4-2-6.5-4-8"/>
    <circle className="ui-c" cx="10" cy="8" r="5"/>
  </svg>,
}

function useCatHover(group: string, headerId: string) {
  useEffect(() => {
    const el = document.getElementById(headerId)
    if (!el || typeof gsap === 'undefined') return
    let fanTween: gsap.core.Tween | null = null

    const enter = () => {
      if (group === 'P0') {
        gsap.to(`#${headerId} .sp-star`, { scale:1.15, duration:0.15, yoyo:true, repeat:1, ease:'power2.inOut', transformOrigin:'center' })
        gsap.to([`#${headerId} .sp-plus`, `#${headerId} .sp-dot`], { opacity:0, scale:0, duration:0.2, yoyo:true, repeat:1, repeatDelay:0.2, ease:'easeInOut', stagger:0.15, transformOrigin:'center' })
      } else if (group === 'P1') {
        fanTween?.kill()
        fanTween = gsap.to(`#${headerId} .cat-icon-fan`, { rotation:360, duration:1.2, ease:'linear', repeat:-1, transformOrigin:'center' })
      } else if (group === 'P2') {
        const els = [`#${headerId} .hw-dot`, `#${headerId} .hw-w2`, `#${headerId} .hw-w1`]
        gsap.fromTo(els, { opacity:0.2 }, { opacity:1, duration:0.25, stagger:0.18, ease:'power2.out', onComplete:() => gsap.to(els, { opacity:0.55, duration:0.3 }) })
      } else if (group === 'P3') {
        gsap.to(`#${headerId} .ly-p1`, { y:3, duration:0.3, yoyo:true, repeat:1, ease:'power2.inOut' })
        gsap.to(`#${headerId} .ly-p3`, { y:-3, duration:0.3, yoyo:true, repeat:1, ease:'power2.inOut' })
      } else if (group === 'P4') {
        gsap.to(`#${headerId} .bl-p1`, { x:2, y:-2, duration:0.3, yoyo:true, repeat:1, ease:'power2.inOut' })
        gsap.to(`#${headerId} .bl-p2`, { x:-2, y:2, duration:0.3, yoyo:true, repeat:1, ease:'power2.inOut' })
      } else if (group === 'P6') {
        gsap.to(`#${headerId} .ui-p1`, { y:4, duration:0.15, yoyo:true, repeat:1, ease:'power1.inOut', delay:0.1 })
        gsap.to(`#${headerId} .ui-c`,  { y:1, duration:0.15, yoyo:true, repeat:1, ease:'power1.inOut', delay:0.1 })
        gsap.to(`#${headerId} .ui-p2`, { y:1, duration:0.15, yoyo:true, repeat:1, ease:'power1.inOut' })
        gsap.to(`#${headerId} .ui-p3`, { y:4, duration:0.15, yoyo:true, repeat:1, ease:'power1.inOut' })
      }
    }
    const leave = () => {
      if (group === 'P1') {
        fanTween?.kill()
        gsap.to(`#${headerId} .cat-icon-fan`, { rotation:0, duration:0.4, ease:'power2.out', transformOrigin:'center' })
      }
    }

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    return () => { el.removeEventListener('mouseenter', enter); el.removeEventListener('mouseleave', leave); fanTween?.kill() }
  }, [group, headerId])
}

function CatGroup({ g, onEnter }: { g: typeof COMPONENT_REGISTRY[0]; onEnter: (id: ComponentId) => void }) {
  const [open, setOpen] = useState(g.group === 'P0' || g.group === 'P4')
  const headerId = `cat-header-${g.group.toLowerCase()}`
  useCatHover(g.group, headerId)

  const allItems = g.subgroups ? g.subgroups.flatMap(sg => sg.items) : (g.items || [])
  const doneCount = allItems.filter(c => c.status === 'done').length

  return (
    <div>
      <div id={headerId} className="cat-header" onClick={() => setOpen(o => !o)}>
        {GROUP_SVG[g.group]}
        <span style={{ flex:1, fontSize:14, fontWeight:500, color:'var(--text-1)' }}>{g.groupLabel}</span>
        {doneCount > 0 && <span style={{ fontSize:11, color:'#27D365', flexShrink:0 }}>{doneCount}</span>}
        <ChevronDown size={13} className={`cat-arrow transition-transform duration-200`} style={{ color: 'var(--text-3)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
      </div>
      {open && (
        <div className="cat-body">
          {g.subgroups
            ? g.subgroups.map(sg => (
                <div key={sg.label}>
                  <div className="subcat-label">{sg.label}</div>
                  {sg.items.map(c => <NavItem key={c.id} comp={c} onEnter={onEnter} />)}
                </div>
              ))
            : (g.items || []).map(c => <NavItem key={c.id} comp={c} onEnter={onEnter} />)
          }
        </div>
      )}
    </div>
  )
}

function NavItem({ comp, onEnter }: { comp: ComponentDef; onEnter: (id: ComponentId) => void }) {
  const isDone = comp.status === 'done'
  return (
    <div
      className={`comp-nav-link ${isDone ? '' : 'coming-soon'}`}
      onClick={() => isDone && onEnter(comp.id as ComponentId)}
    >
      {comp.name}
    </div>
  )
}

export default function CompBrowser() {
  const { enterComp } = useApp()
  const [query, setQuery] = useState('')

  const allItems = COMPONENT_REGISTRY.flatMap(g =>
    g.subgroups ? g.subgroups.flatMap(sg => sg.items) : (g.items || [])
  )
  const filtered = query.trim()
    ? allItems.filter(c => c.name.includes(query) || c.id.includes(query))
    : null

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* 搜索框 */}
      <div style={{ padding:'8px 12px', borderBottom:'1px solid var(--sidebar-border)' }}>
        <input
          type="text" placeholder="搜索组件…" value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width:'100%', padding:'6px 10px', fontSize:12,
            borderRadius:6, border:'1px solid var(--border)',
            background:'var(--bg-subtle)', color:'var(--text-1)', outline:'none',
          }}
        />
      </div>
      {/* 列表 */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {filtered ? (
          <div>
            {filtered.length === 0
              ? <div style={{ padding:'24px', textAlign:'center', fontSize:12, color:'var(--text-3)' }}>未找到组件</div>
              : filtered.map(c => <NavItem key={c.id} comp={c} onEnter={enterComp} />)
            }
          </div>
        ) : (
          COMPONENT_REGISTRY.map(g => <CatGroup key={g.group} g={g} onEnter={enterComp} />)
        )}
      </div>
    </div>
  )
}
