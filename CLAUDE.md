# 闪购会场组件自助设计工具 — Claude Code 上下文文档

> 最后更新：2026-06-11

---

## 项目概述

**用途**：美团闪购业务运营/设计师自助工具，可视化配置 UI 组件、一键导出切图素材。  
**GitHub**：`https://github.com/zhuyanlin2358-pixel/zhuyanlin-tool`  
**线上（GitHub Pages）**：`https://zhuyanlin2358-pixel.github.io/zhuyanlin-tool/`（main 分支自动部署）  
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
| UI 组件 | Headless UI v2（Listbox 下拉） |
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
    AppContext.tsx             # 全局状态：page, currentComp, toast, hasPreview
    SlotContext.tsx            # 老虎机配置状态（config, presets, setPrize 等）
    N4Context.tsx             # N4 文字标签状态
    N2Context.tsx             # N2 品牌Logo状态
  components/
    layout/
      TopBar.tsx               # 顶栏：Logo + 组件菜单 + 深色切换
      Sidebar.tsx              # 侧边栏容器（浏览/配置两种模式）
      PreviewPanel.tsx         # 右侧手机预览面板（老虎机专属，固定 360px）
    pages/
      SlotPage.tsx             # 老虎机：6 个 section（canvas 预览 + 导出卡片）
      N4Page.tsx               # N4 文字标签页
      N2Page.tsx               # N2 品牌Logo页
      YituosiPage.tsx          # 一拖四（占位）
      HomePage.tsx             # 首页分类卡片
      AssetsPage.tsx           # 我的资产
      GenericPage.tsx          # 通用占位
    panels/
      SlotPanel.tsx            # 老虎机左侧配置面板（手风琴，5 个折叠分区）
      N4Panel.tsx              # N4 配置面板
      N2Panel.tsx              # N2 配置面板
    ui/
      PanelField.tsx           # 通用字段组件：PF, PanelInput, PanelTextarea,
                              #   ColorField, PanelListbox, DisclosureGroup
  utils/
    exportUtils.ts             # 所有 Canvas 绘制函数（@2x 超采样）
    slotStyles.ts              # 老虎机风格注册表（SLOT_STYLE_REGISTRY）
  types/
    index.ts                   # 共享类型定义
  assets/
    fonts/                     # 方正兰亭黑字体文件（本地，不入 git）
```

---

## 主题系统

| 主题 | class | 触发 |
|------|-------|------|
| 浅色（默认）| — | — |
| 全局深色 | `body.dark-mode` | 顶栏按钮切换 + localStorage 持久化 |
| 老虎机深色 | `body.has-preview` | 进入老虎机自动激活 |

`has-preview` 时，顶栏/侧边栏/主内容区全部切为 `#0C111B`/`#0D1117`。

---

## 老虎机组件（slot）详情

### 6 类素材

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

### 风格注册表（slotStyles.ts）

老虎机背景支持多风格扩展，每个风格定义 `drawBg` 函数 + `prizeStyle` 配色：

```typescript
SLOT_STYLE_REGISTRY = {
  minimal: { ... },  // 常规极简：对角渐变背景
  daily:   { ... },  // 日常活动：横向渐变 + 矩形备份7叠层（x:342 y:0 w:384 h:105 r:24）
}
// 新增风格：在 SLOT_STYLE_REGISTRY 加一条记录即可，其余代码不用改
```

`drawBg(ctx, W, H, { tintFrom, tintTo })` — 在已 clip 的圆角矩形内绘制背景，颜色跟随主题预设。

### Canvas 导出（exportUtils.ts）

所有函数均采用 **@2x 超采样**：内部以 2x 分辨率绘制，最终 `downsample()` 缩回原尺寸，输出清晰。

| 函数 | 输出 |
|------|------|
| `drawSlotBannerCanvas(cfg, prizeCanvases)` | 750×242 |
| `drawSlotBgCanvas(cfg)` | 750×242 |
| `drawEmptyStateCanvas(imageUrl, transform, text)` | 854×284 |
| `drawButtonCanvas(text, from, to, textColor)` | 194×80 |
| `drawLinkCanvas(parts, color, w, h, fontSize)` | w×h（我的奖品 186×44，抽奖规则 218×44，45px）|
| `drawPrizeCanvas(prize, transform, styleName?)` | 124×124 |
| `drawDialogButtonCanvas(text, from, to, subText?, textColor)` | **276×118**（画布含空隙，按钮本体 276×80 居中）|
| `drawDialogResultCanvas(state, tintFrom, tintTo, titleColor)` | 750×612 |
| `preloadFonts()` | 预加载方正兰亭黑 + MeituanDigitalType |

