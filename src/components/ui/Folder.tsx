/**
 * Folder — 可点击展开的文件夹动效
 * 来源：https://reactbits.dev/components/folder
 * 无额外依赖
 */
import { useState } from 'react'

// ── 工具：将 hex 颜色加深 ──────────────────────────────────────────────────────
function darkenColor(hex: string, percent: number): string {
  let color = hex.startsWith('#') ? hex.slice(1) : hex
  if (color.length === 3) color = color.split('').map(c => c + c).join('')
  const num = parseInt(color, 16)
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.floor(n * (1 - percent))))
  const r = clamp((num >> 16) & 0xff)
  const g = clamp((num >> 8)  & 0xff)
  const b = clamp(num         & 0xff)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

// ── CSS（注入一次到 <head>） ───────────────────────────────────────────────────
const FOLDER_CSS = `
.rb-folder { transition: all 0.2s ease-in; cursor: pointer; }
.rb-folder:not(.rb-folder--open):hover { transform: translateY(-8px); }
.rb-folder:not(.rb-folder--open):hover .rb-paper { transform: translate(-50%, 0%); }
.rb-folder:not(.rb-folder--open):hover .rb-folder__front { transform: skew(15deg) scaleY(0.6); }
.rb-folder:not(.rb-folder--open):hover .rb-folder__front.rb-right { transform: skew(-15deg) scaleY(0.6); }
.rb-folder.rb-folder--open { transform: translateY(-8px); }
.rb-folder.rb-folder--open .rb-paper:nth-child(1) { transform: translate(-120%, -70%) rotateZ(-15deg); height: 80%; }
.rb-folder.rb-folder--open .rb-paper:nth-child(1):hover { transform: translate(-120%, -70%) rotateZ(-15deg) scale(1.1) translate(var(--magnet-x), var(--magnet-y)); }
.rb-folder.rb-folder--open .rb-paper:nth-child(2) { transform: translate(10%, -70%) rotateZ(15deg); height: 80%; }
.rb-folder.rb-folder--open .rb-paper:nth-child(2):hover { transform: translate(10%, -70%) rotateZ(15deg) scale(1.1) translate(var(--magnet-x), var(--magnet-y)); }
.rb-folder.rb-folder--open .rb-paper:nth-child(3) { transform: translate(-50%, -100%) rotateZ(5deg); height: 80%; }
.rb-folder.rb-folder--open .rb-paper:nth-child(3):hover { transform: translate(-50%, -100%) rotateZ(5deg) scale(1.1) translate(var(--magnet-x), var(--magnet-y)); }
.rb-folder.rb-folder--open .rb-folder__front { transform: skew(15deg) scaleY(0.6); }
.rb-folder.rb-folder--open .rb-folder__front.rb-right { transform: skew(-15deg) scaleY(0.6); }
.rb-folder__back { position: relative; width: 100px; height: 80px; background: var(--rb-folder-back); border-radius: 0 10px 10px 10px; }
.rb-folder__back::after { position: absolute; z-index: 0; bottom: 98%; left: 0; content: ''; width: 30px; height: 10px; background: var(--rb-folder-back); border-radius: 5px 5px 0 0; }
.rb-paper { position: absolute; z-index: 2; bottom: 10%; left: 50%; transform: translate(-50%, 10%); width: 70%; height: 80%; background: var(--rb-paper-1); border-radius: 10px; transition: all 0.3s ease-in-out; }
.rb-paper:nth-child(2) { background: var(--rb-paper-2); width: 80%; height: 70%; }
.rb-paper:nth-child(3) { background: var(--rb-paper-3); width: 90%; height: 60%; }
.rb-folder__front { position: absolute; z-index: 3; width: 100%; height: 100%; background: var(--rb-folder-color); border-radius: 5px 10px 10px 10px; transform-origin: bottom; transition: all 0.3s ease-in-out; }
.rb-folder:focus-visible { outline: 2px solid #fff; outline-offset: 4px; border-radius: 10px; }
`

let cssInjected = false
function injectCSS() {
  if (cssInjected) return
  const style = document.createElement('style')
  style.textContent = FOLDER_CSS
  document.head.appendChild(style)
  cssInjected = true
}

// ── 组件 ─────────────────────────────────────────────────────────────────────
export interface FolderProps {
  color?: string
  size?: number
  items?: React.ReactNode[]
  className?: string
  defaultOpen?: boolean
  onToggle?: (open: boolean) => void
}

export default function Folder({
  color        = '#5227FF',
  size         = 1,
  items        = [],
  className    = '',
  defaultOpen  = false,
  onToggle,
}: FolderProps) {
  injectCSS()

  const maxItems   = 3
  const papers     = [...items.slice(0, maxItems)]
  while (papers.length < maxItems) papers.push(null)

  const [open, setOpen]             = useState(defaultOpen)
  const [offsets, setOffsets]       = useState(() => Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })))

  const folderBack = darkenColor(color, 0.08)

  const handleClick = () => {
    const next = !open
    setOpen(next)
    if (!next) setOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })))
    onToggle?.(next)
  }

  const handlePaperMove = (e: React.MouseEvent, i: number) => {
    if (!open) return
    const rect    = e.currentTarget.getBoundingClientRect()
    const offsetX = (e.clientX - rect.left  - rect.width  / 2) * 0.15
    const offsetY = (e.clientY - rect.top   - rect.height / 2) * 0.15
    setOffsets(prev => prev.map((o, idx) => idx === i ? { x: offsetX, y: offsetY } : o))
  }

  const handlePaperLeave = (_e: React.MouseEvent, i: number) => {
    setOffsets(prev => prev.map((o, idx) => idx === i ? { x: 0, y: 0 } : o))
  }

  const cssVars = {
    '--rb-folder-color': color,
    '--rb-folder-back':  folderBack,
    '--rb-paper-1': darkenColor('#ffffff', 0.1),
    '--rb-paper-2': darkenColor('#ffffff', 0.05),
    '--rb-paper-3': '#ffffff',
  } as React.CSSProperties

  return (
    <div style={{ transform: `scale(${size})` }} className={className}>
      <div
        className={`rb-folder${open ? ' rb-folder--open' : ''}`}
        style={cssVars}
        onClick={handleClick}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } }}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-label={open ? 'Close folder' : 'Open folder'}
      >
        <div className="rb-folder__back">
          {papers.map((item, i) => (
            <div
              key={i}
              className="rb-paper"
              onMouseMove={e => handlePaperMove(e, i)}
              onMouseLeave={e => handlePaperLeave(e, i)}
              style={open ? ({
                '--magnet-x': `${offsets[i]?.x ?? 0}px`,
                '--magnet-y': `${offsets[i]?.y ?? 0}px`,
              } as React.CSSProperties) : {}}
            >
              {item}
            </div>
          ))}
          <div className="rb-folder__front" />
          <div className="rb-folder__front rb-right" />
        </div>
      </div>
    </div>
  )
}
