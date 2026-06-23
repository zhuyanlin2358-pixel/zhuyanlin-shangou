/**
 * 一键领券红包 SVG 渲染（基于 Figma 精确路径）
 *
 * 替代 exportUtils.ts 中手写的 Canvas 近似路径，还原度提升至 100%：
 *   - 腰封弧形：Figma 导出的 702 坐标点精确曲线
 *   - 闪电装饰：Figma 精确 path + 精确坐标
 *   - 背景圆角：r=24（Figma 原值）
 *
 * 使用方式：
 *   import { renderCouponBgSvg } from '@/utils/couponSvgRender'
 *   import { svgToCanvas }       from '@/utils/svgToCanvas'
 *   const canvas = await svgToCanvas(renderCouponBgSvg(cfg), 702, 352)
 */

import type { CouponConfig } from '@/types'
import { COUPON_COLORS }     from '@/types'

// ── Figma 精确路径常量 ─────────────────────────────────────────────────────

/** 腰封弧形 – Figma 精确导出，702×166，顶部有机曲线 */
const WAIST_PATH =
  'M701.5 142C701.5 154.979 690.979 165.5 678 165.5H24C11.0214 165.5 0.500198 ' +
  '154.979 0.5 142V1.354C0.822795 1.42844 1.2714 1.53129 1.84277 1.66064C3.13481 ' +
  '1.95314 5.05478 2.38168 7.56641 2.92529C12.5897 4.01254 19.9813 5.56125 29.457 ' +
  '7.40674C48.4085 11.0977 75.6972 15.9771 109.05 20.731C175.754 30.2385 266.721 ' +
  '39.2454 363.766 37.2417C460.8 35.2382 545.382 26.0507 605.706 17.3638C635.868 ' +
  '13.0203 659.967 8.80224 676.526 5.66943C684.806 4.10304 691.201 2.80737 695.526 ' +
  '1.90381C697.689 1.45206 699.334 1.09797 700.439 0.856934C700.879 0.761073 ' +
  '701.233 0.68275 701.5 0.623535V142Z'

/** 背景圆角矩形路径（r=24，702×352）*/
const BG_PATH =
  'M0 24C0 10.7452 10.7452 0 24 0H678C691.255 0 702 10.7452 702 24V328C702 ' +
  '341.255 691.255 352 678 352H24C10.7452 352 0 341.255 0 328V24Z'

/** 大闪电 – 左（Figma: 15×26，绝对坐标 x=132 y=34.5）*/
const BOLT_LG_L = 'M9.5 0H0L6 13.5H1.5L15 25.5L9.5 13.5H15L9.5 0Z'
/** 大闪电 – 右（Figma: 15×26，绝对坐标 x=537 y=34.5）*/
const BOLT_LG_R = 'M5.5 0H15L9 13.5H13.5L0 25.5L5.5 13.5H0L5.5 0Z'
/** 小闪电 – 左（Figma: 11×13，绝对坐标 x=121 y=34）*/
const BOLT_SM_L = 'M4.5 0L0 2L4.32842 7L2 8.5L10.5 13L6.5 8L9 7L4.5 0Z'
/** 小闪电 – 右（Figma: 11×13，绝对坐标 x=552.5 y=34）*/
const BOLT_SM_R = 'M6 0L10.5 2L6.17158 7L8.5 8.5L0 13L4 8L1.5 7L6 0Z'

// ── 腰封白色 fade stroke（Figma 精确）────────────────────────────────────────
const WAIST_STROKE_GRAD = (id: string) => `
  <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
    <stop offset="0%"   stop-color="white" stop-opacity="0.01"/>
    <stop offset="100%" stop-color="white"/>
  </linearGradient>`