字体常量：
- `F` = FZLanTingHei-M（正文/链接/按钮/标题，统一用 M，不用 DB）
- `FB` = FZLanTingHei-DB（已声明但当前未使用，保留备用）
- MeituanDigitalType-Bold（金额券大数字专用）

### 三路独立预览 Build（SlotPage.tsx）

```
buildBanner (400ms debounce) → 依赖配色/文案/风格/奖品 → 更新 s1,s2,s4,s5，setSlotBannerUrl
buildPrizes (300ms debounce) → 依赖奖品图/transform → 更新 s6_0/1/2
buildEmpty  (100ms debounce) → 依赖空态配置 → 更新 s3（画布预览图）
```

**预览按钮逻辑（统一规则）**：手机预览永远显示 Section 1 完整 banner。
- Section 1 预览按钮 → 立即调 `buildBanner()`
- Section 3 预览按钮 → `buildEmptyPreview()`：完整 banner + 空态叠入白框（x43 y75 w427 h142）→ `setSlotBannerUrl`
- Section 6 预览按钮 → 立即调 `buildBanner()`（奖品已含在 banner 内）

所有 build 使用 `setPreviews(prev => ({...prev, ...}))` 合并更新，防止旧预览图闪空。

**⚠️ GSAP 动画必须在 mount-only effect（`[]` 依赖）里调用**，不能和 `registerExportAll` 合并，否则 config 任何变化都会触发标题重新动画（闪烁）。

### 输入框（PanelField.tsx）

`PanelInput` / `PanelTextarea`：
- 本地 `useState` 即时更新，每次按键立刻显示（无 startTransition 延迟）
- IME（中文输入法）保护：`onCompositionStart/End` 防止拼音中间状态触发全局更新
- 外部 value 变化（preset 切换）通过 `extRef` 对比同步，不覆盖正在输入的内容

颜色选择器（`ColorPickerPopup`）：
- 原生 `addEventListener('pointerdown/pointermove')` + `setPointerCapture`，支持拖拽
- `position: fixed` popup 防止被 `overflow:auto` 侧边栏裁切

### 左侧配置面板（SlotPanel.tsx）

手风琴式，5 个折叠分区，同时只开一个：
1. 风格版本（常规极简 / 日常活动 pill 选择器）
2. 配色预设（浅色系/深色系）
3. 文案设置（主标题文案 + 颜色）
4. 空态页设置（文案 + 插图上传）
5. 奖品图设置（3张奖品：类型/标签/上传/底部文字）

---

## 性能优化

- **代码分割**：`App.tsx` 所有页面组件用 `React.lazy` 懒加载，首屏只下载必要代码
- **预览图淡入**：`.slot-card-preview img` 加 0.2s fadein，canvas 重建时不硬闪
- **Canvas @2x 超采样**：内部 2x 渲染 → `downsample()` 缩回，输出清晰
- **startTransition**：输入框全局更新标记低优先级，连续删除/输入不卡顿

---

## 字体

方正兰亭黑系列，本机安装后通过 `@font-face` 接入 Canvas：

| 文件 | family | 用途 |
|------|--------|------|
| FZLTHJW.TTF | FZLanTingHei-M | 正文、链接、计数 |
| FZLTZHJW.TTF | FZLanTingHei-DB | 标题、按钮、大字 |

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

## 已完成组件

| 组件 | id | 状态 |
|------|----|------|
| 老虎机 | slot | ✅ 完整：6类切图、手机预览、风格切换、奖品/空态/配色 |
| N4 文字标签 | n4 | ✅ 8种变体，240×156 透明底 PNG |
| N2 品牌Logo | n2 | ✅ 有底色/描边/素材库 |
| 一拖四 | yituosi | 🔲 占位，尺寸待规范 |
| 其余 | — | 🔲 GenericPage 占位 |

---

## 待做 / 规划中

- **审核下载流程**：提交审核 → 大象群机器人通知（需用户提供 webhook URL）
- **Skill AI 出图入口**：接美境 HTTP API，需联系 zhuxiangyu04 确认开放方案
- **代码分割**：✅ 已完成（React.lazy）
- **Remotion 动效**：老虎机抽奖动画 → GIF/MP4 导出（规划中）
- **一拖四**：占位框架，规范文档确认尺寸后开发
- **GIF 导出**：方案待定
