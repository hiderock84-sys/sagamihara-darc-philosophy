#!/bin/bash

# 最終版：黒い部分を完全に削除

echo "🎨 黒い角を完全削除中..."

cd /home/user/webapp/public/static

# バックアップ
cp icon-512.png icon-512-before-corner-fix.png

# 黒い部分（#000000付近）を青色（#06b6d4）に置換
convert icon-512.png \
  -fuzz 20% \
  -fill '#06b6d4' \
  +opaque '#06b6d4' \
  -opaque black \
  icon-512-temp.png

# または、4隅を直接塗りつぶす
convert icon-512-temp.png \
  -fill '#06b6d4' \
  -draw 'rectangle 0,0 50,50' \
  -draw 'rectangle 462,0 511,50' \
  -draw 'rectangle 0,462 50,511' \
  -draw 'rectangle 462,462 511,511' \
  icon-512.png

# 192x192版を作成
convert icon-512.png -resize 192x192 icon-192.png

# 一時ファイル削除
rm icon-512-temp.png

echo "✅ 黒い角を完全削除完了！"
ls -lh icon-192.png icon-512.png