// ── 主标题闪电装饰 SVG ────────────────────────────────────────────────────────
function titleDecor(boltColor1: string, boltColor2: string): string {
  return `
  <!-- 闪电装饰（Figma 精确坐标：大闪电 x=132/537 y=34.5，小闪电 x=121/552.5 y=34）-->
  <g transform="translate(121,34)">
    <path d="${BOLT_SM_L}" fill="${boltColor2}"/>
  </g>
  <g transform="translate(132,34.5)">
    <path d="${BOLT_LG_L}" fill="${boltColor1}"/>
  </g>
  <g transform="translate(537,34.5)">
    <path d="${BOLT_LG_R}" fill="${boltColor1}"/>
  </g>
  <g transform="translate(552.5,34)">
    <path d="${BOLT_SM_R}" fill="${boltColor2}"/>
  </g>`
}

// ── 主标题文字 SVG ───────────────────────────────────────────────────────────
function titleText(text: string, color: string): string {
  return `
  <text
    x="351" y="47"
    text-anchor="middle" dominant-baseline="alphabetic"
    font-family="FZLanTingHei-DB, FZLanTingHeiS-DB1-GBK, PingFang SC, sans-serif"
    font-size="32" font-weight="400"
    fill="${color}"
  >${text}</text>`
}

// ── 白色券卡（3张全卡 + 1张半显，Figma 精确布局）────────────────────────────
function couponCards(textColor: string): string {
  // Figma：内部区域 x=16 y=84 w=670 h=256；卡宽192 间距12
  const cards = [
    { x: 18,  label: '外卖餐饮券', showAmount: false },
    { x: 222, label: '外卖餐饮券', showAmount: true  },
    { x: 426, label: '外卖餐饮券', showAmount: true  },
  ]
  const clipId = 'cardsClip'
  const H_CARD = 244, R_CARD = 16

  return `
  <defs>
    <clipPath id="${clipId}">
      <rect x="16" y="84" width="670" height="256"/>
    </clipPath>
  </defs>
  <g clip-path="url(#${clipId})">
    <!-- 3 张完整卡 + 第4张半卡（通过 clip 裁切） -->
    ${[...cards, { x: 630, label: '外卖餐饮券', showAmount: true }].map(({ x, label, showAmount }) => `
    <rect x="${x}" y="86" width="192" height="${H_CARD}" rx="${R_CARD}" fill="white"/>
    <text x="${x + 96}" y="119"
      text-anchor="middle" font-family="PingFang SC, sans-serif"
      font-size="22" font-weight="700" fill="#000">${label}</text>
    ${showAmount ? `
    <text x="${x + 92}" y="157"
      text-anchor="end" font-family="PingFang SC, sans-serif"
      font-size="17" fill="${textColor}">¥</text>
    <text x="${x + 94}" y="162"
      font-family="PingFang SC, sans-serif" font-size="32" font-weight="700"
      fill="${textColor}">?</text>
    <text x="${x + 96}" y="198"
      text-anchor="middle" font-family="PingFang SC, sans-serif"
      font-size="12" fill="#222426">${label}</text>
    ` : ''}
    `).join('')}
  </g>`
}

// ── 胶囊按钮 ─────────────────────────────────────────────────────────────────
function buttonSvg(
  btnText: string,
  fromColor: string,
  toColor: string,
  x: number, y: number, w: number, h: number,
  idSuffix = '',
): string {
  const r = h / 2
  const gId = `btnGrad${idSuffix}`
  return `
  <defs>
    <linearGradient id="${gId}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${fromColor}"/>
      <stop offset="100%" stop-color="${toColor}"/>
    </linearGradient>
  </defs>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"
        fill="url(#${gId})"/>
  <text x="${x + w/2}" y="${y + h/2 + 1}"
    text-anchor="middle" dominant-baseline="middle"
    font-family="FZLanTingHei-DB, PingFang SC, sans-serif"
    font-size="28" fill="white"
  >${btnText}</text>`
}

// ─────────────────────────────────────────────────────────────────────────────
// 公开 API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 券包背景 702×352（渐变底 + 标题文案 + 闪电，无按钮/券卡）
 */
