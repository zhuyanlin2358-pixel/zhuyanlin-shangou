/**
 * 高达会场手机预览面板（持久，始终显示在右侧）
 * 头图置顶，组件依次叠放，不压头图，用背景色填充间距
 */
import { useVenue } from '@/contexts/VenueContext'

export default function VenuePhonePreview() {
  const { items, headerUrl, headerSize, bgColor } = useVenue()

  // 手机内容宽度 = 375px，比例：750 → 375（50%）
  const SCALE = 375 / 750
  const headerH = Math.round(parseInt(headerSize) * SCALE)

  return (
    <div
      className="fixed top-0 right-0 h-screen flex flex-col border-l shrink-0"
      style={{ width: 380, background: '#0D1117', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* 标题栏 */}
      <div
        className="h-12 flex items-center px-4 text-xs font-semibold border-b shrink-0"
        style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        手机预览 · 375px
        {items.length > 0 && (
          <span className="ml-2 text-[10px] font-normal" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {items.length} 个组件
          </span>
        )}
      </div>

      {/* 手机外壳 */}
      <div className="flex-1 overflow-hidden flex items-start justify-center pt-4 pb-4 px-2">
        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: 375,
            maxHeight: '100%',
            background: bgColor,
            border: '2px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* 顶部状态栏模拟 */}
          <div
            className="flex items-center justify-between px-4 shrink-0"
            style={{ height: 28, background: 'rgba(0,0,0,0.06)' }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: '#333' }}>9:41</span>
            <div className="flex gap-1 items-center">
              {[4, 4, 4].map((_, i) => (
                <div key={i} className="rounded-full" style={{ width: 4, height: i === 2 ? 6 : 4, background: '#333', opacity: 0.6 }} />
              ))}
            </div>
          </div>

          {/* 导航栏模拟 */}
          <div
            className="flex items-center justify-between px-4 shrink-0"
            style={{ height: 44, background: '#fff', borderBottom: '1px solid #f0f0f0' }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>闪购会场</span>
          </div>

          {/* 可滚动内容区 */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 12rem)', background: bgColor }}
          >
            {/* 头图 */}
            {headerUrl ? (
              <img
                src={headerUrl}
                alt="头图"
                style={{ width: 375, height: headerH, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                className="flex items-center justify-center text-xs"
                style={{ width: 375, height: headerH || 80, background: '#f5f5f5', color: '#999' }}
              >
                {headerH > 0 ? '头图区域' : '未设置头图'}
              </div>
            )}

            {/* 组件列表（头图下方，不压头图）*/}
            {items.length === 0 && !headerUrl && (
              <div
                className="flex items-center justify-center text-xs py-12"
                style={{ color: '#999' }}
              >
                左侧加入组件后在此预览
              </div>
            )}
            {items.map(item => (
              <div key={item.id}>
                {/* 间距区域（背景色填充）*/}
                {item.spacingAbove > 0 && (
                  <div style={{ height: Math.round(item.spacingAbove * SCALE), background: bgColor }} />
                )}
                {/* 组件图片（750→375，50%缩放）*/}
                <img
                  src={item.previewUrl}
                  alt={item.label}
                  style={{
                    width: 375,
                    height: Math.round(item.origH * SCALE),
                    display: 'block',
                    objectFit: 'fill',
                  }}
                />
              </div>
            ))}

            {/* 底部留白 */}
            <div style={{ height: 20, background: bgColor }} />
          </div>
        </div>
      </div>

      {/* 说明 */}
      {items.length === 0 && (
        <div
          className="px-4 py-3 text-[10px] text-center border-t"
          style={{ color: 'rgba(255,255,255,0.25)', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          从左侧配置组件后点「加入会场」即可预览
        </div>
      )}
    </div>
  )
}
