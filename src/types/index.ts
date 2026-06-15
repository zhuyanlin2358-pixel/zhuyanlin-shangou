export type ComponentStatus = 'done' | 'coming'
export type PageId = 'home' | 'comp' | 'assets' | 'review'

export type ComponentId =
  | 'yituosi' | 'n4' | 'n2' | 'yituoer' | 'diaotong' | 'xin-zujian'
  | 'cebar' | 'banner-v' | 'brand-feed' | 'search-ala' | 'popup'
  | 'flower-sale' | 'flower-daily' | 'flower-huayang'
  | 'logo-tag' | 'shop-belt' | 'goods-mark' | 'shop-poster' | 'shop-jg'
  | 'shop-banner' | 'shop-hotzone' | 'card-title' | 'pet-nav' | 'pet-sidebar'
  | 'brand-diy' | 'lottery-card' | 'feed-banner' | 'lp-common' | 'inner-sidebar'
  | 'slot' | 'slot-order' | 'lottery-sign' | 'red-rain'
  | 'coupon-multi' | 'coupon' | 'coupon-old'
  | 'ad-wall' | 'tab-img' | 'h-tab' | 'smart-zone'
  | 'carousel' | 'bottom-nav' | 'top-tab' | 'super-tile' | 'compound' | 'video-carousel' | 'floor'
  | 'group-promo'

export interface ComponentDef {
  id: ComponentId
  name: string
  desc?: string
  status: ComponentStatus
}

export interface ComponentGroup {
  group: string
  groupLabel: string
  subgroups?: { label: string; items: ComponentDef[] }[]
  items?: ComponentDef[]
}

export const COMPONENT_REGISTRY: ComponentGroup[] = [
  {
    group: 'P0', groupLabel: '闪购频道页资源位',
    items: [
      { id: 'yituosi',    name: '一拖四',           desc: '切图素材导出', status: 'done' },
      { id: 'n4',         name: 'N4 文字标签',      desc: '切图素材导出', status: 'done' },
      { id: 'n2',         name: 'N2 品牌/活动 Logo', desc: '切图素材导出', status: 'done' },
      { id: 'yituoer',    name: '一拖二',           status: 'coming' },
      { id: 'diaotong',   name: '顶通',             status: 'coming' },
      { id: 'xin-zujian', name: '首页新组件',       status: 'coming' },
      { id: 'cebar',      name: '侧边栏',           status: 'coming' },
      { id: 'banner-v',   name: '竖版 Banner',      status: 'coming' },
      { id: 'brand-feed', name: '品牌 Feed',        status: 'coming' },
      { id: 'search-ala', name: '搜索页阿拉丁模板', status: 'coming' },
      { id: 'popup',      name: '弹窗/天降',        status: 'coming' },
    ],
  },
  {
    group: 'P1', groupLabel: '鲜花频道页资源位',
    items: [
      { id: 'flower-sale',   name: '鲜花频道-大促换肤', status: 'coming' },
      { id: 'flower-daily',  name: '鲜花频道-日常规范', status: 'coming' },
      { id: 'flower-huayang',name: '鲜花频道-有花漾',   status: 'coming' },
    ],
  },
  {
    group: 'P2', groupLabel: '店铺资源位及商家打标',
    items: [
      { id: 'logo-tag',    name: '商家 Logo 大促标签',   status: 'coming' },
      { id: 'shop-belt',   name: '店铺腰带',             status: 'coming' },
      { id: 'goods-mark',  name: '商品主图打标',          status: 'coming' },
      { id: 'shop-poster', name: '店铺内大海报',          status: 'coming' },
      { id: 'shop-jg',     name: '店铺内金刚球',          status: 'coming' },
      { id: 'shop-banner', name: '店铺内 Banner',         status: 'coming' },
      { id: 'shop-hotzone',name: '店铺内热区组件',        status: 'coming' },
      { id: 'card-title',  name: '商卡组件标题栏',        status: 'coming' },
      { id: 'pet-nav',     name: '顶部导航金刚-宠物专用', status: 'coming' },
      { id: 'pet-sidebar', name: '左侧边栏-宠物专用',    status: 'coming' },
    ],
  },
  {
    group: 'P3', groupLabel: '落地页组件',
    items: [
      { id: 'brand-diy',   name: '品牌自设计规范',   status: 'coming' },
      { id: 'lottery-card',name: '抽免单卡组件',     status: 'coming' },
      { id: 'feed-banner', name: 'Feed 卡片 Banner', status: 'coming' },
      { id: 'lp-common',   name: '落地页通用组件',   status: 'coming' },
      { id: 'inner-sidebar',name:'内页侧边栏',       status: 'coming' },
    ],
  },
  {
    group: 'P4', groupLabel: '高达组件',
    subgroups: [
      {
        label: 'A 互动玩法类',
        items: [
          { id: 'slot',         name: '无门槛老虎机',   desc: '抽奖组件全套切图', status: 'done' },
          { id: 'slot-order',   name: '下单抽奖老虎机', status: 'coming' },
          { id: 'lottery-sign', name: '抽签玩法换肤',   status: 'coming' },
          { id: 'red-rain',     name: '2D 红包雨',      status: 'coming' },
        ],
      },
      {
        label: 'B 优惠券/红包类',
        items: [
          { id: 'coupon-multi', name: '多业务通用券',              status: 'coming' },
          { id: 'coupon',       name: '红包/优惠券（新）',         status: 'coming' },
          { id: 'coupon-old',   name: '默认优惠券/红包皮肤（旧）', status: 'coming' },
        ],
      },
      {
        label: 'C 展示组件类',
        items: [
          { id: 'h-tab',          name: '横滑 Tab',           desc: '7色配色切图', status: 'done' },
          { id: 'floor',          name: '楼层条',             desc: '切图素材导出', status: 'done' },
          { id: 'ad-wall',        name: '品牌活动广告墙',     status: 'coming' },
          { id: 'tab-img',        name: 'TAB 图片版',         status: 'coming' },
          { id: 'smart-zone',     name: '智能分会场物料',     status: 'coming' },
          { id: 'carousel',       name: '轮播图',             status: 'coming' },
          { id: 'bottom-nav',     name: '底部导航',           status: 'coming' },
          { id: 'top-tab',        name: '顶部 TAB 配图',      status: 'coming' },
          { id: 'super-tile',     name: '超级瓷片',           status: 'coming' },
          { id: 'compound',       name: '复合供给',           status: 'coming' },
          { id: 'video-carousel', name: '视频轮播',           status: 'coming' },
        ],
      },
    ],
  },
  {
    group: 'P6', groupLabel: '团资源位',
    items: [
      { id: 'group-promo', name: '首页大促专区简版中通', status: 'coming' },
    ],
  },
]

