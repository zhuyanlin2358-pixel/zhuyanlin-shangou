import { useState, useRef, useCallback, useEffect } from 'react'
import html2canvas from 'html2canvas'

const STORAGE_KEY = 'shangou_n2_logos'

interface Logo {
  id: string
  name: string
  data: string
  type: 'filled' | 'stroke'
}

function getLogos(): Logo[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveLogos(logos: Logo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logos))
}

// 240×156 画布，logo 圆形居中 152×152
function LogoCanvas({
  logoUrl, stroke, canvasRef,
}: { logoUrl: string; stroke: boolean; canvasRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={canvasRef}
      style={{ width: 240, height: 156, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {logoUrl ? (
        <div style={{
          width: 152, height: 152, borderRadius: '50%', overflow: 'hidden',
          border: stroke ? '1.5px solid #DBDDDE' : 'none',
          flexShrink: 0,
        }}>
          <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{
          width: 152, height: 152, borderRadius: '50%',
          border: stroke ? '1.5px solid #DBDDDE' : '1.5px dashed #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#9ca3af', fontSize: 13,
        }}>
          上传 Logo
        </div>
      )}
    </div>
  )
}

function LogoSection({
  title, badge, stroke, logoUrl, onUpload, onSave, onExport, exporting,
  canvasRef,
}: {
  title: string; badge: string; stroke: boolean
  logoUrl: string; onUpload: (url: string) => void
  onSave: () => void; onExport: () => void; exporting: boolean
  canvasRef: React.RefObject<HTMLDivElement>
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onUpload(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800">{title}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          stroke ? 'bg-gray-100 text-gray-500' : 'bg-yellow-50 text-yellow-600'
        }`}>{badge}</span>
      </div>

      {/* 预览 + 棋盘格透明背景 */}
      <div className="relative overflow-hidden rounded-lg" style={{ height: 156 }}>
        <div className="absolute inset-0"
          style={{ backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%)', backgroundSize: '16px 16px' }} />
        <LogoCanvas logoUrl={logoUrl} stroke={stroke} canvasRef={canvasRef} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
        >
          上传 Logo
        </button>
        <button
          onClick={onSave}
          disabled={!logoUrl}
          className="py-2 px-3 text-sm border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 disabled:opacity-30 transition-colors"
        >
          保存到库
        </button>
        <button
          onClick={onExport}
          disabled={exporting}
          className="py-2 px-3 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {exporting ? '…' : '⬇'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}

export default function N2Panel() {
  const [filledUrl, setFilledUrl] = useState('')
  const [strokeUrl, setStrokeUrl] = useState('')
  const [logos, setLogos] = useState<Logo[]>([])
  const [exportingFilled, setExportingFilled] = useState(false)
  const [exportingStroke, setExportingStroke] = useState(false)
  const [toast, setToast] = useState('')
  const filledRef = useRef<HTMLDivElement>(null)
  const strokeRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setLogos(getLogos()) }, [])

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(''), 2500)
  }

  const doExport = useCallback(async (
    ref: React.RefObject<HTMLDivElement>,
    name: string,
    setExp: (v: boolean) => void,
  ) => {
    if (!ref.current) return
    setExp(true); showToast(`正在渲染 ${name}…`)
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 1, width: 240, height: 156,
        useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
      })
      const link = document.createElement('a')
      link.download = `${name}.png`; link.href = canvas.toDataURL('image/png'); link.click()
      showToast(`✅ 已导出：${name}.png`)
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
    setExp(false)
  }, [])

  const saveLogo = (url: string, type: 'filled' | 'stroke') => {
    if (!url) { showToast(`请先上传${type === 'filled' ? '有底色' : '无底色描边'} Logo`); return }
    const name = prompt('输入品牌名称（用于素材库排序）：')
    if (!name?.trim()) return
    const updated = [...logos, { id: Date.now().toString(), name: name.trim(), data: url, type }]
    updated.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
    saveLogos(updated); setLogos(updated)
    showToast(`✅ 已保存到素材库：${name.trim()}`)
  }

  const selectFromLibrary = (logo: Logo) => {
    if (logo.type === 'stroke') {
      setStrokeUrl(logo.data); showToast(`已用到无底色描边：${logo.name}`)
    } else {
      setFilledUrl(logo.data); showToast(`已用到有底色：${logo.name}`)
    }
  }

  const deleteLogo = (id: string) => {
    const updated = logos.filter(l => l.id !== id)
    saveLogos(updated); setLogos(updated)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* 左侧：两个 section */}
      <div className="w-80 shrink-0 border-r border-gray-200 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <LogoSection
          title="有底色 Logo" badge="无描边"
          stroke={false} logoUrl={filledUrl}
          onUpload={setFilledUrl}
          onSave={() => saveLogo(filledUrl, 'filled')}
          onExport={() => doExport(filledRef, 'N2_有底色_240x156', setExportingFilled)}
          exporting={exportingFilled}
          canvasRef={filledRef}
        />
        <LogoSection
          title="无底色 Logo" badge="灰色描边"
          stroke={true} logoUrl={strokeUrl}
          onUpload={setStrokeUrl}
          onSave={() => saveLogo(strokeUrl, 'stroke')}
          onExport={() => doExport(strokeRef, 'N2_无底色描边_240x156', setExportingStroke)}
          exporting={exportingStroke}
          canvasRef={strokeRef}
        />
      </div>

      {/* 右侧：素材库 */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold text-gray-900">品牌素材库</div>
            <div className="text-xs text-gray-400 mt-0.5">点击 Logo 自动填入对应区域</div>
          </div>
        </div>

        {logos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
            暂无素材，点击「保存到库」添加
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {logos.map(logo => (
              <div
                key={logo.id}
                className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 bg-white hover:border-gray-400 cursor-pointer transition-all"
                onClick={() => selectFromLibrary(logo)}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', overflow: 'hidden',
                  border: logo.type === 'stroke' ? '1.5px solid #DBDDDE' : 'none',
                  flexShrink: 0,
                }}>
                  <img src={logo.data} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="text-xs text-gray-700 text-center leading-tight max-w-full truncate">{logo.name}</div>
                <div className={`text-xs px-1.5 py-0.5 rounded-full ${
                  logo.type === 'stroke' ? 'bg-gray-100 text-gray-400' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {logo.type === 'stroke' ? '无底色' : '有底色'}
                </div>
                <button
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-xs hidden group-hover:flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors"
                  onClick={e => { e.stopPropagation(); deleteLogo(logo.id) }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
