/**
 * 交付中心（第三站）
 *
 * 独立页面，用户点「完成设计」后跳转。
 * 左侧：素材仓库（按组件分类，每个素材单独预览/下载）
 * 右侧：页面画布预览（手机帧）
 * 底部：一键全部打包 ZIP
 */
import { useState, useCallback, useRef, useMemo } from 'react'
import JSZip from 'jszip'
import { X, Download, Package, Eye, RefreshCw } from 'lucide-react'
import { useVenue }  from '@/contexts/VenueContext'
import { useSlot }   from '@/contexts/SlotContext'
import { useCoupon } from '@/contexts/CouponContext'
import { useHTab }   from '@/contexts/HTabContext'
import { useFloor }  from '@/contexts/FloorContext'
import { useApp }    from '@/contexts/AppContext'
import {
  preloadFonts,
  drawSlotBannerCanvas, drawSlotBgCanvas, drawButtonCanvas, drawLinkCanvas,
  drawEmptyStateCanvas, drawPrizeCanvas, drawDialogButtonCanvas, drawDialogResultCanvas,
  drawCouponBg, drawCouponWaistband, drawCouponButton,
  drawHTabCanvas, drawFloorCanvas,
} from '@/utils/exportUtils'

// ── 老虎机素材常量（与工作室保持一致）──────────────────────────────────────────
const SLOT_DIALOG_RESULTS = [
  { state: '正在抽奖', label: '弹窗_正在抽奖' },
  { state: '已中奖',   label: '弹窗_已中奖'   },
  { state: '谢谢参与', label: '弹窗_谢谢参与'  },
  { state: '已领满',   label: '弹窗_已领满'   },
  { state: '已使用',   label: '弹窗_已使用'   },
  { state: '出错了',   label: '弹窗_出错了'   },
] as const

const SLOT_DIALOG_BUTTONS = [
  '确认', '领奖品', '查看收货地址', '重新加载', '关闭', '查看详情', '分享给朋友',
]
import type { PrizeInfo, XfTransform } from '@/utils/exportUtils'

// ── 工具 ──────────────────────────────────────────────────────────────────────
function canvasToBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise(res => c.toBlob(b => res(b!), 'image/png'))
}
function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = filename; a.click()
  URL.revokeObjectURL(a.href)
}

// ── 大图预览 Modal ──────────────────────────────────────────────────────────
function PreviewModal({ url, label, onClose, onDownload }: {
  url: string; label: string; onClose: () => void; onDownload: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex items-center justify-between w-full px-6 py-4 shrink-0"
        style={{ maxWidth: 900 }}>
        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</span>
        <div className="flex items-center gap-3">
          <button onClick={onDownload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white"
            style={{ background: 'rgba(45,120,244,0.8)', border: 'none', cursor: 'pointer' }}>
            <Download size={13} /> 下载此图
          </button>
          <button onClick={onClose}
            className="p-2 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 w-full overflow-auto">
        <img src={url} alt={label}
          style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, objectFit: 'contain',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }} />
      </div>
    </div>
  )
}

// 素材定义（不含 onPreview，由 ComponentSection 注入）
interface AssetDef {
  id: string        // 用于选中状态跟踪：`${itemId}_${label}`
  label: string
  size: string
  generate: () => Promise<HTMLCanvasElement>
  canReplace?: boolean
  onReplace?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// ── 圆形复选框（animate-ui radio-group 风格）───────────────────────────────
function RoundCheck({ checked, indeterminate, onChange }: {
  checked: boolean; indeterminate?: boolean; onChange: () => void
}) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onChange() }}
      style={{
        width: 15, height: 15, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
        border: `1.5px solid ${checked || indeterminate ? '#2D78F4' : 'rgba(255,255,255,0.2)'}`,
        background: checked ? '#2D78F4' : indeterminate ? 'rgba(45,120,244,0.3)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.12s',
      }}
    >
      {checked    && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
      {indeterminate && !checked && <div style={{ width: 6, height: 1.5, background: '#6AA3FF', borderRadius: 1 }} />}
    </div>
  )
}

