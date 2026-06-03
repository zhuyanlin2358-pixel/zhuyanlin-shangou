import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function usePageEnter() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.from(ref.current, { opacity: 0, x: 24, duration: 0.38, ease: 'power2.out', clearProps: 'all' })
  }, [])
  return ref
}

export function useHomeEnter() {
  useEffect(() => {
    gsap.from('.home-greeting, .home-sub', { opacity: 0, y: -14, duration: 0.5, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.home-steps',  { opacity: 0, y: 8,  duration: 0.4, delay: 0.08, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.ai-promo-card', { opacity: 0, y: 10, duration: 0.5, delay: 0.15, ease: 'power2.out', clearProps: 'all' })
    gsap.from('.home-section', { opacity: 0, y: 22, duration: 0.45, stagger: 0.07, delay: 0.15, ease: 'power2.out', clearProps: 'all' })
  }, [])
}

export function useSlotEnter() {
  useEffect(() => {
    gsap.from('.slot-section-header', { opacity: 0, y: 16, duration: 0.4, stagger: 0.07, delay: 0.15, ease: 'power2.out', clearProps: 'all' })
  }, [])
}
