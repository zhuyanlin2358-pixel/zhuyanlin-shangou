import { useRef } from 'react'
import { useApp } from '@/contexts/AppContext'
import { captureElement, downloadCanvas } from '@/utils/exportUtils'

const SUB = '尺寸待规范确认'

function SectionCard({
  num, label, sub, name, exportRef, children,
}: {
  num: number; label: string; sub: string; name: string
  exportRef: React.RefObject<HTMLDivElement>
  children: React.ReactNode
}) {
  const { showToast } = useApp()

  const doExport = async () => {
    if (!exportRef.current) return
    showToast(`正在渲染 ${name}…`)
    try {
      const el = exportRef.current
      const canvas = await captureElement(el, el.offsetWidth, el.offsetHeight)
      downloadCanvas(canvas, `${name}.png`)
      showToast(`✅ ${name}.png`)
    } catch (e: unknown) {
      showToast(`❌ ${e instanceof Error ? e.message : '导出失败'}`)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent,#FF3060)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
          {num}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      <div style={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', overflow: 'hidden' }}>
        <div style={{ padding: 16, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
          <div ref={exportRef}>{children}</div>
        </div>
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>尺寸待定 · PNG</div>
          </div>
          <button onClick={doExport} className="btn-export-single">⬇ 导出</button>
        </div>
      </div>
    </div>
  )
}

function Placeholder({ w, h, text }: { w?: number; h: number; text: string }) {
  return (
    <div style={{ width: w ?? '100%', height: h, background: 'var(--bg-subtle)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 12, textAlign: 'center', lineHeight: 1.6 }}>
      {text.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
      <span style={{ fontSize: 10, opacity: 0.6 }}>（尺寸待规范确认）</span>
    </div>
  )
}

export default function YituosiPage() {
  const r1 = useRef<HTMLDivElement>(null)
  const r2 = useRef<HTMLDivElement>(null)
  const r3 = useRef<HTMLDivElement>(null)
  const r4 = useRef<HTMLDivElement>(null)
  const r5 = useRef<HTMLDivElement>(null)
  const r6 = useRef<HTMLDivElement>(null)

  return (
    <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

      <SectionCard num={1} label="主视觉（营销标注）" sub={`完整大促瓷片 · ${SUB}`} name="一拖四_主视觉" exportRef={r1}>
        <Placeholder w={375} h={180} text={"主视觉\n上传图片后显示"} />
      </SectionCard>

      <SectionCard num={2} label="价格标签" sub={`主价格 + 划线价 · ${SUB}`} name="一拖四_价格标签" exportRef={r2}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, padding: '12px 20px', background: 'var(--bg-subtle)', borderRadius: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#FF3060', fontFamily: "'MeituanDigitalType',sans-serif" }}>¥12.9</span>
          <span style={{ fontSize: 13, color: '#bbb', textDecoration: 'line-through' }}>¥25.9</span>
        </div>
      </SectionCard>

      <SectionCard num={3} label="活动 Logo" sub={`品牌/活动圆形 Logo · ${SUB}`} name="一拖四_活动Logo" exportRef={r3}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 11 }}>Logo</div>
      </SectionCard>

      <SectionCard num={4} label="副标题" sub={`活动副文案 · ${SUB}`} name="一拖四_副标题" exportRef={r4}>
        <div style={{ padding: '10px 20px', background: 'var(--bg-subtle)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>
          精选好货 限时特惠
        </div>
      </SectionCard>

      <SectionCard num={5} label="静态兜底" sub={`商品缺货时显示 · ${SUB}`} name="一拖四_静态兜底" exportRef={r5}>
        <Placeholder w={375} h={142} text={"静态兜底\n上传图片后显示"} />
      </SectionCard>

      <SectionCard num={6} label="动态兜底" sub={`含动效帧 · ${SUB}`} name="一拖四_动态兜底" exportRef={r6}>
        <Placeholder w={375} h={142} text={"动态兜底\n上传图片后显示"} />
      </SectionCard>

    </div>
  )
}
