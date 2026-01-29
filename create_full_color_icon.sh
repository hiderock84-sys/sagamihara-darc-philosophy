#!/bin/bash

# 最終版：A箇所の色を完全に全体適用
# 薄い青透明背景 + 白い電話 + 白いDARC

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 512x512版
# 背景を完全に薄い青透明色（#A0D8E8）で塗りつぶし
convert -size 512x512 xc:"#A0D8E8" temp_bg.png

# 電話アイコンを抽出して白く塗る
convert public/static/ai-generated-icon.png \
  -gravity center \
  -crop 50%x40%+0-60 +repage \
  -alpha extract \
  \( +clone -background white -alpha shape \) \
  -resize 300x300 \
  temp_phone.png

# 背景 + 電話 + テキストを合成
convert temp_bg.png \
  temp_phone.png -gravity center -geometry +0-40 -composite \
  -font DejaVu-Sans-Bold \
  -pointsize 160 \
  -fill white \
  -stroke "#D0D0D0" \
  -strokewidth 2 \
  -gravity south \
  -annotate +0+15 "DARC" \
  public/static/icon-512.png

# 一時ファイル削除
rm -f temp_bg.png temp_phone.png

# 192x192版（512版を縮小）
convert public/static/icon-512.png \
  -resize 192x192 \
  public/static/icon-192.png

echo "✅ A箇所の色を完全適用版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
