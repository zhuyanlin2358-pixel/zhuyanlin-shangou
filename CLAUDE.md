# 闪购会场组件自助设计工具 — Claude Code 上下文文档

> 每次对话结束前更新本文档。最后更新：2026-05-22

---

## 项目概述

**用途**：美团闪购业务运营/设计师自助工具，可视化配置 UI 组件、一键导出切图素材，接入美境（aidesign.meituan.com）iframe。

**GitHub**：`https://github.com/zhuyanlin2358-pixel/shangou-export-tool`  
**线上（GitHub Pages）**：`https://zhuyanlin2358-pixel.github.io/shangou-export-tool/`  
**本地开发路径**：`/Users/zhuyanlin/shangou-export-tool/`（有完整读写权限）  
**当前分支**：`dev`（开发分支，稳定后合并 main 发布）

---

## 技术架构

- **纯前端单文件**：`index.html`（约 3100 行），无构建工具，无框架
- **外部依赖（CDN）**：html2canvas 1.4.1、jszip 3.10.1、**GSAP 3.12.5**
- **动效库**：React Bits 组件 JS 逻辑移植（MagicBento、SpotlightCard、BorderGlow、StaggeredMenu、ChromaGrid）、animate-ui SVG 图标 + GSAP 动效
- **Skill**：impeccable（UI 审查/重设计，安装于 `.agents/skills/impeccable/`，需重启 Claude Code 后可用 `/impeccable`）
- **部署**：push 到 `main` 分支，GitHub Pages 自动更新

---

## 整体布局

```
[左侧侧边栏 260px] [主内容区 flex:1] [右侧预览面板 360px, 仅老虎机时显示]
```

- 首页（`body.on-home`）：顶栏隐藏，侧边栏延伸到顶
- 进入组件/资产：顶栏从上滑入（0.25s）

### 侧边栏双模式

| 模式 | 触发 | 内容 |
|------|------|------|
| 浏览模式 | 首页/资产页 | 搜索 + P0-P6 分类树（animate-ui 图标 + GSAP hover 动效）+ 底部我的资产 + 深色切换 |
| 配置模式 | 进入组件 | 返回条 + 组件配置面板（shadcn/ui 风格重设计） |

---

## 主题系统

| 主题 | class | 触发 |
|------|-------|------|
| 浅色（默认）| — | 侧边栏底部「☀ 浅色」按钮 |
| 全局深色 | `body.dark-mode` | 点击切换，localStorage 持久化 |
| 老虎机深色 | `body.has-preview` | 进入老虎机组件自动激活 |

两者独立，可叠加。

---

## 页面结构

| 页面 ID | 默认 | 内容 |
|---------|------|------|
| `page-home` | ✅ 活跃 | 首页目录（AI预留卡片 + 分类卡片 + ChromaGrid效果） |
| `page-slot` | — | 老虎机（暗色高级感，6类切图） |
| `page-assets` | — | 我的资产（导出历史+送审） |
| `page-generic` | — | 通用占位页 |

---

## 已实现动效（GSAP）

| 效果 | 位置 | 函数 |
|------|------|------|
| 首页入场 | 标题/AI卡片/分类区块 | `renderHomePage()` 末尾 |
| 组件页滑入 | 进入组件时 | `switchComp()` 末尾 |
| 返回首页 | 从右滑回 | `goHome()` |
| 配置面板弹出 | 折叠分组展开 | `toggleGroup()` |
| MagicBento | 首页 done 卡片：3D 倾斜 + 点击涟漪 | `initBentoEffects()` |
| BorderGlow | AI卡片 + 首页 done 卡片：边缘光晕 | `initBorderGlow()` |
| SpotlightCard | AI卡片 + 老虎机导出卡片 | `initSpotlightCards()` |
| ChromaGrid | 深色模式首页卡片灰度揭色 | `initChromaGrid()` |
| StaggeredMenu | 顶栏「所有组件」快速跳转 | `openStaggeredMenu()` |
| animate-ui 图标 | P0-P6 分类 hover 动效 | `renderCompBrowser()` 末尾 |

---

## 已实现组件：老虎机（slot）

### 暗色主题
`body.has-preview` 激活：顶栏、侧边栏、右侧预览面板、主内容区全部 `#0C111B`/`#0D1117`

### 6 个素材 + Section ID

