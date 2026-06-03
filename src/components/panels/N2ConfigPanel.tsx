import { useRef } from 'react'
import { useN2 } from '@/contexts/N2Context'
import { useApp } from '@/contexts/AppContext'
import { PF, PanelSection, Divider } from '@/components/ui/PanelField'

function LogoUploadRow({
  label, desc, logoUrl, stroke,
  onUpload, onSave,
}: {
  label: string; desc: string; stroke: boolean
  logoUrl: string; onUpload: (url: string) => void; onSave: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onUpload(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <PF label={label} desc={desc}>
      <div className="flex gap-2 mt-1">
        {/* 缩略图 */}
        <div
          onClick={() => fileRef.current?.click()}
          className="w-12 h-12 rounded-full overflow-hidden cursor-pointer flex items-center justify-center shrink-0 transition-opacity hover:opacity-80"
          style={{
            border: stroke ? '1.5px solid #DBDDDE' : '1.5px dashed rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          {logoUrl
            ? <img src={logoUrl} className="w-full h-full object-cover" />
            : <span style={{ fontSize: 18, opacity: 0.3 }}>+</span>
          }
        </div>
        {/* 按钮组 */}
        <div className="flex flex-col gap-1.5 flex-1">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-1.5 rounded-lg text-xs border transition-colors border-white/10 bg-white/[0.05] text-white/60 hover:bg-white/10"
          >
            {logoUrl ? '更换图片' : '上传 Logo'}
          </button>
          <button
            onClick={onSave}
            disabled={!logoUrl}
            className="w-full py-1.5 rounded-lg text-xs border transition-colors border-white/10 bg-white/[0.05] text-white/40 hover:bg-white/10 disabled:opacity-30"
          >
            保存到素材库
          </button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </PF>
  )
}

export default function N2ConfigPanel() {
  const { filledUrl, strokeUrl, setFilledUrl, setStrokeUrl, saveLogo } = useN2()
  const { showToast } = useApp()

  const handleSave = (url: string, type: 'filled' | 'stroke') => {
    if (!url) { showToast(`请先上传${type === 'filled' ? '有底色' : '无底色描边'} Logo`); return }
    const name = window.prompt('输入品牌名称（用于素材库排序）：')
    if (!name?.trim()) return
    saveLogo(url, type, name.trim())
    showToast(`✅ 已保存：${name.trim()}`)
  }

  return (
    <div className="px-4 py-4 space-y-5">
      <PanelSection legend="N2 品牌/活动 Logo" desc="圆形 Logo · 240 × 156 px">

        <LogoUploadRow
          label="① 有底色 Logo"
          desc="无灰色外描边，有背景色"
          stroke={false}
          logoUrl={filledUrl}
          onUpload={setFilledUrl}
          onSave={() => handleSave(filledUrl, 'filled')}
        />

        <Divider />

        <LogoUploadRow
          label="② 无底色 Logo"
          desc="灰色外描边 #DBDDDE，透明背景"
          stroke={true}
          logoUrl={strokeUrl}
          onUpload={setStrokeUrl}
          onSave={() => handleSave(strokeUrl, 'stroke')}
        />

      </PanelSection>
    </div>
  )
}