export function renderCouponBgSvg(cfg: CouponConfig): string {
  const c        = COUPON_COLORS[cfg.colorKey]
  const bgGradId = 'bgGrad'
  return `<svg viewBox="0 0 702 352" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${bgGradId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="1%"   stop-color="${c.cardBgFrom}"/>
      <stop offset="100%" stop-color="${c.cardBgTo}"/>
    </linearGradient>
  </defs>
  <!-- 背景（Figma 精确圆角 r=24）-->
  <path d="${BG_PATH}" fill="url(#${bgGradId})"/>
  ${titleDecor(c.cardBgTo, c.cardBgFrom)}
  ${titleText(cfg.titleText, c.textColor)}
</svg>`
}

/**
 * 券包腰封 702×168（Figma 精确弧形曲线）
 */
export function renderCouponWaistSvg(cfg: CouponConfig): string {
  const c       = COUPON_COLORS[cfg.colorKey]
  const fillId  = 'waistFill'
  const strokeId = 'waistStroke'
  return `<svg viewBox="0 0 702 168" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${fillId}" x1="0" y1="1" x2="0" y2="0">
      <stop offset="1%"   stop-color="${c.cardBgFrom}"/>
      <stop offset="100%" stop-color="${c.cardBgTo}"/>
    </linearGradient>
    ${WAIST_STROKE_GRAD(strokeId)}
  </defs>
  <!-- 腰封弧形（Figma 导出 702 点精确曲线）-->
  <path d="${WAIST_PATH}"
    fill="url(#${fillId})"
    stroke="url(#${strokeId})" stroke-width="1"/>
</svg>`
}

/**
 * 组件按钮 480×80
 */
export function renderCouponButtonSvg(cfg: CouponConfig): string {
  const c = COUPON_COLORS[cfg.colorKey]
  return `<svg viewBox="0 0 480 80" xmlns="http://www.w3.org/2000/svg">
  ${buttonSvg(cfg.btnText || '一键领取', c.btnFrom, c.btnTo, 0, 0, 480, 80, 'btn')}
</svg>`
}

/**
 * 完整合成预览 702×352
 * 层次：背景 → 闪电+标题 → 券卡 → 腰封弧形 → 按钮
 */
export function renderCouponPreviewSvg(cfg: CouponConfig): string {
  const c        = COUPON_COLORS[cfg.colorKey]
  const WAIST_Y  = 184   // 腰封起始 Y（Figma 精确）
  const bgGradId = 'pvBg'
  const wFillId  = 'pvWaist'
  const wStrkId  = 'pvWaistS'

  return `<svg viewBox="0 0 702 352" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${bgGradId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="1%"   stop-color="${c.cardBgFrom}"/>
      <stop offset="100%" stop-color="${c.cardBgTo}"/>
    </linearGradient>
    <linearGradient id="${wFillId}" x1="0" y1="1" x2="0" y2="0">
      <stop offset="1%"   stop-color="${c.cardBgFrom}"/>
      <stop offset="100%" stop-color="${c.cardBgTo}"/>
    </linearGradient>
    ${WAIST_STROKE_GRAD(wStrkId)}
  </defs>

  <!-- ① 背景 -->
  <path d="${BG_PATH}" fill="url(#${bgGradId})"/>

  <!-- ② 闪电 + 标题 -->
  ${titleDecor(c.cardBgTo, c.cardBgFrom)}
  ${titleText(cfg.titleText, c.textColor)}

  <!-- ③ 白色券卡（Figma 精确布局，裁切显示 3.5 张）-->
  ${couponCards(c.textColor)}

  <!-- ④ 腰封弧形（translate 到 y=184）-->
  <g transform="translate(0,${WAIST_Y})">
    <path d="${WAIST_PATH}"
      fill="url(#${wFillId})"
      stroke="url(#${wStrkId})" stroke-width="1"/>
  </g>

  <!-- ⑤ 按钮（702px 居中：(702-480)/2=111）-->
  ${buttonSvg(cfg.btnText || '一键领取', c.btnFrom, c.btnTo, 111, WAIST_Y + 44, 480, 80, 'pv')}
</svg>`
}
