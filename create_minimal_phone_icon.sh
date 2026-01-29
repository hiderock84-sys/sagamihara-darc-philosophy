#!/bin/bash

# 最もシンプルな電話アイコン付きPWAアイコン作成

echo "🎨 最シンプル電話アイコン版PWAアイコン作成開始..."

# 背景色: A色（薄い青透明 #A0D8E8）
BG_COLOR="#A0D8E8"

# 192x192アイコン作成
convert -size 192x192 xc:"${BG_COLOR}" \
    -fill white -stroke white -strokewidth 6 \
    -draw "circle 96,60 96,30" \
    -draw "line 96,60 96,90" \
    -draw "line 85,75 107,75" \
    -fill white -font DejaVu-Sans-Bold -pointsize 52 \
    -gravity center -annotate +0+58 "DARC" \
    public/static/icon-192-backup.png

# 512x512アイコン作成
convert -size 512x512 xc:"${BG_COLOR}" \
    -fill white -stroke white -strokewidth 16 \
    -draw "circle 256,160 256,80" \
    -draw "line 256,160 256,240" \
    -draw "line 226,200 286,200" \
    -fill white -font DejaVu-Sans-Bold -pointsize 140 \
    -gravity center -annotate +0+155 "DARC" \
    public/static/icon-512-backup.png

# 旧ファイルをバックアップ
[ -f public/static/icon-192.png ] && cp public/static/icon-192.png public/static/icon-192-old.png
[ -f public/static/icon-512.png ] && cp public/static/icon-512.png public/static/icon-512-old.png

# 新ファイルに置き換え
mv public/static/icon-192-backup.png public/static/icon-192.png
mv public/static/icon-512-backup.png public/static/icon-512.png

echo "✅ 最シンプル電話アイコン版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
