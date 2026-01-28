#!/bin/bash
# 相模原ダルク PWAアイコン - 超シンプル版

echo "🎨 相模原ダルク PWAアイコン - 超シンプル版作成..."

DARK_BLUE="#00357f"
LIGHT_BLUE="#0072ab"

# 192x192
convert -size 192x192 gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 60 -gravity north -annotate +0+20 "DARC" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 24 -gravity north -annotate +0+88 "相模原" \
  -fill white -draw "roundrectangle 56,110 136,170 18,18" \
  -fill "$DARK_BLUE" -font "DejaVu-Sans" -pointsize 40 -gravity center -annotate +0+42 "☎" \
  /home/user/webapp/public/static/icon-192.png

# 512x512
convert -size 512x512 gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 160 -gravity north -annotate +0+50 "DARC" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 65 -gravity north -annotate +0+230 "相模原" \
  -fill white -draw "roundrectangle 146,300 366,455 50,50" \
  -fill "$DARK_BLUE" -font "DejaVu-Sans" -pointsize 110 -gravity center -annotate +0+115 "☎" \
  /home/user/webapp/public/static/icon-512.png

echo "✅ 完成！"
ls -lh /home/user/webapp/public/static/icon-*.png | grep -v old | grep -v bad
