/**
 * TiltedCard — 鼠标跟随倾斜卡片
 * 来源：https://reactbits.dev/components/tilted-card
 * 依赖：motion（已安装 v12）
 *
 * 支持两种模式：
 * 1. imageSrc 模式：固定尺寸图片，居中显示
 * 2. children 模式：自适应高度，直接包裹任意内容
 */
import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

const springValues = { damping: 30, stiffness: 100, mass: 2 }

export interface TiltedCardProps {
  // ── image 模式 ──────────────────────────────────────────────────────────────
  imageSrc?: string
  altText?: string
  imageHeight?: string
  imageWidth?: string
  // ── children 模式 ───────────────────────────────────────────────────────────
  children?: React.ReactNode
  // ── 通用 ────────────────────────────────────────────────────────────────────
  captionText?: string
  containerWidth?: string | number
  scaleOnHover?: number
  rotateAmplitude?: number
  showMobileWarning?: boolean
  showTooltip?: boolean
  overlayContent?: React.ReactNode
  displayOverlayContent?: boolean
  borderRadius?: string | number
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
}

export default function TiltedCard({
  imageSrc,
  altText          = 'card image',
  imageHeight      = '300px',
  imageWidth       = '300px',
  children,
  captionText      = '',
  containerWidth   = '100%',
  scaleOnHover     = 1.05,
  rotateAmplitude  = 14,
  showMobileWarning = false,
  showTooltip      = false,
  overlayContent   = null,
  displayOverlayContent = false,
  borderRadius     = 16,
  style,
  className,
  onClick,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale   = useSpring(1, springValues)
  const opacity = useSpring(0)
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 })

  const [lastY, setLastY] = useState(0)

  // children 模式：自适应高度，不需要固定 imageHeight
  const isChildMode = Boolean(children)

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return
    const rect    = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left  - rect.width  / 2
    const offsetY = e.clientY - rect.top   - rect.height / 2

    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude)
    rotateY.set((offsetX / (rect.width  / 2)) *  rotateAmplitude)

    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)

    rotateFigcaption.set(-(offsetY - lastY) * 0.6)
    setLastY(offsetY)
  }

  function handleMouseEnter() { scale.set(scaleOnHover); opacity.set(1) }

  function handleMouseLeave() {
    opacity.set(0); scale.set(1)
    rotateX.set(0); rotateY.set(0); rotateFigcaption.set(0)
  }

  const br = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'relative',
        width: containerWidth,
        perspective: '800px',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {showMobileWarning && (
        <div style={{ position: 'absolute', top: '1rem', textAlign: 'center', fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}>
          效果在桌面端更佳
        </div>
      )}

      {/* ── children 模式（卡片内容自适应高度） ── */}
      {isChildMode && (
        <motion.div
          style={{
            width: '100%',
            rotateX, rotateY, scale,
            transformStyle: 'preserve-3d',
            borderRadius: br,
            overflow: 'hidden',
            willChange: 'transform',
          }}
        >
          {children}
        </motion.div>
      )}

      {/* ── image 模式（固定尺寸图片） ── */}
      {!isChildMode && imageSrc && (
        <motion.div
          style={{
            width: imageWidth,
            height: imageHeight,
            rotateX, rotateY, scale,
            transformStyle: 'preserve-3d',
            position: 'relative',
            margin: '0 auto',
          }}
        >
          <img
            src={imageSrc}
            alt={altText}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              borderRadius: br,
              willChange: 'transform',
            }}
          />
          {displayOverlayContent && overlayContent && (
            <motion.div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, transform: 'translateZ(30px)' }}>
              {overlayContent}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* tooltip */}
      {showTooltip && captionText && (
        <motion.div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            left: 0, top: 0,
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.75)',
            padding: '4px 10px',
            fontSize: 11,
            color: '#fff',
            opacity,
            rotate: rotateFigcaption,
            x, y,
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          {captionText}
        </motion.div>
      )}
    </div>
  )
}
