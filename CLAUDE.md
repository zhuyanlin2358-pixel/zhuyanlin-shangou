# 闪购会场组件自助设计工具 — Claude Code 上下文文档

> 最后更新：2026-06-26

---

## 项目概述

**用途**：美团闪购业务运营/设计师自助工具，可视化配置 UI 组件、一键导出切图素材。  
**GitHub**：`https://github.com/zhuyanlin2358-pixel/zhuyanlin-tool`  
**线上（GitHub Pages）**：`https://zhuyanlin2358-pixel.github.io/zhuyanlin-tool/`（main 分支自动部署，约 40s）  
**本地路径**：`/Users/zhuyanlin/shangou-export-tool/`  
**本地启动**：`pnpm dev`（Vite，默认 5173；如端口占用用 `--port 5178`）

**Obsidian 知识库**：`https://github.com/zhuyanlin2358-pixel/shangou-obsidian`  
**同步命令**：`bash scripts/sync-obsidian.sh`

---

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5（manualChunks 分包：react/gsap/ui/jszip） |
| 样式 | Tailwind CSS v3 + CSS 自定义变量 |
| 包管理 | pnpm |
| 动效 | GSAP 3（仅入场动画，只在挂载时执行一次） |
| UI 组件 | Headless UI v2（Listbox / Disclosure） |
| 导出 | **Canvas API（全部自绘，无 html2canvas）** + JSZip |
| 部署 | GitHub Actions → GitHub Pages（main 分支 push → 自动部署，约 40s） |

---

## 目录结构

```
src/
  App.tsx                     # 全局布局 + 页面路由
  index.css                   # 全局样式：CSS 变量 + 主题
  contexts/
    AppContext.tsx             # 全局状态：page, currentComp, toast
                              # P4高达组件（VENUE_COMP_IDS）→ page='venue'
    SlotContext.tsx / N4Context / N2Context
    FloorContext.tsx           # 楼层条：patchConfig 函数式更新
    HTabContext.tsx            # 横滑Tab：items 多条目管理
    CouponContext.tsx          # 一键领券红包：colorKey / titleText
    VenueContext.tsx           # 高达会场：items/header/bgColor/moveItem/reorderItems
  components/
    layout/
      TopBar.tsx / Sidebar.tsx / PreviewPanel.tsx
    pages/
      SlotPage / N4Page / N2Page / FloorPage / HTabPage
      CouponPage.tsx           # 一键领券红包（ExportCard×4：完整预览/背景/腰封/按钮）
      VenuePage.tsx            # 4列工作区（薄导航+配置面板+主内容+手机预览）
      VenueManager.tsx         # 会场管理（头图/背景色/组件列表/导出拼图）
      VenuePhonePreview.tsx    # 右侧手机预览（pointer拖拽排序）
    panels/
      SlotPanel / N4ConfigPanel / N2ConfigPanel / FloorPanel / HTabPanel
      CouponPanel.tsx          # 配色选择 + 文案输入
    ui/
      PanelField.tsx           # ColorField, PanelInput, DisclosureGroup 等
      VenueAddButton.tsx       # 加入会场/更新预览 智能双模式按钮
  utils/
    exportUtils.ts             # 所有 Canvas 绘制（@2x 超采样）
    slotStyles.ts              # 老虎机风格注册表
  types/index.ts               # VENUE_COMP_IDS 单一数据源
  scripts/
    sync-obsidian.sh           # 三端同步脚本（项目→Obsidian→GitHub）
```

---

## 主题系统

