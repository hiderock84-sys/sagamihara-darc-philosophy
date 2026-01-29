#!/bin/bash

# シンプル＆シルバー版PWAアイコン作成
# ライトブルー背景 + シルバー電話アイコン + シルバーDARCテキスト

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 512x512版
# 1) ライトブルー背景（#87CEEB - スカイブルー）
# 2) シルバー電話アイコン（白ベースにグレーシャドウ）
# 3) シルバーDARCテキスト

convert -size 512x512 \
  xc:"#87CEEB" \
  \( -size 200x200 xc:none \
     -fill "#C0C0C0" \
     -stroke "#A9A9A9" \
     -strokewidth 8 \
     -draw "path 'M 50,30 Q 40,20 30,30 L 30,50 Q 30,70 50,90 L 90,130 Q 110,150 130,150 L 150,150 Q 160,150 170,140 L 170,120 Q 170,100 150,80 L 110,40 Q 90,20 70,20 Z'" \
  \) -gravity north -geometry +0+80 -composite \
  -font DejaVu-Sans-Bold \
  -pointsize 140 \
  -fill "#C0C0C0" \
  -stroke "#A9A9A9" \
  -strokewidth 4 \
  -gravity south \
  -annotate +0+40 "DARC" \
  public/static/icon-512.png

# 192x192版（512版を縮小）
convert public/static/icon-512.png \
  -resize 192x192 \
  public/static/icon-192.png

echo "✅ シンプル＆シルバー版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