| section ID | 素材 | 尺寸 |
|------------|------|------|
| `section-preview` | 老虎机未抽奖状态 | 750×242 |
| `section-bg` | 老虎机背景 | 750×242 |
| `section-empty` | 空态页 | 854×284 @2x |
| `section-btn` | 抽奖按钮 | 194×80 |
| `section-link` | 链接文字 | 96/109×34 |
| `section-prize` | 奖品图×3 | 124×124 |

### 左侧配置面板（shadcn/ui 风格重设计）

| id | 标题 | 滚动到 |
|----|------|--------|
| `pg-bg-slot` | 会场背景色（移自右侧）| — |
| `pg-preset` | 配色预设 | `section-preview` |
| `pg-color` | 自定义颜色 | `section-bg` |
| `pg-text` | 文案设置 | `section-bg` |
| `pg-empty` | 空态页设置 | `section-empty` |
| `pg-prize` | 奖品图设置 | `section-prize` |

---

## 组件注册表（COMPONENT_REGISTRY）

约 50 个组件，P0-P6，定义在 JS 中，仅 `slot` 为 `status: 'done'`。

**后续新增组件步骤：**
1. `COMPONENT_REGISTRY` 里改 `status: 'done'`
2. 加 `page-{id}` HTML
3. 加 `panel-{id}` 配置面板
4. 加 JS sync/preview/export 函数
5. 需要预览的加入 `PREVIEW_COMPS = ['slot', ...]`
6. `exportAll()` 的 tasks 数组加素材

---

## 我的资产

- **存储**：localStorage，key `shangou_asset_records`，最多 200 条
- **触发**：`exportAll()` 完成后自动记录
- **功能**：送审/通过状态流转，`reuseAssetConfig()` 复用历史配色

---

## 核心 JS 函数

| 函数 | 作用 |
|------|------|
| `renderHomePage()` | 首页目录 HTML + GSAP 入场 + 初始化 Bento/BorderGlow/Chroma |
| `renderCompBrowser()` | 左侧分类树 + P0-P6 图标 hover 动效 |
| `switchComp(id)` | 进入组件（切页 + 侧边栏模式 + 主题 + 预览面板） |
| `goHome()` | 返回首页（重置状态 + GSAP 动画） |
| `switchToAssets()` | 切到我的资产页 |
| `toggleGroup(id, scrollTarget)` | 折叠分组 + 弹性动画 + 滚动到素材区 |
| `toggleTheme()` / `applyTheme(dark)` | 深色模式切换 + localStorage 持久化 |
| `toggleStaggeredMenu()` | 顶栏快速跳转菜单 |
| `initBentoEffects()` | 首页卡片 MagicBento 效果 |
| `initBorderGlow()` | BorderGlow 边缘光晕 |
| `initChromaGrid()` | 深色模式 ChromaGrid 灰度揭色 |
| `exportAll()` | 打包 ZIP + 自动记录到资产 |

---

## 设计 Token

```css
/* 浅色 */
--accent: #FF3060; --accent-soft: #FFF0F3;
--border: #EBEBEB; --text-1: #1A1A1A; --text-2: #666; --text-3: #737373;
--bg: #FFFFFF; --bg-subtle: #F8F8F8;

/* 深色（body.dark-mode）*/
body: #0D1117; sidebar: #0C111B;
text-primary: rgba(255,255,255,0.92); text-secondary: rgba(255,255,255,0.62);
border: rgba(255,255,255,0.08);
```

---

## AI 生图预留

首页顶部深色卡片（`.ai-promo-card`），标注「即将上线」。  
API endpoint：`ANTHROPIC_BASE_URL=https://mcli.sankuai.com`（内部美团 AI 服务）

---

## Git 工作流

```bash
# 日常开发
git add index.html && git commit -m "描述" && git push origin dev

# 发布线上
git checkout main && git merge dev && git push origin main && git checkout dev
```

---

## 近期 Git 历史摘要

```
d03b7a4  chore: 添加 .gitignore、impeccable skill
6bbe380  fix: 深色模式可用卡片白色问题
5dee764  feat: 深色模式文字提亮 + ChromaGrid 效果  
3774899  feat: 全局深色模式切换
4afea30  feat: 首页隐藏顶栏，标题更大更干净
c340c57  feat: StaggeredMenu 顶栏快速跳转菜单
8225549  feat: 替换 P0/P1/P2 图标 + GSAP 动效
f10474c  feat: 替换 P3/P4 图标 + GSAP 动效
a39ff9b  feat: 团资源位图标换为 animate-ui/icons-users-round
585a26e  feat: BorderGlow 移植到 AI 预留卡片
```
