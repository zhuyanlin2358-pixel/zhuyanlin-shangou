/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SVG 组件模板（复制此文件开发新组件）
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * 开发新组件只需三步：
 *  1. 定义颜色配置 (ComponentColors)
 *  2. 把 Figma 导出的 SVG 路径粘贴进 renderSvg()
 *  3. 把颜色从写死的 hex 改成模板变量 ${c.xxx}
 *
 * 优势 vs Canvas 自绘：
 *  · 颜色改变 → 立即重渲染（0 等待）
 *  · 形状 = Figma 路径直接粘贴，零误差
 *  · 接别人 HTML/SVG 组件：直接提取路径，10 分钟搞定
 *  · 导出质量与 Canvas 自绘一致（@2x SVG→Canvas→PNG）
 */

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/contexts/AppContext'
import { svgToCanvas, svgToDataUrl } from '@/utils/svgToCanvas'
import { downloadCanvas } from '@/utils/exportUtils'
import VenueAddButton from '@/components/ui/VenueAddButton'

// ─────────────────────────────────────────────────────
// ① 颜色配置类型（按实际组件有哪些可配色来定）
// ─────────────────────────────────────────────────────
interface ComponentColors {
  bgFrom:    string   // 背景渐变起色
  bgTo:      string   // 背景渐变终色
  accent:    string   // 主题强调色（按钮、装饰等）
  textColor: string   // 文字颜色
}

const DEFAULT_COLORS: ComponentColors = {
  bgFrom:    '#FFDCEB',
  bgTo:      '#FFD4D4',
  accent:    '#FF3060',
  textColor: '#950E0F',
}

// ─────────────────────────────────────────────────────
// ② SVG 模板函数（颜色作为参数，形状从 Figma 粘贴）
//
// 使用方式：
//   1. Figma 选中图层 → 右键 → Copy as SVG
//   2. 粘贴到这里，替换 viewBox / path 内容
//   3. 把写死的 hex 颜色改成 ${c.bgFrom} 这种模板变量
// ─────────────────────────────────────────────────────
const W = 750   // 组件设计稿宽度
const H = 200   // 组件设计稿高度（改成实际高度）

function renderSvg(c: ComponentColors, text = '示例文案'): string {
  return `
<svg viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- 背景渐变 -->
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${c.bgFrom}"/>
      <stop offset="100%" stop-color="${c.bgTo}"/>
    </linearGradient>

    <!-- ── 在这里粘贴 Figma 的 <defs>（clipPath / 其他渐变）── -->
  </defs>

  <!-- 背景 -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- ── 在这里粘贴 Figma 的形状 path ── -->
  <!-- 示例：把 Figma Copy as SVG 里的 <path d="..."/> 粘贴在这里 -->
  <!-- 把路径上写死的 fill="#FF3060" 改成 fill="${c.accent}" -->

  <!-- 示例装饰形状（删掉，换成真实 Figma 路径） -->
  <circle cx="60" cy="${H/2}" r="28" fill="${c.accent}" opacity="0.15"/>
  <circle cx="${W-60}" cy="${H/2}" r="28" fill="${c.accent}" opacity="0.15"/>

  <!-- 文字（如果有可配置文案） -->
  <text
    x="${W/2}" y="${H/2 + 6}"
    text-anchor="middle"
    font-family="PingFang SC, -apple-system, sans-serif"
    font-size="32" font-weight="600"
    fill="${c.textColor}"
  >${text}</text>

</svg>`
}

// ─────────────────────────────────────────────────────
// ③ 预览组件（改颜色立刻重渲染）
// ─────────────────────────────────────────────────────
function SvgPreview({ colors, text }: { colors: ComponentColors; text: string }) {
  return (
    <div
      style={{ width: '100%', lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: renderSvg(colors, text) }}
    />
  )
}

// ─────────────────────────────────────────────────────
// ④ 主页面（对齐现有 ExportCard 样式）
// ─────────────────────────────────────────────────────
export default function SvgComponentPage() {
  const { showToast } = useApp()
  const [colors, setColors]   = useState<ComponentColors>(DEFAULT_COLORS)
  const [text, setText]       = useState('示例文案')
  const [previewUrl, setPreviewUrl] = useState('')

  // 颜色/文案变化 → 立刻更新 previewUrl（用于加入会场）
  useEffect(() => {
    svgToDataUrl(renderSvg(colors, text), W, H).then(setPreviewUrl)
  }, [colors, text])

  const handleExport = useCallback(async () => {
    try {
      const canvas = await svgToCanvas(renderSvg(colors, text), W, H)
      downloadCanvas(canvas, `组件_${W}x${H}.png`)
      showToast('✅ 已导出 PNG')
    } catch {
      showToast('❌ 导出失败')
    }
  }, [colors, text, showToast])

  const setColor = (key: keyof ComponentColors) => (val: string) =>
    setColors(prev => ({ ...prev, [key]: val }))

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 预览 + 导出 */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 12 }}>
          预览 · {W} × {H} px
        </div>

        {/* 实时预览区 */}
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <SvgPreview colors={colors} text={text} />
        </div>

        {/* 导出 + 加入会场 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button
            onClick={handleExport}
            className="slot-btn-export"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            导出 PNG
          </button>
          {previewUrl && (
            <VenueAddButton
              componentId="yituosi"   // ← 改成对应的 ComponentId
              label="组件名称"
              previewUrl={previewUrl}
              origW={W}
              origH={H}
            />
          )}
        </div>
      </div>

      {/* ── 配色控件（直接在预览下方，改色立刻看到）── */}
      <div style={{
        padding: 16, borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.025)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>配色</div>

        {/* 颜色选择器（每个可配色一行）*/}
        {([
          { key: 'bgFrom',    label: '背景色（起）' },
          { key: 'bgTo',      label: '背景色（终）' },
          { key: 'accent',    label: '强调色' },
          { key: 'textColor', label: '文字色' },
        ] as { key: keyof ComponentColors; label: string }[]).map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', width: 80, flexShrink: 0 }}>{label}</span>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: colors[key],
                border: '1px solid rgba(255,255,255,0.2)',
              }} />
              <input
                type="color" value={colors[key]}
                onChange={e => setColor(key)(e.target.value)}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              />
            </div>
            <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>
              {colors[key].toUpperCase()}
            </span>
          </label>
        ))}

        {/* 文案输入（如果有） */}
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>文案</div>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="填写文案"
            style={{
              width: '100%', padding: '6px 10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, fontSize: 12,
              color: 'rgba(255,255,255,0.8)',
              outline: 'none',
            }}
          />
        </div>
      </div>

    </div>
  )
}
