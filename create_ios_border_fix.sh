#!/bin/bash

# iOS の黒い縁を目立たなくする方法
# 戦略: アイコンの周囲にグラデーションの「のりしろ」を追加

echo "🎨 iOS黒縁対策版アイコンを作成中..."

cd /home/user/webapp/public/static

# バックアップ
cp icon-192.png icon-192-old.png
cp icon-512.png icon-512-old.png

# 512x512版を作成
# 1. 中心部分を460x460で作成（余白52px）
# 2. 周囲に暗めのグラデーション縁を追加
convert /home/user/webapp/reference_icon.png \
  -gravity center \
  -crop 400x400+0+0 +repage \
  -resize 460x460! \
  \( -size 512x512 xc:none \
     -fill 'radial-gradient(circle at center, 
            rgba(56,139,192,1) 0%, 
            rgba(40,100,140,1) 90%, 
            rgba(20,50,70,1) 100%)' \
     -draw 'rectangle 0,0 511,511' \) \
  -gravity center -composite \
  icon-512.png

# 192x192版を作成
convert icon-512.png -resize 192x192 icon-192.png

echo "✅ iOS黒縁対策版アイコン作成完了！"
echo "   - アイコン周囲に暗いグラデーション縁を追加"
echo "   - iOSの黒い縁と調和して目立たなくなります"
ls -lh icon-192.png icon-512.png
file icon-512.png
