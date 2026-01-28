#!/bin/bash
# 相模原ダルク PWAアイコン - 最終決定版

echo "🎨 相模原ダルク PWAアイコン最終版を作成..."

DARK_BLUE="#00357f"
LIGHT_BLUE="#0072ab"
WHITE="#FFFFFF"

# ========================================
# 192x192 アイコン
# ========================================
convert -size 192x192 gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 56 \
  -gravity north -annotate +0+25 "DARC" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 22 \
  -gravity north -annotate +0+90 "相模原" \
  \( -size 80x80 xc:none \
     -fill white -draw "roundrectangle 0,0 80,80 20,20" \
  \) -gravity south -geometry +0+20 -composite \
  \( -size 80x80 xc:none \
     -fill "$DARK_BLUE" -stroke none \
     -draw "path 'M 30,28 Q 28,26 26,28 L 22,32 Q 20,34 22,36 L 24,38 Q 26,40 28,42 L 32,46 Q 36,50 40,48 L 50,44 Q 54,42 58,46 L 62,50 Q 64,52 66,50 L 70,46 Q 72,44 70,42 L 68,40 Q 66,38 64,40 L 60,44 Q 56,48 52,46 L 42,40 Q 38,38 34,42 L 30,46 Q 28,48 26,46 L 24,44 Q 22,42 24,40 L 26,38 Q 28,36 30,38 L 32,40 Q 34,42 36,40 L 40,36 Q 42,34 44,36 L 48,40 Q 50,42 52,40 L 56,36 Q 58,34 60,36 L 62,38 Q 64,40 62,42 L 58,46'" \
  \) -gravity south -geometry +0+20 -composite \
  /home/user/webapp/public/static/icon-192.png

# ========================================  
# 512x512 アイコン
# ========================================
convert -size 512x512 gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 150 \
  -gravity north -annotate +0+65 "DARC" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 60 \
  -gravity north -annotate +0+240 "相模原" \
  \( -size 220x220 xc:none \
     -fill white -draw "roundrectangle 0,0 220,220 50,50" \
  \) -gravity south -geometry +0+55 -composite \
  \( -size 220x220 xc:none \
     -fill "$DARK_BLUE" -stroke none \
     -draw "path 'M 80,75 Q 75,70 70,75 L 60,85 Q 55,90 60,95 L 65,100 Q 70,105 75,110 L 85,120 Q 95,130 105,125 L 130,115 Q 140,110 150,120 L 160,130 Q 165,135 170,130 L 180,120 Q 185,115 180,110 L 175,105 Q 170,100 165,105 L 155,115 Q 145,125 135,120 L 110,105 Q 100,100 90,110 L 80,120 Q 75,125 70,120 L 65,115 Q 60,110 65,105 L 70,100 Q 75,95 80,100 L 85,105 Q 90,110 95,105 L 105,95 Q 110,90 115,95 L 125,105 Q 130,110 135,105 L 145,95 Q 150,90 155,95 L 160,100 Q 165,105 160,110 L 150,120'" \
  \) -gravity south -geometry +0+55 -composite \
  /home/user/webapp/public/static/icon-512.png

echo "✅ 完成！"
ls -lh /home/user/webapp/public/static/icon-*.png | grep -v old | grep -v bad
