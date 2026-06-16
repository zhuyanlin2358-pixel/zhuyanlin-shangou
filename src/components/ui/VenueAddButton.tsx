/**
 * 会场操作按钮（加入 / 更新预览）
 * - 第一次：「加入会场」→ addItem（新增条目）
 * - 已在会场中（按 label 匹配）：「更新预览」→ updatePreview（刷新预览图）
 * - 仅在 page === 'venue' 时渲染
 */
import { useApp }   from '@/contexts/AppContext'
import { useVenue } from '@/contexts/VenueContext'
import type { ComponentId } from '@/types'

interface Props {
  componentId: ComponentId
  label: string         // 唯一标识该条目（同 label = 同条目）
  previewUrl: string    // 当前最新预览图 data URL
  origW?: number
  origH: number
}

export default function VenueAddButton({
  componentId, label, previewUrl, origW = 750, origH,
}: Props) {
  const { page, showToast }         = useApp()
  const { items, addItem, updatePreview } = useVenue()

  if (page !== 'venue' || !previewUrl) return null

  const inVenue = items.some(it => it.label === label)

  if (inVenue) {
    // 已在会场：点击 = 更新这条的预览图
    return (
      <button
        onClick={() => {
          updatePreview(label, previewUrl)
          showToast(`✅ 「${label}」预览已更新`)
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-all hover:opacity-90"
        style={{ background: '#6B7280' }}
        title="把当前最新配置同步到手机预览"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
        更新预览
      </button>
    )
  }

  // 未在会场：点击 = 加入
  return (
    <button
      onClick={() => {
        addItem({ componentId, label, previewUrl, origW, origH })
        showToast(`✅ 「${label}」已加入会场`)
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-all hover:opacity-90"
      style={{ background: '#2D78F4' }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M12 5v14M5 12h14"/>
      </svg>
      加入会场
    </button>
  )
}
