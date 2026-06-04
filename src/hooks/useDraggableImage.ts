import { useRef, useState, useCallback, useEffect } from 'react'

interface DragState {
  offsetX: number
  offsetY: number
  scale: number
}

const DEFAULT: DragState = { offsetX: 0, offsetY: 0, scale: 1 }

export function useDraggableImage(minScale = 0.1, maxScale = 4) {
  const [state, setState] = useState<DragState>(DEFAULT)
  const dragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startOffset = useRef({ x: 0, y: 0 })

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    startPos.current = { x: e.clientX, y: e.clientY }
    startOffset.current = { x: state.offsetX, y: state.offsetY }
    e.preventDefault()
  }, [state.offsetX, state.offsetY])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setState(prev => ({
        ...prev,
        offsetX: startOffset.current.x + (e.clientX - startPos.current.x),
        offsetY: startOffset.current.y + (e.clientY - startPos.current.y),
      }))
    }
    const onUp = () => { dragging.current = false }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.05 : 0.05
    setState(prev => ({
      ...prev,
      scale: Math.min(maxScale, Math.max(minScale, prev.scale + delta)),
    }))
  }, [minScale, maxScale])

  const setScale = useCallback((s: number) => {
    setState(prev => ({ ...prev, scale: s }))
  }, [])

  const reset = useCallback(() => {
    setState(DEFAULT)
  }, [])

  const imgStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(calc(-50% + ${state.offsetX}px), calc(-50% + ${state.offsetY}px)) scale(${state.scale})`,
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain',
    userSelect: 'none',
    display: 'block',
  }

  return { state, imgStyle, onMouseDown, onWheel, setScale, reset }
}