// ── 单个素材行 ────────────────────────────────────────────────────────────────
function AssetRow({
  id, label, size, generate, onPreview, canReplace, onReplace,
  checked, onToggle,
}: AssetDef & {
  onPreview: (url: string, label: string, gen: () => Promise<HTMLCanvasElement>) => void
  checked?: boolean
  onToggle?: (id: string) => void
}) {
  const [dlStatus, setDlStatus] = useState<'idle'|'loading'|'done'>('idle')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleDownload = async () => {
    setDlStatus('loading')
    try {
      const c = await generate()
      downloadBlob(await canvasToBlob(c), label + '.png')
      setDlStatus('done')
    } catch { setDlStatus('idle') }
    setTimeout(() => setDlStatus('idle'), 2500)
  }

  const handlePreview = () => onPreview('', label, generate)
  const isChecked = checked ?? true

  return (
    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
      style={{ background: isChecked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)', opacity: isChecked ? 1 : 0.5 }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isChecked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isChecked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)'}
    >
      {/* 复选框 */}
      {onToggle && (
        <RoundCheck checked={isChecked} onChange={() => onToggle(id)} />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{label}</div>
        <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{size}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {canReplace && onReplace && (
          <>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer' }}>
              <RefreshCw size={9} /> 替换
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onReplace} />
          </>
        )}
        <button onClick={handlePreview}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer' }}>
          <Eye size={10} /> 预览
        </button>
        <button onClick={handleDownload} disabled={dlStatus === 'loading'}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-lg transition-all"
          style={{
            background: dlStatus === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(45,120,244,0.15)',
            color: dlStatus === 'done' ? '#4ade80' : '#6AA3FF',
            border: 'none', cursor: dlStatus === 'loading' ? 'not-allowed' : 'pointer',
          }}>
          <Download size={10} />
          {dlStatus === 'loading' ? '…' : dlStatus === 'done' ? '✓' : '下载'}
        </button>
      </div>
    </div>
  )
}

// ── 可折叠子分组（含组级复选框）────────────────────────────────────────────
function CollapsibleGroup({
  label, count, defaultOpen = true, children, extra,
  groupIds, selectedIds, onToggle,
}: {
  label: string; count: number; defaultOpen?: boolean
  children: React.ReactNode; extra?: React.ReactNode
  groupIds?: string[];  selectedIds?: Set<string>
  onToggle?: (id: string) => void
}) {
  const [open, setOpen] = useState(defaultOpen)

  // 组级选中状态（正向集合：空=未选中）
  const allChecked  = groupIds ? groupIds.length > 0 && groupIds.every(id => selectedIds?.has(id) ?? false) : false
  const someChecked = groupIds ? groupIds.some(id  => selectedIds?.has(id) ?? false) : false
  const groupToggle = () => {
    if (!groupIds || !onToggle) return
    if (allChecked) groupIds.forEach(onToggle)   // 全选→全不选
    else groupIds.filter(id => !selectedIds?.has(id)).forEach(onToggle) // 补全选
  }

  return (
    <div className="rounded-xl overflow-hidden mb-2"
      style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="w-full flex items-center gap-2 px-3 py-2.5">
        {/* 折叠箭头 */}
        <button onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" style={{ color: 'rgba(255,255,255,0.25)', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
            <path d="M4 6l4 4 4-4"/>
          </svg>
        </button>
        {/* 组级复选框 */}
        {groupIds && onToggle && (
          <RoundCheck
            checked={allChecked}
            indeterminate={!allChecked && someChecked}
            onChange={groupToggle}
          />
        )}
        <button onClick={() => setOpen(o => !o)} className="flex-1 flex items-center gap-2 text-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
            {count}
          </span>
        </button>
        {extra}
      </div>
      {open && (
        <div className="px-2 pb-2 space-y-0.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── 老虎机专用分组 Section ────────────────────────────────────────────────────
function SlotComponentSection({
  label, icon, assets, onPreview, prizeCount, onAddPrize, onRemovePrize,
  selectedIds, onToggleId, onSelectGroup,
}: {
  label: string; icon: React.ReactNode
  assets: AssetDef[]
  onPreview: (url: string, label: string, gen: () => Promise<HTMLCanvasElement>) => void
  prizeCount: number; onAddPrize: () => void; onRemovePrize: (idx: number) => void
  selectedIds: Set<string>; onToggleId: (id: string) => void
  onSelectGroup: (ids: string[], on: boolean) => void
}) {
  const [dlStatus, setDlStatus] = useState<'idle'|'loading'|'done'>('idle')

  const sel = assets.filter(a => selectedIds.has(a.id))
  const selCount = sel.length

  const handleAll = async () => {
    setDlStatus('loading')
    try {
      await preloadFonts()
      const zip = new JSZip()
      for (const asset of sel) {
        const c = await asset.generate()
        zip.file(`${asset.label}.png`, await canvasToBlob(c))
      }
      downloadBlob(await zip.generateAsync({ type: 'blob' }), '老虎机_切图包.zip')
      setDlStatus('done')
    } catch { setDlStatus('idle') }
    setTimeout(() => setDlStatus('idle'), 3000)
  }

  // 按类型分组
  const coreAssets   = assets.filter(a => a.label.includes('主视觉') || a.label.includes('背景') || a.label.includes('空态'))
  const buttonAssets = assets.filter(a => a.label.startsWith('按钮'))
  const linkAssets   = assets.filter(a => a.label.startsWith('链接'))
  const prizeAssets  = assets.filter(a => a.label.startsWith('奖品图'))
  const dialogBtns   = assets.filter(a => a.label.startsWith('弹窗按钮'))
  const dialogPages  = assets.filter(a => a.label.startsWith('弹窗_'))

  const ARow = (asset: AssetDef, i: number) => (
    <AssetRow key={i} {...asset} onPreview={onPreview}
      checked={selectedIds.has(asset.id)} onToggle={onToggleId} />
  )

  return (
    <div className="rounded-2xl overflow-hidden mb-4"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#111827' }}>
      {/* 标题栏 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <span style={{ opacity: 0.6 }}>{icon}</span>
        <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{label}</span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>已选 {selCount}/{assets.length}</span>
          <button
            onClick={() => onSelectGroup(assets.map(a => a.id), selCount < assets.length)}
            className="text-[9px] px-2 py-0.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(45,120,244,0.12)', color: '#6AA3FF', border: '1px solid rgba(45,120,244,0.2)', cursor: 'pointer' }}>
            {selCount === assets.length ? '全不选' : '全选'}
          </button>
        </div>
      </div>

      {/* 分组内容 */}
      <div className="p-3 space-y-0.5">
        {/* 核心素材 */}
        {coreAssets.map((a, i) => ARow(a, i))}

        {/* 抽奖按钮 */}
        <CollapsibleGroup label="抽奖按钮" count={buttonAssets.length}
          groupIds={buttonAssets.map(a => a.id)} selectedIds={selectedIds} onToggle={onToggleId}>
          {buttonAssets.map((a, i) => ARow(a, i))}
        </CollapsibleGroup>

        {/* 链接文字 */}
        <CollapsibleGroup label="链接文字" count={linkAssets.length}
          groupIds={linkAssets.map(a => a.id)} selectedIds={selectedIds} onToggle={onToggleId}>
          {linkAssets.map((a, i) => ARow(a, i))}
        </CollapsibleGroup>

        {/* 奖品图 + 增加按钮 */}
        <CollapsibleGroup label="奖品图" count={prizeAssets.length}
          groupIds={prizeAssets.map(a => a.id)} selectedIds={selectedIds} onToggle={onToggleId}
          extra={
            <button onClick={e => { e.stopPropagation(); onAddPrize() }}
              className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold rounded-lg ml-1 transition-all hover:opacity-80"
              style={{ background: 'rgba(45,120,244,0.15)', color: '#6AA3FF', border: '1px solid rgba(45,120,244,0.2)', cursor: 'pointer' }}>
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
              增加奖品图
            </button>
          }>
          {prizeAssets.map((a, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="flex-1"><AssetRow {...a} onPreview={onPreview}
                checked={selectedIds.has(a.id)} onToggle={onToggleId} /></div>
              {prizeCount > 1 && (
                <button onClick={() => onRemovePrize(i)}
                  className="px-1.5 py-1 text-[9px] rounded transition-all hover:opacity-80 shrink-0"
                  style={{ color: 'rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer' }}>
                  ✕
                </button>
              )}
            </div>
          ))}
        </CollapsibleGroup>

        {/* 弹窗按钮（默认折叠） */}
        <CollapsibleGroup label="弹窗按钮" count={dialogBtns.length} defaultOpen={false}
          groupIds={dialogBtns.map(a => a.id)} selectedIds={selectedIds} onToggle={onToggleId}>
          {dialogBtns.map((a, i) => ARow(a, i))}
        </CollapsibleGroup>

        {/* 弹窗结果页（默认折叠） */}
        <CollapsibleGroup label="弹窗结果页" count={dialogPages.length} defaultOpen={false}
          groupIds={dialogPages.map(a => a.id)} selectedIds={selectedIds} onToggle={onToggleId}>
          {dialogPages.map((a, i) => ARow(a, i))}
        </CollapsibleGroup>
      </div>

      {/* 下载已选 */}
      <div className="px-3 pb-3">
        <button onClick={handleAll} disabled={dlStatus === 'loading' || selCount === 0}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all"
          style={{
            background: dlStatus === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
            color: dlStatus === 'done' ? '#4ade80' : selCount === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
            border: `1px solid ${dlStatus === 'done' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`,
            cursor: dlStatus === 'loading' || selCount === 0 ? 'not-allowed' : 'pointer',
          }}>
          <Download size={12} />
          {dlStatus === 'loading' ? '生成中…' : dlStatus === 'done' ? '✅ 已下载' : `下载已选 ${selCount} 个 ZIP`}
        </button>
      </div>
    </div>
  )
}

// ── 通用组件素材分组 ──────────────────────────────────────────────────────────
function ComponentSection({
  label, icon, assets, onPreview, selectedIds, onToggleId, onSelectGroup,
}: {
  label: string; icon: React.ReactNode
  assets: AssetDef[]
  onPreview: (url: string, label: string, gen: () => Promise<HTMLCanvasElement>) => void
  selectedIds: Set<string>; onToggleId: (id: string) => void
  onSelectGroup: (ids: string[], on: boolean) => void
}) {
  const [dlStatus, setDlStatus] = useState<'idle'|'loading'|'done'>('idle')
  const sel = assets.filter(a => selectedIds.has(a.id))

  const handleAll = async () => {
    setDlStatus('loading')
    try {
      await preloadFonts()
      const zip = new JSZip()
      for (const asset of sel) {
        const c = await asset.generate()
        zip.file(`${asset.label}.png`, await canvasToBlob(c))
      }
      downloadBlob(await zip.generateAsync({ type: 'blob' }), `${label}.zip`)
      setDlStatus('done')
    } catch { setDlStatus('idle') }
    setTimeout(() => setDlStatus('idle'), 3000)
  }

  return (
    <div className="rounded-2xl overflow-hidden mb-4"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#111827' }}>
      {/* 分组标题 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <span style={{ opacity: 0.6 }}>{icon}</span>
        <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{label}</span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>已选 {sel.length}/{assets.length}</span>
          <button
            onClick={() => onSelectGroup(assets.map(a => a.id), sel.length < assets.length)}
            className="text-[9px] px-2 py-0.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(45,120,244,0.12)', color: '#6AA3FF', border: '1px solid rgba(45,120,244,0.2)', cursor: 'pointer' }}>
            {sel.length === assets.length ? '全不选' : '全选'}
          </button>
        </div>
      </div>
      {/* 素材列表 */}
      <div className="p-3 space-y-1">
        {assets.map((asset, i) => (
          <AssetRow key={i} {...asset} onPreview={onPreview}
            checked={selectedIds.has(asset.id)} onToggle={onToggleId} />
        ))}
      </div>
      {/* 下载已选 */}
      <div className="px-3 pb-3">
        <button onClick={handleAll} disabled={dlStatus === 'loading' || sel.length === 0}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all"
          style={{
            background: dlStatus === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
            color: dlStatus === 'done' ? '#4ade80' : sel.length === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)',
            border: `1px solid ${dlStatus === 'done' ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`,
            cursor: dlStatus === 'loading' || sel.length === 0 ? 'not-allowed' : 'pointer',
          }}>
          <Download size={12} />
          {dlStatus === 'loading' ? '生成中…' : dlStatus === 'done' ? '✅ 已下载' : `下载已选 ${sel.length} 个 ZIP`}
        </button>
      </div>
    </div>
  )
}

// ── 右侧：已选素材切图预览 ───────────────────────────────────────────────────
function AssetGallery({ assets }: { assets: AssetDef[] }) {
  // 逐条生成预览，不重置已有缓存
  const [cache, setCache] = useState<Record<string, string>>({})
  const runRef = useRef(0)

  useEffect(() => {
    const run = ++runRef.current
    const missing = assets.filter(a => !cache[a.id])
    if (!missing.length) return
    ;(async () => {
      await preloadFonts()
      for (const asset of missing) {
        if (runRef.current !== run) break
        try {
          const c = await asset.generate()
          if (runRef.current === run)
            setCache(prev => ({ ...prev, [asset.id]: c.toDataURL() }))
        } catch {}
      }
    })()
  }, [assets.map(a => a.id).join('|')])

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <div style={{ fontSize: 32, opacity: 0.2 }}>🖼</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.6 }}>
          在左侧勾选素材<br/>右侧显示切图预览
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', padding: '2px 4px 6px' }}>
        已选 {assets.length} 个素材
      </div>
      {assets.map(asset => (
        <div key={asset.id}
          style={{
            borderRadius: 10, overflow: 'hidden',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}>
          {/* 图像区 */}
          <div style={{
            padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 56, background: 'rgba(255,255,255,0.02)',
          }}>
            {cache[asset.id]
              ? <img src={cache[asset.id]} alt={asset.label}
                  style={{ maxWidth: '100%', maxHeight: 130, objectFit: 'contain', display: 'block', borderRadius: 4 }} />
              : <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    style={{ animation: 'btnSpin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity={.3}/>
                    <path d="M21 12a9 9 0 00-9-9"/>
                  </svg>
                  生成中…
                </div>
            }
          </div>
          {/* 信息栏 */}
          <div style={{
            padding: '5px 10px', borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{asset.size}</div>
            </div>
            {cache[asset.id] && (
              <a href={cache[asset.id]} download={`${asset.label}.png`}
                style={{
                  flexShrink: 0, fontSize: 10, color: '#6AA3FF',
                  textDecoration: 'none', background: 'rgba(45,120,244,0.12)',
                  padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(45,120,244,0.2)',
                }}>
                ↓
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────────────────────
export default function DeliveryPage() {
  const { goVenue, showToast } = useApp()
  const { items }  = useVenue()
  const slotCtx    = useSlot()
  const couponCtx  = useCoupon()
  const hTabCtx    = useHTab()
  const floorCtx   = useFloor()

  // 大图预览弹窗状态
  const [preview, setPreview] = useState<{
    url: string; label: string; gen: () => Promise<HTMLCanvasElement>
  } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const handlePreview = useCallback(async (
    _url: string,
    label: string,
    gen: () => Promise<HTMLCanvasElement>,
  ) => {
    setPreviewLoading(true)
    try {
      await preloadFonts()
      const c = await gen()
      setPreview({ url: c.toDataURL(), label, gen })
    } catch { showToast('预览生成失败') }
    setPreviewLoading(false)
  }, [showToast])

  // 为每个 VenueItem 构建素材列表（id = `${item.id}_${label}` 用于选中跟踪）
  const buildAssets = useCallback((item: typeof items[0]) => {
    const mk = (label: string) => `${item.id}_${label}`  // 生成唯一 id

    const slot = slotCtx.config
    const sc = { slotTintFrom: slot.slotTintFrom, slotTintTo: slot.slotTintTo,
      slotRect7From: slot.slotRect7From, slotRect7To: slot.slotRect7To,
      titleText: slot.titleText, titleColor: slot.titleColor, linksColor: slot.linksColor,
      btnActiveFrom: slot.btnActiveFrom, btnActiveTo: slot.btnActiveTo,
      btnTextColor: slot.btnTextColor, slotStyle: slot.slotStyle }

    if (item.componentId === 'slot') {
      const genBanner = async () => {
        const pcs = await Promise.all(slot.prizes.map((p, idx) => drawPrizeCanvas(p as PrizeInfo, slot.prizeTransforms[idx] as XfTransform, slot.slotStyle)))
        return drawSlotBannerCanvas(sc, pcs)
      }
      const assetList: AssetDef[] = [
        { id: mk('主视觉（未抽奖状态）'), label: '主视觉（未抽奖状态）', size: '750 × 242 px', generate: genBanner },
        { id: mk('老虎机背景图'), label: '老虎机背景图', size: '750 × 242 px', generate: () => drawSlotBgCanvas(slot as any) },
        { id: mk('空态页'), label: '空态页', size: '854 × 284 px', generate: () => drawEmptyStateCanvas(slot.emptyImageUrl, slot.emptyTransform as XfTransform, slot.emptyText) },
        { id: mk('按钮 · 立即抽奖'), label: '按钮 · 立即抽奖', size: '194 × 80 px', generate: () => Promise.resolve(drawButtonCanvas('立即抽奖', slot.btnActiveFrom, slot.btnActiveTo, slot.btnTextColor)) },
        { id: mk('按钮 · 活动结束'), label: '按钮 · 活动结束', size: '194 × 80 px', generate: () => Promise.resolve(drawButtonCanvas('活动已结束', slot.btnDisabledFrom, slot.btnDisabledTo, slot.btnTextColor)) },
        { id: mk('链接 · 我的奖品'), label: '链接 · 我的奖品', size: '186 × 44 px', generate: () => Promise.resolve(drawLinkCanvas([{ text: '我的奖品' }], slot.linksColor, 186, 44, 45, 2)) },
        { id: mk('链接 · 抽奖规则'), label: '链接 · 抽奖规则', size: '218 × 44 px', generate: () => Promise.resolve(drawLinkCanvas([{ text: '|', opacity: 0.6 }, { text: '抽奖规则' }], slot.linksColor, 218, 44, 45, 2)) },
        // 奖品图（动态数量）
        ...slot.prizes.map((p, idx): AssetDef => ({
          id: mk(`奖品图 ${idx+1}（${p.tag || '商品图'}）`),
          label: `奖品图 ${idx+1}（${p.tag || '商品图'}）`, size: '124 × 124 px',
          generate: () => drawPrizeCanvas(p as PrizeInfo, slot.prizeTransforms[idx] as XfTransform, slot.slotStyle),
          canReplace: p.type === 'product-tag' || p.type === 'product-dashed',
          onReplace: (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]; if (!file) return
            const reader = new FileReader()
            reader.onload = ev => slotCtx.setPrize(idx, { imageUrl: ev.target?.result as string })
            reader.readAsDataURL(file)
          },
        })),
        // 弹窗按钮（全部7种）
        ...SLOT_DIALOG_BUTTONS.map((text): AssetDef => ({
          id: mk(`弹窗按钮 · ${text}`),
          label: `弹窗按钮 · ${text}`, size: '276 × 80 px',
          generate: () => Promise.resolve(drawDialogButtonCanvas(text, slot.btnActiveFrom, slot.btnActiveTo, undefined, slot.btnTextColor)),
        })),
        // 弹窗结果页（全部6种）
        ...SLOT_DIALOG_RESULTS.map((dr): AssetDef => ({
          id: mk(dr.label),
          label: dr.label, size: '750 × 612 px',
          generate: () => Promise.resolve(drawDialogResultCanvas(dr.state, slot.slotTintFrom, slot.slotTintTo, slot.titleColor)),
        })),
      ]

      const downloadAll = async () => {
        await preloadFonts()
        const zip = new JSZip()
        const pcs = await Promise.all(slot.prizes.map((p, i) => drawPrizeCanvas(p as PrizeInfo, slot.prizeTransforms[i] as XfTransform, slot.slotStyle)))
        const [c1, c2, c3, c4a, c4d] = await Promise.all([
          drawSlotBannerCanvas(sc, pcs), drawSlotBgCanvas(slot as any),
          drawEmptyStateCanvas(slot.emptyImageUrl, slot.emptyTransform as XfTransform, slot.emptyText),
          Promise.resolve(drawButtonCanvas('立即抽奖',   slot.btnActiveFrom,   slot.btnActiveTo,   slot.btnTextColor)),
          Promise.resolve(drawButtonCanvas('活动已结束', slot.btnDisabledFrom, slot.btnDisabledTo, slot.btnTextColor)),
        ])
        const c5p = drawLinkCanvas([{ text: '我的奖品' }], slot.linksColor, 186, 44, 45, 2)
        const c5r = drawLinkCanvas([{ text: '|', opacity: 0.6 }, { text: '抽奖规则' }], slot.linksColor, 218, 44, 45, 2)
        zip.file('1_主视觉_750x242.png',   await canvasToBlob(c1))
        zip.file('2_背景图_750x242.png',   await canvasToBlob(c2))
        zip.file('3_空态页_854x284.png',   await canvasToBlob(c3))
        zip.file('4_按钮_立即抽奖.png',    await canvasToBlob(c4a))
        zip.file('4_按钮_活动结束.png',    await canvasToBlob(c4d))
        zip.file('5_链接_我的奖品.png',    await canvasToBlob(c5p))
        zip.file('5_链接_抽奖规则.png',    await canvasToBlob(c5r))
        for (let i = 0; i < pcs.length; i++) zip.file(`6_奖品图${i+1}_124x124.png`, await canvasToBlob(pcs[i]))
        // 弹窗按钮（7种）
        const fb = zip.folder('7_弹窗按钮') ?? zip
        for (const text of SLOT_DIALOG_BUTTONS) fb.file(`${text}.png`, await canvasToBlob(drawDialogButtonCanvas(text, slot.btnActiveFrom, slot.btnActiveTo, undefined, slot.btnTextColor)))
        // 弹窗结果页（6种）
        const fr = zip.folder('8_弹窗结果页') ?? zip
        for (const dr of SLOT_DIALOG_RESULTS) fr.file(`${dr.label}.png`, await canvasToBlob(await drawDialogResultCanvas(dr.state, slot.slotTintFrom, slot.slotTintTo, slot.titleColor)))
        downloadBlob(await zip.generateAsync({ type: 'blob' }), '老虎机_切图包.zip')
      }
      return { assetList, downloadAll }
    }

    if (item.componentId === 'coupon') {
      const cfg = couponCtx.config
      const assetList: AssetDef[] = [
        { id: mk('券包背景'), label: '券包背景', size: '702 × 352 px', generate: () => drawCouponBg(cfg) },
        { id: mk('腰封图'),   label: '腰封图',   size: '702 × 168 px', generate: () => drawCouponWaistband(cfg) },
        { id: mk('领取按钮'), label: '领取按钮', size: '480 × 80 px',  generate: () => drawCouponButton(cfg) },
      ]
      const downloadAll = async () => {
        await preloadFonts()
        const [bg, w, b] = await Promise.all([drawCouponBg(cfg), drawCouponWaistband(cfg), drawCouponButton(cfg)])
        const zip = new JSZip(); zip.file('背景.png', await canvasToBlob(bg)); zip.file('腰封.png', await canvasToBlob(w)); zip.file('按钮.png', await canvasToBlob(b))
        downloadBlob(await zip.generateAsync({ type: 'blob' }), `红包_${cfg.colorKey}.zip`)
      }
      return { assetList, downloadAll }
    }

    if (item.componentId === 'h-tab') {
      const assetList: AssetDef[] = hTabCtx.items.map(it => ({
        id: mk(`横滑 Tab · ${it.tabs.join(' / ')}`),
        label: `横滑 Tab · ${it.tabs.join(' / ')}`,
        size: '750 × 88 px',
        generate: () => drawHTabCanvas({ colorKey: hTabCtx.config.colorKey, tabs: it.tabs, activeIndex: it.activeIndex }),
      }))
      const downloadAll = async () => {
        await preloadFonts()
        const zip = new JSZip()
        for (const it of hTabCtx.items) { const c = await drawHTabCanvas({ colorKey: hTabCtx.config.colorKey, tabs: it.tabs, activeIndex: it.activeIndex }); zip.file(`Tab_${it.tabs.join('-')}.png`, await canvasToBlob(c)) }
        downloadBlob(await zip.generateAsync({ type: 'blob' }), `横滑Tab_${hTabCtx.config.colorKey}.zip`)
      }
      return { assetList, downloadAll }
    }

    if (item.componentId === 'floor') {
      const assetList: AssetDef[] = floorCtx.floors.map(f => ({
        id: mk(`楼层条 · ${f.text || '楼层'}`),
        label: `楼层条 · ${f.text || '楼层'}`,
        size: '750 × 60 px',
        generate: () => drawFloorCanvas({ ...floorCtx.config, text: f.text }),
      }))
      const downloadAll = async () => {
        await preloadFonts()
        const zip = new JSZip()
        for (const f of floorCtx.floors) { const c = await drawFloorCanvas({ ...floorCtx.config, text: f.text }); zip.file(`${f.text || '楼层'}.png`, await canvasToBlob(c)) }
        downloadBlob(await zip.generateAsync({ type: 'blob' }), '楼层条.zip')
      }
      return { assetList, downloadAll }
    }

    return { assetList: [] as Parameters<typeof AssetRow>[], downloadAll: async () => {} }
  }, [slotCtx, couponCtx, hTabCtx, floorCtx])

  // ── 选中状态：正向集合，默认空（用户手动选择）────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleId = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
    })
  }, [])

  const selectNone = useCallback(() => setSelected(new Set()), [])

  // 批量选择/取消一组 id
  const selectGroup = useCallback((ids: string[], on: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (on) ids.forEach(id => next.add(id))
      else    ids.forEach(id => next.delete(id))
      return next
    })
  }, [])

  const selectedIds   = selected
  const selectedCount = selected.size

  // 全部素材 ID 列表（用于「全选/全不选」判断，避免在 JSX 里调用 getAllIds()）
  const allAssetIds = useMemo<string[]>(() => {
    const ids: string[] = []
    for (const item of items) {
      try {
        const { assetList } = buildAssets(item)
        assetList.forEach((a: AssetDef) => ids.push(a.id))
      } catch {}
    }
    return ids
  }, [items, buildAssets])

  const totalAssetCount = allAssetIds.length
  const allSelected     = selectedCount > 0 && selectedCount >= totalAssetCount

  // 全选：用预计算的 ID 列表
  const selectAll = useCallback(() => setSelected(new Set(allAssetIds)), [allAssetIds])

  // 已选素材列表（给右侧预览用）
  const selectedAssets = useMemo<AssetDef[]>(() => {
    const result: AssetDef[] = []
    for (const item of items) {
      try {
        const { assetList } = buildAssets(item)
        assetList.forEach((a: AssetDef) => { if (selected.has(a.id)) result.push(a) })
      } catch {}
    }
    return result
  }, [items, selected, buildAssets])

  // ── 全部打包（只含已选素材）────────────────────────────────────────────────
  const [allStatus, setAllStatus] = useState<'idle'|'loading'|'done'>('idle')
  const handleDownloadAll = useCallback(async () => {
    if (!items.length) { showToast('没有组件'); return }
    if (!selectedCount)  { showToast('请先选择要下载的素材'); return }
    setAllStatus('loading'); showToast('正在生成素材…')
    try {
      await preloadFonts()
      const zip = new JSZip()
      for (const item of items) {
        const { assetList } = buildAssets(item)
        const sel = assetList.filter(a => selectedIds.has(a.id))
        if (!sel.length) continue
        const folder = zip.folder(item.label) ?? zip
        for (const asset of sel) {
          const c = await asset.generate()
          folder.file(`${asset.label}.png`, await canvasToBlob(c))
        }
      }
      downloadBlob(await zip.generateAsync({ type: 'blob' }), '会场素材全包.zip')
      setAllStatus('done'); showToast(`✅ 已打包 ${selectedCount} 个素材！`)
    } catch { showToast('❌ 打包失败') }
    setTimeout(() => setAllStatus('idle'), 3000)
  }, [items, selectedIds, selectedCount, buildAssets, showToast])

  const COMP_ICON: Record<string, React.ReactNode> = {
    slot: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 4v16M16 4v16"/></svg>,
    coupon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/></svg>,
    'h-tab': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="2" y="5" width="6" height="14" rx="1.5"/><rect x="10" y="5" width="6" height="14" rx="1.5"/></svg>,
    floor: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#080C14' }}>

      {/* 顶栏 */}
      <div className="flex items-center gap-4 px-6 h-14 shrink-0 border-b"
        style={{ background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}>
        <button onClick={goVenue}
          className="flex items-center gap-2 text-xs transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          返回画布
        </button>
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
        <span className="text-base font-bold" style={{ color: '#fff' }}>交付中心</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
          ✅ 素材已就绪
        </span>
        <div style={{ flex: 1 }} />
        {/* 全选 / 全不选 */}
        <button onClick={allSelected ? selectNone : selectAll}
          className="text-[11px] px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          {allSelected ? '全不选' : `全选 (${totalAssetCount})`}
        </button>
        {/* 选中计数 */}
        {selectedCount > 0 && (
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            已选 {selectedCount} 个
          </span>
        )}
        {/* 一键打包（只含已选）*/}
        <button onClick={handleDownloadAll} disabled={allStatus === 'loading' || !selectedCount}
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl text-white transition-all"
          style={{
            background: allStatus === 'done' ? 'rgba(34,197,94,0.8)' : 'linear-gradient(90deg,#FF3060,#FF6030)',
            cursor: allStatus === 'loading' || !selectedCount ? 'not-allowed' : 'pointer',
            opacity: allStatus === 'loading' || !selectedCount ? 0.6 : 1,
          }}>
          <Package size={14} />
          {allStatus === 'loading' ? '生成中…' : allStatus === 'done' ? '✅ 已下载' : `打包已选 (${selectedCount})`}
        </button>
      </div>

      {/* 主体：左侧素材仓库 + 右侧页面预览 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 左侧：素材仓库 */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="text-xs font-semibold mb-4 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
            素材仓库
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div style={{ fontSize: 40, opacity: 0.3 }}>📦</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>画布上还没有组件</div>
              <button onClick={goVenue}
                className="px-4 py-2 text-xs rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer' }}>
                ← 返回画布添加组件
              </button>
            </div>
          ) : items.map(item => {
            const { assetList } = buildAssets(item)
            if (item.componentId === 'slot') {
              return (
                <SlotComponentSection
                  key={item.id}
                  label={item.label}
                  icon={COMP_ICON[item.componentId] ?? <Package size={14} />}
                  assets={assetList as AssetDef[]}
                  onPreview={handlePreview}
                  prizeCount={slotCtx.config.prizes.length}
                  onAddPrize={slotCtx.addPrize}
                  onRemovePrize={idx => slotCtx.removePrize(idx)}
                  selectedIds={selectedIds}
                  onToggleId={toggleId}
                  onSelectGroup={selectGroup}
                />
              )
            }
            return (
              <ComponentSection
                key={item.id}
                label={item.label}
                icon={COMP_ICON[item.componentId] ?? <Package size={14} />}
                assets={assetList as AssetDef[]}
                onPreview={handlePreview}
                selectedIds={selectedIds}
                onToggleId={toggleId}
                onSelectGroup={selectGroup}
              />
            )
          })}
        </div>

        {/* 右侧：已选素材切图预览 */}
        <div className="flex flex-col shrink-0 border-l overflow-hidden"
          style={{ width: 360, borderColor: 'rgba(255,255,255,0.07)', background: '#0A0E18' }}>
          <div className="px-4 py-3 border-b shrink-0 flex items-center justify-between"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)' }}>
              素材预览
            </span>
            {selectedCount > 0 && (
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
                {selectedCount} 张
              </span>
            )}
          </div>
          <AssetGallery assets={selectedAssets} />
        </div>
      </div>

      {/* 大图预览弹窗 */}
      {previewLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>生成预览中…</div>
        </div>
      )}
      {preview && (
        <PreviewModal
          url={preview.url}
          label={preview.label}
          onClose={() => setPreview(null)}
          onDownload={async () => {
            const c = await preview.gen()
            downloadBlob(await canvasToBlob(c), preview.label + '.png')
          }}
        />
      )}
    </div>
  )
}
