import { useRef, useEffect } from 'react'
import { useSlot } from '@/contexts/SlotContext'
import { PrizeCardFull } from '@/components/pages/SlotPage'

const PF  = "'FZLanTingHei-M','PingFang SC','Microsoft YaHei',sans-serif"
const PFB = "'FZLanTingHei-DB','FZLanTingHei-M','PingFang SC','Microsoft YaHei',sans-serif"
const SLOT_W = 750
const PANEL_W = 296            // 原版 panel-slot-inner-wrap 宽度
const SCALE   = PANEL_W / SLOT_W // 0.3947
const MOCK_BG_MIN_H = Math.round(1624 * 320 / 750) // 693px — 原版公式

export default function PreviewPanel() {
  const { config } = useSlot()

  // 拖拽：直接操作 DOM style，跟原版 initPanelSlotDrag 完全一致
  // 不用 state 避免每次 move 触发 re-render + effect 重新注册
  const dragging  = useRef(false)
  const startY    = useRef(0)
  const topPx     = useRef(56)   // 当前 top，初始 56px（nav 高度）

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const wrap = document.getElementById('panel-slot-inner-wrap')
      if (!wrap) return
      const r = wrap.getBoundingClientRect()
      if (e.clientX < r.left || e.clientX > r.right ||
          e.clientY < r.top  || e.clientY > r.bottom) return
      dragging.current = true
      startY.current   = e.clientY
      e.preventDefault()
    }
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const wrap = document.getElementById('panel-slot-inner-wrap')
      if (!wrap) return
      topPx.current = topPx.current + (e.clientY - startY.current)
      startY.current = e.clientY           // 每帧更新起点，对齐原版
      wrap.style.top = topPx.current + 'px'
    }
    const onUp = () => { dragging.current = false }

    document.addEventListener('mousedown', onDown)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
    }
  }, [])  // 只绑定一次，通过 DOM ref 读最新值

  return (
    <aside style={{
      position: 'fixed', top: 56, right: 0, width: 360,
      height: 'calc(100vh - 56px)',
      background: '#0C111B',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', zIndex: 40,
    }}>
      {/* 标题 */}
      <div style={{
        padding: '10px 14px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
          手机预览
        </div>
      </div>

      {/* 预览区：可滚动 */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        scrollbarWidth: 'none',
      }}>
        {/* 手机框 */}
        <div id="page-mock" style={{
          width: 320, borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          background: '#f5f5f5',
          flexShrink: 0,
          position: 'relative',    // 必须 relative，inner-wrap 才能 absolute
        }}>
          {/* 导航条 44px */}
          <div id="page-mock-nav" style={{
            height: 44, display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 8,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            position: 'relative', zIndex: 20,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd' }} />
            <div style={{
              flex: 1, textAlign: 'center',
              fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginRight: 24,
            }}>
              闪购会场
            </div>
          </div>

          {/* 会场背景 — min-height: 693px（原版 Math.round(1624×320/750)） */}
          <div id="page-mock-bg" style={{
            width: '100%',
            minHeight: MOCK_BG_MIN_H,
            padding: 12,
            background: config.bgColor || '#ffdcdc',
            transition: 'background-color 0.3s',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            {/* 背景占位高度（让背景能撑开） */}
            <div style={{ height: MOCK_BG_MIN_H - 24 }} />
          </div>

          {/* 老虎机内容层 — 绝对定位，可上下拖拽，初始 top=56px */}
          <div
            id="panel-slot-inner-wrap"
            style={{
              width: PANEL_W,
              position: 'absolute',
              top: 56,              // 初始在 nav 下方，之后由 DOM 直接更新
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              cursor: 'grab',
              overflow: 'visible',
              borderRadius: 8,
            }}
          >
            {/* 实际老虎机内容，scale(0.3947)，pointer-events:none */}
            <div style={{
              width: SLOT_W,
              height: 242,   // 老虎机原始高度，scale 后视觉约 95px
              transform: `scale(${SCALE})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
            }}>
              {/* ── asset-slot-ready 克隆（与 canvas drawBg 颜色完全同步）── */}
              <div style={{
                width: SLOT_W, height: 242,
                position: 'relative', overflow: 'hidden',
                // daily 用 Figma 精确色，minimal 用主题预设色
                background: config.slotStyle === 'daily'
                  ? 'linear-gradient(90deg, #FFF2F6, #FEDCE2)'
                  : `linear-gradient(90deg, ${config.slotTintFrom}, ${config.slotTintTo})`,
                borderRadius: 20,
              }}>
                {/* daily style：矩形备份7（Figma精确色）+ 真实箭头图片 */}
                {config.slotStyle === 'daily' && (<>
                  <div style={{
                    position: 'absolute', left: 342, top: 0,
                    width: 384, height: 105,
                    borderRadius: '24px 0 0 24px',
                    background: 'linear-gradient(90deg, #FFD8DA, #FFC7D4)',
                    pointerEvents: 'none',
                  }} />
                  <img src={`${import.meta.env.BASE_URL}arrow-left.png`} alt=""
                    style={{ position: 'absolute', left: 31, top: 139, width: 26, height: 26, pointerEvents: 'none' }} />
                  <img src={`${import.meta.env.BASE_URL}arrow-right.png`} alt=""
                    style={{ position: 'absolute', left: 452, top: 139, width: 26, height: 26, pointerEvents: 'none' }} />
                </>)}
                {/* 标题 */}
                <div style={{
                  position: 'absolute', left: 43, top: 11,
                  fontSize: 38, fontWeight: 400, lineHeight: '58.8px',
                  color: config.titleColor, fontFamily: PFB,
                  whiteSpace: 'nowrap', zIndex: 3,
                }}>
                  {config.titleText}
                </div>
                {/* 链接 */}
                <div style={{
                  position: 'absolute', top: 11, right: 48,
                  display: 'flex', alignItems: 'center',
                  fontSize: 28, lineHeight: '44px', color: config.linksColor, fontFamily: PF, zIndex: 3, letterSpacing: '2px',
                }}>
                  <span>我的奖品</span>
                  <span style={{ margin: '0 8px', opacity: 0.6 }}>|</span>
                  <span>抽奖规则</span>
                </div>
                {/* 奖品框白底（Figma：白色 + 底部淡粉渐变 + 白色描边） */}
                <div style={{
                  position: 'absolute', left: 43, top: 75,
                  width: 427, height: 142, borderRadius: 24,
                  background: 'linear-gradient(180deg, #fff 67%, rgba(255,246,249,1) 100%)',
                  border: '1px solid #FFFFFF', zIndex: 1,
                }} />
                {/* 奖品层 — PrizeCardFull + prizeTransforms */}
                <div style={{
                  position: 'absolute', left: 43, top: 75,
                  width: 427, height: 142, zIndex: 2,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, padding: '0 12px',
                }}>
                  {config.prizes.map((p, i) => (
                    <PrizeCardFull
                      key={i}
                      prize={p}
                      transform={config.prizeTransforms[i]}
                    />
                  ))}
                </div>
                {/* 按钮 */}
                <div style={{
                  position: 'absolute', right: 57, top: 104,
                  width: 194, height: 80, borderRadius: 40, zIndex: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(90deg, ${config.btnActiveFrom}, ${config.btnActiveTo})`,
                  fontSize: 30, color: '#fff', fontFamily: PFB,
                }}>
                  立即抽奖
                </div>
                {/* 剩余次数 */}
                <div style={{
                  position: 'absolute', right: 79, top: 188,
                  fontSize: 20, color: config.linksColor, fontFamily: PF,
                  textAlign: 'center', width: 153, zIndex: 3,
                  whiteSpace: 'nowrap',
                }}>
                  还剩 999 次抽奖机会
                </div>
              </div>

            </div>
          </div>
        </div>

        <div style={{
          marginTop: 8, fontSize: 11,
          color: 'rgba(255,255,255,0.2)', textAlign: 'center',
        }}>
          拖动老虎机区域可上下移动
        </div>
      </div>
    </aside>
  )
}
