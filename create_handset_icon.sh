#!/bin/bash

# 受話器型の電話アイコン付きPWAアイコン作成

echo "🎨 受話器型電話アイコン版PWAアイコン作成開始..."

# 背景色: A色（薄い青透明 #A0D8E8）
BG_COLOR="#A0D8E8"

# 192x192アイコン作成
convert -size 192x192 xc:"${BG_COLOR}" \
    -fill white -stroke white -strokewidth 3 \
    -draw "ellipse 70,45 18,25 -30,-30" \
    -draw "ellipse 122,87 18,25 -30,-30" \
    -draw "bezier 80,55 90,65 102,75 112,80" \
    -fill white -font DejaVu-Sans-Bold -pointsize 52 \
    -gravity center -annotate +0+58 "DARC" \
    public/static/icon-192-backup.png

# 512x512アイコン作成
convert -size 512x512 xc:"${BG_COLOR}" \
    -fill white -stroke white -strokewidth 8 \
    -draw "ellipse 186,120 48,65 -30,-30" \
    -draw "ellipse 326,232 48,65 -30,-30" \
    -draw "bezier 215,145 240,175 286,205 310,220" \
    -fill white -font DejaVu-Sans-Bold -pointsize 140 \
    -gravity center -annotate +0+155 "DARC" \
    public/static/icon-512-backup.png

# 旧ファイルをバックアップ
[ -f public/static/icon-192.png ] && cp public/static/icon-192.png public/static/icon-192-old.png
[ -f public/static/icon-512.png ] && cp public/static/icon-512.png public/static/icon-512-old.png

# 新ファイルに置き換え
mv public/static/icon-192-backup.png public/static/icon-192.png
mv public/static/icon-512-backup.png public/static/icon-512.png

echo "✅ 受話器型電話アイコン版PWAアイコン作成完了！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
