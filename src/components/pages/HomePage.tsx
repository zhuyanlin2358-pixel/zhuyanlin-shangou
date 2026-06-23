import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
  const { goVenue } = useApp()

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#0D1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0,
      animation: 'fadeUp 0.45s ease both',
    }}>

      {/* 标题 */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <p style={{ margin: '0 0 14px', fontSize: 11, letterSpacing: '3px', color: 'rgba(255,255,255,0.2)' }}>
          美团闪购
        </p>
        <h1 style={{ margin: '0 0 14px', fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: '-1px' }}>
          设计工作台
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.4)' }}>
          选择你要完成的任务
        </p>
      </div>

      {/* 主入口 */}
      <button
        onClick={goVenue}
        style={{
          width: 320,
          padding: '18px 28px',
          background: 'linear-gradient(135deg, #FF3060 0%, #FF6030 100%)',
          border: 'none',
          borderRadius: 14,
          cursor: 'pointer',
          textAlign: 'center',
          marginBottom: 14,
          color: '#fff',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '0.3px',
          transition: 'opacity 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.opacity = '0.85'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.opacity = '1'
          ;(e.currentTarget as HTMLElement).style.transform = 'none'
        }}
      >
        打开设计工具
      </button>

      {/* 场景方案库 */}
      <div style={{
        width: 320,
        padding: '12px 20px',
        border: '1px dashed rgba(255,255,255,0.08)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>场景方案库</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 2 }}>大促 / 日常 / 节日，一键套用</div>
        </div>
        <span style={{ fontSize: 10, color: 'rgba(255,180,0,0.45)', border: '1px solid rgba(255,180,0,0.12)', borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>
          待开发
        </span>
      </div>

    </div>
  )
}
