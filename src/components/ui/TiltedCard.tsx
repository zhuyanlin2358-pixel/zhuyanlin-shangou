/**
 * TiltedCard — 鼠标跟随倾斜卡片
 * 来源：https://reactbits.dev/components/tilted-card
 * 依赖：motion（已安装 v12）
 */
import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

const springValues = { damping: 30, stiffness: 100, mass: 2 }

export interface TiltedCardProps {
  imageSrc?: string
  altText?: string
  captionText?: string
  containerHeight?: string
  containerWidth?: string
  imageHeight?: string
  imageWidth?: string
  scaleOnHover?: number
  rotateAmplitude?: number
  showMobileWarning?: boolean
  showTooltip?: boolean
  overlayContent?: React.ReactNode
  displayOverlayContent?: boolean
  /** 替代 imageSrc，直接放子内容（自定义卡片体） */
  children?: React.ReactNode
  borderRadius?: string
}

export default function TiltedCard({
  imageSrc,
  altText          = 'Tilted card image',
  captionText      = '',
  containerHeight  = '300px',
  containerWidth   = '100%',
  imageHeight      = '300px',
  imageWidth       = '300px',
  scaleOnHover     = 1.05,
  rotateAmplitude  = 14,
  showMobileWarning = false,
  showTooltip      = true,
  overlayContent   = null,
  displayOverlayContent = false,
  children,
  borderRadius     = '15px',
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale   = useSpring(1, springValues)
  const opacity = useSpring(0)
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 })

  const [lastY, setLastY] = useState(0)

  function handleMouse(e: React.MouseEvent<HTMLElement>) {
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

  return (
    <figure
      ref={ref}
      style={{
        position: 'relative',
        width: containerWidth,
        height: containerHeight,
        perspective: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div style={{ position: 'absolute', top: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
          This effect is not optimized for mobile.
        </div>
      )}

      <motion.div
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
          position: 'relative',
        }}
      >
        {/* 图片模式 */}
        {imageSrc && (
          <motion.img
            src={imageSrc}
            alt={altText}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: imageWidth, height: imageHeight,
              objectFit: 'cover',
              borderRadius,
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          />
        )}

        {/* 自定义内容模式 */}
        {children && (
          <div style={{
            width: '100%', height: '100%',
            borderRadius,
            overflow: 'hidden',
            position: 'relative',
          }}>
            {children}
          </div>
        )}

        {/* 可选叠层 */}
        {displayOverlayContent && overlayContent && (
          <motion.div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, transform: 'translateZ(30px)' }}>
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {/* tooltip */}
      {showTooltip && captionText && (
        <motion.figcaption
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            left: 0, top: 0,
            borderRadius: 4,
            backgroundColor: '#fff',
            padding: '4px 10px',
            fontSize: 10,
            color: '#2d2d2d',
            opacity,
            rotate: rotateFigcaption,
            x, y,
            zIndex: 3,
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  )
}
