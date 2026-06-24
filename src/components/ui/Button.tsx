/**
 * Button — 统一按钮组件
 *
 * 参考 Linear / animate-ui 风格：
 * - 4种变体：default（主要）| outline（次要）| ghost（静默）| danger（破坏性）
 * - 3种尺寸：sm | md（默认）| lg
 * - icon 方形模式
 * - 轻微 scale 动画（motion/react）
 */
import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef } from 'react'

type Variant = 'default' | 'outline' | 'ghost' | 'danger' | 'primary'
type Size    = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(90deg,#FF3060,#FF6030)',
    color: '#fff',
    border: 'none',
  },
  default: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  outline: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.75)',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  ghost: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.55)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'rgba(239,68,68,0.1)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.2)',
  },
}

const SIZE_STYLES: Record<Size, React.CSSProperties> = {
  sm:   { height: 28, padding: '0 10px', fontSize: 11, fontWeight: 500, borderRadius: 7, gap: 5 },
  md:   { height: 34, padding: '0 14px', fontSize: 13, fontWeight: 500, borderRadius: 9, gap: 6 },
  lg:   { height: 42, padding: '0 20px', fontSize: 14, fontWeight: 600, borderRadius: 10, gap: 8 },
  icon: { height: 34, width: 34, padding: '0',  fontSize: 13, fontWeight: 500, borderRadius: 9, gap: 0 },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', loading, children, style, ...props }, ref) => {
    const vStyle = VARIANT_STYLES[variant]
    const sStyle = SIZE_STYLES[size]

    return (
      <motion.button
        ref={ref}
        whileHover={{ opacity: 0.9 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: props.disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          opacity: props.disabled ? 0.45 : 1,
          letterSpacing: '-0.01em',
          flexShrink: 0,
          ...vStyle,
          ...sStyle,
          ...style,
        }}
        {...props}
      >
        {loading ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
            style={{ animation: 'btnSpin 0.7s linear infinite' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        ) : children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
