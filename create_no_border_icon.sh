#!/bin/bash

# 黒枠完全削除版PWAアイコン作成
# 黒い部分を透明にしてから背景を青グラデーションで塗りつぶす

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 192x192版
# 1) 元画像の黒い部分(#000000付近)を透明化
# 2) 青グラデーション背景を適用
convert public/static/ai-generated-icon.png \
  -resize 192x192 \
  -fuzz 20% -transparent black \
  -background "gradient:#2563eb-#06b6d4" \
  -flatten \
  public/static/icon-192.png

# 512x512版
convert public/static/ai-generated-icon.png \
  -resize 512x512 \
  -fuzz 20% -transparent black \
  -background "gradient:#2563eb-#06b6d4" \
  -flatten \
  public/static/icon-512.png

echo "✅ 黒枠完全削除版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