// 扁平化所有组件
export function getAllComponents(): (ComponentDef & { groupLabel: string })[] {
  return COMPONENT_REGISTRY.flatMap(g => {
    if (g.subgroups) {
      return g.subgroups.flatMap(sg => sg.items.map(item => ({ ...item, groupLabel: g.groupLabel })))
    }
    return (g.items || []).map(item => ({ ...item, groupLabel: g.groupLabel }))
  })
}

export function findComponent(id: ComponentId): ComponentDef | undefined {
  return getAllComponents().find(c => c.id === id)
}

export const DONE_COMP_IDS: ComponentId[] = ['yituosi', 'n4', 'n2', 'slot', 'floor', 'h-tab']

export interface Logo {
  id: string
  name: string
  data: string
  type: 'filled' | 'stroke'
}

export interface AssetRecord {
  id: string
  compId: ComponentId
  compLabel: string
  files: string[]
  status: 'pending' | 'approved' | 'rejected'
  timestamp: number
}

export interface SlotPreset {
  from: string
  to: string
  disFrom: string
  disTo: string
  slotFrom: string
  slotTo: string
  rect7From: string
  rect7To: string
  linksColor: string
  titleColor: string
  btnTextColor?: string  // 按钮文字颜色，默认 #fff；浅色按钮（年货红）需设深色
  isDark: boolean
}

export type PrizeType = 'product-tag' | 'product-dashed' | 'amount' | 'thanks'

export interface PrizeConfig {
  type: PrizeType
  imageUrl: string
  tag: string        // 顶部标签文字
  amount: string     // 金额数字（amount 类型）
  unit: string       // 单位（元/折等）
  bottomText: string // 底部文字
  thanksText: string // 谢谢参与文字
}

export interface ImgTransform {
  offsetX: number
  offsetY: number
  scale: number
}

export interface SlotConfig {
  bgColor: string
  bgImageUrl: string
  btnActiveFrom: string
  btnActiveTo: string
  btnDisabledFrom: string
  btnDisabledTo: string
  slotTintFrom: string
  slotTintTo: string
  slotRect7From: string
  slotRect7To: string
  linksColor: string
  titleColor: string
  btnTextColor: string
  titleText: string
  emptyText: string
  emptyImageUrl: string
  emptyTransform: ImgTransform
  prizes: PrizeConfig[]
  prizeTransforms: ImgTransform[]
  tone: 'light' | 'dark'
  slotStyle: string  // 老虎机风格 id，对应 SLOT_STYLE_REGISTRY
}

// ── 审核流程 ────────────────────────────────────────────────────────────────
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface SubmissionAsset {
  name: string       // 素材名称，如「slot_1_未抽奖状态_750x242」
  dataUrl: string    // 缩略图 base64（压缩后）
}

export interface Submission {
  id: string
  createdAt: number  // timestamp ms
  submitter: string  // 提交人
  projectName: string
  notes: string
  assets: SubmissionAsset[]
  status: ReviewStatus
  statusNote?: string   // 审核意见
  webhookSent: boolean  // 是否已发大象通知
}

// ── 横滑 Tab 组件 ─────────────────────────────────────────────────────────────
export type HTabColorKey = 'yellow' | 'orange' | 'red' | 'green' | 'pink' | 'blue' | 'purple'

