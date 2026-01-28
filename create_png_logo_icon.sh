#!/bin/bash

# 🎨 相模原ダルク PWAアイコン - PNG版公式ロゴ使用
# ダウンロードした公式PNGロゴを使用

echo "🎨 相模原ダルク PWAアイコン - PNG版公式ロゴ使用..."

# Step 1: 512x512のグラデーション背景を作成
convert -size 512x512 gradient:'#00357f-#0072ab' /tmp/bg_final.png

# Step 2: 公式PNGロゴをリサイズ（450px幅に調整）
convert public/static/darc-logo.png -resize 450x /tmp/logo_resized.png

# Step 3: 背景とロゴを合成
convert /tmp/bg_final.png \
  /tmp/logo_resized.png -gravity Center -composite \
  -quality 100 \
  public/static/icon-512.png

# Step 4: 192x192版を作成
convert public/static/icon-512.png -resize 192x192 -quality 100 public/static/icon-192.png

# 一時ファイル削除
rm -f /tmp/bg_final.png /tmp/logo_resized.png

echo "✅ PNG版公式ロゴを使用したPWAアイコンを作成しました！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
