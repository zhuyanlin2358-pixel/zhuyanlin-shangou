# 闪购会场组件自助设计工具 — Claude Code 上下文文档

> 本文档供 Claude Code 接手开发使用。阅读完本文件即可理解项目全貌，直接开始开发。

---

## 项目概述

**用途**：美团闪购业务的设计师自助工具，用于生成老虎机组件所需的各类 UI 切图素材，可配置配色、文案、奖品图，一键导出 PNG / ZIP。

**GitHub 仓库**：`https://github.com/zhuyanlin2358-pixel/shangou-export-tool`  
**线上地址（GitHub Pages）**：`https://zhuyanlin2358-pixel.github.io/shangou-export-tool/`  
**本地路径**：`F:\catpaw\work\shangou-export-tool\`

---

## 技术架构

- **纯前端单文件**：`index.html`（约 1660 行），无构建工具，无框架，无 npm。
- **外部依赖（CDN）**：
  - `html2canvas 1.4.1`：将 DOM 渲染为 Canvas，用于导出 PNG
  - `jszip 3.10.1`：打包多张 PNG 为 ZIP 下载
- **内嵌资源**：
  - 美团数字字体 `MeituanDigitalType`（base64 内嵌，约 40 行 `@font-face`）
  - 空态页默认插图（base64 PNG，`~15KB`）
  - 奖品图 1/2 默认示例图片（base64 PNG，各 `~3KB`）
- **部署**：直接 commit + push 到 `main` 分支，GitHub Pages 自动构建，无需任何 CI/CD。

---

## 目录结构

```
shangou-export-tool/
├── index.html      # 全部代码（HTML + CSS + JS），唯一需要修改的文件
├── fonts/          # 备用字体目录（当前未使用，字体已内嵌到 index.html）
├── images/         # 备用图片目录（当前未使用，图片已内嵌到 index.html）
├── README.md       # 简介
└── CLAUDE.md       # 本文档
```

---

## index.html 结构（按行号）

| 行号范围 | 内容 |
|----------|------|
| 1–8 | HTML head，引入 html2canvas / jszip CDN |
| 9–12 | `@font-face` MeituanDigitalType（base64 内嵌） |
| 13–26 | `:root` CSS 变量（组件配色 token + 美境 UI token） |
| 27–420 | 全部 CSS 样式 |
| 421–425 | `</style></head><body>` |
| 426–445 | 顶部导航 `.topbar`（标题 + 一键导出 ZIP 按钮） |
| 446–463 | 左侧组件导航栏 `.comp-nav`（老虎机/领券红包/楼层条/Banner/倒计时） |
| 464–637 | 左侧配置侧边栏 `.sidebar`（5 个组件配置面板，当前仅老虎机有完整配置） |
| 638–1000 | 主内容区 `.main`（6 个 section：未抽奖状态/背景/空态页/按钮/链接/奖品图） |
| 1001–1004 | toast 提示 + offscreen 渲染容器 |
| 1005–1660 | 全部 JavaScript 逻辑（`<script>` 标签） |
| 1660–1662 | `</script></body></html>` |

---

## CSS 设计 Token（`:root`）

### 组件配色 Token（随配色预设动态变更）
```css
--btn-active-from    /* 主按钮渐变起始色，默认 #FF3060 */
--btn-active-to      /* 主按钮渐变结束色，默认 #FF7030 */
--btn-active-shadow  /* 主按钮阴影色 */
--btn-disabled-from  /* 禁用按钮渐变起始色 */
--btn-disabled-to    /* 禁用按钮渐变结束色 */
--slot-tint-from     /* 老虎机背景渐变起始色 */
--slot-tint-to       /* 老虎机背景渐变结束色 */
--slot-links-color   /* 链接文字颜色 */
--slot-title-color   /* 主标题颜色 */
--slot-remain-color  /* 剩余次数文字颜色（深色模式时白色）*/
```

### UI 框架 Token（固定，不参与配色预设）
```css
--accent / --accent-soft  /* 当前等同于 --border 系列，历史遗留 */
--border    #EBEBEB
--text-1    #1A1A1A
--text-2    #555
--text-3    #999
--bg-page   #F5F4FB
--bg-card   #FFFFFF
--radius-sm 6px
--radius-md 10px
```

---

## 布局系统

```
[72px comp-nav] [240px sidebar] [主内容区 flex:1] [360px preview-panel]
                                ← margin-left:312px →← margin-right:360px →
