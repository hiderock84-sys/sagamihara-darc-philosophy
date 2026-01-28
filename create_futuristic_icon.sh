#!/bin/bash

# 🎨 相模原ダルク PWAアイコン - 未来的デザイン
# 公式ロゴ + 電話アイコン + グロー効果

echo "🎨 相模原ダルク PWAアイコン - 未来的デザイン作成..."

# Step 1: ダークブルーのグラデーション背景（宇宙風）
convert -size 512x512 \
  -define gradient:angle=135 \
  gradient:'#001a3d-#003d7a' \
  /tmp/space_bg.png

# Step 2: 星のような効果を追加
convert /tmp/space_bg.png \
  +noise Random \
  -channel G -threshold 99.5% \
  -blur 0x0.3 \
  /tmp/stars.png

convert /tmp/space_bg.png /tmp/stars.png -compose Lighten -composite /tmp/bg_stars.png

# Step 3: 公式ロゴをリサイズ
convert public/static/darc-logo.png -resize 350x /tmp/logo_resize.png

# Step 4: 電話アイコン（グロー効果付き）
convert -size 140x140 xc:none \
  -fill 'rgba(255,255,255,0.95)' \
  -draw "roundrectangle 5,5,135,135,25,25" \
  \( +clone -blur 0x8 -fill 'rgba(0,114,171,0.6)' -colorize 100% \) \
  -compose DstOver -composite \
  -fill '#0072ab' \
  -stroke '#0072ab' \
  -strokewidth 6 \
  -draw "path 'M 40,40 Q 35,35 35,45 Q 35,55 45,60 L 95,60 Q 105,55 105,45 Q 105,35 100,40 M 40,55 Q 40,65 50,65 L 90,65 Q 100,65 100,55'" \
  -draw "ellipse 45,50 7,9 0,360" \
  -draw "ellipse 95,50 7,9 0,360" \
  /tmp/phone_glow.png

# Step 5: ロゴにグロー効果を追加
convert /tmp/logo_resize.png \
  \( +clone -blur 0x10 -fill 'rgba(0,114,171,0.5)' -colorize 100% \) \
  -compose DstOver -composite \
  /tmp/logo_glowing.png

# Step 6: すべてを合成
convert /tmp/bg_stars.png \
  /tmp/logo_glowing.png -gravity Center -geometry +0-30 -composite \
  /tmp/phone_glow.png -gravity SouthEast -geometry +35+35 -composite \
  -quality 100 \
  public/static/icon-512.png

# Step 7: 192x192版を作成
convert public/static/icon-512.png -resize 192x192 -quality 100 public/static/icon-192.png

# 一時ファイル削除
rm -f /tmp/space_bg.png /tmp/stars.png /tmp/bg_stars.png /tmp/logo_resize.png /tmp/phone_glow.png /tmp/logo_glowing.png

echo "✅ 未来的デザインのPWAアイコンを作成しました！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
