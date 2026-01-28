#!/bin/bash
# 相模原ダルク PWAアイコン作成スクリプト（改良版）

# 192x192 アイコン - シンプルでクリーンなデザイン
convert -size 192x192 \
  -define gradient:angle=135 gradient:"#00357f-#0072ab" \
  \( +clone -alpha extract -draw "fill black polygon 0,0 0,192 192,192 192,0" -blur 0x10 \) \
  -compose DstOut -composite \
  -fill white -font DejaVu-Sans-Bold -pointsize 38 -gravity north -annotate +0+20 "相模原" \
  -fill white -font DejaVu-Sans-Bold -pointsize 32 -gravity north -annotate +0+65 "DARC" \
  \( -size 80x80 xc:none -fill "rgba(255,255,255,0.9)" -draw "roundrectangle 0,0 80,80 15,15" \
     -fill "#00357f" -font DejaVu-Sans -pointsize 50 -gravity center -annotate +0+0 "📞" \) \
  -gravity center -geometry +0+35 -composite \
  /home/user/webapp/public/static/icon-192.png

# 512x512 アイコン - 高解像度版
convert -size 512x512 \
  -define gradient:angle=135 gradient:"#00357f-#0072ab" \
  \( +clone -alpha extract -draw "fill black polygon 0,0 0,512 512,512 512,0" -blur 0x20 \) \
  -compose DstOut -composite \
  -fill white -font DejaVu-Sans-Bold -pointsize 100 -gravity north -annotate +0+50 "相模原" \
  -fill white -font DejaVu-Sans-Bold -pointsize 85 -gravity north -annotate +0+170 "DARC" \
  \( -size 220x220 xc:none -fill "rgba(255,255,255,0.9)" -draw "roundrectangle 0,0 220,220 40,40" \
     -fill "#00357f" -font DejaVu-Sans -pointsize 140 -gravity center -annotate +0+0 "📞" \) \
  -gravity center -geometry +0+90 -composite \
  /home/user/webapp/public/static/icon-512.png

echo "✅ 相模原ダルク公式カラーのPWAアイコンを作成しました！"
echo "   - 背景: #00357f → #0072ab グラデーション（公式カラー）"
echo "   - テキスト: 相模原 DARC"
echo "   - アイコン: 電話マーク 📞"