顶部导航 topbar 高度 56px，fixed 定位
```

- `.comp-nav`：左侧图标导航（72px），切换当前组件
- `.sidebar`：配置面板（240px），随 `.comp-nav` 选中项切换
- `.main`：主内容区，展示所有可导出的素材卡片
- `.preview-panel`：右侧 360px 面板，显示手机 Mock + 实时预览组件效果

---

## 当前已实现的组件：老虎机（slot）

### 6 个可导出素材（section 1–6）

| section | 素材名 | 尺寸 | DOM id |
|---------|--------|------|--------|
| 1 | 老虎机未抽奖状态 | 750×242 px | `asset-slot-ready` |
| 2 | 老虎机背景（含主标题） | 750×242 px | `asset-bg-only` |
| 3 | 老虎机空态页 | 854×284 @2x | `asset-slot-empty` |
| 4 | 按钮—立即抽奖 | 194×80 px | `asset-btn-active` |
| 4 | 按钮—活动已结束 | 194×80 px | `asset-btn-ended` |
| 5 | 链接文字：我的奖品 | 96×34 px | `asset-link-prize` |
| 5 | 链接文字：抽奖规则 | 109×34 px | `asset-link-rule` |
| 6 | 奖品图 1/2/3 | 124×124 px | `asset-prize-1/2/3` |

### 左侧配置面板（5 个折叠分组）

| id | 标题 | 功能 |
|----|------|------|
| `pg-preset` | 配色预设 | 浅色系 7 种 + 深色系 5 种（深色系 UI 已标注 disabled 待开发） |
| `pg-color` | 自定义颜色 | 手动设置 6 个颜色值 |
| `pg-text` | 文案设置 | 主标题文案 + 主标题颜色 |
| `pg-empty` | 空态页设置 | 空态文案 + 替换插图 + 调整大小/位置 |
| `pg-prize` | 奖品图设置 | 3 个奖品图各自：类型选择/文案/上传产品图/金额 |

### 奖品图 4 种类型

| type 值 | 样式 | 说明 |
|---------|------|------|
| `product-tag` | 实线边框 + 顶部标签 + 产品图 + 底部文字 | 默认 |
| `product-dashed` | 虚线边框 + 产品图 + 底部文字 | 无顶部标签 |
| `amount` | 实线边框 + 顶部标签 + 大号金额数字 + 底部文字 | 金额券 |
| `thanks` | 圆形卡片 + 大字 | 谢谢参与 |

---

## 配色预设数据结构（PRESETS）

```js
const PRESETS = {
  pink:   { from, to, disFrom, disTo, slotFrom, slotTo, linksColor, titleColor, isDark: false },
  rose:   { ... },
  orange: { ... },
  yellow: { ... },
  green:  { ... },
  teal:   { ... },
  purple: { ... },
};
const PRESETS_DARK = {
  'dark-red':    { ..., isDark: true },
  'dark-orange': { ..., isDark: true },
  'dark-green':  { ..., isDark: true },
  'dark-blue':   { ..., isDark: true },
  'dark-purple': { ..., isDark: true },
};
```

`isDark: true` 时链接文字和剩余次数文字自动改为白色/半透明白色。

---

## 核心 JS 函数速查

| 函数 | 作用 |
|------|------|
| `applyPreset(key, btn)` | 应用配色预设，更新所有 CSS 变量和输入框值 |
| `syncCustom()` | 自定义颜色输入变更时同步 CSS 变量 |
| `syncTitleText()` | 主标题文案同步到所有 `.title-layer` |
| `syncEmptyText()` | 空态页文案同步 |
| `syncPreviewPanel()` | 将 `asset-slot-ready` clone 到右侧预览面板 |
| `previewToPanel()` | 点击「预览」按钮时触发，显示 slot wrap |
| `previewEmpty()` | 切换右侧预览区显示空态页 |
| `previewPrize(idx)` | 将奖品图 idx 加入预览队列（最多 3 位） |
| `previewBtn(state)` | 切换按钮为 active/disabled 状态并滚动到预览区 |
| `previewLink(mode)` | 切换链接文字深色/浅色版并预览 |
| `syncPrize(n)` | 奖品图配置变更时同步 DOM 和徽章/卡片名 |
| `loadPrizeImg(n, input)` | 上传产品图，更新奖品图区域 |
| `clonePrizeToSlot(srcIdx, slotIdx)` | 将奖品图 clone 到未抽奖状态预览区 |
| `syncPrizeToSlot()` | 批量调用 clonePrizeToSlot(1→1, 2→2, 3→3) |
| `replaceEmptyImg(input)` | 替换空态页插图（仅接受 PNG） |
| `syncEmptyScale(val)` | 空态插图缩放滑块同步 |
| `resetEmptyTransform()` | 重置空态插图位置和缩放 |
| `exportSingle(id, filename, scale)` | 导出单张，scale 可选（空态页传 2） |
| `exportSingleFixed(id, filename, w, h)` | 导出固定尺寸（链接文字用） |
| `exportPrize(n)` | 导出奖品图，内部先截 prize-card 再居中到 124×124 画布 |
| `exportAll()` | 一键打包所有素材为 ZIP，文件名用中文 |
| `switchComp(compId, navEl)` | 切换组件（更新导航高亮/主内容区/侧边栏/顶部副标题） |
| `toggleGroup(id)` | 折叠/展开侧边栏分组 |
| `showToast(msg)` | 显示底部 toast，2.5s 后自动消失 |
| `applyBgTheme(bgHex, swatchEl, forceTone)` | 右侧预览面板换背景色，自动推荐配色预设 |
| `calcBgTheme(bgHex)` | 根据背景色计算推荐预设（返回 isLight/recommendedPreset/Label） |
| `updatePresetToneState(tone)` | 根据当前色调（light/dark）启用/禁用预设按钮 |
| `loadDefaultPrizeImg(n)` | 初始化时加载奖品图 1/2 的默认示例图 |
| `downloadCanvas(canvas, filename)` | canvas → PNG 下载 |
| `canvasToBlob(canvas)` | canvas → Blob（Promise） |

---

## 右侧预览面板结构

```html
.preview-panel
  .preview-panel-header
    <!-- 背景色色块选择 + 上传背景图 + 自定义颜色 -->
  .preview-panel-body
    .page-mock          <!-- 手机 frame，320px 宽 -->
      .page-mock-nav    <!-- 假导航栏 -->
      .page-mock-bg     <!-- 背景色区域，点击色块切换 -->
        #panel-bg-img-el  <!-- 上传的背景图 -->
      #panel-slot-inner-wrap  <!-- 老虎机 slot-full 的 clone，可拖拽上下 -->
        #panel-slot-inner
