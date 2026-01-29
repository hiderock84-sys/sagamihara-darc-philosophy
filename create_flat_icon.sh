#!/bin/bash

# 完全フラット版PWAアイコン作成（黒枠・角丸枠なし）
# 純粋な青グラデーション背景のみ

cd /home/user/webapp

# 元のAI生成アイコンを使用
if [ ! -f "public/static/ai-generated-icon.png" ]; then
  echo "❌ 元画像が見つかりません"
  exit 1
fi

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 192x192版（完全フラット、枠なし）
convert public/static/ai-generated-icon.png \
  -resize 192x192 \
  -gravity center \
  -background none \
  -alpha remove \
  -alpha off \
  public/static/icon-192.png

# 512x512版（完全フラット、枠なし）
convert public/static/ai-generated-icon.png \
  -resize 512x512 \
  -gravity center \
  -background none \
  -alpha remove \
  -alpha off \
  public/static/icon-512.png

echo "✅ 完全フラット版PWAアイコン作成完了！（黒枠・角丸枠なし）"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
