#!/bin/bash
# 相模原ダルク 公式デザインPWAアイコン作成（完全版）

echo "🎨 相模原ダルク公式デザインのPWAアイコンを作成します..."

# 公式カラー
DARK_BLUE="#00357f"
LIGHT_BLUE="#0072ab"
ACCENT_BLUE="#00496c"

# 192x192 アイコン作成
convert -size 192x192 xc:"$DARK_BLUE" \
  \( -size 192x192 xc:"$LIGHT_BLUE" \) \
  \( -size 192x192 gradient:"$DARK_BLUE"-"$LIGHT_BLUE" -rotate 135 \) \
  -composite \
  \( -size 192x192 xc:none \
     -fill white -font DejaVu-Sans-Bold -pointsize 42 \
     -gravity north -annotate +0+30 "DARC" \
     -fill white -font DejaVu-Sans-Bold -pointsize 20 \
     -gravity north -annotate +0+80 "相模原" \
  \) -composite \
  \( -size 70x70 xc:none \
     -fill white -draw "roundrectangle 0,0 70,70 15,15" \
     -fill "$DARK_BLUE" -font DejaVu-Sans -pointsize 40 \
     -gravity center -annotate +0-1 "📞" \
  \) -gravity south -geometry +0+25 -composite \
  /home/user/webapp/public/static/icon-192.png

# 512x512 アイコン作成  
convert -size 512x512 xc:"$DARK_BLUE" \
  \( -size 512x512 xc:"$LIGHT_BLUE" \) \
  \( -size 512x512 gradient:"$DARK_BLUE"-"$LIGHT_BLUE" -rotate 135 \) \
  -composite \
  \( -size 512x512 xc:none \
     -fill white -font DejaVu-Sans-Bold -pointsize 110 \
     -gravity north -annotate +0+80 "DARC" \
     -fill white -font DejaVu-Sans-Bold -pointsize 52 \
     -gravity north -annotate +0+210 "相模原" \
  \) -composite \
  \( -size 190x190 xc:none \
     -fill white -draw "roundrectangle 0,0 190,190 40,40" \
     -fill "$DARK_BLUE" -font DejaVu-Sans -pointsize 110 \
     -gravity center -annotate +0-3 "📞" \
  \) -gravity south -geometry +0+70 -composite \
  /home/user/webapp/public/static/icon-512.png

echo "✅ PWAアイコン作成完了！"
echo ""
echo "📋 使用した公式カラー:"
echo "   - ダークブルー: $DARK_BLUE"
echo "   - ライトブルー: $LIGHT_BLUE"
echo "   - アクセント: $ACCENT_BLUE"
echo ""
echo "✨ デザイン要素:"
echo "   - 背景: 相模原ブルーのグラデーション"
echo "   - テキスト: DARC / 相模原"
echo "   - アイコン: 電話マーク 📞 (白背景)"