```

预览面板支持：
- 点击色块换背景色（同时自动推荐配色预设）
- 上传自定义背景图
- 拖拽 slot-full 上下调整位置
- 点各个「预览」按钮后实时更新内容

---

## 待开发功能（UI 已有占位）

以下 4 个组件在 `.comp-nav` 中已有入口（标注了 `coming-soon` class，显示为灰色不可点），主内容区和侧边栏都有占位页面，需要开发：

1. **一键领券红包**（`coupon`）：红包封面、领券按钮、倒计时
2. **楼层条**（`floor`）：楼层标题、分隔线、跳转按钮
3. **Banner**（`banner`）：通用 banner 素材
4. **倒计时**（`countdown`）：独立倒计时组件

### 开发新组件的步骤（参考老虎机）

1. **去掉 `coming-soon` 限制**：删除 `.comp-nav-item` 上的 `coming-soon` class 和 `pointer-events: none`
2. **添加 CSS**：新组件的 DOM 尺寸/样式
3. **补充侧边栏配置面板**：在 `#panel-{compId}` 里添加配置项
4. **补充主内容区**：在 `#page-{compId}` 里添加 section + export-card
5. **补充 JS**：实现对应的 sync/preview/export 函数
6. **接入 `exportAll()`**：在 `tasks` 数组里添加新素材

