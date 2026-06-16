/**
 * 「加入会场」按钮
 * 只在 page === 'venue' 时渲染，点击将当前预览图加入 VenueContext
 */
import { useApp }   from '@/contexts/AppContext'
import { useVenue } from '@/contexts/VenueContext'
import type { ComponentId } from '@/types'

interface Props {
  componentId: ComponentId
  label: string       // 展示名
  previewUrl: string  // 当前预览图 data URL
  origW?: number      // 设计稿宽度，默认 750
  origH: number       // 设计稿高度（px）
}

export default function VenueAddButton({
  componentId, label, previewUrl, origW = 750, origH,
}: Props) {
  const { page, showToast } = useApp()
  const { addItem, items }  = useVenue()

  if (page !== 'venue' || !previewUrl) return null

  const exists = items.some(it => it.label === label)

  return (
    <button
      onClick={() => {
        addItem({ componentId, label, previewUrl, origW, origH })
        showToast(`✅ 「${label}」已加入会场`)
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-all hover:opacity-90"
      style={{ background: exists ? '#7D5AC0' : '#2D78F4' }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M12 5v14M5 12h14"/>
      </svg>
      {exists ? '再次加入会场' : '加入会场'}
    </button>
  )
}
