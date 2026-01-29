#!/bin/bash

# 黒枠完全削除版PWAアイコン作成（単色青背景）
# 黒い部分を透明化してから青背景で塗りつぶす

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 192x192版
# 1) 元画像の黒い部分を透明化（fuzz 30%で黒に近い色も透明化）
# 2) 青背景（相模原ブルー）を適用
convert public/static/ai-generated-icon.png \
  -resize 192x192 \
  -fuzz 30% -transparent "#000000" \
  -background "#2563eb" \
  -alpha remove \
  -alpha off \
  public/static/icon-192.png

# 512x512版
convert public/static/ai-generated-icon.png \
  -resize 512x512 \
  -fuzz 30% -transparent "#000000" \
  -background "#2563eb" \
  -alpha remove \
  -alpha off \
  public/static/icon-512.png

echo "✅ 黒枠完全削除版PWAアイコン作成完了！（青背景）"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
