#!/bin/bash

# 完全正方形フラット版PWAアイコン作成
# 黒枠を完全に削除し、青グラデーション背景のみにする

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 192x192版
# 1) 中央の60%を切り取り（黒枠を完全排除）
# 2) 青背景でパディング追加
# 3) 192x192にリサイズ
convert public/static/ai-generated-icon.png \
  -gravity center \
  -crop 60%x60%+0+0 +repage \
  -background "#2563eb" \
  -gravity center \
  -extent 120%x120% \
  -resize 192x192! \
  public/static/icon-192.png

# 512x512版
convert public/static/ai-generated-icon.png \
  -gravity center \
  -crop 60%x60%+0+0 +repage \
  -background "#2563eb" \
  -gravity center \
  -extent 120%x120% \
  -resize 512x512! \
  public/static/icon-512.png

echo "✅ 完全正方形フラット版PWAアイコン作成完了！（黒枠完全削除）"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
