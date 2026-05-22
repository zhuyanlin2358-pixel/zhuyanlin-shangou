# 闪购会场组件自助设计工具 — Claude Code 上下文文档

> 本文档供 Claude Code 接手开发使用。阅读完本文件即可理解项目全貌，直接开始开发。
> **每次对话结束前更新本文档。**

---

## 项目概述

**用途**：美团闪购业务的运营/设计师自助工具，通过可视化目录选择组件，配置文案/配色/奖品图，一键导出 PNG / ZIP 切图素材，可接入美境（aidesign.meituan.com）"应用"模块（iframe 嵌入）。

**GitHub 仓库**：`https://github.com/zhuyanlin2358-pixel/shangou-export-tool`  
**线上地址（GitHub Pages）**：`https://zhuyanlin2358-pixel.github.io/shangou-export-tool/`  
**本地路径（开发用）**：`/Users/zhuyanlin/shangou-export-tool/`

---

## 技术架构

- **纯前端单文件**：`index.html`（约 2492 行），无构建工具，无框架，无 npm
- **外部依赖（CDN）**：
  - `html2canvas 1.4.1`：DOM → Canvas → PNG 导出
  - `jszip 3.10.1`：多张 PNG 打包 ZIP
- **内嵌资源**：美团数字字体 `MeituanDigitalType`（base64），奖品图默认示例（base64）
- **部署**：`git push origin main` → GitHub Pages 自动构建（1-2 分钟）

---

## 目录结构

```
shangou-export-tool/
├── index.html        # 全部代码（HTML + CSS + JS）
├── COMPONENTS.md     # 组件分类清单（50个，P0-P6优先级）
├── CLAUDE.md         # 本文档
└── images/           # 备用图片目录（未使用，图片内嵌JS）
```

---

## 整体布局（当前）

```
[顶栏 56px, fixed]
[左侧侧边栏 260px] [主内容区 flex:1] [右侧预览面板 360px, 仅老虎机时显示]
```

### 侧边栏双模式

| 模式 | 触发条件 | 显示内容 |
|------|----------|----------|
| 浏览模式 | 首页/我的资产 | 组件目录（搜索 + P0-P6 分类树）+ 底部「我的资产」入口 |
| 配置模式 | 进入某个组件 | 顶部返回条 + 该组件配置面板 |

切换靠 `.sidebar.config-mode` class 控制，在 `switchComp()` / `goHome()` 里管理。

---

## 页面结构（主内容区）

| 页面 ID | 默认激活 | 内容 |
|---------|----------|------|
| `page-home` | ✅ | 首页目录（AI预留卡片 + 分类组件卡片，由 `renderHomePage()` 生成） |
| `page-slot` | — | 老虎机配置+导出页（暗色高级感主题） |
| `page-assets` | — | 我的资产页（导出历史，由 `renderAssetsPage()` 生成） |
| `page-generic` | — | 通用占位页（未开发组件点击后显示） |
| `page-coupon/floor/banner/countdown` | — | 旧版占位页（保留兼容） |

---

## 已实现组件：老虎机（slot）

### 暗色主题
进入老虎机时，`body.has-preview` class 触发全局暗色：
- 顶栏、左侧、右侧全部变为 `#0C111B`
- 主内容区 `#0D1117`，flat（无渐变）
- 退出后恢复浅色（`transition: 0.3s`）

### 6 个可导出素材

| section ID | 素材名 | 尺寸 |
|------------|--------|------|
| `section-preview` | 老虎机未抽奖状态 | 750×242 px |
| `section-bg` | 老虎机背景（含主标题） | 750×242 px |
| `section-empty` | 老虎机空态页 | 854×284 @2x |
| `section-btn` | 抽奖按钮（两态） | 194×80 px |
| `section-link` | 链接文字（我的奖品/抽奖规则） | 96/109×34 px |
| `section-prize` | 奖品图 1/2/3 | 124×124 px |

### 左侧配置面板（panel-slot，5 个折叠分组）

| id | 标题 | 功能 | 点击滚动到 |
|----|------|------|------------|
| `pg-bg-slot` | 会场背景色 | 背景色色块 + 上传背景图 | — |
| `pg-preset` | 配色预设 | 浅色/深色系 12 种预设 | `section-preview` |
| `pg-color` | 自定义颜色 | 6 个颜色 token 手动设置 | `section-bg` |
| `pg-text` | 文案设置 | 主标题文案 + 颜色 | `section-bg` |
| `pg-empty` | 空态页设置 | 文案 + 插图 + 缩放 | `section-empty` |
| `pg-prize` | 奖品图设置 | 3 个奖品图配置 | `section-prize` |

**点击展开分组 → 自动滚动到对应素材区**（`toggleGroup(id, scrollTarget)`）

