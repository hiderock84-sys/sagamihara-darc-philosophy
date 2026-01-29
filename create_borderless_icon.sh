#!/bin/bash

# 完全縁なし版PWAアイコン作成スクリプト
# 背景: 薄い青透明 #A0D8E8（縁なし・完全単色）
# 電話アイコン: 白銀色、大きく表示
# DARCテキスト: 超大サイズ、白色

echo "🎨 完全縁なし版PWAアイコンを作成中..."

cd /home/user/webapp/public/static

# バックアップ
cp icon-192.png icon-192-old.png
cp icon-512.png icon-512-old.png

# 512x512版を作成
convert -size 512x512 xc:'#A0D8E8' \
  \( -size 320x320 xc:none \
     -gravity center \
     -font DejaVu-Sans-Bold \
     -pointsize 280 \
     -fill white \
     -stroke '#E0E0E0' \
     -strokewidth 3 \
     -annotate +0+0 '☎' \) \
  -gravity north -geometry +0+60 -composite \
  \( -size 512x200 xc:none \
     -gravity center \
     -font DejaVu-Sans-Bold \
     -pointsize 170 \
     -fill white \
     -stroke '#E0E0E0' \
     -strokewidth 2 \
     -annotate +0+0 'DARC' \) \
  -gravity south -geometry +0+30 -composite \
  icon-512.png

# 192x192版を作成
convert icon-512.png -resize 192x192 icon-192.png

echo "✅ 完全縁なし版PWAアイコン作成完了！"
echo "   - 背景: 単色 #A0D8E8（縁なし・フラット）"
echo "   - 電話アイコン: 白色、超大サイズ"
echo "   - DARCテキスト: 白色、超大サイズ"
ls -lh icon-192.png icon-512.png
file icon-512.png
