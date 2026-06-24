import { useApp } from '@/contexts/AppContext'
import type { ComponentId } from '@/types'
import Grainient from '@/components/ui/Grainient'

// 独立切图工具（不走会场流程）
const STANDALONE_TOOLS: {
  id: ComponentId
  name: string
  desc: string
  color: string
}[] = [
  { id: 'yituosi', name: '一拖四',       desc: 'P0 频道页首图切图素材', color: '#ffffff' },
  { id: 'n4',      name: 'N4 文字标签',  desc: '8 种变体 240×156 PNG',  color: '#ffffff' },
  { id: 'n2',      name: 'N2 品牌 Logo', desc: '有底色 / 描边 / 素材库',  color: '#ffffff' },
]

export default function HomePage() {
  const { goVenue, enterComp } = useApp()

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

        {/* ── 会场搭建入口 ── */}
        <div style={{ width: 360, marginBottom: 28 }}>
          <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', marginBottom: 8, letterSpacing: '1.5px', fontWeight: 600 }}>
            会场搭建
          </div>
          <button
            onClick={goVenue}
            style={{
              width: '100%',
              padding: '18px 20px',
              background: 'rgba(0,0,0,0.82)',
              border: 'none',
              borderRadius: 16,
              cursor: 'pointer',
              textAlign: 'left',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              backdropFilter: 'blur(8px)',
              transition: 'transform 0.15s, opacity 0.15s',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.opacity = '0.88'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.opacity = '1'
              ;(e.currentTarget as HTMLElement).style.transform = 'none'
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>打开设计工具</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>老虎机 · 楼层条 · 横滑Tab · 一键领券</div>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ opacity: 0.4, flexShrink: 0 }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          {/* 场景方案库占位 */}
          <div style={{
            marginTop: 8,
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            backdropFilter: 'blur(4px)',
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>场景方案库</div>
              <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.28)', marginTop: 2 }}>大促 / 日常 / 节日，一键套用</div>
            </div>
            <span style={{ fontSize: 9, color: 'rgba(100,60,0,0.5)', background: 'rgba(255,180,0,0.18)', border: '1px solid rgba(180,120,0,0.2)', borderRadius: 4, padding: '2px 7px', flexShrink: 0, fontWeight: 600 }}>
              待开发
            </span>
          </div>
        </div>

        {/* ── 独立切图工具 ── */}
        <div style={{ width: 360 }}>
          <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.3)', marginBottom: 8, letterSpacing: '1.5px', fontWeight: 600 }}>
            独立切图工具
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {STANDALONE_TOOLS.map(tool => (
              <button
                key={tool.id}
                onClick={() => enterComp(tool.id)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.35)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  transition: 'all 0.15s',
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(255,255,255,0.55)'
                  el.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'rgba(255,255,255,0.35)'
                  el.style.transform = 'none'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a0a00', marginBottom: 2 }}>
                    {tool.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)' }}>
                    {tool.desc}
                  </div>
                </div>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                  style={{ opacity: 0.3, flexShrink: 0, color: '#1a0a00' }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
