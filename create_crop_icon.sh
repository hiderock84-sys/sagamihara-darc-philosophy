#!/bin/bash

# 完全フラット版PWAアイコン作成（枠完全削除）
# 元画像の中央部分（電話アイコン+DARCテキスト）だけを切り取り

cd /home/user/webapp

# 旧ファイルバックアップ
cp public/static/icon-192.png public/static/icon-192-old.png 2>/dev/null || true
cp public/static/icon-512.png public/static/icon-512-old.png 2>/dev/null || true

# 元画像のサイズを確認
ORIG_SIZE=$(identify -format "%wx%h" public/static/ai-generated-icon.png)
echo "元画像サイズ: $ORIG_SIZE"

# 192x192版
# 中央の80%を切り取り、外側の黒枠を削除
convert public/static/ai-generated-icon.png \
  -gravity center \
  -crop 80%x80%+0+0 +repage \
  -resize 192x192! \
  -background "#2563eb" \
  -alpha remove \
  public/static/icon-192.png

# 512x512版
convert public/static/ai-generated-icon.png \
  -gravity center \
  -crop 80%x80%+0+0 +repage \
  -resize 512x512! \
  -background "#2563eb" \
  -alpha remove \
  public/static/icon-512.png

echo "✅ 完全フラット版PWAアイコン作成完了！（枠完全削除）"
ls -lh public/static/icon-*.png

# ファイル確認
file public/static/icon-512.png
