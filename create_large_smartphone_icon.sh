#!/bin/bash

# 大きなスマートフォン型電話アイコン付きPWAアイコン作成

echo "🎨 大きなスマートフォン型電話アイコン版PWAアイコン作成開始..."

# 背景色: A色（薄い青透明 #A0D8E8）
BG_COLOR="#A0D8E8"

# 192x192アイコン作成
convert -size 192x192 xc:"${BG_COLOR}" \
    -fill white -stroke none \
    -draw "roundrectangle 66,25 126,85 10,10" \
    -draw "circle 96,70 96,75" \
    -fill white -font DejaVu-Sans-Bold -pointsize 54 \
    -gravity center -annotate +0+60 "DARC" \
    public/static/icon-192-backup.png

# 512x512アイコン作成
convert -size 512x512 xc:"${BG_COLOR}" \
    -fill white -stroke none \
    -draw "roundrectangle 176,67 336,227 26,26" \
    -draw "circle 256,187 256,197" \
    -fill white -font DejaVu-Sans-Bold -pointsize 145 \
    -gravity center -annotate +0+160 "DARC" \
    public/static/icon-512-backup.png

# 旧ファイルをバックアップ
[ -f public/static/icon-192.png ] && cp public/static/icon-192.png public/static/icon-192-old.png
[ -f public/static/icon-512.png ] && cp public/static/icon-512.png public/static/icon-512-old.png

# 新ファイルに置き換え
mv public/static/icon-192-backup.png public/static/icon-192.png
mv public/static/icon-512-backup.png public/static/icon-512.png

echo "✅ 大きなスマートフォン型電話アイコン版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
