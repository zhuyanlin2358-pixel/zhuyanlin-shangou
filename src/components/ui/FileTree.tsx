/**
 * FileTree — 文件树基础组件
 *
 * 参考 shadcn/animate-ui sidebar 风格精致化：
 * - 36px 行高，rounded hover/active
 * - 左侧激活条 + 背景高亮
 * - 展开子节点带缩进指示线 + framer-motion 高度动画
 * - FolderItem chevron 旋转动画
 * - section 标签统一排版
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// ── Token ────────────────────────────────────────────────────────────────────
const T = {
  activeBg:   'rgba(255,255,255,0.09)',
  hoverBg:    'rgba(255,255,255,0.05)',
  activeText: 'rgba(255,255,255,0.95)',
  mutedText:  'rgba(255,255,255,0.55)',
  dimText:    'rgba(255,255,255,0.28)',
  accentLine: 'rgba(255,255,255,0.65)',
  indent:     'rgba(255,255,255,0.07)',
}

// ── FileItem ──────────────────────────────────────────────────────────────────
export interface FileItemProps {
  label:    string
  icon?:    React.ReactNode
  active?:  boolean
  badge?:   string | number
  action?:  React.ReactNode
  depth?:   number
  onClick?: () => void
  sublabel?: string
}

export function FileItem({
  label, icon, active, badge, action, depth = 0, onClick, sublabel,
}: FileItemProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center gap-2 select-none cursor-pointer"
      style={{
        height: 34,
        paddingLeft: 10 + depth * 16,
        paddingRight: 6,
        borderRadius: 8,
        background: active ? T.activeBg : hovered ? T.hoverBg : 'transparent',
        color: active ? T.activeText : T.mutedText,
        marginBottom: 1,
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      {/* 激活指示条 */}
      {active && (
        <div style={{
          position: 'absolute', left: 0, top: '18%', bottom: '18%',
          width: 2.5, background: T.accentLine, borderRadius: 2,
        }} />
      )}

      {/* 图标 */}
      {icon && (
        <span style={{ flexShrink: 0, display: 'flex', opacity: active ? 0.9 : 0.45 }}>
          {icon}
        </span>
      )}

      {/* 文字区 */}
      <div className="flex-1 min-w-0">
        <div style={{
          fontSize: 12.5, fontWeight: active ? 600 : 400,
          lineHeight: 1.3, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{
            fontSize: 10, color: T.dimText,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}>
            {sublabel}
          </div>
        )}
      </div>

      {/* 角标 */}
      {badge !== undefined && (
        <span style={{
          fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.32)',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 4, padding: '1px 5px', flexShrink: 0,
        }}>
          {badge}
        </span>
      )}

      {/* 操作（hover/active 时渐显）*/}
      {action && (
        <div style={{
          flexShrink: 0, opacity: hovered || active ? 1 : 0,
          transition: 'opacity 0.14s',
        }}>
          {action}
        </div>
      )}
    </div>
  )
}

// ── FolderItem（可展开/折叠）─────────────────────────────────────────────────
export interface FolderItemProps {
  label:         string
  icon?:         React.ReactNode
  activeFolder?: boolean
  badge?:        string | number
  action?:       React.ReactNode
  depth?:        number
  defaultOpen?:  boolean
  children?:     React.ReactNode
  sublabel?:     string
  onSelect?:     () => void
}

export function FolderItem({
  label, icon, activeFolder, badge, depth = 0,
  defaultOpen = false, children, sublabel, onSelect,
}: FolderItemProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [hovered, setHovered] = useState(false)
  const hasKids = !!children

  return (
    <div>
      <div
        onClick={() => { setOpen(o => !o); onSelect?.() }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex items-center gap-2 select-none cursor-pointer"
        style={{
          height: 34,
          paddingLeft: 10 + depth * 16,
          paddingRight: 6,
          borderRadius: 8,
          background: activeFolder ? T.activeBg : hovered ? T.hoverBg : 'transparent',
          color: activeFolder ? T.activeText : T.mutedText,
          marginBottom: 1,
          transition: 'background 0.12s, color 0.12s',
        }}
      >
        {activeFolder && (
          <div style={{
            position: 'absolute', left: 0, top: '18%', bottom: '18%',
            width: 2.5, background: T.accentLine, borderRadius: 2,
          }} />
        )}

        {/* Chevron */}
        {hasKids && (
          <motion.span
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            style={{ display: 'flex', flexShrink: 0, opacity: 0.32 }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 6l4 4 4-4"/>
            </svg>
          </motion.span>
        )}

        {icon && (
          <span style={{ flexShrink: 0, display: 'flex', opacity: activeFolder ? 0.9 : 0.45 }}>
            {icon}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <div style={{
            fontSize: 12.5, fontWeight: activeFolder ? 600 : 400,
            lineHeight: 1.3, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {label}
          </div>
          {sublabel && (
            <div style={{ fontSize: 10, color: T.dimText, lineHeight: 1.3 }}>
              {sublabel}
            </div>
          )}
        </div>

        {badge !== undefined && (
          <span style={{
            fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.32)',
            background: 'rgba(255,255,255,0.07)',
            borderRadius: 4, padding: '1px 5px', flexShrink: 0,
          }}>
            {badge}
          </span>
        )}
      </div>

      {/* 展开内容（高度动画）*/}
      <AnimatePresence initial={false}>
        {open && hasKids && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ position: 'relative', paddingLeft: 10 + depth * 16 + 22 }}>
              {/* 缩进线 */}
              <div style={{
                position: 'absolute',
                left: 10 + depth * 16 + 10,
                top: 4, bottom: 6,
                width: 1.5,
                background: T.indent,
                borderRadius: 1,
              }} />
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── TreeSection ───────────────────────────────────────────────────────────────
export function TreeSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 10, fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.2)',
        padding: '0 10px',
        marginBottom: 3,
        lineHeight: '26px',
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

// ── FileTree（根容器）────────────────────────────────────────────────────────
export function FileTree({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '2px 4px' }}>{children}</div>
}
