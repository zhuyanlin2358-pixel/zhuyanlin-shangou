import { useRef, useEffect, useCallback } from 'react'
import { useSlot } from '@/contexts/SlotContext'
import { useApp } from '@/contexts/AppContext'
import { captureElement, downloadCanvas, downloadZip } from '@/utils/exportUtils'
import type { PrizeConfig } from '@/types'

/* ── 奖品卡片 ── */
function PrizeCard({ prize }: { prize: PrizeConfig }) {
  const isDashed  = prize.type === 'product-dashed'
  const isAmount  = prize.type === 'amount'
  const isThanks  = prize.type === 'thanks'
  const showTag   = prize.type === 'product-tag'
  const showImg   = prize.type === 'product-tag' || isDashed
  const showBottom= !isThanks

  const cardStyle: React.CSSProperties = isThanks
    ? { width:111, height:111, borderRadius:'50%', background:'#FFD060', border:'1px solid rgba(180,120,0,0.2)',
        position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif", alignSelf:'center' }
    : { width:111, height:119, borderRadius:14,
        background: isDashed ? '#FFF4D0' : '#FFE9B0',
        border: isDashed ? '1.5px dashed #F0A830' : '1px solid rgba(180,120,0,0.15)',
        position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center',
        fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif" }

  return (
    <div style={{ width:124, height:124, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative' }}>
      <div style={cardStyle}>
        {/* 顶部标签 */}
        {showTag && (
          <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
            width:81, minHeight:18, background:'#fff', borderRadius:'0 0 6px 6px',
            display:'flex', alignItems:'center', justifyContent:'center', padding:'2px 6px', zIndex:2 }}>
            <span style={{ fontSize:12, color:'#812D16', fontWeight:400, lineHeight:1.3, whiteSpace:'nowrap' }}>
              {prize.tag || '无门槛优惠券'}
            </span>
          </div>
        )}

        {/* 产品图区域 */}
        {showImg && (
          <div style={{
            position:'absolute', bottom:31, left:'50%', transform:'translateX(-50%)',
            width: isDashed ? 77 : 72, height: isDashed ? 78 : 72,
            background:'repeating-conic-gradient(#E8E8E8 0% 25%,#F8F8F8 0% 50%) 0 0/8px 8px',
            borderRadius:6, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {prize.imageUrl
              ? <img src={prize.imageUrl} style={{ maxWidth:'80%', maxHeight:'80%', objectFit:'contain' }} />
              : <span style={{ fontSize:9, color:'#888', textAlign:'center', lineHeight:1.4 }}>点击左侧<br/>上传图片</span>
            }
          </div>
        )}

        {/* 金额券 */}
        {isAmount && (
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-58%)',
            display:'flex', alignItems:'baseline', gap:1 }}>
            <span style={{ fontSize:60, fontWeight:700, color:'#812D16',
              fontFamily:"'MeituanDigitalType','PingFang SC',sans-serif", lineHeight:1, letterSpacing:-4 }}>
              {prize.amount || '30'}
            </span>
            <span style={{ fontSize:16, fontWeight:600, color:'#812D16', lineHeight:1 }}>
              {prize.unit || '元'}
            </span>
          </div>
        )}

        {/* 谢谢参与 */}
        {isThanks && (
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            textAlign:'center', fontSize:22, fontWeight:700, color:'#7B3A00', lineHeight:1.3, whiteSpace:'nowrap' }}>
            {prize.thanksText || '谢谢参与'}
          </div>
        )}

        {/* 底部文字 */}
        {showBottom && (
          <div style={{ position:'absolute', bottom:8, left:0, right:0, textAlign:'center',
            fontSize:13, color:'#7B3A00', fontWeight:500, lineHeight:1.2, whiteSpace:'nowrap' }}>
            {prize.bottomText}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── ExportCard 包装 ── */
function ExportCard({ children, label, sub, onExport }: {
  children: React.ReactNode; label: string; sub: string; onExport: () => void
}) {
  return (
    <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.08)',
      background:'rgba(255,255,255,0.04)' }}>
      <div style={{ padding:'16px 16px 12px', display:'flex', justifyContent:'center',
        background:'rgba(255,255,255,0.02)' }}>
        {children}
      </div>
      <div style={{ padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between',
        borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.8)' }}>{label}</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{sub}</div>
        </div>
        <button onClick={onExport} style={{
          padding:'5px 12px', fontSize:12, borderRadius:6, cursor:'pointer',
          border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.06)',
          color:'rgba(255,255,255,0.7)' }}>
          ↓ 导出
        </button>
      </div>
    </div>
  )
}

