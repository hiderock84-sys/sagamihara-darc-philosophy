#!/bin/bash

# DARCテキスト最大化版PWAアイコン作成
# 青グラデーション背景 + 白い電話アイコン + 超大きなDARCテキスト

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 512x512版（高解像度で作成）
convert -size 512x512 \
  gradient:"#2563eb-#06b6d4" \
  \( public/static/ai-generated-icon.png \
     -gravity center \
     -crop 60%x50%+0-50 +repage \
     -resize 260x260 \
  \) -gravity north -geometry +0+40 -composite \
  -font DejaVu-Sans-Bold \
  -pointsize 130 \
  -fill white \
  -stroke "#1e40af" \
  -strokewidth 3 \
  -gravity south \
  -annotate +0+20 "DARC" \
  public/static/icon-512.png

# 192x192版（512版を縮小）
convert public/static/icon-512.png \
  -resize 192x192 \
  public/static/icon-192.png

echo "✅ DARCテキスト最大化版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
