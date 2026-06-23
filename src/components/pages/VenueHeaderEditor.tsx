/**
 * 会场「会场」选中时的中间区域
 * 替换原有「会场搭建」组件列表
 * 专注：头图配置 + 动效库（待开发）+ 头图文案（待开发）
 */
import { useRef } from 'react'
import { ImageIcon, Trash2, Download } from 'lucide-react'
import { useVenue } from '@/contexts/VenueContext'
import { useApp } from '@/contexts/AppContext'
import type { VenueHeaderSize } from '@/types'

const HEADER_SIZES: { key: VenueHeaderSize; label: string; desc: string }[] = [
  { key: '424', label: '标准', desc: '750 × 424 px' },
  { key: '624', label: '大图', desc: '750 × 624 px' },
  { key: '274', label: '极矮', desc: '750 × 274 px' },
]

export default function VenueHeaderEditor() {
  const { headerUrl, setHeaderUrl, headerSize, setHeaderSize, bgColor, setBgColor, items, removeItem, moveItem, setSpacing } = useVenue()
  const { showToast } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setHeaderUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ padding: '28px 36px', maxWidth: 680 }}>

      {/* 头图配置 */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>
          活动头图
        </div>

        {/* 上传区 */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '1.5px dashed var(--border)',
            borderRadius: 12,
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 12,
            background: 'var(--bg-subtle)',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,48,96,0.4)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
        >
          {headerUrl ? (
            <img
              src={headerUrl} alt="头图"
              style={{ width: 80, height: Math.round(80 * parseInt(headerSize) / 750), objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 80, height: 44, borderRadius: 6, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ImageIcon size={20} color="var(--text-3)" />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', marginBottom: 3 }}>
              {headerUrl ? '点击更换头图' : '上传活动头图'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              750 × {HEADER_SIZES.find(s => s.key === headerSize)?.desc.split('×')[1].trim()}，置顶显示
            </div>
          </div>
          {headerUrl && (
            <button
              onClick={e => { e.stopPropagation(); setHeaderUrl('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />

        {/* 尺寸选择 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {HEADER_SIZES.map(s => (
            <button
              key={s.key}
              onClick={() => setHeaderSize(s.key)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${headerSize === s.key ? '#FF5050' : 'var(--border)'}`,
                background: headerSize === s.key ? 'rgba(255,80,80,0.08)' : 'var(--bg-subtle)',
                color: headerSize === s.key ? '#FF8080' : 'var(--text-2)',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>{s.desc}</div>
            </button>
          ))}
        </div>

        {/* 背景色 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>会场背景色</span>
          <label style={{ cursor: 'pointer', position: 'relative' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: bgColor, border: '1px solid var(--border)' }} />
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
          </label>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-3)' }}>{bgColor.toUpperCase()}</span>
        </div>
      </section>

      {/* 动效库（待开发）*/}
      <section style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
          头图动效
        </div>
        <div style={{
          border: '1.5px dashed var(--border)',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: 0.6,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,200,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,180,0,0.7)" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 2 }}>动效库</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>头图入场动效、循环动效及自定义动效配置</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,180,0,0.6)', border: '1px solid rgba(255,180,0,0.2)', borderRadius: 4, padding: '2px 8px', flexShrink: 0 }}>
            待开发
          </span>
        </div>
      </section>

      {/* 头图文案（待开发）*/}
      <section style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
          头图文案
        </div>
        <div style={{
          border: '1.5px dashed var(--border)',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: 0.6,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(45,120,244,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(100,160,255,0.7)' }}>T</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 2 }}>文案叠加</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>在头图上叠加活动标题、副标题等文案元素</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(100,160,255,0.5)', border: '1px solid rgba(100,160,255,0.15)', borderRadius: 4, padding: '2px 8px', flexShrink: 0 }}>
            待开发
          </span>
        </div>
      </section>

      {/* 已加入组件（精简版） */}
      {items.length > 0 && (
        <section>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 12 }}>
            已加入组件 <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-3)' }}>共 {items.length} 个</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, idx) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8,
                background: 'var(--bg-subtle)', border: '1px solid var(--border)',
              }}>
                <img src={item.previewUrl} alt={item.label} style={{ width: 52, height: 17, objectFit: 'cover', objectPosition: 'top', borderRadius: 3, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text-1)' }}>{item.label}</span>
                <button onClick={() => moveItem(item.id, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>↑</button>
                <button onClick={() => moveItem(item.id, 'down')} disabled={idx === items.length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}>↓</button>
                <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>

          <button
            onClick={() => showToast('导出功能在右侧「完成设计并下载」')}
            style={{
              marginTop: 14,
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10,
              background: 'linear-gradient(90deg,#FF3060,#FF6030)',
              border: 'none', cursor: 'pointer', color: '#fff',
              fontSize: 13, fontWeight: 600,
            }}
          >
            <Download size={14} />
            导出会场拼图 PNG
          </button>
        </section>
      )}

    </div>
  )
}
