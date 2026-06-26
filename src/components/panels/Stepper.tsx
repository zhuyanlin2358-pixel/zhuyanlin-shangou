import { useSlot } from '@/contexts/SlotContext'

const STEPS = [
  { label: '选配色', section: 'slot-section-1' },
  { label: '设文案', section: 'slot-section-2' },
  { label: '配奖品', section: 'slot-section-6' },
  { label: '导出',   section: 'slot-section-1' },
]

export default function Stepper() {
  const { activeStep, setActiveStep } = useSlot()

  const goToStep = (n: number) => {
    setActiveStep(n)
    const sectionId = STEPS[n - 1].section
    const el = document.getElementById(sectionId)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (n === 4) {
      // toast hint
      const e = new CustomEvent('show-toast', { detail: '步骤 4：点击各素材卡片右下角「⬇ 导出」，或顶栏「完成设计并下载」' })
      window.dispatchEvent(e)
    }
  }

  return (
    <div style={{
      padding: '16px 40px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {STEPS.map((step, i) => {
          const n = i + 1
          const isDone = activeStep > n
          const isActive = activeStep === n
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', flex: i < STEPS.length - 1 ? '1' : 'none' }}>
              {/* Step */}
              <div
                onClick={() => goToStep(n)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0, minWidth: 60 }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, position: 'relative', transition: 'all 0.3s',
                  background: isDone ? 'rgba(255,48,96,0.25)' : isActive ? 'rgba(255,48,96,0.18)' : 'rgba(255,255,255,0.07)',
                  border: (isDone || isActive) ? '1.5px solid rgba(255,48,96,0.55)' : '1.5px solid rgba(255,255,255,0.15)',
                  color: isDone ? 'transparent' : isActive ? '#FF8FAA' : 'rgba(255,255,255,0.3)',
                }}>
                  {isDone
                    ? <span style={{ position: 'absolute', width: 10, height: 6, borderLeft: '2px solid #FF8FAA', borderBottom: '2px solid #FF8FAA', transform: 'rotate(-45deg) translate(1px,-1px)' }} />
                    : n
                  }
                </div>
                <div style={{
                  fontSize: 12, fontWeight: isActive ? 600 : 500, textAlign: 'center', whiteSpace: 'nowrap', transition: 'color 0.3s',
                  color: isDone ? 'rgba(255,140,165,0.65)' : isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.28)',
                }}>
                  {step.label}
                </div>
              </div>
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1.5, background: 'rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden', margin: '14px 4px 0' }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, height: '100%', transition: 'width 0.4s ease',
                    background: 'rgba(255,48,96,0.7)', width: isDone ? '100%' : '0%',
                  }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
