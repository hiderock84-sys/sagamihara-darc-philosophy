#!/bin/bash

# シンプルな電話アイコン付きPWAアイコン作成

echo "🎨 シンプル電話アイコン版PWAアイコン作成開始..."

# 背景色: A色（薄い青透明 #A0D8E8）
BG_COLOR="#A0D8E8"

# よりシンプルな電話受話器型のSVG
cat > /tmp/phone_simple.svg << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <!-- 電話受話器の形 -->
  <g fill="white" opacity="0.95">
    <!-- 左の受話口 -->
    <ellipse cx="80" cy="80" rx="45" ry="60" transform="rotate(-30 80 80)"/>
    <!-- 右の受話口 -->
    <ellipse cx="220" cy="220" rx="45" ry="60" transform="rotate(-30 220 220)"/>
    <!-- つなぐカーブ -->
    <path d="M 100 90 Q 150 120, 200 210" stroke="white" stroke-width="40" fill="none" stroke-linecap="round" opacity="0.95"/>
  </g>
</svg>
EOF

# 192x192アイコン作成
convert -size 192x192 xc:"${BG_COLOR}" \
    \( /tmp/phone_simple.svg -resize 110x110 \) -gravity center -geometry +0-15 -composite \
    -fill white -font DejaVu-Sans-Bold -pointsize 48 \
    -gravity center -annotate +0+60 "DARC" \
    public/static/icon-192-backup.png

# 512x512アイコン作成
convert -size 512x512 xc:"${BG_COLOR}" \
    \( /tmp/phone_simple.svg -resize 300x300 \) -gravity center -geometry +0-40 -composite \
    -fill white -font DejaVu-Sans-Bold -pointsize 130 \
    -gravity center -annotate +0+160 "DARC" \
    public/static/icon-512-backup.png

# 旧ファイルをバックアップ
[ -f public/static/icon-192.png ] && cp public/static/icon-192.png public/static/icon-192-old.png
[ -f public/static/icon-512.png ] && cp public/static/icon-512.png public/static/icon-512-old.png

# 新ファイルに置き換え
mv public/static/icon-192-backup.png public/static/icon-192.png
mv public/static/icon-512-backup.png public/static/icon-512.png

echo "✅ シンプル電話アイコン版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
