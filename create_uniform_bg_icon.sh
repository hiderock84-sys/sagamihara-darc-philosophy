#!/bin/bash

# 完全単色背景版PWAアイコン作成
# A箇所の薄い青透明色を完全に全体に適用

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 512x512版
# 1) 完全に薄い青透明色の背景（#A0D8E8）
# 2) 電話アイコンを白に変換して透明部分を削除
# 3) 大きな白いDARCテキスト

convert -size 512x512 \
  xc:"#A0D8E8" \
  \( public/static/ai-generated-icon.png \
     -gravity center \
     -crop 50%x40%+0-60 +repage \
     -alpha extract \
     -negate \
     \( +clone -background white -alpha shape \) \
     +swap -compose Over -composite \
     -fuzz 30% -transparent white \
     -background white -alpha remove \
     -resize 300x300 \
  \) -gravity center -geometry +0-40 -composite \
  -font DejaVu-Sans-Bold \
  -pointsize 160 \
  -fill white \
  -stroke "#D0D0D0" \
  -strokewidth 2 \
  -gravity south \
  -annotate +0+15 "DARC" \
  public/static/icon-512.png

# 192x192版（512版を縮小）
convert public/static/icon-512.png \
  -resize 192x192 \
  public/static/icon-192.png

echo "✅ 完全単色背景版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
