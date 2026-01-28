#!/bin/bash

# 使い方: ./add_staff.sh "スタッフ名" "役職（任意）"

if [ -z "$1" ]; then
  echo "使い方: ./add_staff.sh \"スタッフ名\" \"役職（任意）\""
  echo "例: ./add_staff.sh \"山田太郎\" \"上級スタッフ\""
  exit 1
fi

NAME=$1
ROLE=${2:-"スタッフ"}

echo "スタッフを追加中: $NAME ($ROLE)"

npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO staff (name, role, is_active) VALUES ('$NAME', '$ROLE', 1)" 2>&1 | tail -5

echo ""
echo "✅ スタッフを追加しました！"
echo ""
echo "現在のスタッフ一覧:"
npx wrangler d1 execute sagamihara-darc-production --local --command="SELECT id, name, role FROM staff WHERE is_active = 1 ORDER BY id" 2>&1 | grep -A 30 "results"
