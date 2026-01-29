#!/bin/bash

# iOS の黒い縁を目立たなくする最終版
# 戦略1: アイコンを少し小さくして、周囲に青のグラデーション縁を追加
# 戦略2: 縁の色を暗くして、iOSの黒縁と調和させる

echo "🎨 iOS黒縁対策・最終版アイコンを作成中..."

cd /home/user/webapp/public/static

# バックアップ
cp icon-192.png icon-192-old.png
cp icon-512.png icon-512-old.png

# 512x512版を作成
# 参考画像から中央380x380を切り取り → 440x440にリサイズ
# 512x512キャンバスの中央に配置（周囲36pxの余白）
convert /home/user/webapp/reference_icon.png \
  -gravity center \
  -crop 380x380+0+0 +repage \
  -resize 440x440! \
  \( -size 512x512 \
     gradient:'#2563eb-#06b6d4' \) \
  -gravity center -composite \
  -blur 0x1 \
  icon-512-temp.png

# 元の画像を上に重ねる
convert icon-512-temp.png \
  \( /home/user/webapp/reference_icon.png \
     -gravity center \
     -crop 380x380+0+0 +repage \
     -resize 440x440! \) \
  -gravity center -composite \
  icon-512.png

rm icon-512-temp.png

# 192x192版を作成
convert icon-512.png -resize 192x192 icon-192.png

echo "✅ iOS黒縁対策・最終版アイコン作成完了！"
echo "   - アイコンサイズ: 440x440 (周囲36px余白)"
echo "   - 背景: 青グラデーション"
echo "   - iOSの黒縁が目立たなくなります"
ls -lh icon-192.png icon-512.png
file icon-512.png
