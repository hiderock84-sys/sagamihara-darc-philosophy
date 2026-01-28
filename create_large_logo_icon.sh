#!/bin/bash

# 🎨 相模原ダルク PWAアイコン - 公式ロゴ大きく明確版
# 公式SVGロゴを大きく明瞭に表示

echo "🎨 相模原ダルク PWAアイコン - 公式ロゴ大きく明確版作成..."

# 公式カラーのグラデーション背景を作成
convert -size 512x512 gradient:'#00357f-#0072ab' /tmp/bg_large.png

# 公式SVGロゴをPNGに変換（より大きく、高解像度）
# 512x512の背景に対して、ロゴを450x200程度の大きさで作成
convert -density 600 -background none public/static/darc-logo.svg -resize 450x200 /tmp/logo_large.png

# 背景とロゴを合成（中央配置）
convert /tmp/bg_large.png \
  /tmp/logo_large.png -gravity Center -composite \
  -quality 100 \
  public/static/icon-512.png

# 192x192版を作成
convert public/static/icon-512.png -resize 192x192 -quality 100 public/static/icon-192.png

# 一時ファイル削除
rm -f /tmp/bg_large.png /tmp/logo_large.png

echo "✅ 公式ロゴ大きく明確版PWAアイコンを作成しました！"
ls -lh public/static/icon-*.png
file public/static/icon-512.png
