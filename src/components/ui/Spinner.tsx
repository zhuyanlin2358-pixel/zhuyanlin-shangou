/**
 * Spinner — 统一加载动画
 * 参考 Ant Design Spin 三档规格：sm=14 / md=20 / lg=32
 * 不依赖 antd，纯 CSS border-spin 实现
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string   // 可选文字说明（显示在圈下方）
}

const SIZE_MAP = { sm: 14, md: 20, lg: 32 } as const

export default function Spinner({ size = 'md', label }: SpinnerProps) {
  const px = SIZE_MAP[size]
  const border = size === 'sm' ? 1.5 : size === 'md' ? 2 : 3

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: px, height: px, borderRadius: '50%',
        border: `${border}px solid rgba(250,217,0,0.15)`,
        borderTopColor: 'rgba(250,217,0,0.7)',
        animation: 'btnSpin 0.65s linear infinite',
        flexShrink: 0,
      }} />
      {label && (
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.02em' }}>
          {label}
        </span>
      )}
    </div>
  )
}