function SectionTitle({ num, label, sub, badge }: { num:number; label:string; sub:string; badge?:string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
      <div style={{ width:28, height:28, borderRadius:'50%', background:'#FF3060',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>{num}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color:'var(--text-1)' }}>{label}</div>
        <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{sub}</div>
      </div>
      {badge && <span style={{ fontSize:12, padding:'2px 8px', borderRadius:4,
        background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)' }}>{badge}</span>}
    </div>
  )
}

/* ── 主页面 ── */
export default function SlotPage() {
  const { config } = useSlot()
  const { showToast, registerExportAll } = useApp()

  const refs = {
    preview: useRef<HTMLDivElement>(null),
    bg:      useRef<HTMLDivElement>(null),
    empty:   useRef<HTMLDivElement>(null),
    btnActive:   useRef<HTMLDivElement>(null),
    btnDisabled: useRef<HTMLDivElement>(null),
    linkPrize: useRef<HTMLDivElement>(null),
    linkRule:  useRef<HTMLDivElement>(null),
    prize: [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)],
  }

  const ex = useCallback(async (
    ref: React.RefObject<HTMLDivElement | null>, name: string, w: number, h: number
  ) => {
    if (!ref.current) return
    showToast(`正在渲染 ${name}…`)
    try {
      const canvas = await captureElement(ref.current, w, h)
      downloadCanvas(canvas, `${name}.png`)
      showToast(`✅ ${name}.png`)
    } catch (e: unknown) { showToast(`❌ ${e instanceof Error ? e.message : '导出失败'}`) }
  }, [showToast])

  const doExportAll = useCallback(async () => {
    showToast('正在打包…')
    const tasks = [
      { ref: refs.preview,     name:'slot_1_未抽奖状态_750x242', w:750, h:242 },
      { ref: refs.bg,          name:'slot_2_背景_750x242',       w:750, h:242 },
      { ref: refs.empty,       name:'slot_3_空态页_854x284',     w:854, h:284 },
      { ref: refs.btnActive,   name:'slot_4_按钮立即抽奖_194x80',w:194, h:80  },
      { ref: refs.btnDisabled, name:'slot_4_按钮活动结束_194x80',w:194, h:80  },
      { ref: refs.linkPrize,   name:'slot_5_我的奖品_96x34',     w:96,  h:34  },
      { ref: refs.linkRule,    name:'slot_5_抽奖规则_109x34',    w:109, h:34  },
      ...refs.prize.map((r, i) => ({ ref:r, name:`slot_6_奖品${i+1}_124x124`, w:124, h:124 })),
    ]
    try {
      const files = await Promise.all(
        tasks.filter(t => t.ref.current).map(async t => ({
          canvas: await captureElement(t.ref.current!, t.w, t.h), name:`${t.name}.png`,
        }))
      )
      await downloadZip(files, '老虎机_切图包')
      showToast('✅ 已打包：老虎机_切图包.zip')
    } catch (e: unknown) { showToast(`❌ ${e instanceof Error ? e.message : '打包失败'}`) }
  }, [showToast]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    registerExportAll(doExportAll)
    return () => registerExportAll(null)
  }, [doExportAll, registerExportAll])

  const v = {
    '--btn-active-from': config.btnActiveFrom, '--btn-active-to': config.btnActiveTo,
    '--btn-disabled-from': config.btnDisabledFrom, '--btn-disabled-to': config.btnDisabledTo,
    '--slot-tint-from': config.slotTintFrom, '--slot-tint-to': config.slotTintTo,
    '--slot-links-color': config.linksColor, '--slot-title-color': config.titleColor,
  } as React.CSSProperties

  const PF = "'PingFang SC','Microsoft YaHei',sans-serif"

  return (
    <div style={{ padding:'24px 32px', display:'flex', flexDirection:'column', gap:32, ...v }}>

      {/* ── 1 未抽奖状态 ── */}
      <div>
        <SectionTitle num={1} label="老虎机未抽奖状态" sub="含标题 + 奖品图 + 按钮 · 750 × 242 px" badge="素材 1" />
        <ExportCard label="老虎机 — 未抽奖状态" sub="750 × 242 px · PNG"
          onExport={() => ex(refs.preview, 'slot_1_未抽奖状态_750x242', 750, 242)}>
          <div ref={refs.preview} style={{ width:750, height:242, position:'relative', overflow:'hidden',
            background:`linear-gradient(120deg,var(--slot-tint-from),var(--slot-tint-to))`,
            borderRadius:20, flexShrink:0 }}>
            <div style={{ position:'absolute', left:42, top:25, fontSize:33, fontWeight:500,
              color:'var(--slot-title-color)', fontFamily:PF, zIndex:3 }}>{config.titleText}</div>
            <div style={{ position:'absolute', top:24, right:48, display:'flex', alignItems:'center',
              fontSize:22, color:'var(--slot-links-color)', fontFamily:PF, zIndex:3 }}>
              <span>我的奖品</span><span style={{ margin:'0 8px', opacity:0.6 }}>|</span><span>抽奖规则</span>
            </div>
            <div style={{ position:'absolute', left:43, top:76, width:441, height:142, borderRadius:20,
              background:'#fff', border:'1px solid rgba(0,0,0,0.1)', zIndex:1 }} />
            <div style={{ position:'absolute', left:43, top:76, width:441, height:142, zIndex:2,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'0 12px' }}>
              {config.prizes.map((p, i) => <PrizeCard key={i} prize={p} />)}
            </div>
            <div style={{ position:'absolute', right:46, top:106, width:194, height:80, borderRadius:40, zIndex:3,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:`linear-gradient(90deg,var(--btn-active-from),var(--btn-active-to))`,
              fontSize:30, color:'#fff', fontFamily:PF }}>立即抽奖</div>
            <div style={{ position:'absolute', right:46, bottom:14, fontSize:14,
              color:'var(--slot-links-color)', textAlign:'center', width:194, zIndex:3 }}>
              还剩 999 次抽奖机会
            </div>
          </div>
        </ExportCard>
      </div>

      {/* ── 2 背景 ── */}
      <div>
        <SectionTitle num={2} label="老虎机背景" sub="含主标题，不带商品图 · 750 × 242 px" badge="素材 2" />
        <ExportCard label="老虎机背景（含主标题）" sub="750 × 242 px · PNG"
          onExport={() => ex(refs.bg, 'slot_2_背景_750x242', 750, 242)}>
          <div ref={refs.bg} style={{ width:750, height:242, position:'relative', overflow:'hidden',
            background:`linear-gradient(120deg,var(--slot-tint-from),var(--slot-tint-to))`,
            borderRadius:20, flexShrink:0 }}>
            <div style={{ position:'absolute', left:42, top:25, fontSize:33, fontWeight:500,
              color:'var(--slot-title-color)', fontFamily:PF }}>{config.titleText}</div>
            <div style={{ position:'absolute', left:43, top:76, width:441, height:142, borderRadius:20,
              background:'#fff', border:'1px solid rgba(0,0,0,0.1)' }} />
          </div>
        </ExportCard>
      </div>

      {/* ── 3 空态页 ── */}
      <div>
        <SectionTitle num={3} label="老虎机空态页" sub="854 × 284 px @2x" badge="素材 3" />
        <ExportCard label="老虎机空态页" sub="854 × 284 px · PNG"
          onExport={() => ex(refs.empty, 'slot_3_空态页_854x284', 854, 284)}>
          <div ref={refs.empty} style={{ width:427, height:142, borderRadius:12, background:'#fff',
            border:'1px solid rgba(0,0,0,0.06)', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative', flexShrink:0 }}>
            {/* 插图区域 */}
            <div style={{ width:239, height:96, position:'relative', overflow:'hidden', flexShrink:0,
              background:'repeating-conic-gradient(#E8E8E8 0% 25%,#F8F8F8 0% 50%) 0 0/8px 8px' }}>
              {config.emptyImageUrl && (
                <img src={config.emptyImageUrl} style={{ position:'absolute', top:'50%', left:'50%',
                  transform:`translate(-50%,-50%) scale(${config.emptyScale/100})`,
                  maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} />
              )}
            </div>
            <div style={{ marginTop:2, fontFamily:PF, fontSize:13, color:'#999', textAlign:'center', whiteSpace:'nowrap' }}>
              {config.emptyText}
            </div>
          </div>
        </ExportCard>
      </div>

      {/* ── 4 抽奖按钮（两款）── */}
      <div>
        <SectionTitle num={4} label="抽奖按钮" sub="194 × 80 px · 随配色自动适配" badge="素材 4–5" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <ExportCard label="按钮 — 立即抽奖" sub="194 × 80 px · PNG"
            onExport={() => ex(refs.btnActive, 'slot_4_按钮立即抽奖_194x80', 194, 80)}>
            <div ref={refs.btnActive} style={{ width:194, height:80, borderRadius:40, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:`linear-gradient(90deg,var(--btn-active-from),var(--btn-active-to))`,
              fontSize:30, color:'#fff', fontFamily:PF }}>立即抽奖</div>
          </ExportCard>
          <ExportCard label="按钮 — 活动已结束" sub="194 × 80 px · PNG"
            onExport={() => ex(refs.btnDisabled, 'slot_4_按钮活动结束_194x80', 194, 80)}>
            <div ref={refs.btnDisabled} style={{ width:194, height:80, borderRadius:40, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:`linear-gradient(90deg,var(--btn-disabled-from),var(--btn-disabled-to))`,
              fontSize:30, color:'#fff', fontFamily:PF }}>活动已结束</div>
          </ExportCard>
        </div>
      </div>

      {/* ── 5 链接文字（两款）── */}
      <div>
        <SectionTitle num={5} label="链接文字" sub="透明背景 · 随配色自动适配" />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <ExportCard label="我的奖品" sub="96 × 34 px · PNG"
            onExport={() => ex(refs.linkPrize, 'slot_5_我的奖品_96x34', 96, 34)}>
            <div ref={refs.linkPrize} style={{ width:96, height:34, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, color:'var(--slot-links-color)', fontFamily:PF }}>我的奖品</div>
          </ExportCard>
          <ExportCard label="抽奖规则" sub="109 × 34 px · PNG"
            onExport={() => ex(refs.linkRule, 'slot_5_抽奖规则_109x34', 109, 34)}>
            <div ref={refs.linkRule} style={{ width:109, height:34, flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, color:'var(--slot-links-color)', fontFamily:PF }}>
              <span style={{ opacity:0.6, marginRight:8 }}>|</span>抽奖规则
            </div>
          </ExportCard>
        </div>
      </div>

      {/* ── 6 奖品图 ── */}
      <div>
        <SectionTitle num={6} label="奖品图" sub="124 × 124 px · 可编辑模板" badge="素材 6" />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {config.prizes.map((p, i) => (
            <ExportCard key={i} label={`奖品图 ${i+1} — ${p.bottomText || p.thanksText}`} sub="124 × 124 px · PNG"
              onExport={() => ex(refs.prize[i], `slot_6_奖品${i+1}_124x124`, 124, 124)}>
              <div ref={refs.prize[i]} style={{
                width:124, height:124, display:'flex', alignItems:'center', justifyContent:'center',
                background:'repeating-conic-gradient(#F0F0F0 0% 25%,#FAFAFA 0% 50%) 0 0/16px 16px',
              }}>
                <PrizeCard prize={p} />
              </div>
            </ExportCard>
          ))}
        </div>
      </div>

    </div>
  )
}