- `page === 'comp'` 或 `page === 'venue'` → 强制深色（所有面板用 text-white/*）
- 首页/资产/审核 → 跟随用户深/浅色偏好
- TopBar 在组件/会场页内隐藏深浅切换按钮

---

## 已完成组件

| 组件 | id | 状态 | 导出素材 |
|------|----|------|---------|
| 老虎机 | slot | ✅ 已上线 | 8类切图（背景/按钮/滚轮/奖品等）|
| N4 文字标签 | n4 | ✅ 已上线 | 8种变体，240×156 透明底 PNG |
| N2 品牌Logo | n2 | ✅ 已上线 | 有底色/描边/素材库 |
| 楼层条 | floor | ✅ 已上线 | 750×60，3款预设，3种装饰，透明底，多条批量 |
| 横滑 Tab | h-tab | ✅ 已上线 | 7色×N张，按尺寸分子文件夹 |
| 一键领券红包 | coupon | ✅ 已上线 | 3素材（券包背景702×352/腰封702×168/按钮480×80） |

**VENUE_COMP_IDS** 单一数据源在 `src/types/index.ts`：
```typescript
export const VENUE_COMP_IDS: ComponentId[] = ['slot', 'floor', 'h-tab', 'coupon']
```
新增高达完成品只需往这里加，Sidebar / VenuePage / AppContext 自动同步。

---

## 高达会场（venue 页）

### 架构：4列工作区

```
[文字导航140px] [配置面板260px] [主内容flex-1] [手机预览380px]
```

- **点击 P4 高达组件** → `page='venue'` + `currentComp=id`（不走旧 comp 流程）
- **配置面板** 随 currentComp 切换（SlotPanel / FloorPanel / HTabPanel / CouponPanel）
- **VenuePhonePreview** 始终显示，pointer 事件拖拽排序
- **已加入组件**卡片：统一 120px 高缩略图（objectFit cover + top 裁切），所有组件高度一致

### VenueAddButton 双模式

- **未在会场**：蓝色「加入会场」→ `addItem()`，HTab 自动打 Tab1/Tab2 序号
- **已在会场**：灰色「更新预览 ↺」→ `updatePreview(sourceId)` 精准刷新
- HTab / Coupon 用 `sourceId = item.id` 稳定匹配，不受改色/改数量影响

### 手机预览对齐规则

- **全组件**：`padding: 0 8px`，`width: 100%`，`height: auto`
- **券红包**：`padding: 0 20px`（设计稿702px vs 750px，多补12px让视觉等宽），`borderRadius: 10`
- **组件间距**：`marginTop: 4px`（用背景色填充，拖拽不受影响）

### 拖拽排序实现（pointer 事件方案）

HTML5 drag 在 overflow-y:auto 容器内不可靠，改用：
```typescript
onPointerDown → setPointerCapture(pointerId)
onPointerMove → 通过 itemRefs 检查邻居中线位置 → moveItem('up'/'down')
// 关键：handlePointerMove 不传 id，通过 draggedId ref 定位
```

### 会场拼图导出

750px Canvas，头图 + 各组件 canvas 垂直拼合，间距用背景色填充。

---

## 一键领券红包组件（coupon）

### 导出素材

| 素材 | 尺寸 | 函数 |
|------|------|------|
| 券包背景 | 702×352 | `drawCouponBg(cfg)` |
| 券包腰封 | 702×168 | `drawCouponWaistband(cfg)` |
| 组件按钮 | 480×80 | `drawCouponButton(cfg)` |
| 完整预览（会场用）| 702×352 | `drawCouponPreview(cfg)` |

### 配色系统（7色）

`COUPON_COLORS` in `types/index.ts`：teal/blue/green/gold1/gold2/pink/red  
每色包含：cardBgFrom/To（券卡渐变）、btnFrom/To（按钮渐变）、textColor（标题色）

### Canvas 关键实现

```typescript
// 腰封弧形（Path2D + SVG 路径字符串）
const WAIST_SVG_PATH = 'M0,15 Q351,0 702,15 L702,168 L0,168 Z'
function drawWaistShape(ctx, from, to, gradY0, gradY1) { /* 填充渐变弧形 */ }

// 胶囊按钮
function capsulePath(ctx, x, y, w, h) { /* arcTo 画圆端 */ }

