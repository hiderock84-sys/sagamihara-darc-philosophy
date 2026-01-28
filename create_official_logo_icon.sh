#!/bin/bash

# 🎨 相模原ダルク PWAアイコン - 公式ロゴ完全版
# 公式SVGロゴをそのまま使用した高品質アイコン

echo "🎨 相模原ダルク PWAアイコン - 公式ロゴ完全版作成..."

# 公式カラーのグラデーション背景を作成
convert -size 512x512 gradient:'#00357f-#0072ab' /tmp/bg_official.png

# 公式SVGロゴをPNGに変換（高解像度）
convert -density 300 -background none public/static/darc-logo.svg -resize 400x150 /tmp/logo_high.png

# 背景とロゴを合成（中央配置）
convert /tmp/bg_official.png \
  /tmp/logo_high.png -gravity Center -composite \
  -quality 100 \
  public/static/icon-512.png

# 192x192版を作成
convert public/static/icon-512.png -resize 192x192 -quality 100 public/static/icon-192.png

# 一時ファイル削除
rm -f /tmp/bg_official.png /tmp/logo_high.png

echo "✅ 公式ロゴ完全版PWAアイコンを作成しました！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
