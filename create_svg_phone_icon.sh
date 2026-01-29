#!/bin/bash

# SVGベースの電話アイコン付きPWAアイコン作成

echo "🎨 SVG電話アイコン版PWAアイコン作成開始..."

# 背景色: A色（薄い青透明 #A0D8E8）
BG_COLOR="#A0D8E8"

# SVG電話アイコンを作成
cat > /tmp/phone_icon.svg << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <path d="M60 40 L80 40 L80 80 L100 80 L100 100 L120 100 L120 120 L140 120 L140 140 L160 140 L160 160 L180 160 L180 180 L200 180 L200 200 L220 200 L220 220 L240 220 L240 240 L260 240 L260 220 L240 220 L240 200 L220 200 L220 180 L200 180 L200 160 L180 160 L180 140 L160 140 L160 120 L140 120 L140 100 L120 100 L120 80 L100 80 L100 60 L80 60 L80 40 Z" 
        fill="white" opacity="0.95"/>
  <circle cx="90" cy="70" r="25" fill="white" opacity="0.95"/>
  <circle cx="210" cy="210" r="25" fill="white" opacity="0.95"/>
</svg>
EOF

# 192x192アイコン作成
convert -size 192x192 xc:"${BG_COLOR}" \
    \( /tmp/phone_icon.svg -resize 100x100 \) -gravity center -geometry +0-15 -composite \
    -fill white -font DejaVu-Sans-Bold -pointsize 45 \
    -gravity center -annotate +0+55 "DARC" \
    public/static/icon-192-backup.png

# 512x512アイコン作成
convert -size 512x512 xc:"${BG_COLOR}" \
    \( /tmp/phone_icon.svg -resize 280x280 \) -gravity center -geometry +0-40 -composite \
    -fill white -font DejaVu-Sans-Bold -pointsize 120 \
    -gravity center -annotate +0+150 "DARC" \
    public/static/icon-512-backup.png

# 旧ファイルをバックアップ
[ -f public/static/icon-192.png ] && cp public/static/icon-192.png public/static/icon-192-old.png
[ -f public/static/icon-512.png ] && cp public/static/icon-512.png public/static/icon-512-old.png

# 新ファイルに置き換え
mv public/static/icon-192-backup.png public/static/icon-192.png
mv public/static/icon-512-backup.png public/static/icon-512.png

echo "✅ SVG電話アイコン版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
