/**
 * 横滑 Tab 配置面板
 * 配色（横排药丸）+ Tab 数量切换 + Tab 文案输入
 */
import type { CSSProperties, ReactNode } from 'react'
import { useHTab } from '@/contexts/HTabContext'
import { H_TAB_COLORS, type HTabColorKey } from '@/types'

const COLOR_KEYS = Object.keys(H_TAB_COLORS) as HTabColorKey[]
const TAB_COUNTS = [2, 3, 4] as const

// 模块顶层：label 样式（防 re-mount 失焦）
function SLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
    }}>
      {children}
    </div>
  )
}

// 模块顶层：分割线
function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
}

// 模块顶层：Tab 文案行（独立组件防失焦）
function TabInput({ idx, value, onChange }: {
  idx: number; value: string; onChange: (v: string) => void
}) {
  const inp: CSSProperties = {
    flex: 1, boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '7px 10px', fontSize: 12,
    color: '#ebe9fc', outline: 'none',
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', width: 14, textAlign: 'right', flexShrink: 0 }}>
        {idx + 1}
      </span>
      <input style={inp} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={`Tab ${idx + 1}`} />
    </div>
  )
}

interface HTabPanelProps {
  /** ComponentStudio 传入当前激活的图层 id，venue 侧边栏不传（显示全部） */
  activeLayer?: string | null
}

export default function HTabPanel({ activeLayer }: HTabPanelProps = {}) {
  const { config, setColor, items, updateItem } = useHTab()
  const item = items[0]
  const tabs = item?.tabs ?? ['Tab 1', 'Tab 2', 'Tab 3']
  const tabCount = tabs.length

  // 按激活图层决定显示哪些配置区；无激活层（venue）时显示全部
  const showColor = !activeLayer || activeLayer === 'style'
  const showCount = !activeLayer || activeLayer === 'export'
  const showText  = !activeLayer || activeLayer === 'tabs'

  const setTabCount = (n: number) => {
    if (!item) return
    const next = [...tabs]
    if (n > next.length) {
      while (next.length < n) next.push(`Tab ${next.length + 1}`)
    } else {
      next.length = n
    }
    updateItem(item.id, { tabs: next })
  }

  const setTabText = (idx: number, text: string) => {
    if (!item) return
    const next = [...tabs]
    next[idx] = text
    updateItem(item.id, { tabs: next })
  }

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ① 配色预设 — 横排药丸（款式配色层 or 无激活层时显示） */}
      {showColor && (
        <div>
          <SLabel>配色预设</SLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {COLOR_KEYS.map(k => {
              const def = H_TAB_COLORS[k]
              const active = config.colorKey === k
              return (
                <button key={k} onClick={() => setColor(k)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                    borderColor: active ? 'rgba(255,48,96,0.6)' : 'rgba(255,255,255,0.1)',
                    borderWidth: 1, borderStyle: 'solid',
                    background: active ? 'rgba(255,48,96,0.12)' : 'rgba(255,255,255,0.04)',
                    color:      active ? '#FF8FAA' : 'rgba(255,255,255,0.5)',
                    fontWeight: active ? 600 : 400,
                    transition: 'all 0.12s',
                  }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
                    background: def.inactiveBg,
                  }} />
                  {def.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {showColor && showCount && <Divider />}

      {/* ② Tab 数量（Tab 数量层 or 无激活层时显示） */}
      {showCount && (
        <div>
          <SLabel>Tab 数量</SLabel>
          <div style={{ display: 'flex', gap: 6 }}>
            {TAB_COUNTS.map(n => (
              <button key={n} onClick={() => setTabCount(n)}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8, cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  borderColor: tabCount === n ? 'rgba(255,48,96,0.6)' : 'rgba(255,255,255,0.1)',
                  borderWidth: 1, borderStyle: 'solid',
                  background: tabCount === n ? 'rgba(255,48,96,0.12)' : 'rgba(255,255,255,0.04)',
                  color:      tabCount === n ? '#FF8FAA' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.12s',
                }}>
                {n} Tab
              </button>
            ))}
          </div>
        </div>
      )}

      {(showCount && showText) && <Divider />}

      {/* ③ Tab 文案（Tab 文案层 or 无激活层时显示） */}
      {showText && (
        <div>
          <SLabel>Tab 文案</SLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tabs.map((tab, i) => (
              <TabInput key={i} idx={i} value={tab} onChange={v => setTabText(i, v)} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
