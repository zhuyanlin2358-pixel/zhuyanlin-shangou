# 闪购会场组件自助设计工具 — Claude Code 上下文文档

> 最后更新：2026-06-12

---

## 项目概述

**用途**：美团闪购业务运营/设计师自助工具，可视化配置 UI 组件、一键导出切图素材。  
**GitHub**：`https://github.com/zhuyanlin2358-pixel/zhuyanlin-tool`  
**线上（GitHub Pages）**：`https://zhuyanlin2358-pixel.github.io/zhuyanlin-tool/`（main 分支自动部署，约 40s）  
**本地路径**：`/Users/zhuyanlin/shangou-export-tool/`  
**本地启动**：`pnpm dev`（Vite，默认 5173；如端口占用用 `--port 5178`）

---

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS v3 + CSS 自定义变量 |
| 包管理 | pnpm |
| 动效 | GSAP 3（仅入场动画，只在挂载时执行一次） |
| UI 组件 | Headless UI v2（Listbox / Disclosure） |
| 导出 | **Canvas API（全部自绘，无 html2canvas）** + JSZip |
| 部署 | GitHub Actions → GitHub Pages（main 分支 push → 自动部署，约 40s） |

> ⚠️ 已完全弃用 html2canvas，所有导出和预览均用 Canvas 2D API 自绘，确保像素级精确。

---

## 目录结构

```
src/
  App.tsx                     # 全局布局 + 页面路由（state 管理，非 react-router）
                              # 页面组件全部 React.lazy 按需加载（代码分割）
  index.css                   # 全局样式：CSS 变量 + 滚动条 + 主题 + 预览图淡入动画
  contexts/
    AppContext.tsx             # 全局状态：page, currentComp, toast, hasPreview, darkMode
    SlotContext.tsx            # 老虎机配置状态
    N4Context.tsx             # N4 文字标签状态
    N2Context.tsx             # N2 品牌Logo状态
    FloorContext.tsx          # 楼层条配置状态（patchConfig 函数式更新）
  components/
    layout/
      TopBar.tsx               # 顶栏：返回 + 组件名 + 一键导出 + 深色切换（组件页隐藏切换按钮）
      Sidebar.tsx              # 侧边栏容器（浏览/配置两种模式）
      PreviewPanel.tsx         # 右侧手机预览面板（老虎机专属，固定 360px）
    pages/
      SlotPage.tsx             # 老虎机：8 个 section（canvas 预览 + 导出卡片）
      N4Page.tsx               # N4 文字标签页
      N2Page.tsx               # N2 品牌Logo页
      FloorPage.tsx            # 楼层条页（预览 + 装饰图形选择库）
      YituosiPage.tsx          # 一拖四（占位）
      HomePage.tsx             # 首页分类卡片
      AssetsPage.tsx           # 我的资产
      GenericPage.tsx          # 通用占位
    panels/
      SlotPanel.tsx            # 老虎机左侧配置面板（手风琴，5 个折叠分区）
      N4ConfigPanel.tsx        # N4 配置面板
      N2ConfigPanel.tsx        # N2 配置面板
      FloorPanel.tsx           # 楼层条配置面板（款式/背景/文案/装饰 4 个折叠分区）
      YituosiPanel.tsx         # 一拖四占位面板
      GenericPanel.tsx         # 通用占位面板
    ui/
      PanelField.tsx           # 通用字段组件：PF, PanelInput, PanelTextarea,
                              #   ColorField, PanelListbox, DisclosureGroup
  utils/
    exportUtils.ts             # 所有 Canvas 绘制函数（@2x 超采样）
    slotStyles.ts              # 老虎机风格注册表（SLOT_STYLE_REGISTRY）
  types/
    index.ts                   # 共享类型定义（含 FloorConfig, FloorDecoStyle, FLOOR_PRESETS 等）
  assets/
    fonts/                     # 方正兰亭黑字体文件（本地，不入 git）
```

---

## 主题系统

| 主题 | class | 触发 |
|------|-------|------|
| 浅色（默认）| — | 首页/资产页/审核页 |
| 全局深色 | `body.dark-mode` | 顶栏按钮切换 + localStorage 持久化 |
| 老虎机深色 | `body.has-preview` | 进入老虎机自动激活 |
| **组件页强制深色** | `body.dark-mode`（强制）| **进入任意组件页（page==='comp'）自动激活** |

