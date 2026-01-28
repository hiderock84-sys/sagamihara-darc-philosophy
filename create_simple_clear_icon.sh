#!/bin/bash
# 相模原ダルク PWAアイコン - 完全作り直し版

echo "🎨 相模原ダルク PWAアイコンを完全に作り直します..."

DARK_BLUE="#00357f"
LIGHT_BLUE="#0072ab"

# ========================================
# 192x192 アイコン
# ========================================
echo "📱 192x192アイコン作成中..."

convert -size 192x192 \
  gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  \( -size 192x80 xc:none \
     -fill white -font "DejaVu-Sans-Bold" -pointsize 56 \
     -gravity center -annotate +0+0 "DARC" \
  \) -gravity north -geometry +0+25 -composite \
  \( -size 192x30 xc:none \
     -fill white -font "DejaVu-Sans-Bold" -pointsize 22 \
     -gravity center -annotate +0+0 "相模原" \
  \) -gravity north -geometry +0+90 -composite \
  \( -size 80x80 xc:none \
     -fill white -draw "roundrectangle 0,0 80,80 20,20" \
     -fill "$DARK_BLUE" -font "Noto-Color-Emoji" -pointsize 55 \
     -gravity center -annotate +0+0 "📞" \
  \) -gravity south -geometry +0+20 -composite \
  /home/user/webapp/public/static/icon-192.png

# ========================================
# 512x512 アイコン
# ========================================
echo "🖥️  512x512アイコン作成中..."

convert -size 512x512 \
  gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  \( -size 512x220 xc:none \
     -fill white -font "DejaVu-Sans-Bold" -pointsize 150 \
     -gravity center -annotate +0+0 "DARC" \
  \) -gravity north -geometry +0+65 -composite \
  \( -size 512x80 xc:none \
     -fill white -font "DejaVu-Sans-Bold" -pointsize 60 \
     -gravity center -annotate +0+0 "相模原" \
  \) -gravity north -geometry +0+240 -composite \
  \( -size 220x220 xc:none \
     -fill white -draw "roundrectangle 0,0 220,220 50,50" \
     -fill "$DARK_BLUE" -font "Noto-Color-Emoji" -pointsize 150 \
     -gravity center -annotate +0+0 "📞" \
  \) -gravity south -geometry +0+55 -composite \
  /home/user/webapp/public/static/icon-512.png

echo ""
echo "✅ アイコン作成完了！"
echo ""
echo "📋 デザイン:"
echo "   ✓ 背景: 相模原ブルー ($DARK_BLUE → $LIGHT_BLUE)"
echo "   ✓ テキスト: DARC + 相模原 (白色・太字)"
echo "   ✓ 電話: 📞 (白い角丸の中に配置)"
echo ""
ls -lh /home/user/webapp/public/static/icon-*.png | grep -v old | grep -v bad
