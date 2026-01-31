#!/bin/bash

echo "🎨 アイコンの4隅の黒い部分のみを青色で塗りつぶし中..."

cd /home/user/webapp/public/static

# バックアップから復元
cp icon-512-before-corner-fix.png icon-512.png

# 4隅の黒い部分のみを青色（#3b82f6）で塗りつぶし
# 各隅を個別に処理（より正確に黒い部分だけを対象）
convert icon-512.png \
  -fill "#3b82f6" \
  -draw "color 0,0 floodfill" \
  -draw "color 511,0 floodfill" \
  -draw "color 0,511 floodfill" \
  -draw "color 511,511 floodfill" \
  icon-512.png

# 192x192版も生成
convert icon-512.png -resize 192x192 icon-192.png

ls -lh icon-*.png | head -5

echo "✅ 4隅の黒い部分を青色で塗りつぶし完了！"
