/**
 * 会场操作按钮（加入 / 更新预览）
 *
 * 匹配优先级：sourceId（稳定，不随改色/改数量变化）> label
 * 用于 HTab：首次加入自动打 Tab1/Tab2 序号，后续用 sourceId 定位更新
 */
import { useApp }   from '@/contexts/AppContext'
import { useVenue } from '@/contexts/VenueContext'
import type { ComponentId } from '@/types'

interface Props {
  componentId: ComponentId
  label: string           // 展示名
  previewUrl: string      // 当前最新预览图 data URL
  origW?: number
  origH: number
  sourceId?: string       // 来源实例 ID（HTabItem.id 等），传入可稳定匹配
}

export default function VenueAddButton({
  componentId, label, previewUrl, origW = 750, origH, sourceId,
}: Props) {
  const { page, showToast } = useApp()
  const { items, addItem, updatePreview } = useVenue()

  if (page !== 'venue' || !previewUrl) return null

  // 按 sourceId（优先）或 label 查找已有条目
  const existingItem = sourceId
    ? items.find(it => it.sourceId === sourceId)
    : items.find(it => it.label === label)

  if (existingItem) {
    // 已在会场 → 更新预览
    return (
      <button
        onClick={() => {
          updatePreview(
            sourceId ? { sourceId } : { label },
            previewUrl,
          )
          showToast(`✅ 「${existingItem.label}」预览已更新`)
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-all hover:opacity-90"
        style={{ background: '#6B7280' }}
        title={`更新「${existingItem.label}」的预览图`}
      >
        {/* 刷新图标 */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
        </svg>
        更新预览 · {existingItem.label}
      </button>
    )
  }

  // 未在会场 → 加入，HTab 自动分配序号
  const getTabLabel = () => {
    if (componentId !== 'h-tab') return label
    const tabCount = items.filter(it => it.componentId === 'h-tab').length
    return `Tab ${tabCount + 1}`
  }

  const finalLabel = getTabLabel()

  return (
    <button
      onClick={() => {
        addItem({ componentId, label: finalLabel, previewUrl, origW, origH, sourceId })
        showToast(`✅ 「${finalLabel}」已加入会场`)
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:opacity-90"
      style={{ background: 'var(--sl-primary-grad)', color: 'var(--sl-cta-text)' }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M12 5v14M5 12h14"/>
      </svg>
      加入会场
    </button>
  )
}
