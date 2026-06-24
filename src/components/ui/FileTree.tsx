/**
 * FileTree — 文件树组件
 *
 * 参考 animate-ui Files + Linear 左侧导航风格。
 * 用于替换简单列表的层级结构（工作室结构树、图层面板等）。
 *
 * 特性：
 * - 展开/收起动画（framer-motion height 过渡）
 * - 缩进指示线
 * - 激活状态高亮
 * - 支持 badge/action
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// ── 单个文件项 ────────────────────────────────────────────────────────────────
export interface FileItemProps {
  label: string
  icon?: React.ReactNode
  active?: boolean
  badge?: string | number
  action?: React.ReactNode
  depth?: number
  onClick?: () => void
  sublabel?: string
}

export function FileItem({
  label, icon, active, badge, action, depth = 0, onClick, sublabel,
}: FileItemProps) {
  return (
    <div
      onClick={onClick}
      className="group relative flex items-center gap-2 select-none cursor-pointer transition-all"
      style={{
        paddingLeft: 12 + depth * 14,
        paddingRight: 8,
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 7,
        background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: active ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.62)',
        marginBottom: 1,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {/* 激活指示条 */}
      {active && (
        <div style={{
          position: 'absolute', left: 0, top: '20%', bottom: '20%',
          width: 2, background: '#fff', borderRadius: 2, opacity: 0.7,
        }} />
      )}

      {/* 图标 */}
      {icon && (
        <span style={{ flexShrink: 0, opacity: active ? 0.9 : 0.5, display: 'flex' }}>
          {icon}
        </span>
      )}

      {/* 文字 */}
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 12, fontWeight: active ? 500 : 400, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sublabel}
          </div>
        )}
      </div>

      {/* 角标 */}
      {badge !== undefined && (
        <span style={{
          fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.35)',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 4, padding: '1px 5px', flexShrink: 0,
        }}>
          {badge}
        </span>
      )}

      {/* 操作按钮（hover 显示） */}
      {action && (
        <div style={{ flexShrink: 0, opacity: 0 }} className="group-hover:opacity-100 transition-opacity">
          {action}
        </div>
      )}
    </div>
  )
}

// ── 文件夹项（可展开）──────────────────────────────────────────────────────────
export interface FolderItemProps {
  label: string
  icon?: React.ReactNode
  activeFolder?: boolean
  badge?: string | number
  action?: React.ReactNode
  depth?: number
  defaultOpen?: boolean
  children?: React.ReactNode
  sublabel?: string
  onSelect?: () => void
}

export function FolderItem({
  label, icon, activeFolder, badge, action, depth = 0,
  defaultOpen = false, children, sublabel, onSelect,
}: FolderItemProps) {
  const [open, setOpen] = useState(defaultOpen)
  const hasChildren = !!children

  return (
    <div>
      <div
        onClick={() => { setOpen(o => !o); onSelect?.() }}
        className="group relative flex items-center gap-2 select-none cursor-pointer transition-all"
        style={{
          paddingLeft: 12 + depth * 14,
          paddingRight: 8,
          paddingTop: 5,
          paddingBottom: 5,
          borderRadius: 7,
          background: activeFolder ? 'rgba(255,255,255,0.08)' : 'transparent',
          color: activeFolder ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.62)',
          marginBottom: 1,
        }}
        onMouseEnter={e => { if (!activeFolder) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
        onMouseLeave={e => { if (!activeFolder) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        {activeFolder && (
          <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2, background: '#fff', borderRadius: 2, opacity: 0.7 }} />
        )}

        {/* Chevron */}
        {hasChildren && (
          <motion.span
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            style={{ display: 'flex', flexShrink: 0, opacity: 0.35 }}
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 6l4 4 4-4"/>
            </svg>
          </motion.span>
        )}

        {/* 图标 */}
        {icon && <span style={{ flexShrink: 0, opacity: activeFolder ? 0.9 : 0.5, display: 'flex' }}>{icon}</span>}

        {/* 文字 */}
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 12, fontWeight: activeFolder ? 500 : 400, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </div>
          {sublabel && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{sublabel}</div>
          )}
        </div>

        {badge !== undefined && (
          <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>
            {badge}
          </span>
        )}

        {action && (
          <div style={{ flexShrink: 0, opacity: 0 }} className="group-hover:opacity-100 transition-opacity">{action}</div>
        )}
      </div>

      {/* 子内容 */}
      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {/* 缩进指示线 */}
            <div style={{ position: 'relative', paddingLeft: 12 + depth * 14 + 20 }}>
              <div style={{
                position: 'absolute',
                left: 12 + depth * 14 + 8,
                top: 0, bottom: 8,
                width: 1,
                background: 'rgba(255,255,255,0.08)',
              }} />
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── 分组标题 ──────────────────────────────────────────────────────────────────
export function TreeSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.22)', padding: '0 12px', marginBottom: 4,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

// ── 根容器 ────────────────────────────────────────────────────────────────────
export function FileTree({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: '4px 4px' }}>{children}</div>
}
