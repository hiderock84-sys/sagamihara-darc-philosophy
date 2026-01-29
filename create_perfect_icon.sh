#!/bin/bash

# 完璧版PWAアイコン作成
# 薄い青透明背景 + 大きなシルバー電話 + 大きな白いDARC

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 512x512版
# 背景: #A0D8E8（薄い青透明色 - スクリーンショットのA箇所）
# 電話: 大きなシルバー（白に近い）
# DARC: 大きな白文字

convert -size 512x512 \
  xc:"#A0D8E8" \
  \( public/static/ai-generated-icon.png \
     -gravity center \
     -crop 50%x40%+0-60 +repage \
     -resize 300x300 \
  \) -gravity center -geometry +0-40 -composite \
  -font DejaVu-Sans-Bold \
  -pointsize 160 \
  -fill white \
  -stroke "#E0E0E0" \
  -strokewidth 2 \
  -gravity south \
  -annotate +0+15 "DARC" \
  public/static/icon-512.png

# 192x192版（512版を縮小）
convert public/static/icon-512.png \
  -resize 192x192 \
  public/static/icon-192.png

echo "✅ 完璧版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
