# 闪购会场组件自助设计工具 — Claude Code 上下文文档

> 最后更新：2026-06-17

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
| 构建 | Vite 5 |
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
                              # P4高达组件（slot/floor/h-tab）→ page='venue'
    SlotContext.tsx / N4Context / N2Context
    FloorContext.tsx           # 楼层条：patchConfig 函数式更新
    HTabContext.tsx            # 横滑Tab：items 多条目管理
    VenueContext.tsx           # 高达会场：items/header/bgColor/moveItem/reorderItems
  components/
    layout/
      TopBar.tsx / Sidebar.tsx / PreviewPanel.tsx
    pages/
      SlotPage / N4Page / N2Page / FloorPage / HTabPage
      VenuePage.tsx            # 4列工作区（薄导航+配置面板+主内容+手机预览）
      VenueManager.tsx         # 会场管理（头图/背景色/组件列表/导出拼图）
      VenuePhonePreview.tsx    # 右侧手机预览（pointer拖拽排序，高度可调）
    panels/
      SlotPanel / N4ConfigPanel / N2ConfigPanel / FloorPanel / HTabPanel
    ui/
      PanelField.tsx           # ColorField, PanelInput, DisclosureGroup 等
      VenueAddButton.tsx       # 加入会场/更新预览 智能双模式按钮
  utils/
    exportUtils.ts             # 所有 Canvas 绘制（@2x 超采样）
    slotStyles.ts              # 老虎机风格注册表
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

| 组件 | id | 状态 |
|------|----|------|
| 老虎机 | slot | ✅ 8类切图、手机预览、风格切换 |
| N4 文字标签 | n4 | ✅ 8种变体，240×156 透明底 PNG |
| N2 品牌Logo | n2 | ✅ 有底色/描边/素材库 |
| 楼层条 | floor | ✅ 750×60，3款预设，3种装饰，透明底，多条批量 |
| 横滑 Tab | h-tab | ✅ 7色配色，2/3/4tab，选中箭头，按尺寸分文件夹 |

---

## 高达会场预览（feature/venue-preview 分支）

### 架构：4列工作区

```
[文字导航140px] [配置面板260px] [主内容flex-1] [手机预览380px]
```

- **点击 P4 高达组件** → `page='venue'` + `currentComp=id`（不走旧 comp 流程）
- **配置面板** 随 currentComp 切换（SlotPanel / FloorPanel / HTabPanel）
- **VenuePhonePreview** 始终显示，pointer 事件拖拽排序，高度滑块可调

### VenueAddButton 双模式

- **未在会场**：蓝色「加入会场」→ `addItem()`，HTab 自动打 Tab1/Tab2 序号
- **已在会场**：灰色「更新预览 ↺」→ `updatePreview(sourceId)` 精准刷新
- HTab 用 `sourceId = item.id` 稳定匹配，不受改色/改数量影响

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

## 楼层条组件（floor）

- 750×60 px，FZLanTingHei-DB 34px，透明底（背景色仅预览用）
- 装饰图形：Figma 精确 SVG 路径（闪电+双燕+爱心+古铜钱）
- 动态定位：`ctx.measureText()` 测文字宽，贴紧 16px 间距
- ⚠️ 装饰绘完后必须重置 `ctx.fillStyle = cfg.textColor`（否则文字用装饰色）

## 横滑 Tab 组件（h-tab）

- 7色（黄/橙/红/绿/粉/蓝/紫），Figma 精确配色
- 选中：127° pastel 渐变 + 底部箭头 + inset 高光
- 未选中：饱和实色 + 同系浅色文字
- 尺寸：2tab=336×88，3tab=226×88，4tab=180×88（Figma 精确，按居中对齐）
- 每条 Tab 出 N张（每个 Tab 位置一张），按尺寸分子文件夹

---

## 关键 Canvas 规范

1. **@2x 超采样**：内部 2x 渲染 → `downsample()` 缩回
2. **装饰绘制后必须重置 fillStyle**（楼层条 bug 教训）
3. **patchConfig 函数式更新**：`prev => ({...prev, ...patch})` 防色轮拖拽 stale closure
4. **子组件必须在模块顶层**：不能在父函数体内定义，否则 input 失焦

---

## 字体

| 文件 | family | 用途 |
|------|--------|------|
| FZLTHJW.TTF | FZLanTingHei-M | 老虎机正文/链接/按钮 |
| FZLTZHJW.TTF | FZLanTingHei-DB | 楼层条/横滑Tab |

字体加载：singleton + 3s 超时降级（避免慢网卡死）。

---

## 分支/发布流程

```bash
# 日常开发（main 分支）
git add -A && git commit -m "描述" && git push origin dev
# 发布
git checkout main && git merge dev && git push origin main && git checkout dev

# 会场预览功能（独立分支）
git checkout feature/venue-preview
git push origin feature/venue-preview
# 合并到 main（确认无误后）
git checkout main && git merge feature/venue-preview && git push origin main

# 同步记忆到 Obsidian + GitHub
bash scripts/sync-obsidian.sh
```

---

## 待做

- **一拖四**：规范确认后开发
- **N4/N2 加入会场**：需 captureElement → previewUrl
- **会场预览合并主干**：feature/venue-preview 测试完后 merge main
- **Skill AI 出图**：等 zhuxiangyu04 API 方案
