import { useN4, N4_VARIANT_IDS, N4_VARIANTS } from '@/contexts/N4Context'
import { PF, PanelInput, PanelSection } from '@/components/ui/PanelField'

export default function N4ConfigPanel() {
  const { variant, contents, setVariant, setContent } = useN4()
  const isFullcut = variant.startsWith('fullcut')
  const meta = N4_VARIANTS[variant]

  return (
    <div className="px-4 py-4 space-y-5">
      <PanelSection legend="N4 文字标签" desc="240 × 156 px · 透明底 PNG">

        {/* 标签样式 */}
        <PF label="标签样式">
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            {N4_VARIANT_IDS.map(id => (
              <button
                key={id}
                onClick={() => setVariant(id)}
                className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all border"
                style={{
                  borderColor: variant === id ? 'rgba(255,48,96,0.6)' : 'rgba(255,255,255,0.1)',
                  background:  variant === id ? 'rgba(255,48,96,0.12)' : 'rgba(255,255,255,0.04)',
                  color:       variant === id ? '#FF8FAA' : 'rgba(255,255,255,0.5)',
                }}
              >
                {N4_VARIANTS[id].label}
              </button>
            ))}
          </div>
        </PF>

        {/* 文案内容 */}
        <PF
          label={isFullcut ? '减后金额' : '文案内容'}
          desc={meta.hint}
        >
          <PanelInput
            type="text"
            value={contents[variant]}
            onChange={e => setContent(variant, e.target.value)}
            placeholder={meta.hint}
            maxLength={meta.maxLen}
          />
        </PF>

      </PanelSection>
    </div>
  )
}
