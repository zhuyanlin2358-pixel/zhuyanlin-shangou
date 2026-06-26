/**
 * 会场各组件预览 URL 生成函数（共享）
 * 被 VenueDynamicPanel 和 VenueLayerPanel（侧边栏加入按钮）共同使用
 */
import {
  drawFloorCanvas, drawHTabCanvas, drawCouponPreview,
  drawSlotBannerCanvas, drawPrizeCanvas, preloadFonts,
} from '@/utils/exportUtils'
import type { PrizeInfo, XfTransform, BannerConfig } from '@/utils/exportUtils'
import type { SlotConfig } from '@/types'

export async function genFloorUrl(cfg: Parameters<typeof drawFloorCanvas>[0]): Promise<string> {
  await preloadFonts()
  return (await drawFloorCanvas(cfg)).toDataURL('image/png')
}

export async function genHTabUrl(cfg: Parameters<typeof drawHTabCanvas>[0]): Promise<string> {
  await preloadFonts()
  return (await drawHTabCanvas(cfg)).toDataURL('image/png')
}

export async function genCouponUrl(cfg: Parameters<typeof drawCouponPreview>[0]): Promise<string> {
  await preloadFonts()
  return (await drawCouponPreview(cfg)).toDataURL('image/png')
}

export async function genSlotUrl(config: SlotConfig): Promise<string> {
  await preloadFonts()
  const prizeCanvases = await Promise.all(
    config.prizes.map((p, i) =>
      drawPrizeCanvas(p as PrizeInfo, config.prizeTransforms[i] as XfTransform, config.slotStyle)
    )
  )
  const bannerCfg: BannerConfig = {
    slotTintFrom:  config.slotTintFrom,
    slotTintTo:    config.slotTintTo,
    slotRect7From: config.slotRect7From,
    slotRect7To:   config.slotRect7To,
    titleText:     config.titleText,
    titleColor:    config.titleColor,
    linksColor:    config.linksColor,
    btnActiveFrom: config.btnActiveFrom,
    btnActiveTo:   config.btnActiveTo,
    btnTextColor:  config.btnTextColor,
    slotBtnText:   config.slotBtnText,
    slotStyle:     config.slotStyle,
  }
  return (await drawSlotBannerCanvas(bannerCfg, prizeCanvases)).toDataURL('image/png')
}
