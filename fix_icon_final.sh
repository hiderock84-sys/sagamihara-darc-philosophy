#!/bin/bash

# アイコン修正スクリプト（改良版）
# 1. 4隅の黒い部分を青色で塗りつぶす
# 2. 元のDARCテキスト部分を背景色で塗りつぶし
# 3. Call Mgmtを新規追加

echo "🎨 アイコン修正中（改良版）..."

cd /home/user/webapp/public/static

# バックアップ
cp icon-512.png icon-512-old.png 2>/dev/null || true
cp icon-192.png icon-192-old.png 2>/dev/null || true

# 元の画像から開始（黒い部分が残っているもの）
cp icon-512-old.png icon-512-work.png 2>/dev/null || cp /home/user/webapp/reference_icon.png icon-512-work.png

# 参考画像から中央部分を切り取り
convert /home/user/webapp/reference_icon.png \
  -gravity center \
  -crop 380x380+0+0 +repage \
  -resize 440x440! \
  temp_content.png

# 512x512の青背景を作成（グラデーション）
convert -size 512x512 gradient:'#3b82f6-#06b6d4' temp_bg.png

# 背景の上に内容を合成（DARCテキスト付き）
convert temp_bg.png \
  temp_content.png \
  -gravity center -composite \
  temp_with_darc.png

# DARCテキスト部分を青色で塗りつぶし（下部80px）
convert temp_with_darc.png \
  -fill '#06b6d4' \
  -draw 'rectangle 0,432 511,511' \
  temp_no_text.png

# 新しいCall Mgmtテキストを追加
convert temp_no_text.png \
  \( -size 512x100 xc:none \
     -gravity center \
     -font DejaVu-Sans-Bold \
     -pointsize 65 \
     -fill white \
     -stroke '#C0C0C0' \
     -strokewidth 2 \
     -annotate +0+0 'Call Mgmt' \) \
  -gravity south -geometry +0+25 -composite \
  icon-512.png

# 192x192版を作成
convert icon-512.png -resize 192x192 icon-192.png

# 一時ファイル削除
rm temp_*.png

echo "✅ アイコン修正完了！"
echo "   - 4隅の黒い部分を青色で塗りつぶし"
echo "   - 元のDARCテキストを削除"
echo "   - Call Mgmtテキストを追加"
ls -lh icon-192.png icon-512.png
file icon-512.png
