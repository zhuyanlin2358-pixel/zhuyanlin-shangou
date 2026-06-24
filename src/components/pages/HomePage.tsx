import { useApp } from '@/contexts/AppContext'
import type { ComponentId } from '@/types'

// 独立切图工具（不走会场流程）
const STANDALONE_TOOLS: {
  id: ComponentId
  name: string
  desc: string
  color: string
}[] = [
  { id: 'yituosi', name: '一拖四',       desc: 'P0 频道页首图切图素材', color: '#6366F1' },
  { id: 'n4',      name: 'N4 文字标签',  desc: '8 种变体 240×156 PNG',  color: '#0EA5E9' },
  { id: 'n2',      name: 'N2 品牌 Logo', desc: '有底色 / 描边 / 素材库',  color: '#10B981' },
]

export default function HomePage() {
  const { goVenue, enterComp } = useApp()

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#0D1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      animation: 'fadeUp 0.45s ease both',
    }}>

      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{ margin: '0 0 12px', fontSize: 11, letterSpacing: '3px', color: 'rgba(255,255,255,0.2)' }}>
          美团闪购
        </p>
        <h1 style={{ margin: '0 0 12px', fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: '-1px' }}>
          设计工作台
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>
          选择你要完成的任务
        </p>
      </div>

      {/* ── 会场搭建入口 ── */}
      <div style={{ width: 360, marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginBottom: 10, letterSpacing: '1px' }}>
          会场搭建
        </div>
        <button
          onClick={goVenue}
          style={{
            width: '100%',
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #FF3060 0%, #FF6030 100%)',
            border: 'none',
            borderRadius: 14,
            cursor: 'pointer',
            textAlign: 'left',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.opacity = '0.88'
            ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.opacity = '1'
            ;(e.currentTarget as HTMLElement).style.transform = 'none'
          }}
        >
          {/* 图标 */}
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>打开设计工具</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>老虎机 · 楼层条 · 横滑Tab · 一键领券 搭建完整会场</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ opacity: 0.6, flexShrink: 0 }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        {/* 场景方案库 占位 */}
        <div style={{
          marginTop: 8,
          padding: '10px 16px',
          border: '1px dashed rgba(255,255,255,0.07)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>场景方案库</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.12)', marginTop: 2 }}>大促 / 日常 / 节日，一键套用</div>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,180,0,0.4)', border: '1px solid rgba(255,180,0,0.12)', borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>
            待开发
          </span>
        </div>
      </div>

      {/* ── 独立切图工具 ── */}
      <div style={{ width: 360 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginBottom: 10, letterSpacing: '1px' }}>
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
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.06)'
                el.style.borderColor = 'rgba(255,255,255,0.12)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.03)'
                el.style.borderColor = 'rgba(255,255,255,0.07)'
              }}
            >
              {/* 色块图标 */}
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: tool.color + '22',
                border: `1px solid ${tool.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: tool.color, opacity: 0.85 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>
                  {tool.name}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  {tool.desc}
                </div>
              </div>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                style={{ opacity: 0.25, flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