// 标题区闪电装饰（4颗，Figma 精确坐标）
const BOLT_SM_L = '...', BOLT_SM_R = '...'  // 小闪电（标题左右各1）
const BOLT_LG_L = '...', BOLT_LG_R = '...'  // 大闪电（标题旁各1）
```

### 渲染流程（两遍渲染防白屏）

```typescript
// 立即用占位色渲染一遍（字体未加载时也能看到形状）
render()
// 字体加载完成后再渲染一遍（精确文字）
preloadFonts().then(() => render())
```

---

## 楼层条组件（floor）

- 750×60 px，FZLanTingHei-DB 34px，透明底（背景色仅预览用）
- 装饰图形：Figma 精确 SVG 路径（闪电+双燕+爱心+古铜钱）
- 动态定位：`ctx.measureText()` 测文字宽，贴紧 16px 间距
- ⚠️ 装饰绘完后必须重置 `ctx.fillStyle = cfg.textColor`（否则文字用装饰色）

---

## 横滑 Tab 组件（h-tab）

- 7色（黄/橙/红/绿/粉/蓝/紫），Figma 精确配色
- 选中：127° pastel 渐变 + 底部箭头 + inset 高光
- 未选中：饱和实色 + 同系浅色文字
- 尺寸：2tab=336×88，3tab=226×88，4tab=180×88（Figma 精确，按居中对齐）
- 每条 Tab 出 N张（每个 Tab 位置一张），按尺寸分子文件夹

---

## 关键 Canvas 规范

1. **@2x 超采样**：内部 2x 渲染 → `downsample()` 缩回 1x 输出
2. **装饰绘制后必须重置 fillStyle**（楼层条 bug 教训）
3. **patchConfig 函数式更新**：`prev => ({...prev, ...patch})` 防色轮拖拽 stale closure
4. **子组件必须在模块顶层**：不能在父函数体内定义，否则 input 失焦
5. **两遍渲染**：字体未就绪时先占位渲染，`preloadFonts()` 完成后精渲（CouponPage、SlotPage 均用此模式）
6. **坐标系一致**：canvas 宽多少就画多少，不要用 translate 偏移再用不同宽度的路径（背景/腰封宽度不匹配 bug 教训）

---

## 字体

| 文件 | family | 格式 | 用途 |
|------|--------|------|------|
| FZLTHJW.woff2 | FZLanTingHei-M | WOFF2（1.1MB） | 老虎机正文/链接/按钮 |
| FZLTZHJW.woff2 | FZLanTingHei-DB | WOFF2（1.1MB） | 楼层条/横滑Tab/红包标题 |

**性能优化**：TTF → WOFF2，4.4MB → 2.3MB（-47%）；`font-display: swap` 避免白屏阻塞。  
字体加载：`preloadFonts()` singleton + 3s 超时降级。`_fontsLoaded` flag 二次进入即时返回。

---

## 构建优化（vite.config.ts）

```typescript
build: {
  chunkSizeWarningLimit: 800,
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-gsap':  ['gsap'],
        'vendor-ui':    ['@headlessui/react', 'lucide-react'],
        'vendor-jszip': ['jszip'],
      },
    },
  },
},
```

业务代码改动不会让用户重新下载大型第三方库。

---

## 分支/发布流程

```bash
# 日常开发（feature/venue-preview 分支开发，main 发布）
git add -A && git commit -m "描述"
git push origin feature/venue-preview

# 发布到线上
git checkout main && git merge feature/venue-preview && git push origin main && git checkout feature/venue-preview

# 同步记忆到 Obsidian + GitHub
bash scripts/sync-obsidian.sh
```

## 当前分支状态（2026-06-26）

| 分支 | 用途 | 状态 |
|------|------|------|
| `main` | 线上稳定版，GitHub Pages 自动部署 | ✅ 当前线上版 |
| `feature/ui-redesign` | UI改版+新功能主力开发分支 | 🚧 持续开发，每次改完直接 merge main |

**发布流程**（已固定）：
```bash
git add -A && git commit -m "描述"
git checkout main && git merge feature/ui-redesign && git push origin main && git checkout feature/ui-redesign
```

---

## 2026-06-26 主要改动

### UI 规范（Ant Design 对齐）
- FileItem 行高 34→**40px**，间距 1→**3px**
- CTA 按钮圆角 12→**10px**，顶栏高度 48→**56px**
- 面包屑去掉"页面结构"，缩放档位5→3档（75/100/150）
- **阴影系统**：`--shadow-topbar/panel-r/panel-l/popover/card`（index.css + ui-tokens.html）
- **Spinner 组件**：`src/components/ui/Spinner.tsx`，sm/md/lg 三档

### 工作室功能
- HTab 工作室：颜色药丸+Tab数量+文案输入，图层感知右侧面板
- Floor 工作室：新增楼层标题文案输入（之前缺失）
- 老虎机：新增 `slotBtnText` 字段（按钮文案可编辑），新增 button 热区
- 红包：新增 title/btn 热区，修复热区对齐 bug（zones 改为相对 img 元素定位）

### 新功能
- **删除撤销**：`showToastWithUndo` + `restoreItem`，5秒撤销
- **App.tsx 重构**：5处重复 toast 合并为 `<AppToast>` 组件

### 对外文档（public/ 目录，随 main 分支发布）
- `ui-tokens.html` — UI设计令牌手册（含阴影/Spinner/行高）
- `component-spec.html` — 组件接入规范
- `component-template.html` — HTML组件开发模板

---

## 待做

- **有 tab 类红包** → 等 Figma 设计稿
- **配置另存为模板** → Task #8
- **版本号/历史记录** → Task #9
- **Tooltip 悬停提示** → 图标独立按钮（删除×、加入↺）
- **Empty 空状态图标** → 会场空状态加小图标
- **Vercel 部署** → 隐藏 GitHub 仓库地址（用户有意向）
- **一拖四** → 规范确认后开发
- **头图动效接入** → 等同事 HTML 文件（按 component-spec.html 规范）
