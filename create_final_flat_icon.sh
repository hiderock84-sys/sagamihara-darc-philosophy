#!/bin/bash

# 完全フラット版アイコン作成 - A色（#A0D8E8）で全体を統一

echo "🎨 完全フラット版PWAアイコン作成開始..."

# 背景色: A色（薄い青透明 #A0D8E8）
BG_COLOR="#A0D8E8"
PHONE_COLOR="white"
TEXT_COLOR="white"

# 192x192アイコン作成
convert -size 192x192 xc:"${BG_COLOR}" \
    -fill "${PHONE_COLOR}" \
    -font DejaVu-Sans-Bold \
    -pointsize 80 \
    -gravity center \
    -annotate +0-20 "📞" \
    -fill "${TEXT_COLOR}" \
    -pointsize 40 \
    -annotate +0+50 "DARC" \
    -alpha set \
    public/static/icon-192-backup.png

# 512x512アイコン作成
convert -size 512x512 xc:"${BG_COLOR}" \
    -fill "${PHONE_COLOR}" \
    -font DejaVu-Sans-Bold \
    -pointsize 220 \
    -gravity center \
    -annotate +0-50 "📞" \
    -fill "${TEXT_COLOR}" \
    -pointsize 110 \
    -annotate +0+130 "DARC" \
    -alpha set \
    public/static/icon-512-backup.png

# 旧ファイルをバックアップ
[ -f public/static/icon-192.png ] && cp public/static/icon-192.png public/static/icon-192-old.png
[ -f public/static/icon-512.png ] && cp public/static/icon-512.png public/static/icon-512-old.png

# 新ファイルに置き換え
mv public/static/icon-192-backup.png public/static/icon-192.png
mv public/static/icon-512-backup.png public/static/icon-512.png

echo "✅ 完全フラット版PWAアイコン作成完了！（A色 #A0D8E8 で全体統一）"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
