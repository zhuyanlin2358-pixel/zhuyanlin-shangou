import { useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { useN2 } from '@/contexts/N2Context'
import { useApp } from '@/contexts/AppContext'
import { captureElement, downloadCanvas } from '@/utils/exportUtils'

function LogoCanvas({ logoUrl, stroke, canvasRef }: {
  logoUrl: string
  stroke: boolean
  canvasRef: React.RefObject<HTMLDivElement>
}) {
  return (
    <div
      ref={canvasRef}
      style={{ width: 240, height: 156, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {logoUrl ? (
        <div style={{
          width: 152, height: 152, borderRadius: '50%', overflow: 'hidden',
          border: stroke ? '1.5px solid #DBDDDE' : 'none',
        }}>
          <img src={logoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{
          width: 152, height: 152, borderRadius: '50%',
          border: stroke ? '1.5px solid #DBDDDE' : '1.5px dashed #ccc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#aaa', fontSize: 13,
        }}>
          上传 Logo
        </div>
      )}
    </div>
  )
}

function LogoSection({ title, badge, stroke, logoUrl, canvasRef, onExport, exporting }: {
  title: string; badge: string; stroke: boolean
  logoUrl: string; canvasRef: React.RefObject<HTMLDivElement>
  onExport: () => void; exporting: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{title}</span>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: stroke ? 'var(--bg-subtle)' : 'rgba(248,181,0,0.1)', color: stroke ? 'var(--text-3)' : '#B8860B' }}>
          {badge}
        </span>
      </div>

      <div className="relative rounded-xl overflow-hidden shadow-sm">
        <div className="absolute inset-0"
          style={{ backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%)', backgroundSize: '16px 16px' }} />
        <LogoCanvas logoUrl={logoUrl} stroke={stroke} canvasRef={canvasRef} />
      </div>

      <button
        onClick={onExport}
        disabled={exporting}
        className="px-5 py-2 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50"
        style={{ background: '#1a1a1a' }}
      >
        {exporting ? '导出中…' : <><Download size={13} className="shrink-0" />导出 PNG</>}
      </button>
    </div>
  )
}

export default function N2Page() {
  const { filledUrl, strokeUrl, logos, selectLogo, deleteLogo } = useN2()
  const { showToast } = useApp()
  const [expFilled, setExpFilled] = useState(false)
  const [expStroke, setExpStroke] = useState(false)
  const filledRef = useRef<HTMLDivElement>(null)
  const strokeRef = useRef<HTMLDivElement>(null)

  const doExport = async (
    ref: React.RefObject<HTMLDivElement | null>, name: string,
    setExp: (v: boolean) => void,
  ) => {
    if (!ref.current) return
    setExp(true); showToast(`正在渲染 ${name}…`)
    try {
      const canvas = await captureElement(ref.current as HTMLDivElement, 240, 156)
      downloadCanvas(canvas, `${name}.png`)
      showToast(`✅ 已导出：${name}.png`)
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
    setExp(false)
  }

  return (
    <div className="p-6 space-y-8">
      {/* 两个预览区并排 */}
      <div className="flex gap-12 justify-center flex-wrap">
        <LogoSection
          title="有底色 Logo" badge="无描边"
          stroke={false} logoUrl={filledUrl}
          canvasRef={filledRef as React.RefObject<HTMLDivElement>}
          onExport={() => doExport(filledRef, 'N2_有底色_240x156', setExpFilled)}
          exporting={expFilled}
        />
        <LogoSection
          title="无底色 Logo" badge="灰色描边"
          stroke={true} logoUrl={strokeUrl}
          canvasRef={strokeRef as React.RefObject<HTMLDivElement>}
          onExport={() => doExport(strokeRef, 'N2_无底色描边_240x156', setExpStroke)}
          exporting={expStroke}
        />
      </div>

      {/* 素材库 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>品牌素材库</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              点击 Logo 自动填入对应区域
            </div>
          </div>
        </div>

        {logos.length === 0 ? (
          <div className="flex items-center justify-center h-24 rounded-xl border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-3)', fontSize: 13 }}>
            暂无素材，在左侧配置面板上传并保存
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {logos.map(logo => (
              <div
                key={logo.id}
                className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                onClick={() => { selectLogo(logo); showToast(`已选用：${logo.name}`) }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', overflow: 'hidden',
                  border: logo.type === 'stroke' ? '1.5px solid #DBDDDE' : 'none',
                }}>
                  <img src={logo.data} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="text-xs text-center truncate w-full" style={{ color: 'var(--text-2)' }}>
                  {logo.name}
                </div>
                <div className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: logo.type === 'stroke' ? 'var(--bg-subtle)' : 'rgba(248,181,0,0.08)',
                    color: logo.type === 'stroke' ? 'var(--text-3)' : '#B8860B',
                    fontSize: 10,
                  }}>
                  {logo.type === 'stroke' ? '无底色' : '有底色'}
                </div>
                <button
                  className="absolute top-1 right-1 w-5 h-5 rounded-full text-xs items-center justify-center hidden group-hover:flex transition-colors"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-3)' }}
                  onClick={e => { e.stopPropagation(); deleteLogo(logo.id) }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
