#!/bin/bash

# LINEで送るための案内画像を作成
# QRコード + 説明文

echo "🎨 LINE共有用の案内画像を作成中..."

cd /home/user/webapp

# QRコードをダウンロード（既にある場合はスキップ）
if [ ! -f qrcode.png ]; then
  curl -o qrcode.png "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://sagamihara-darc.pages.dev"
fi

# 案内画像を作成（800x1000px）
convert -size 800x1000 xc:'#1e40af' \
  \( -size 760x150 xc:white \
     -gravity center \
     -font DejaVu-Sans-Bold \
     -pointsize 48 \
     -fill '#1e40af' \
     -annotate +0+0 '相模原ダルク' \) \
  -gravity north -geometry +0+40 -composite \
  \( -size 760x80 xc:white \
     -gravity center \
     -font DejaVu-Sans-Bold \
     -pointsize 32 \
     -fill '#1e40af' \
     -annotate +0+0 '電話対応支援アプリ' \) \
  -gravity north -geometry +0+210 -composite \
  qrcode.png \
  -gravity center -geometry +0-50 -composite \
  \( -size 760x100 xc:white \
     -gravity center \
     -font DejaVu-Sans-Bold \
     -pointsize 28 \
     -fill '#1e40af' \
     -annotate +0+0 'iPhoneで読み取って' \) \
  -gravity south -geometry +0+150 -composite \
  \( -size 760x80 xc:white \
     -gravity center \
     -font DejaVu-Sans-Bold \
     -pointsize 24 \
     -fill '#1e40af' \
     -annotate +0+0 'ホーム画面に追加してください' \) \
  -gravity south -geometry +0+50 -composite \
  line_share_image.png

echo "✅ LINE共有用案内画像作成完了！"
echo "   - ファイル: line_share_image.png"
echo "   - サイズ: 800x1000px"
echo "   - 用途: LINEでそのまま送信できます"
ls -lh line_share_image.png qrcode.png
file line_share_image.png