---

## 深色系预设（待完成）

当前深色系 5 个预设按钮已在 UI 中显示但被 disable 掉。  
激活方式：删除 `preset-btn.preset-disabled` class（`applyPreset` 逻辑已兼容 `isDark: true`）。  
深色模式下需要注意：
- 链接文字颜色改为 `rgba(255,255,255,0.9)`
- 剩余次数文字颜色改为 `rgba(255,255,255,0.85)`
- `--slot-remain-color` CSS 变量已预留

---

## 颜色工具函数

内置了完整的颜色计算工具，可直接使用：

```js
hexToRgb(hex)         // '#FF3060' → [255, 48, 96]
rgbToHex(r, g, b)     // [255, 48, 96] → '#ff3060'
rgbToHsl(r, g, b)     // → [h(0-360), s(0-1), l(0-1)]
hslToRgb(h, s, l)     // → [r, g, b]
adjustL(hex, dL)      // 调整亮度，dL ∈ [-1, 1]
adjustS(hex, dS)      // 调整饱和度，dS ∈ [-1, 1]
```

---

## 开发注意事项

1. **不要引入任何构建工具**：项目刻意保持为单文件，直接用浏览器打开 index.html 即可调试。

2. **html2canvas 限制**：
   - 导出时元素必须在视口内或通过 offscreen div 渲染
   - 跨域图片需要 `useCORS: true` + `allowTaint: true`
   - 透明背景需要 `backgroundColor: null`
   - 奖品图导出用了二次 canvas 绘制（先截 111×119，再居中放到 124×124）

3. **Base64 图片**：默认示例图片和空态插图都内嵌在 JS 变量里（`PRIZE_DEFAULT_IMGS`），不是外部文件，修改时注意不要破坏 base64 字符串。

4. **CSS 变量与 JS 双向同步**：配色变更时需同时更新 `document.documentElement.style.setProperty` 和对应的 `<input type="color">` value，两者都改才能保持 UI 状态一致。

5. **组件切换是局部显示/隐藏**：所有组件 DOM 始终存在，通过 `.active` class 切换可见性，不动态创建/销毁。

6. **Git 工作流**：  
   ```bash
   git add index.html
   git commit -m "描述"
   git push origin main
   # GitHub Pages 约 1-2 分钟后自动更新
   ```

---

## 近期 Git 历史（上下文参考）

```
1400d71  Revert 紫色 UI（已回滚，当前为粉红色系）
091fadf  feat: UI 升级美境品牌紫（已回滚）
d8dff6b  fix: previewEmpty sync actual transform from empty-illus
9bb9d8c  revert: remove real-time sync, preview btn only
7d1ff85  feat: real-time sync empty img transform to preview overlay
91d9664  fix: call previewEmpty() after empty img load for auto sync
f2f51b0  fix: sync empty img in onload, auto-refresh overlay if visible
0a982db  fix: sync empty img to preview, prize img max 80%
1be1950  fix: title color #f00068, previewEmpty no syncPreviewPanel
```

空态页同步逻辑经过多次迭代，当前稳定版本：替换插图后调用 `previewEmpty()` 触发预览区同步，**不做实时同步**（用户点「预览」才更新，避免性能问题）。
