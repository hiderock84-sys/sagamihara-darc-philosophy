#!/bin/bash

# 明るいシルバー版PWAアイコン作成
# スカイブルー背景 + 明るいシルバー電話 + 明るいシルバーDARC

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 512x512版
# 背景: #87CEEB（スカイブルー）
# 電話: ほぼ白（#F0F0F0）のシルバー
# DARC: 明るいシルバー（#E8E8E8）

convert -size 512x512 \
  xc:"#87CEEB" \
  \( public/static/ai-generated-icon.png \
     -gravity center \
     -crop 50%x40%+0-60 +repage \
     -alpha extract \
     -negate \
     \( +clone -background "#F0F0F0" -alpha shape \) \
     +swap -compose Over -composite \
     -resize 240x240 \
  \) -gravity north -geometry +0+60 -composite \
  -font DejaVu-Sans-Bold \
  -pointsize 140 \
  -fill "#E8E8E8" \
  -stroke "#D0D0D0" \
  -strokewidth 2 \
  -gravity south \
  -annotate +0+30 "DARC" \
  public/static/icon-512.png

# 192x192版（512版を縮小）
convert public/static/icon-512.png \
  -resize 192x192 \
  public/static/icon-192.png

echo "✅ 明るいシルバー版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
