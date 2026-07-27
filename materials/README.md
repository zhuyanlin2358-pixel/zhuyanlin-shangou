# 素材库文件夹

此文件夹存放工具使用的图片素材，后续可替换为 Talos CDN URL。

## 文件夹结构

```
materials/
├── headers/          # 头图背景（750×424, 750×624, 750×274）
├── prizes/           # 老虎机奖品图
└── logos/            # Logo 图片
```

## 头图背景命名规范

| 文件名 | 尺寸 | 色系 | 用途 |
|--------|------|------|------|
| pink-1.jpg | 750×424 | 粉色 | 鲜花日常 |
| pink-2.jpg | 750×424 | 粉色 | 情人节 |
| red-1.jpg | 750×424 | 红色 | 大促 |
| yellow-1.jpg | 750×424 | 黄色 | 活力日常 |
| ... | ... | ... | ... |

## 当前状态

使用**占位图**：代码会检测图片加载失败，自动显示渐变色 + 文字名称。

## 替换为真图步骤

1. 设计师提供图片
2. 压缩（tinypng.com）
3. 按命名规范放入对应文件夹
4. 或：上传到 Talos CDN，修改 `src/data/materials.ts` 中的 URL

## Talos CDN 迁移

当图片准备好后，修改 `src/data/materials.ts`：

```typescript
// 从本地路径
url: '/materials/headers/pink-1.jpg'

// 改为 Talos CDN
url: 'https://talos-cdn.xxx/headers/pink-1.jpg'
```
