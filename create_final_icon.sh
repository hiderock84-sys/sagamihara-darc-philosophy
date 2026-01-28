#!/bin/bash
# 相模原ダルク PWAアイコン - 最終完全版

echo "🎨 相模原ダルク PWAアイコン（最終版）作成中..."

DARK_BLUE="#00357f"
LIGHT_BLUE="#0072ab"

# ========================================
# 192x192 アイコン
# ========================================
convert -size 192x192 xc:"$DARK_BLUE" \
  \( -size 192x192 \
     -define gradient:angle=135 \
     gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  \) -composite \
  \( -size 192x192 xc:none \
     -fill white \
     -font "DejaVu-Sans-Bold" -pointsize 50 \
     -gravity north -annotate +0+25 "DARC" \
     -font "Noto-Sans-CJK-JP-Bold" -pointsize 26 \
     -gravity north -annotate +0+80 "相模原" \
  \) -composite \
  \( -size 90x90 xc:none \
     -fill white -stroke none \
     -draw "roundrectangle 0,0 90,90 18,18" \
  \) -gravity south -geometry +0+20 -composite \
  \( -size 90x90 xc:none \
     -fill "$DARK_BLUE" \
     -draw "path 'M 30,25 L 35,20 L 40,25 L 40,35 C 40,40 45,45 50,45 C 55,45 60,40 60,35 L 60,25 L 65,20 L 70,25 L 70,35 C 70,50 60,60 50,60 C 40,60 30,50 30,35 Z M 45,30 L 55,30 M 45,40 L 55,40'" \
  \) -gravity south -geometry +0+20 -composite \
  /home/user/webapp/public/static/icon-192.png

# ========================================
# 512x512 アイコン
# ========================================
convert -size 512x512 xc:"$DARK_BLUE" \
  \( -size 512x512 \
     -define gradient:angle=135 \
     gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  \) -composite \
  \( -size 512x512 xc:none \
     -fill white \
     -font "DejaVu-Sans-Bold" -pointsize 135 \
     -gravity north -annotate +0+65 "DARC" \
     -font "Noto-Sans-CJK-JP-Bold" -pointsize 70 \
     -gravity north -annotate +0+215 "相模原" \
  \) -composite \
  \( -size 240x240 xc:none \
     -fill white -stroke none \
     -draw "roundrectangle 0,0 240,240 48,48" \
  \) -gravity south -geometry +0+55 -composite \
  \( -size 240x240 xc:none \
     -fill "$DARK_BLUE" \
     -draw "path 'M 80,65 L 95,50 L 110,65 L 110,95 C 110,110 120,120 135,120 C 150,120 160,110 160,95 L 160,65 L 175,50 L 190,65 L 190,95 C 190,135 165,160 135,160 C 105,160 80,135 80,95 Z M 120,80 L 150,80 M 120,110 L 150,110'" \
  \) -gravity south -geometry +0+55 -composite \
  /home/user/webapp/public/static/icon-512.png

echo "✅ 完成しました！"
ls -lh /home/user/webapp/public/static/icon-*.png | grep -v old
