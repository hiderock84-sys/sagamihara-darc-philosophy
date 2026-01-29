#!/bin/bash

# 参考画像から黒い外枠を削除してPWAアイコンを作成
# 青のグラデーション背景 + 3D白電話 + 白DARCテキスト

echo "🎨 黒枠削除版PWAアイコンを作成中..."

cd /home/user/webapp/public/static

# バックアップ
cp icon-192.png icon-192-old.png
cp icon-512.png icon-512-old.png

# 参考画像から中央部分を切り取り（黒枠を除去）
# 512x512の画像から中央の約440x440部分を切り取る
convert /home/user/webapp/reference_icon.png \
  -gravity center \
  -crop 440x440+0+0 +repage \
  -resize 512x512! \
  icon-512.png

# 192x192版を作成
convert icon-512.png -resize 192x192 icon-192.png

echo "✅ 黒枠削除版PWAアイコン作成完了！"
echo "   - 元画像の中央部分を切り取り"
echo "   - 黒い外枠を完全削除"
echo "   - 青グラデーション背景を維持"
echo "   - 3D電話アイコンとDARCテキストを保持"
ls -lh icon-192.png icon-512.png
file icon-512.png
