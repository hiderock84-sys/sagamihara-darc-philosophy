#!/bin/bash

# シンプル＆シルバー版PWAアイコン作成
# ライトブルー透明背景 + シルバー電話 + シルバーDARC

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 512x512版
convert -size 512x512 \
  xc:"#87CEEB" \
  \( public/static/ai-generated-icon.png \
     -gravity center \
     -crop 50%x40%+0-60 +repage \
     -colorspace Gray \
     -fill "#C0C0C0" -colorize 60% \
     -resize 240x240 \
  \) -gravity north -geometry +0+60 -composite \
  -font DejaVu-Sans-Bold \
  -pointsize 140 \
  -fill "#C0C0C0" \
  -stroke "#909090" \
  -strokewidth 3 \
  -gravity south \
  -annotate +0+30 "DARC" \
  public/static/icon-512.png

# 192x192版（512版を縮小）
convert public/static/icon-512.png \
  -resize 192x192 \
  public/static/icon-192.png

echo "✅ シンプル＆シルバー版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
