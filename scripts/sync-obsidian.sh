#!/bin/bash
# 同步 Claude 记忆 + 项目文档 → Obsidian vault → GitHub
# 用法：bash scripts/sync-obsidian.sh

VAULT="/Users/zhuyanlin/Library/Mobile Documents/iCloud~md~obsidian/Documents/闪购工具"
PROJECT="/Users/zhuyanlin/shangou-export-tool"
MEMORY="/Users/zhuyanlin/.claude/projects/-Users-zhuyanlin/memory"

echo "📄 同步文档到 Obsidian..."

# CLAUDE.md（项目主文档）
cp "$PROJECT/CLAUDE.md" "$VAULT/CLAUDE.md"

# 记忆文件
mkdir -p "$VAULT/wiki/记忆"
cp "$MEMORY/project_shangou.md" "$VAULT/wiki/记忆/项目状态.md"
cp "$MEMORY/feedback.md"        "$VAULT/wiki/记忆/代码偏好与踩坑.md"
cp "/Users/zhuyanlin/.cursorrules" "$VAULT/wiki/记忆/cursorrules快捷记忆.md"

# 产品设计文档（docs/ → wiki/概念/）
mkdir -p "$VAULT/wiki/概念"
cp "$PROJECT/docs/产品设计逻辑与汇报.md" "$VAULT/wiki/概念/产品设计逻辑与汇报.md"

echo "📦 提交并推送到 GitHub..."
cd "$VAULT"
git add -A
git commit -m "sync: $(date '+%Y-%m-%d %H:%M') 自动同步" 2>/dev/null || echo "（无变更，跳过提交）"
git push origin main

echo "✅ Obsidian + GitHub 同步完成"
echo "   仓库: https://github.com/zhuyanlin2358-pixel/shangou-obsidian"