**⚠️ 重要：组件页强制深色**  
所有面板（FloorPanel/N4/N2/SlotPanel 等）的标签/文字使用 Tailwind `text-white/*` 写死白色，
浅色模式下白字消失。AppContext 在 `page === 'comp'` 时无条件加 `dark-mode` class，
离开组件页恢复用户偏好。顶栏切换按钮在组件页内隐藏（强制深色时切换无意义）。

`has-preview` 时，顶栏/侧边栏/主内容区全部切为 `#0C111B`/`#0D1117`。

---

## 已完成组件

| 组件 | id | 状态 |
|------|----|------|
| 老虎机 | slot | ✅ 完整：8 类切图、手机预览、风格切换、奖品/空态/配色 |
| N4 文字标签 | n4 | ✅ 8 种变体，240×156 透明底 PNG |
| N2 品牌Logo | n2 | ✅ 有底色/描边/素材库 |
| **楼层条** | **floor** | ✅ 750×60，3 款预设，3 种装饰，透明背景，装饰图形选择库 |
| 一拖四 | yituosi | 🔲 占位，尺寸待规范 |
| 其余 | — | 🔲 GenericPage 占位 |

---

## 老虎机组件（slot）详情

### 8 类素材

| # | 内容 | 尺寸 |
|---|------|------|
| 1 | 未抽奖状态（含奖品图+按钮） | 750×242 |
| 2 | 背景（含主标题，无商品图） | 750×242 |
| 3 | 空态页 | 854×284 @2x |
| 4 | 抽奖按钮（激活/禁用两款） | 194×80 |
| 5 | 链接文字（我的奖品/抽奖规则） | 186×44 / 218×44 |
| 6 | 奖品图×3 | 124×124 |
| 7 | 弹窗按钮 × 7 | **276×118**（画布含空隙，按钮本体 276×80，r=40）|
| 8 | 弹窗结果页 × 5 | 750×612 |

### Canvas 导出函数（exportUtils.ts）

所有函数均采用 **@2x 超采样**：内部以 2x 分辨率绘制，最终 `downsample()` 缩回原尺寸，输出清晰。

| 函数 | 输出 |
|------|------|
| `drawSlotBannerCanvas(cfg, prizeCanvases)` | 750×242 |
| `drawSlotBgCanvas(cfg)` | 750×242 |
| `drawEmptyStateCanvas(imageUrl, transform, text)` | 854×284 |
| `drawButtonCanvas(text, from, to, textColor)` | 194×80 |
| `drawLinkCanvas(parts, color, w, h, fontSize)` | w×h |
| `drawPrizeCanvas(prize, transform, styleName?)` | 124×124 |
| `drawDialogButtonCanvas(...)` | 276×118 |
| `drawDialogResultCanvas(state, tintFrom, tintTo, titleColor)` | 750×612 |
| `drawFloorCanvas(cfg: FloorConfig)` | **750×60**（楼层条） |
| `preloadFonts()` | 预加载方正兰亭黑 + MeituanDigitalType |

字体常量：
- `F`  = FZLanTingHei-M（正文/链接/按钮/标题）
- `FB` = FZLanTingHei-DB（楼层条文案用此字体，Figma 规格 34px）
- MeituanDigitalType-Bold（金额券大数字专用）

---

## 楼层条组件（floor）详情

### 规格

- **尺寸**：750×60 px
- **字体**：FZLanTingHei-DB 34px，居中，来自 Figma 精确规格
- **Canvas 绘制**：@2x 超采样，`drawFloorCanvas(cfg: FloorConfig)`

### FloorConfig 字段

```typescript
interface FloorConfig {
  variant: 'dachao' | 'valentine' | 'newyear' | 'custom'
  bgColor: string        // 背景色（纯色，无渐变）
  bgTransparent: boolean // true = 无底色，导出透明底 PNG
  text: string           // 主文案
  textColor: string      // 文字颜色
  showDeco: boolean      // 是否显示两侧装饰图形
  decoStyle: 'arrow' | 'heart' | 'coin'  // 装饰形状
  decoColor1: string     // 装饰主色
  decoColor2: string     // 装饰副色（仅 arrow 款双燕形使用）
}
```

### 3 款 Figma 预设

| 款式 | 背景色 | 文字 | 装饰 |
|------|--------|------|------|
| 大促款 | `#FF9000` | `#950E0F` | arrow（闪电+双燕，金黄+粉色） |
| 情人节款 | `#FFCDDB` | `#FF5274` | heart（爱心，粉红） |
| 年货节款 | `#ED0004` | `#FFFFFF` | coin（古铜钱，金色） |

### 装饰图形（Figma SVG 精确路径）

