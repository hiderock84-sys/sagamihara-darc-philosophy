#!/bin/bash

# iOS の黒い縁を目立たなくする最終版（修正版）
# アイコン周囲に余白を作り、グラデーション背景を追加

echo "🎨 iOS黒縁対策・修正版アイコンを作成中..."

cd /home/user/webapp/public/static

# バックアップ
cp icon-192.png icon-192-old.png 2>/dev/null || true
cp icon-512.png icon-512-old.png 2>/dev/null || true

# 512x512版を作成
# 1. 512x512の青グラデーション背景を作成
convert -size 512x512 gradient:'#3b82f6-#06b6d4' icon-512-bg.png

# 2. 参考画像から中央380x380を切り取り → 440x440にリサイズ
convert /home/user/webapp/reference_icon.png \
  -gravity center \
  -crop 380x380+0+0 +repage \
  -resize 440x440! \
  icon-512-content.png

# 3. 背景の上に内容を合成
convert icon-512-bg.png \
  icon-512-content.png \
  -gravity center -composite \
  icon-512.png

# 一時ファイル削除
rm icon-512-bg.png icon-512-content.png

# 192x192版を作成
convert icon-512.png -resize 192x192 icon-192.png

echo "✅ iOS黒縁対策・修正版アイコン作成完了！"
echo "   - キャンバスサイズ: 512x512"
echo "   - アイコン本体: 440x440 (周囲36px余白)"
echo "   - 背景: 青グラデーション (#3b82f6 → #06b6d4)"
echo "   - iOSの黒縁と調和して目立たなくなります"
ls -lh icon-192.png icon-512.png
file icon-512.png
