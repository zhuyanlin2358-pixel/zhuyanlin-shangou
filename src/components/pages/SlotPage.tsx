import { useRef } from 'react'
import { useSlot } from '@/contexts/SlotContext'
import { useApp } from '@/contexts/AppContext'
import { captureElement, downloadCanvas, downloadZip } from '@/utils/exportUtils'

function SectionHeader({ num, label, sub }: { num: number; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: 'var(--accent, #FF3060)' }}>
        {num}
      </div>
      <div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{label}</div>
        <div className="text-xs" style={{ color: 'var(--text-3)' }}>{sub}</div>
      </div>
    </div>
  )
}

function ExportBtn({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mt-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      style={{ background: 'var(--text-1)', color: 'var(--bg)' }}
    >
      {loading ? '导出中…' : '⬇ 导出 PNG'}
    </button>
  )
}

export default function SlotPage() {
  const { config } = useSlot()
  const { showToast } = useApp()

  // refs for each export section
  const previewRef = useRef<HTMLDivElement>(null)
  const bgRef      = useRef<HTMLDivElement>(null)
  const emptyRef   = useRef<HTMLDivElement>(null)
  const btnRef     = useRef<HTMLDivElement>(null)
  const linkRef    = useRef<HTMLDivElement>(null)
  const prizeRefs  = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]

  const doExport = async (ref: React.RefObject<HTMLDivElement | null>, name: string, w: number, h: number) => {
    if (!ref.current) return
    showToast(`正在渲染 ${name}…`)
    try {
      const canvas = await captureElement(ref.current, w, h)
      downloadCanvas(canvas, `${name}.png`)
      showToast(`✅ 已导出：${name}.png`)
    } catch (e: unknown) {
      showToast(`❌ 导出失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
  }

  const doExportAll = async () => {
    showToast('正在打包所有素材…')
    try {
      const tasks: { ref: React.RefObject<HTMLDivElement | null>; name: string; w: number; h: number }[] = [
        { ref: previewRef, name: 'slot_1_未抽奖状态_750x242',  w: 750, h: 242 },
        { ref: bgRef,      name: 'slot_2_背景_750x242',        w: 750, h: 242 },
        { ref: emptyRef,   name: 'slot_3_空态页_854x284',      w: 854, h: 284 },
        { ref: btnRef,     name: 'slot_4_按钮_194x80',         w: 194, h: 80  },
        { ref: linkRef,    name: 'slot_5_链接文字_109x34',     w: 109, h: 34  },
        ...prizeRefs.map((r, i) => ({ ref: r, name: `slot_6_奖品${i+1}_124x124`, w: 124, h: 124 })),
      ]
      const files = await Promise.all(
        tasks.filter(t => t.ref.current).map(async t => ({
          canvas: await captureElement(t.ref.current!, t.w, t.h),
          name: `${t.name}.png`,
        }))
      )
      await downloadZip(files, '老虎机_切图包')
      showToast('✅ 已打包下载：老虎机_切图包.zip')
    } catch (e: unknown) {
      showToast(`❌ 打包失败：${e instanceof Error ? e.message : '未知错误'}`)
    }
  }

  // CSS vars driven by slot config
  const vars = {
    '--btn-active-from': config.btnActiveFrom,
    '--btn-active-to': config.btnActiveTo,
    '--btn-disabled-from': config.btnDisabledFrom,
    '--btn-disabled-to': config.btnDisabledTo,
    '--slot-tint-from': config.slotTintFrom,
    '--slot-tint-to': config.slotTintTo,
    '--slot-links-color': config.linksColor,
    '--slot-title-color': config.titleColor,
  } as React.CSSProperties

  return (
    <div className="p-6 space-y-10" style={vars}>
      {/* 一键导出全部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>老虎机</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>共 6 类切图素材</p>
        </div>
        <button
          onClick={doExportAll}
          className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
          style={{ background: 'linear-gradient(135deg, #FF3060, #FF6030)' }}
        >
          📦 一键导出全部
        </button>
      </div>

      {/* Section 1: 未抽奖状态 */}
      <div>
        <SectionHeader num={1} label="老虎机未抽奖状态" sub="含标题 + 奖品图 + 按钮 · 750 × 242 px" />
        <div
          ref={previewRef}
          style={{
            width: 750, height: 242, position: 'relative', overflow: 'hidden',
            background: `linear-gradient(180deg, var(--slot-tint-from) 0%, var(--slot-tint-to) 100%)`,
            flexShrink: 0,
          }}
        >
          {/* 标题 */}
          <div style={{
            position: 'absolute', top: 12, left: 0, right: 0, textAlign: 'center',
            fontSize: 28, fontWeight: 800, color: 'var(--slot-title-color)',
            fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif",
          }}>
            {config.titleText}
          </div>
          {/* 老虎机框 */}
          <div style={{
            position: 'absolute', left: 43, top: 56, width: 441, height: 142,
            borderRadius: 20, background: 'rgba(255,255,255,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-evenly',
          }}>
            {config.prizes.map((prize, i) => (
              <div key={i} style={{
                width: 120, height: 120, borderRadius: 12,
                background: prize.imageUrl ? 'transparent' : 'rgba(0,0,0,0.06)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {prize.imageUrl
                  ? <img src={prize.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: 11, color: '#aaa' }}>奖品{i+1}</span>
                }
              </div>
            ))}
          </div>
          {/* 按钮 */}
          <div style={{
            position: 'absolute', right: 47, top: 81, width: 194, height: 80,
            borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(180deg, var(--btn-active-from) 0%, var(--btn-active-to) 100%)`,
            fontSize: 22, fontWeight: 800, color: '#fff',
            fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif",
          }}>
            开始抽奖
          </div>
        </div>
        <ExportBtn onClick={() => doExport(previewRef, 'slot_1_未抽奖状态_750x242', 750, 242)} />
      </div>

      {/* Section 2: 背景 */}
      <div>
        <SectionHeader num={2} label="老虎机背景" sub="纯背景渐变层 · 750 × 242 px" />
        <div
          ref={bgRef}
          style={{
            width: 750, height: 242,
            background: `linear-gradient(180deg, var(--slot-tint-from) 0%, var(--slot-tint-to) 100%)`,
          }}
        />
        <ExportBtn onClick={() => doExport(bgRef, 'slot_2_背景_750x242', 750, 242)} />
      </div>

      {/* Section 3: 空态页 */}
      <div>
        <SectionHeader num={3} label="空态页" sub="854 × 284 px @2x" />
        <div
          ref={emptyRef}
          style={{
            width: 854, height: 284, position: 'relative',
            background: config.bgColor || '#FFF5F8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 12,
          }}
        >
          <div style={{ fontSize: 48, lineHeight: 1 }}>😢</div>
          <div style={{
            fontSize: 28, color: '#999', textAlign: 'center',
            fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif",
            maxWidth: 600,
          }}>
            {config.emptyText}
          </div>
        </div>
        <ExportBtn onClick={() => doExport(emptyRef, 'slot_3_空态页_854x284', 854, 284)} />
      </div>

      {/* Section 4: 按钮 */}
      <div>
        <SectionHeader num={4} label="抽奖按钮" sub="194 × 80 px" />
        <div
          ref={btnRef}
          style={{
            width: 194, height: 80, borderRadius: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(180deg, var(--btn-active-from) 0%, var(--btn-active-to) 100%)`,
            fontSize: 22, fontWeight: 800, color: '#fff',
            fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif",
          }}
        >
          开始抽奖
        </div>
        <ExportBtn onClick={() => doExport(btnRef, 'slot_4_按钮_194x80', 194, 80)} />
      </div>

      {/* Section 5: 链接文字 */}
      <div>
        <SectionHeader num={5} label="链接文字" sub="109 × 34 px" />
        <div
          ref={linkRef}
          style={{
            width: 109, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: 'var(--slot-links-color)',
            fontFamily: "'PingFang SC','Microsoft YaHei',sans-serif",
          }}
        >
          查看记录 &gt;
        </div>
        <ExportBtn onClick={() => doExport(linkRef, 'slot_5_链接文字_109x34', 109, 34)} />
      </div>

      {/* Section 6: 奖品图 */}
      <div>
        <SectionHeader num={6} label="奖品图" sub="124 × 124 px × 3" />
        <div className="flex gap-4">
          {config.prizes.map((prize, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                ref={prizeRefs[i]}
                style={{
                  width: 124, height: 124, borderRadius: 12,
                  background: 'rgba(255,255,255,0.85)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {prize.imageUrl
                  ? <img src={prize.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: 11, color: '#aaa' }}>奖品{i+1}</span>
                }
              </div>
              <ExportBtn onClick={() => doExport(prizeRefs[i], `slot_6_奖品${i+1}_124x124`, 124, 124)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
