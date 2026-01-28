#!/bin/bash
# 相模原ダルク PWAアイコン作成スクリプト

# 192x192 アイコン作成
convert -size 192x192 xc:"#00357f" \
  -fill "#0072ab" -draw "roundrectangle 0,0 192,192 20,20" \
  -fill white -font DejaVu-Sans-Bold -pointsize 28 -gravity north -annotate +0+15 "DARC" \
  -fill white -font DejaVu-Sans -pointsize 18 -gravity north -annotate +0+50 "SAGAMIHARA" \
  -fill "#FFD700" -draw "circle 96,120 96,70" \
  -fill white -font DejaVu-Sans -pointsize 60 -gravity center -annotate +0+10 "📞" \
  /home/user/webapp/public/static/icon-192-new.png

# 512x512 アイコン作成
convert -size 512x512 xc:"#00357f" \
  -fill "#0072ab" -draw "roundrectangle 0,0 512,512 50,50" \
  -fill white -font DejaVu-Sans-Bold -pointsize 72 -gravity north -annotate +0+40 "DARC" \
  -fill white -font DejaVu-Sans -pointsize 48 -gravity north -annotate +0+130 "SAGAMIHARA" \
  -fill "#FFD700" -draw "circle 256,320 256,200" \
  -fill white -font DejaVu-Sans -pointsize 160 -gravity center -annotate +0+30 "📞" \
  /home/user/webapp/public/static/icon-512-new.png

echo "✅ 相模原ダルク公式デザインのPWAアイコンを作成しました！"
