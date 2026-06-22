/**
 * 老虎机左侧配置面板（已精简）
 * 配置逻辑主体已移至 SlotConfigBlocks.tsx，被 SlotPage 行内使用
 * 此面板保留作备用入口（目前 VenuePage 对 slot 隐藏此列）
 */
import { useState } from 'react'
import { useSlot, SLOT_PRESETS } from '@/contexts/SlotContext'
import { useVenue } from '@/contexts/VenueContext'
import {
  SlotColorConfig, SlotTextConfig, SlotEmptyConfig,
  SlotPrizeConfig, SlotDialogBtnConfig, SlotDialogBgConfig,
  InlineConfigSection,
} from './SlotConfigBlocks'

export default function SlotPanel() {
  return (
    <div className="py-2 space-y-1">
      <div className="px-4 py-3 border-b border-white/[0.07]">
        <span className="text-sm font-semibold text-white/90">老虎机</span>
        <p className="text-[10px] text-white/30 mt-0.5">配置已移至各素材区域下方</p>
      </div>
      <div className="px-4 py-3">
        <InlineConfigSection label="配色预设" badge="素材 1-5">
          <SlotColorConfig />
        </InlineConfigSection>
        <InlineConfigSection label="文案设置" badge="素材 2">
          <SlotTextConfig />
        </InlineConfigSection>
        <InlineConfigSection label="空态页设置" badge="素材 3">
          <SlotEmptyConfig />
        </InlineConfigSection>
        <InlineConfigSection label="奖品图设置" badge="素材 6">
          <SlotPrizeConfig />
        </InlineConfigSection>
        <InlineConfigSection label="弹窗按钮配色" badge="素材 7">
          <SlotDialogBtnConfig />
        </InlineConfigSection>
        <InlineConfigSection label="弹窗结果页配色" badge="素材 8">
          <SlotDialogBgConfig />
        </InlineConfigSection>
      </div>
    </div>
  )
}
