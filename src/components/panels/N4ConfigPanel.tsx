import { useN4, N4_VARIANT_IDS, N4_VARIANTS } from '@/contexts/N4Context'

export default function N4ConfigPanel() {
  const { variant, contents, setVariant, setContent } = useN4()
  const isFullcut = variant.startsWith('fullcut')
  const meta = N4_VARIANTS[variant]

  return (
    <div className="p-4 space-y-5">
      <div>
        <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-1)' }}>
          N4 文字标签
        </div>
        <div className="text-xs mb-3" style={{ color: 'var(--text-3)' }}>
          240 × 156 px · 透明底 PNG
        </div>
      </div>

      {/* 变体选择 */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-2)' }}>标签样式</div>
        <div className="grid grid-cols-2 gap-1">
          {N4_VARIANT_IDS.map(id => (
            <button
              key={id}
              onClick={() => setVariant(id)}
              className="px-2 py-2 rounded-lg border text-xs font-medium transition-all"
              style={{
                borderColor: variant === id ? '#E63129' : 'var(--border)',
                background: variant === id ? 'rgba(230,49,41,0.06)' : 'var(--bg)',
                color: variant === id ? '#E63129' : 'var(--text-2)',
              }}
            >
              {N4_VARIANTS[id].label}
            </button>
          ))}
        </div>
      </div>

      {/* 文案输入 */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-2)' }}>
          {isFullcut ? '减后金额' : '文案内容'}
        </div>
        <input
          type="text"
          value={contents[variant]}
          onChange={e => setContent(variant, e.target.value)}
          placeholder={meta.hint}
          maxLength={meta.maxLen}
          className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-colors"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            color: 'var(--text-1)',
          }}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{meta.hint}</p>
      </div>
    </div>
  )
}
