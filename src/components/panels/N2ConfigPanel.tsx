import { useRef } from 'react'
import { useN2 } from '@/contexts/N2Context'
import { useApp } from '@/contexts/AppContext'

export default function N2ConfigPanel() {
  const { filledUrl, strokeUrl, setFilledUrl, setStrokeUrl, saveLogo } = useN2()
  const { showToast } = useApp()
  const filledRef = useRef<HTMLInputElement>(null)
  const strokeRef = useRef<HTMLInputElement>(null)

  const handleFile = (type: 'filled' | 'stroke') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const url = ev.target?.result as string
      if (type === 'filled') setFilledUrl(url)
      else setStrokeUrl(url)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = (url: string, type: 'filled' | 'stroke') => {
    if (!url) { showToast(`请先上传${type === 'filled' ? '有底色' : '无底色描边'} Logo`); return }
    const name = window.prompt('输入品牌名称（用于素材库排序）：')
    if (!name?.trim()) return
    saveLogo(url, type, name.trim())
    showToast(`✅ 已保存到素材库：${name.trim()}`)
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-1)' }}>N2 品牌/活动 Logo</div>
        <div className="text-xs" style={{ color: 'var(--text-3)' }}>圆形 Logo · 240 × 156 px</div>
      </div>

      {/* 有底色 */}
      <div className="space-y-2">
        <div className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>① 有底色 Logo</div>
        <div
          className="h-20 rounded-lg border flex items-center justify-center cursor-pointer overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
          onClick={() => filledRef.current?.click()}
        >
          {filledUrl
            ? <img src={filledUrl} className="h-full w-full object-cover" style={{ borderRadius: '50%', width: 60, height: 60 }} />
            : <span className="text-xs" style={{ color: 'var(--text-3)' }}>点击上传</span>
          }
        </div>
        <button
          onClick={() => handleSave(filledUrl, 'filled')}
          disabled={!filledUrl}
          className="w-full py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-30"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--bg)' }}
        >
          保存到素材库
        </button>
        <input ref={filledRef} type="file" accept="image/*" className="hidden" onChange={handleFile('filled')} />
      </div>

      {/* 无底色 */}
      <div className="space-y-2">
        <div className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>② 无底色描边 Logo</div>
        <div
          className="h-20 rounded-lg border flex items-center justify-center cursor-pointer"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
          onClick={() => strokeRef.current?.click()}
        >
          {strokeUrl
            ? <div style={{ width: 60, height: 60, borderRadius: '50%', border: '1.5px solid #DBDDDE', overflow: 'hidden' }}>
                <img src={strokeUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            : <span className="text-xs" style={{ color: 'var(--text-3)' }}>点击上传</span>
          }
        </div>
        <button
          onClick={() => handleSave(strokeUrl, 'stroke')}
          disabled={!strokeUrl}
          className="w-full py-1.5 text-xs rounded-lg border transition-colors disabled:opacity-30"
          style={{ borderColor: 'var(--border)', color: 'var(--text-2)', background: 'var(--bg)' }}
        >
          保存到素材库
        </button>
        <input ref={strokeRef} type="file" accept="image/*" className="hidden" onChange={handleFile('stroke')} />
      </div>
    </div>
  )
}
