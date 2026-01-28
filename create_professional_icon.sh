#!/bin/bash

# 🎨 相模原ダルク PWAアイコン - 最高品質プロフェッショナル版
# 公式カラー: #00357f (ダークブルー) → #0072ab (ライトブルー)

echo "🎨 相模原ダルク PWAアイコン - プロフェッショナル版作成..."

# 512x512の高品質アイコンを作成
magick -size 512x512 \
  gradient:'#00357f-#0072ab' \
  \( +clone -sparse-color barycentric '0,0 #00357f 512,512 #0072ab' \) \
  -compose over -composite \
  \( -size 512x400 xc:none \
     -gravity North \
     -pointsize 90 \
     -font DejaVu-Sans-Bold \
     -fill white \
     -annotate +0+60 'DARC' \
     -pointsize 40 \
     -font DejaVu-Sans-Bold \
     -annotate +0+170 '相模原' \
  \) -composite \
  \( -size 140x140 xc:white \
     -draw "roundrectangle 0,0 140,140 30,30" \
     -fill '#00357f' \
     -draw "path 'M 40,30 C 40,20 50,20 60,30 L 60,40 C 60,50 50,60 40,60 L 30,60 C 20,60 10,50 10,40 L 10,30 C 10,20 20,20 30,30 Z M 100,30 C 100,20 90,20 80,30 L 80,40 C 80,50 90,60 100,60 L 110,60 C 120,60 130,50 130,40 L 130,30 C 130,20 120,20 110,30 Z M 50,50 Q 60,60 70,60 Q 80,60 90,50'" \
     -draw "path 'M 45,70 Q 55,85 70,85 Q 85,85 95,70'" \
  \) -gravity South -geometry +0+40 -composite \
  public/static/icon-512.png

# 192x192版を作成
magick public/static/icon-512.png -resize 192x192 public/static/icon-192.png

echo "✅ プロフェッショナル版PWAアイコンを作成しました！"
ls -lh public/static/icon-*.png
