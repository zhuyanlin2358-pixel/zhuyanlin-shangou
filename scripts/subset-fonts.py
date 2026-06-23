#!/usr/bin/env python3
"""
字体子集化脚本
把方正兰亭黑从 1.1MB 压到 ~100KB
只保留工具实际用到的字符 + 用户常用输入字符缓冲

运行方式：python3 scripts/subset-fonts.py
"""

import subprocess, sys, os, re

FONT_DIR = os.path.join(os.path.dirname(__file__), '../src/assets/fonts')
SRC_DIR  = os.path.join(os.path.dirname(__file__), '../src')

# ── 1. 从源代码收集所有用到的字符 ─────────────────────────────────────────
print('📖 扫描源码字符...')
used_chars = set()
for root, _, files in os.walk(SRC_DIR):
    for f in files:
        if f.endswith(('.ts', '.tsx', '.css')):
            with open(os.path.join(root, f), encoding='utf-8', errors='ignore') as fp:
                for ch in fp.read():
                    if ord(ch) > 0x7F:   # 非 ASCII
                        used_chars.add(ch)

print(f'  源码中: {len(used_chars)} 个非 ASCII 字符')

# ── 2. 加入 GB2312 一级汉字（3755 个最常用汉字，覆盖用户输入场景）──────────
print('📚 加入常用汉字缓冲...')
# GB2312 一级汉字区：0xB0A1 – 0xD7F9（GBK 编码范围）
gb2312_level1 = set()
for hi in range(0xB0, 0xD8):
    for lo in range(0xA1, 0xFF):
        try:
            ch = bytes([hi, lo]).decode('gbk')
            if '一' <= ch <= '鿿':   # 只取汉字
                gb2312_level1.add(ch)
        except Exception:
            pass

used_chars |= gb2312_level1
print(f'  加入 GB2312 一级汉字后: {len(used_chars)} 个字符')

# ── 3. 加入 ASCII 可打印字符（数字、字母、常用符号）────────────────────────
ascii_chars = ''.join(chr(i) for i in range(0x20, 0x7F))
all_chars = ascii_chars + ''.join(sorted(used_chars))

# ── 4. 对每个字体文件执行子集化 ────────────────────────────────────────────
fonts = [
    ('FZLTHJW.woff2',  'FZLanTingHei-M'),
    ('FZLTZHJW.woff2', 'FZLanTingHei-DB'),
]

print('\n✂️  开始子集化...')
for filename, family in fonts:
    src  = os.path.join(FONT_DIR, filename)
    dest = os.path.join(FONT_DIR, filename)   # 直接覆盖
    tmp  = src + '.tmp.woff2'

    if not os.path.exists(src):
        print(f'  ⚠️  跳过（文件不存在）: {filename}')
        continue

    size_before = os.path.getsize(src) / 1024

    result = subprocess.run([
        sys.executable, '-m', 'fonttools', 'subset', src,
        f'--text={all_chars}',
        '--flavor=woff2',
        '--no-ignore-missing-glyphs',
        f'--output-file={tmp}',
    ], capture_output=True, text=True)

    if result.returncode != 0 or not os.path.exists(tmp):
        print(f'  ❌ 失败: {filename}')
        print(result.stderr[:300])
        continue

    os.replace(tmp, dest)
    size_after = os.path.getsize(dest) / 1024
    ratio = (1 - size_after / size_before) * 100
    print(f'  ✅ {family}')
    print(f'     {size_before:.0f}KB → {size_after:.0f}KB  (-{ratio:.0f}%)')

print('\n🎉 完成！重启 pnpm dev 生效')
