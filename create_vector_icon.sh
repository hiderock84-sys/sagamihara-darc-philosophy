#!/bin/bash
# 相模原ダルク PWAアイコン - 高精度ベクター電話アイコン版

echo "🎨 高精度ベクター電話アイコンを作成します..."

DARK_BLUE="#00357f"
LIGHT_BLUE="#0072ab"

# ========================================
# 192x192 アイコン - 高精度版
# ========================================
echo "📱 192x192アイコン作成中..."

# まず電話アイコンSVGを作成
cat > /tmp/phone_icon.svg << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M 15,10 C 13,10 11,12 11,14 L 11,16 C 11,18 13,20 15,20 L 17,20 C 17,22 18,24 20,25 L 20,30 C 18,31 17,33 17,35 L 17,45 C 17,47 19,49 21,49 L 39,49 C 41,49 43,47 43,45 L 43,35 C 43,33 42,31 40,30 L 40,25 C 42,24 43,22 43,20 L 45,20 C 47,20 49,18 49,16 L 49,14 C 49,12 47,10 45,10 L 15,10 Z M 30,22 C 32,22 34,24 34,26 C 34,28 32,30 30,30 C 28,30 26,28 26,26 C 26,24 28,22 30,22 Z" 
        fill="#00357f" 
        stroke="#00357f" 
        stroke-width="2"/>
</svg>
EOF

# 背景 + テキスト + 電話アイコンを合成
convert -size 192x192 gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 58 \
  -gravity north -annotate +0+22 "DARC" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 24 \
  -gravity north -annotate +0+86 "相模原" \
  \( -size 85x85 xc:white -draw "roundrectangle 0,0 85,85 18,18" \) \
  -gravity south -geometry +0+18 -composite \
  \( /tmp/phone_icon.svg -resize 60x60 -background none \) \
  -gravity south -geometry +0+30 -composite \
  /home/user/webapp/public/static/icon-192.png

# ========================================
# 512x512 アイコン - 高精度版
# ========================================
echo "🖥️  512x512アイコン作成中..."

# 大きい電話アイコンSVGを作成
cat > /tmp/phone_icon_large.svg << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
  <path d="M 40,25 C 35,25 30,30 30,35 L 30,42 C 30,47 35,52 40,52 L 45,52 C 45,58 48,64 53,67 L 53,80 C 48,83 45,88 45,93 L 45,120 C 45,125 50,130 55,130 L 105,130 C 110,130 115,125 115,120 L 115,93 C 115,88 112,83 107,80 L 107,67 C 112,64 115,58 115,52 L 120,52 C 125,52 130,47 130,42 L 130,35 C 130,30 125,25 120,25 L 40,25 Z M 80,58 C 85,58 90,63 90,68 C 90,73 85,78 80,78 C 75,78 70,73 70,68 C 70,63 75,58 80,58 Z" 
        fill="#00357f" 
        stroke="#00357f" 
        stroke-width="4"/>
</svg>
EOF

convert -size 512x512 gradient:"$DARK_BLUE"-"$LIGHT_BLUE" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 156 \
  -gravity north -annotate +0+58 "DARC" \
  -fill white -font "DejaVu-Sans-Bold" -pointsize 64 \
  -gravity north -annotate +0+228 "相模原" \
  \( -size 230x230 xc:white -draw "roundrectangle 0,0 230,230 48,48" \) \
  -gravity south -geometry +0+48 -composite \
  \( /tmp/phone_icon_large.svg -resize 160x160 -background none \) \
  -gravity south -geometry +0+80 -composite \
  /home/user/webapp/public/static/icon-512.png

# クリーンアップ
rm -f /tmp/phone_icon.svg /tmp/phone_icon_large.svg

echo ""
echo "✅ 高精度ベクターアイコン作成完了！"
echo ""
echo "📋 仕様:"
echo "   ✓ 背景: 相模原ブルーグラデーション"
echo "   ✓ テキスト: DARC + 相模原 (白・太字)"
echo "   ✓ 電話: SVGベクター描画（高精度）"
echo ""
ls -lh /home/user/webapp/public/static/icon-*.png | grep -v old | grep -v bad
