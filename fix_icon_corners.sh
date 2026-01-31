#!/bin/bash

# アイコン修正スクリプト
# 1. 4隅の黒い部分を青色で塗りつぶす
# 2. DARCをCall Mgmtに変更

echo "🎨 アイコン修正中..."

cd /home/user/webapp/public/static

# バックアップ
cp icon-512.png icon-512-old.png
cp icon-192.png icon-192-old.png

# 512x512版を修正
# 1. 4隅の黒い部分を青色(#06b6d4)で塗りつぶす
convert icon-512.png \
  -fill '#06b6d4' \
  -draw 'color 0,0 floodfill' \
  -draw 'color 511,0 floodfill' \
  -draw 'color 0,511 floodfill' \
  -draw 'color 511,511 floodfill' \
  icon-512-temp1.png

# 2. DARCテキストを削除して、Call Mgmtに置き換え
convert icon-512-temp1.png \
  \( -size 512x120 xc:none \
     -gravity center \
     -font DejaVu-Sans-Bold \
     -pointsize 70 \
     -fill white \
     -stroke '#E0E0E0' \
     -strokewidth 2 \
     -annotate +0+0 'Call Mgmt' \) \
  -gravity south -geometry +0+30 -composite \
  icon-512.png

# 192x192版を作成
convert icon-512.png -resize 192x192 icon-192.png

# 一時ファイル削除
rm icon-512-temp1.png

echo "✅ アイコン修正完了！"
echo "   - 4隅の黒い部分を青色で塗りつぶし"
echo "   - DARCをCall Mgmtに変更"
ls -lh icon-192.png icon-512.png
file icon-512.png