export interface HTabColorDef {
  name: string
  bg: string          // 主色（选中+未选中 bg 相同，全不透明，Figma 原版）
  bgEnd?: string      // 渐变终色（仅黄色有，Figma fill_C78151）
  activeText: string  // 选中文字色
  inactiveText: string // 未选中文字色（比选中更淡，Figma 原版）
}

// Figma 精确配色（选中/未选中背景相同，文字色区分状态）
export const H_TAB_COLORS: Record<HTabColorKey, HTabColorDef> = {
  // 黄色：Figma fill_8SZ8ME=#F8CB4A（背景），fill_F0Q7R3=#8E0000（文字）
  // 渐变：fill_C78151 linear-gradient(90° #F6CE4F→#F8CB4A)
  yellow: { name: '黄色', bg: '#F8CB4A', bgEnd: '#F6CE4F', activeText: '#8E0000', inactiveText: 'rgba(142,0,0,0.4)' },
  // 橙色：fill_J0F4FR=#FF721F，选中文字白色，未选中文字淡橙
  orange: { name: '橙色', bg: '#FF721F', activeText: '#FFFFFF', inactiveText: '#FFDAC9' },
  // 红色：fill_PE525V=#FF3B3F，文字 fill_B9F0UU=#FFD0D0（未选中淡粉）
  red:    { name: '红色', bg: '#FF3B3F', activeText: '#FFFFFF', inactiveText: '#FFD0D0' },
  // 绿色：fill_T5DQN0=#279E0E，文字 fill_BE6PU6=#E2F7CD
  green:  { name: '绿色', bg: '#279E0E', activeText: '#FFFFFF', inactiveText: '#E2F7CD' },
  // 粉色：fill_P6K65Z=#FF1379，选中白字，未选中淡粉
  pink:   { name: '粉色', bg: '#FF1379', activeText: '#FFFFFF', inactiveText: 'rgba(255,255,255,0.55)' },
  // 蓝色：fill_9QZZZ1=#2D78F4，文字 fill_UVR1NV=#D0DFFF
  blue:   { name: '蓝色', bg: '#2D78F4', activeText: '#FFFFFF', inactiveText: '#D0DFFF' },
  // 紫色：fill_ATCRV2=#7D2AE2，文字 fill_F1QZXC=#E7D0FF
  purple: { name: '紫色', bg: '#7D2AE2', activeText: '#FFFFFF', inactiveText: '#E7D0FF' },
}

export interface HTabConfig {
  colorKey: HTabColorKey
  tabs: string[]        // Tab 标签文案
  activeIndex: number   // 当前选中 Tab 序号
}

// ── 楼层条组件 ────────────────────────────────────────────────────────────────
export type FloorVariant = 'dachao' | 'valentine' | 'newyear' | 'custom'

/** 单条楼层：独立文案，共享全局样式 */
export interface FloorItem {
  id: string    // 唯一标识（时间戳 + 随机后缀）
  text: string  // 该楼层的文案
}

export type FloorDecoStyle = 'arrow' | 'heart' | 'coin'

export interface FloorConfig {
  variant: FloorVariant
  bgColor: string        // 背景色（纯色，无渐变）
  bgTransparent: boolean // true = 无底色（透明背景，导出 PNG 无填充）
  text: string           // 主文案
  textColor: string      // 文字颜色
  showDeco: boolean      // 是否显示装饰图形
  decoStyle: FloorDecoStyle // 装饰形状：arrow 箭头 / heart 爱心 / coin 钱币
  decoColor1: string     // 装饰主色（箭头=闪电色；心=心形色；币=外圆色）
  decoColor2: string     // 装饰副色（仅箭头款：双燕形颜色）
}

export const FLOOR_PRESETS: Record<FloorVariant, Omit<FloorConfig, 'variant'>> = {
  dachao: {
    bgColor: '#FF9000', bgTransparent: false,
    text: '领618好店券 下单更优惠',
    textColor: '#950E0F',
    showDeco: true, decoStyle: 'arrow',
    decoColor1: '#FFCA60', decoColor2: '#FF7399',
  },
  valentine: {
    bgColor: '#FFCDDB', bgTransparent: false,
    text: '领214好店券 下单更优惠',
    textColor: '#FF5274',
    showDeco: true, decoStyle: 'heart',
    decoColor1: '#FF6B8A', decoColor2: '#FF6B8A',
  },
  newyear: {
    bgColor: '#ED0004', bgTransparent: false,
    text: '年货好礼 幸福加马',
    textColor: '#FFFFFF',
    showDeco: true, decoStyle: 'coin',
    decoColor1: '#FFCA00', decoColor2: '#FFCA00',
  },
  custom: {
    bgColor: '#FF7800', bgTransparent: false,
    text: '请填写楼层文案',
    textColor: '#FFFFFF',
    showDeco: false, decoStyle: 'arrow',
    decoColor1: '#FFCA60', decoColor2: '#FF7399',
  },
}
