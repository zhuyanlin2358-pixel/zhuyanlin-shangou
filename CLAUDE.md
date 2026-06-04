# 闪购会场组件自助设计工具 — Claude Code 上下文文档

> 最后更新：2026-06-04

---

## 项目概述

**用途**：美团闪购业务运营/设计师自助工具，可视化配置 UI 组件、一键导出切图素材。  
**GitHub**：`https://github.com/zhuyanlin2358-pixel/shangou-export-tool`  
**线上（Vercel）**：`https://shangou-export-tool.vercel.app`（main 分支自动部署）  
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
| 部署 | Vercel（main 分支 push → 自动部署） |

> ⚠️ 已完全弃用 html2canvas，所有导出和预览均用 Canvas 2D API 自绘，确保像素级精确。

---

## 目录结构

```
src/
  App.tsx                     # 全局布局 + 页面路由（state 管理，非 react-router）
  index.css                   # 全局样式：CSS 变量 + 滚动条 + 主题
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
      PanelField.tsx           # 通用字段组件：PF, PanelInput, PanelSection, ColorField, PanelListbox
  utils/
    exportUtils.ts             # 所有 Canvas 绘制函数（@2x 超采样）
  types/
    index.ts                   # 共享类型定义
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
| 5 | 链接文字（我的奖品/抽奖规则） | 96×34 / 109×34 |
| 6 | 奖品图×3 | 124×124 |

### Canvas 导出（exportUtils.ts）

所有函数均采用 **@2x 超采样**：内部以 2x 分辨率绘制，最终 `downsample()` 缩回原尺寸，输出清晰。

| 函数 | 输出 |
|------|------|
| `drawSlotBannerCanvas(cfg, prizeCanvases)` | 750×242（内部 1500×484） |
| `drawSlotBgCanvas(cfg)` | 750×242 |
| `drawEmptyStateCanvas(imageUrl, transform, text)` | 854×284（不 downsample，本身即 @2x） |
| `drawButtonCanvas(text, from, to)` | 194×80 |
| `drawLinkCanvas(parts, color, w, h, fontSize)` | w×h |
| `drawPrizeCanvas(prize, transform)` | 124×124 |

### 三路独立预览 Build（SlotPage.tsx）

```
buildBanner (400ms debounce) → 依赖配色/文案/奖品 → 更新 s1,s2,s4,s5
buildPrizes (300ms debounce) → 依赖奖品图/transform → 更新 s6_0/1/2
buildEmpty  (100ms debounce) → 依赖空态配置 → 更新 s3
```

所有 build 使用 `setPreviews(prev => ({...prev, ...}))` 合并更新，防止老预览图闪空。

**⚠️ 重要：GSAP 动画必须在 mount-only effect（`[]` 依赖）里调用，不能和 `registerExportAll` 合并。** 否则 config 任何变化都会触发标题重新动画（闪烁）。

### 左侧配置面板（SlotPanel.tsx）

手风琴式，5 个折叠分区，同时只开一个：
- 配色预设（浅色系/深色系）
- 会场背景色（色板 + 自定义）
- 文案设置（主标题文案 + 颜色）
- 空态页设置（文案 + 插图上传 + 大小）
- 奖品图设置（3张奖品：类型 + 标签 + 上传 + 底部文字）

---

## 滚动条样式

- 默认透明，鼠标 hover 时显示（浅色 `rgba(0,0,0,0.15)`）
- `.is-scrolling` class（JS 检测，900ms 自动移除）：滚动时可见
- 深色背景（`has-preview` / `dark-mode`）：白色 `rgba(255,255,255,0.2/0.22)`

---

## 分支/发布流程

```bash
# 日常开发
cd /Users/zhuyanlin/shangou-export-tool
git add -A && git commit -m "描述" && git push origin dev

# 发布到线上（Vercel 自动部署）
git checkout main && git merge dev && git push origin main && git checkout dev
```

---

## 已知限制 / 待做

- 一拖四：占位框架，需规范文档确认精确尺寸
- 字体：方正兰亭黑（公司字体）需用户本机安装后通过 `@font-face` 接入 Canvas
- GIF 导出：方案确认（html2canvas 截帧 + gif.js），待开发
- MasterGo MCP 免费版无 API 权限，用截图 + Figma MCP 替代
