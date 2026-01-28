#!/bin/bash
# 相模原ダルク 超精密PWAアイコン作成スクリプト

echo "🎨 相模原ダルク 超精密PWAアイコンを作成中..."

# 公式カラー（SVGから抽出）
DARK_BLUE="#00357f"
LIGHT_BLUE="#0072ab"
NAVY="#00496c"

# ========================================
# 192x192 アイコン作成
# ========================================
echo "📱 192x192アイコン作成中..."

# 1. 背景: 相模原ブルーのグラデーション（左上から右下）
convert -size 192x192 \
  gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  -rotate -45 \
  /tmp/bg_192.png

# 2. テキスト部分を作成
convert -size 192x100 xc:none \
  -font DejaVu-Sans-Bold -pointsize 48 -fill white \
  -gravity center -annotate +0-20 "DARC" \
  -font DejaVu-Sans-Bold -pointsize 24 -fill white \
  -gravity center -annotate +0+25 "相模原" \
  /tmp/text_192.png

# 3. 電話アイコン部分を作成
convert -size 80x80 xc:none \
  -fill white -draw "roundrectangle 0,0 80,80 20,20" \
  -gravity center \
  -font DejaVu-Sans -pointsize 50 -fill "$DARK_BLUE" -annotate +0+0 "☎" \
  /tmp/phone_192.png

# 4. すべてを合成
convert /tmp/bg_192.png \
  /tmp/text_192.png -gravity north -geometry +0+15 -composite \
  /tmp/phone_192.png -gravity south -geometry +0+15 -composite \
  -background none -alpha off \
  /home/user/webapp/public/static/icon-192.png

# ========================================
# 512x512 アイコン作成
# ========================================
echo "🖥️  512x512アイコン作成中..."

# 1. 背景
convert -size 512x512 \
  gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  -rotate -45 \
  /tmp/bg_512.png

# 2. テキスト部分
convert -size 512x280 xc:none \
  -font DejaVu-Sans-Bold -pointsize 128 -fill white \
  -gravity center -annotate +0-50 "DARC" \
  -font DejaVu-Sans-Bold -pointsize 64 -fill white \
  -gravity center -annotate +0+65 "相模原" \
  /tmp/text_512.png

# 3. 電話アイコン部分
convert -size 220x220 xc:none \
  -fill white -draw "roundrectangle 0,0 220,220 50,50" \
  -gravity center \
  -font DejaVu-Sans -pointsize 140 -fill "$DARK_BLUE" -annotate +0+0 "☎" \
  /tmp/phone_512.png

# 4. すべてを合成
convert /tmp/bg_512.png \
  /tmp/text_512.png -gravity north -geometry +0+40 -composite \
  /tmp/phone_512.png -gravity south -geometry +0+40 -composite \
  -background none -alpha off \
  /home/user/webapp/public/static/icon-512.png

# クリーンアップ
rm -f /tmp/bg_*.png /tmp/text_*.png /tmp/phone_*.png

echo ""
echo "✅ PWAアイコン作成完了！"
echo ""
echo "📋 デザイン仕様:"
echo "   - 背景: $DARK_BLUE → $LIGHT_BLUE グラデーション"
echo "   - テキスト: DARC + 相模原（白色・太字）"
echo "   - アイコン: ☎ 電話マーク（白い角丸背景）"
echo ""
echo "📏 サイズ:"
echo "   - 192x192px: $(ls -lh /home/user/webapp/public/static/icon-192.png | awk '{print $5}')"
echo "   - 512x512px: $(ls -lh /home/user/webapp/public/static/icon-512.png | awk '{print $5}')"
