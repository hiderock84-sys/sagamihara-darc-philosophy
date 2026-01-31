#!/bin/bash

echo "元のアイコンを復元中..."

# reference_icon.png を icon-512.png にコピー
cp reference_icon.png public/static/icon-512.png

# 192x192版を作成
convert public/static/icon-512.png -resize 192x192 public/static/icon-192.png

echo "✅ アイコン復元完了！"
ls -lh public/static/icon-*.png

