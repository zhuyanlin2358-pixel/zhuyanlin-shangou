/**
 * 老虎机画布视图（原型 S3）
 * 三列：组件库 | 画布预览（可点击） | 动态属性面板
 * 点击预览里的元素 → 右侧属性面板切换对应配置
 * 点「进入设计工作室」→ 进入 SlotPage 精细模式
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Settings } from 'lucide-react'
import { useSlot } from '@/contexts/SlotContext'
import { useApp } from '@/contexts/AppContext'
import { findComponent, VENUE_COMP_IDS } from '@/types'
import {
  drawSlotBannerCanvas, drawPrizeCanvas, preloadFonts, isFontsReady,
} from '@/utils/exportUtils'
import type { PrizeInfo, XfTransform } from '@/utils/exportUtils'
import {
  SlotColorConfig, SlotTextConfig, SlotDialogBtnConfig,
} from '@/components/panels/SlotConfigBlocks'
import { PanelInput, PF } from '@/components/ui/PanelField'

// 可点击区域（基于 750×242 坐标系的百分比）
const CLICK_ZONES = {
  title:  { left: '3.2%',  top: '4.5%', width: '29%', height: '26%' },
  cards:  { left: '5.7%',  top: '31%',  width: '57%', height: '59%' },
  button: { left: '66.5%', top: '43%',  width: '26%', height: '33%' },
}

type AttrMode = 'default' | 'title' | 'button' | 'prize' | 'cards'

interface Props {
  onEnterStudio: () => void
}

export default function SlotCanvasView({ onEnterStudio }: Props) {
  const { config, setConfig } = useSlot()
  const { enterComp, currentComp } = useApp()

  const [previewUrl, setPreviewUrl] = useState('')
  const [activeAttr, setActiveAttr] = useState<AttrMode>('default')
  const bannerTimer = useRef<ReturnType<typeof setTimeout>>()

  // 渲染老虎机 banner（和 SlotPage 用同一套逻辑）
  const buildPreview = useCallback(async () => {
    try {
      const pcs = await Promise.all(
        config.prizes.map((p, i) =>
          drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)
        )
      )
      const canvas = await drawSlotBannerCanvas(config, pcs)
      setPreviewUrl(canvas.toDataURL())
    } catch { /* 渲染失败静默 */ }
  }, [config])

  useEffect(() => {
    clearTimeout(bannerTimer.current)
    bannerTimer.current = setTimeout(buildPreview, 400)
  }, [buildPreview])

  useEffect(() => {
    if (!isFontsReady()) preloadFonts().then(buildPreview)
    return () => clearTimeout(bannerTimer.current)
  }, [])

  // 点击可点击区域
  const handleZoneClick = (zone: AttrMode) => {
    setActiveAttr(zone)
  }

  // 点击其他区域重置
  const handleCanvasClick = () => setActiveAttr('default')

  return (
    <div className="flex h-full">

      {/* ── 左：组件库 ────────────────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 border-r overflow-y-auto"
        style={{ width: 160, background: '#0C111B', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="px-3 pt-3 pb-1 text-[9px] tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>
          常用组件
        </div>

        {VENUE_COMP_IDS.map(id => {
          const comp = findComponent(id)
          const isActive = currentComp === id
          return (
            <button
              key={id}
              onClick={() => enterComp(id)}
              className="flex items-center gap-2 px-3 py-2 mx-2 my-0.5 rounded-lg text-left transition-all text-xs"
              style={{
                background: isActive ? 'rgba(255,48,96,0.12)' : 'transparent',
                borderLeft: isActive ? '2px solid #FF3060' : '2px solid transparent',
                color: isActive ? '#FF8FAA' : 'rgba(255,255,255,0.5)',
                fontWeight: isActive ? 600 : 400,
                borderRadius: isActive ? '0 8px 8px 0' : 8,
                marginLeft: isActive ? 0 : 8,
                paddingLeft: isActive ? 10 : 12,
              }}
            >
              {comp?.name ?? id}
            </button>
          )
        })}

        <div className="px-3 pt-3 pb-1 text-[9px] tracking-wider mt-2" style={{ color: 'rgba(255,255,255,0.15)' }}>
          素材列表
        </div>
        {['① 未抽奖状态', '② 背景切图', '③ 空态页', '④⑤ 按钮×2', '⑥ 奖品图×3', '⑦ 弹窗按钮', '⑧ 弹窗结果页'].map(label => (
          <div key={label} className="px-3 py-1 text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {label}
          </div>
        ))}

        <div className="mt-auto px-2 pb-3">
          <button
            onClick={onEnterStudio}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)', color: '#fff' }}
          >
            <Settings size={12} />
            设计工作室
          </button>
        </div>
      </aside>

      {/* ── 中：画布预览 ──────────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#111827', position: 'relative', padding: '24px 32px' }}
      >
        <div className="text-[10px] mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
          画布预览 · 点击元素直接配置
        </div>

        {/* 老虎机预览 + 可点击区域叠层 */}
        <div
          style={{ position: 'relative', maxWidth: 600, width: '100%', cursor: 'pointer' }}
          onClick={handleCanvasClick}
        >
          {/* 实际 Canvas 渲染图 */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="老虎机预览"
              style={{ width: '100%', height: 'auto', borderRadius: 16, display: 'block' }}
              draggable={false}
            />
          ) : (
            <div
              style={{
                width: '100%', aspectRatio: '750/242', borderRadius: 16,
                background: `linear-gradient(120deg, ${config.slotTintFrom}, ${config.slotTintTo})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: 'rgba(255,255,255,0.5)',
              }}
            >
              渲染中…
            </div>
          )}

          {/* 可点击叠层区域 */}
          {Object.entries(CLICK_ZONES).map(([zone, style]) => (
            <div
              key={zone}
              onClick={e => { e.stopPropagation(); handleZoneClick(zone as AttrMode) }}
              style={{
                position: 'absolute',
                ...style,
                cursor: 'pointer',
                borderRadius: 6,
                border: activeAttr === zone
                  ? '2px solid rgba(255,200,0,0.8)'
                  : '2px solid transparent',
                background: activeAttr === zone
                  ? 'rgba(255,200,0,0.08)'
                  : 'transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (activeAttr !== zone) {
                  (e.currentTarget as HTMLElement).style.border = '2px solid rgba(255,200,0,0.4)'
                }
              }}
              onMouseLeave={e => {
                if (activeAttr !== zone) {
                  (e.currentTarget as HTMLElement).style.border = '2px solid transparent'
                }
              }}
            />
          ))}
        </div>

        {/* 提示 */}
        <div className="mt-3 text-[10px]" style={{ color: 'rgba(255,200,0,0.5)' }}>
          {activeAttr === 'default' && '💡 点击预览中的文案 / 奖品图 / 按钮，右侧自动切换配置'}
          {activeAttr === 'title'   && '✏️ 已选中：标题文案区域'}
          {activeAttr === 'cards'   && '🎁 已选中：奖品图区域'}
          {activeAttr === 'button'  && '🔘 已选中：立即抽奖按钮'}
        </div>
      </div>

      {/* ── 右：动态属性面板 ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col shrink-0 border-l overflow-y-auto"
        style={{ width: 260, background: '#161B22', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        {/* 面板标题 */}
        <div className="px-4 py-3 border-b text-[11px] font-semibold" style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
          {activeAttr === 'default' && '设计属性'}
          {activeAttr === 'title'   && '✏️ 标题文案'}
          {activeAttr === 'cards'   && '🎁 奖品图配置'}
          {activeAttr === 'button'  && '🔘 按钮配置'}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* 默认：配色 + 主标题 */}
          {activeAttr === 'default' && (
            <div className="space-y-3">
              <SlotColorConfig />
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <PF label="主标题">
                <PanelInput
                  value={config.titleText}
                  onChange={e => setConfig({ titleText: e.target.value })}
                  placeholder="天天抽免单"
                />
              </PF>
            </div>
          )}

          {/* 标题文案 */}
          {activeAttr === 'title' && <SlotTextConfig />}

          {/* 奖品图 */}
          {activeAttr === 'cards' && (
            <div className="space-y-2">
              <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                奖品图在设计工作室里配置（支持上传商品图）
              </div>
              <button
                onClick={onEnterStudio}
                className="w-full py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'rgba(255,48,96,0.1)', border: '1px solid rgba(255,48,96,0.3)', color: '#FF8FAA' }}
              >
                → 进入设计工作室配置奖品图
              </button>
            </div>
          )}

          {/* 按钮配色 */}
          {activeAttr === 'button' && <SlotDialogBtnConfig />}

        </div>

        {/* 进入设计工作室（始终可见） */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <button
            onClick={onEnterStudio}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg,#FF3060,#FF6030)', color: '#fff' }}
          >
            <Settings size={14} />
            进入设计工作室
          </button>
          <div className="text-[9px] text-center mt-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            空态页 · 奖品图 · 动效 · 导出全部 8 张
          </div>
        </div>
      </div>

    </div>
  )
}
