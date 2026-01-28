#!/bin/bash

# 🎨 相模原ダルク PWAアイコン - 超精密プロフェッショナル版 V3
# 公式カラー: #00357f (ダークブルー) → #0072ab (ライトブルー)

echo "🎨 相模原ダルク PWAアイコン - 超精密版V3作成..."

# Step 1: グラデーション背景 (512x512)
convert -size 512x512 gradient:'#00357f-#0072ab' /tmp/bg_512.png

# Step 2: テキストレイヤー（DARC + 相模原）
convert -size 512x400 xc:none \
  -gravity North \
  -pointsize 100 \
  -font DejaVu-Sans-Bold \
  -fill white \
  -stroke white \
  -strokewidth 2 \
  -annotate +0+50 'DARC' \
  -strokewidth 0 \
  -pointsize 44 \
  -font DejaVu-Sans-Bold \
  -annotate +0+165 '相模原' \
  /tmp/text_512.png

# Step 3: 電話アイコン（白背景 + 電話受話器）
# 白い角丸背景
convert -size 160x160 xc:none \
  -fill white \
  -draw "roundrectangle 0,0,160,160,25,25" \
  /tmp/phone_bg_512.png

# 電話受話器を描画（より詳細）
convert /tmp/phone_bg_512.png \
  -fill '#00357f' \
  -stroke '#00357f' \
  -strokewidth 4 \
  -draw "path 'M 50,50 Q 40,45 35,50 Q 30,55 35,65 Q 40,75 50,80 L 110,80 Q 120,75 125,65 Q 130,55 125,50 Q 120,45 110,50 Z'" \
  -draw "ellipse 50,65 8,12 0,360" \
  -draw "ellipse 110,65 8,12 0,360" \
  -draw "path 'M 60,85 Q 80,100 100,85'" \
  /tmp/phone_icon_512.png

# Step 4: すべてを合成（512x512）
convert /tmp/bg_512.png \
  /tmp/text_512.png -gravity North -composite \
  /tmp/phone_icon_512.png -gravity South -geometry +0+30 -composite \
  -quality 95 \
  public/static/icon-512.png

# Step 5: 192x192版を作成
convert public/static/icon-512.png -resize 192x192 -quality 95 public/static/icon-192.png

# 一時ファイル削除
rm -f /tmp/bg_512.png /tmp/text_512.png /tmp/phone_bg_512.png /tmp/phone_icon_512.png

echo "✅ 超精密プロフェッショナル版PWAアイコンを作成しました！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