- **arrow（箭头形）**：Vector2 闪电折线形（13×16）+ Vector1 双燕形（18×30），来自 Figma 精确 SVG 路径
- **heart（爱心）**：bezier 曲线，大心 r=13 + 小心 r=4 一组
- **coin（古铜钱）**：外圆 + 内方孔，`ctx.fill('evenodd')` 挖空

右侧装饰用 `ctx.save() → ctx.translate(grx) → ctx.scale(-1,1) → 画左侧 → ctx.restore()` 镜像，保证形状像素级一致。

### 动态定位

装饰图形根据实际文字宽度动态定位，始终贴紧文字两侧 **GAP=16px**（来自 Figma 原稿值）。

### ⚠️ Canvas 状态污染 Bug（已修）

装饰图形绘制函数会修改 `ctx.fillStyle`。**必须在 `ctx.fillText()` 前重新设置 `ctx.fillStyle = cfg.textColor`**，否则文字用的是装饰图形的颜色。

### FloorContext — patchConfig 函数式更新

```typescript
// FloorContext 暴露 patchConfig（不是 setConfig）
const patchConfig = useCallback((patch: Partial<FloorConfig>) => {
  rawSetConfig(prev => ({ ...prev, ...patch }))
}, [])
```

FloorPanel 使用 `patchConfig({ [key]: val })` 而非 `setConfig({...config, [key]: val})`。
原因：React 18 快速拖拽色轮时，`setConfig({...config, key:val})` 中 `config` 是 stale closure，
多次 batched 更新会互相覆盖。函数式更新 `prev => ({...prev,...patch})` 永远基于最新状态。

### FloorPage — 装饰图形选择库

页面下方有 9 个配色缩略图（3 款式 × 3 配色），Canvas 实时渲染，点击一键应用。

---

## 输入框 / 颜色选择器通用规范（PanelField.tsx）

### PanelInput / PanelTextarea（非受控，根治失焦）

- `defaultValue` 非受控，浏览器原生管理 DOM，React re-render 不干扰光标
- Preset 切换时通过 `inputRef.current.value = ext` 命令式同步
- `onChangeRef` 存 onChange 函数引用，防止闭包不一致
- IME 保护：`onCompositionStart/End`

### ColorPickerPopup（颜色选择器）

- React 合成事件 `onPointerDown` + `onPointerMove`（不用 useEffect + addEventListener）
- `e.currentTarget.setPointerCapture(e.pointerId)` + `e.buttons === 0` 判断拖拽
- 子层覆盖物加 `pointerEvents: 'none'` 防止拦截
- `position: fixed` popup 防止被 `overflow:auto` 侧边栏裁切

### ⚠️ 子组件不得定义在父组件函数体内

每次 re-render 产生新函数引用 → React unmount+remount 子树 → input 失焦。  
所有子组件必须提取到模块顶层，通过 props 传入需要的状态。

---

## 性能优化

- **代码分割**：`App.tsx` 所有页面组件用 `React.lazy` 懒加载，首屏只下载必要代码
- **预览图淡入**：`.slot-card-preview img` 加 0.2s fadein，canvas 重建时不硬闪
- **Canvas @2x 超采样**：内部 2x 渲染 → `downsample()` 缩回，输出清晰
- **GSAP 动画只在 mount-only effect（`[]` 依赖）里调用**，不和 config 依赖合并

---

## 字体

方正兰亭黑系列，本机安装后通过 `@font-face` 接入 Canvas：

| 文件 | family | 用途 |
|------|--------|------|
| FZLTHJW.TTF | FZLanTingHei-M | 老虎机正文/链接/按钮 |
| FZLTZHJW.TTF | FZLanTingHei-DB | 楼层条文案（Figma 规格） |

字体文件在 `/src/assets/fonts/`，**已加入 `.gitignore`，不入 git**（公司版权字体）。

---

## 分支/发布流程

```bash
# 日常开发
git add -A && git commit -m "描述" && git push origin dev

# 发布到线上（GitHub Pages 自动部署）
git checkout main && git merge dev && git push origin main && git checkout dev
# 或直接说「推送发布」，Claude 帮你跑
```

---

## 待做 / 规划中

- **Skill AI 出图入口**：接美境 HTTP API，需联系 zhuxiangyu04 确认 CORS 白名单/client_id
- **一拖四**：占位框架，规范文档确认尺寸后开发
- **GIF 导出**：老虎机抽奖动画 → GIF/MP4（Remotion 方案，规划中）
- **审核下载流程**：提交审核 → 大象群机器人通知（需用户提供 webhook URL）
