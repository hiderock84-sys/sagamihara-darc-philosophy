#!/bin/bash
# 相模原ダルク PWAアイコン - 公式ロゴ使用版

echo "🎨 公式ロゴを使用したPWAアイコンを作成します..."

DARK_BLUE="#00357f"
LIGHT_BLUE="#0072ab"

# ========================================
# 192x192 アイコン - シンプル＆クリア
# ========================================
echo "📱 192x192アイコン作成..."

convert -size 192x192 \
  -define gradient:angle=135 gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  \( /home/user/webapp/public/static/darc-logo.svg -resize 160x \
     -background none -gravity center -extent 192x80 \) \
  -gravity north -geometry +0+20 -composite \
  \( -size 70x70 xc:white -draw "roundrectangle 0,0 70,70 15,15" \
     -font DejaVu-Sans -pointsize 50 -fill "$DARK_BLUE" \
     -gravity center -annotate +0+0 "📞" \) \
  -gravity south -geometry +0+20 -composite \
  /home/user/webapp/public/static/icon-192.png

# ========================================
# 512x512 アイコン - 高解像度版
# ========================================
echo "🖥️  512x512アイコン作成..."

convert -size 512x512 \
  -define gradient:angle=135 gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  \( /home/user/webapp/public/static/darc-logo.svg -resize 420x \
     -background none -gravity center -extent 512x220 \) \
  -gravity north -geometry +0+50 -composite \
  \( -size 200x200 xc:white -draw "roundrectangle 0,0 200,200 40,40" \
     -font DejaVu-Sans -pointsize 140 -fill "$DARK_BLUE" \
     -gravity center -annotate +0+0 "📞" \) \
  -gravity south -geometry +0+50 -composite \
  /home/user/webapp/public/static/icon-512.png

echo ""
echo "✅ 完成！"
echo ""
echo "📋 デザイン:"
echo "   - 公式DARCロゴをそのまま使用"
echo "   - 背景: 相模原ブルーグラデーション"
echo "   - 電話マーク: 📞 (白い角丸背景)"
echo ""
ls -lh /home/user/webapp/public/static/icon-*.png | grep -v old | grep -v bad
