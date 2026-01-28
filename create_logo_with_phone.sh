#!/bin/bash

# 🎨 相模原ダルク PWAアイコン - 公式ロゴ + 電話アイコン
# 公式PNGロゴ + 電話受話器を組み合わせ

echo "🎨 相模原ダルク PWAアイコン - 公式ロゴ + 電話アイコン作成..."

# Step 1: 512x512のグラデーション背景を作成
convert -size 512x512 gradient:'#00357f-#0072ab' /tmp/bg_phone.png

# Step 2: 公式PNGロゴをリサイズ（380px幅に調整 - 電話アイコンのスペースを確保）
convert public/static/darc-logo.png -resize 380x /tmp/logo_with_phone.png

# Step 3: 電話アイコンを作成（白い円形背景 + 青い電話受話器）
convert -size 120x120 xc:none \
  -fill white \
  -draw "circle 60,60 60,10" \
  -fill '#00357f' \
  -stroke '#00357f' \
  -strokewidth 5 \
  -draw "path 'M 35,35 Q 30,30 30,40 Q 30,50 40,55 L 80,55 Q 90,50 90,40 Q 90,30 85,35 M 35,50 Q 35,60 45,60 L 75,60 Q 85,60 85,50'" \
  -draw "ellipse 40,45 6,8 0,360" \
  -draw "ellipse 80,45 6,8 0,360" \
  /tmp/phone_icon.png

# Step 4: すべてを合成
# - 背景
# - 中央にロゴ
# - 右下に電話アイコン
convert /tmp/bg_phone.png \
  /tmp/logo_with_phone.png -gravity Center -geometry +0-20 -composite \
  /tmp/phone_icon.png -gravity SouthEast -geometry +30+30 -composite \
  -quality 100 \
  public/static/icon-512.png

# Step 5: 192x192版を作成
convert public/static/icon-512.png -resize 192x192 -quality 100 public/static/icon-192.png

# 一時ファイル削除
rm -f /tmp/bg_phone.png /tmp/logo_with_phone.png /tmp/phone_icon.png

echo "✅ 公式ロゴ + 電話アイコンのPWAアイコンを作成しました！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
