#!/bin/bash

# 🎨 相模原ダルク PWAアイコン - 最高品質プロフェッショナル版 V2
# 公式カラー: #00357f (ダークブルー) → #0072ab (ライトブルー)

echo "🎨 相模原ダルク PWAアイコン - プロフェッショナル版V2作成..."

# まず、グラデーション背景を作成
convert -size 512x512 gradient:'#00357f-#0072ab' /tmp/bg.png

# テキストレイヤーを作成（DARC + 相模原）
convert -size 512x400 xc:none \
  -gravity North \
  -pointsize 90 \
  -font DejaVu-Sans-Bold \
  -fill white \
  -annotate +0+60 'DARC' \
  -pointsize 40 \
  -font DejaVu-Sans-Bold \
  -annotate +0+170 '相模原' \
  /tmp/text.png

# 電話アイコンの白い背景を作成
convert -size 140x140 xc:white \
  -draw "roundrectangle 0,0,140,140,20,20" \
  /tmp/phone_bg.png

# 電話アイコンを描画（簡潔版）
convert /tmp/phone_bg.png \
  -fill '#00357f' \
  -draw "ellipse 45,55 15,20 0,360" \
  -draw "ellipse 95,55 15,20 0,360" \
  -draw "path 'M 45,75 Q 70,95 95,75'" \
  -draw "rectangle 30,25 50,35" \
  -draw "rectangle 90,25 110,35" \
  /tmp/phone.png

# すべてを合成
convert /tmp/bg.png \
  /tmp/text.png -composite \
  /tmp/phone.png -gravity South -geometry +0+40 -composite \
  public/static/icon-512.png

# 192x192版を作成
convert public/static/icon-512.png -resize 192x192 public/static/icon-192.png

# 一時ファイル削除
rm -f /tmp/bg.png /tmp/text.png /tmp/phone_bg.png /tmp/phone.png

echo "✅ プロフェッショナル版PWAアイコンを作成しました！"
ls -lh public/static/icon-*.png