### 右侧预览面板
`body.has-preview` 时显示，内容：
- 顶部「手机预览」标签
- 手机 mock frame + 拖拽 slot 位置
- `.page-mock.visible` 由 `switchComp('slot')` 触发

---

## 组件注册表（COMPONENT_REGISTRY）

约 50 个组件，P0-P6 优先级，定义在 JS 中。结构：
```js
{ group, groupLabel, badgeClass, items: [{id, name, status:'done'|'coming'}] }
// P4 有 subgroups（A/B/C 子分类）
```

仅 `slot`（无门槛老虎机）`status: 'done'`，其余 `coming`。

**开发新组件的步骤：**
1. 在 `COMPONENT_REGISTRY` 里把 `status` 改为 `'done'`
2. 添加 `page-{id}` HTML（主内容区）
3. 添加 `panel-{id}` HTML（侧边栏配置面板）
4. 添加对应 JS 函数（sync/preview/export）
5. 如需预览面板，把 id 加入 `PREVIEW_COMPS` 数组
6. 在 `exportAll()` 的 `tasks` 数组里添加素材

---

## 我的资产功能

- **存储**：`localStorage`，key = `shangou_asset_records`，最多 200 条
- **触发**：`exportAll()` 完成后自动调用 `recordExport()`
- **Tab**：我的导出 / 待审核 / 已通过（状态通过 `updateAssetStatus(id, status)` 切换）
- **复用配置**：`reuseAssetConfig(id)` 一键恢复历史配色/文案到老虎机

---

## 核心 JS 函数速查

| 函数 | 作用 |
|------|------|
| `renderHomePage()` | 渲染首页目录（AI预留卡片 + 分类卡片） |
| `renderCompBrowser()` | 渲染左侧分类树（含 SVG 图标） |
| `switchComp(compId)` | 进入组件视图（切换页面 + 配置面板 + 侧边栏模式 + 预览面板） |
| `goHome()` | 返回首页（重置所有状态） |
| `switchToAssets()` | 切换到我的资产页 |
| `toggleGroup(id, scrollTarget)` | 折叠/展开配置分组，展开时滚动到对应素材区 |
| `applyPreset(key, btn)` | 应用配色预设 |
| `syncCustom()` | 自定义颜色同步到 CSS 变量 |
| `exportAll()` | 一键打包所有素材为 ZIP，完成后记录到资产 |
| `exportSingle(id, filename, scale)` | 导出单张 PNG |
| `recordExport(files)` | 导出完成后写入 localStorage |
| `reuseAssetConfig(id)` | 从资产历史恢复配置到当前组件 |

---

## 设计系统

### CSS Token（`:root`）
```css
--accent: #FF3060          /* 主色（红）*/
--accent-soft: #FFF0F3     /* 主色浅背景 */
--border: #EBEBEB
--text-1: #1A1A1A / --text-2: #666 / --text-3: #999
--bg: #FFFFFF / --bg-subtle: #F8F8F8
--shadow-sm/md
```

### 暗色模式 Token（老虎机页，body.has-preview）
```
页面背景: #0D1117
侧边栏/右侧面板: #0C111B
边框: rgba(255,255,255,0.07)
文字: rgba(255,255,255,0.88/0.55/0.35)
```

---

## 首页 AI 预留卡片

顶部深色暗调卡片（`.ai-promo-card`），标注「即将上线」。  
后续接入 `mcli.sankuai.com` API，实现「上传商品图 → AI 生成资源位」。  
API endpoint 已在环境变量中：`ANTHROPIC_BASE_URL=https://mcli.sankuai.com`

---

## 开发注意事项

1. **不引入构建工具**，保持单文件，直接用浏览器打开调试
2. **推送流程**：`git add index.html && git commit -m "描述" && git push origin main`
3. **html2canvas 限制**：导出元素需在视口内或 offscreen div；跨域图需 `useCORS: true`
4. **暗色主题作用域**：全部用 `body.has-preview` 前缀，不影响其他页面
5. **新组件预览**：把组件 id 加入 `const PREVIEW_COMPS = ['slot', ...]`
6. **组件状态**：`COMPONENT_REGISTRY` 里改 `status: 'done'` 即可激活

---

## Git 历史摘要（最近重要节点）

```
d088bdb  fix: 隐藏暗色模式下的滚动条
2e09258  fix: 消除白色区域 + 去渐变 + SVG图标替换emoji
4f01611  feat: 老虎机四项UX改造（全页深色/背景色移左/点击滚动/可读性）
b5f4c8d  feat: 我的资产功能 + AI生图预留入口
09e5b54  fix: 修复两个关键bug（#page-home始终可见/sidebar-bottom不可点）
cf96f8d  feat: 侧边栏双模式——浏览/配置互斥显示
1299b2c  feat: LibLib风格导航 + 右侧面板按需显示
e08c481  feat: 可视化首页目录 + 美境风格重设计
c09f82f  feat: 重建左侧导航为分类树，支持50个组件
```
