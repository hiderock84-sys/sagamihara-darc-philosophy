# スタッフ管理ガイド

## スタッフの追加方法

### 方法1: スクリプトを使う（推奨）

```bash
cd /home/user/webapp
./add_staff.sh "スタッフ名" "役職"
```

**例**:
```bash
./add_staff.sh "山田太郎" "上級スタッフ"
./add_staff.sh "佐藤花子" "相談員"
./add_staff.sh "田中次郎"  # 役職を省略すると「スタッフ」になります
```

### 方法2: SQLコマンドを直接実行

```bash
cd /home/user/webapp
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO staff (name, role, is_active) VALUES ('スタッフ名', '役職', 1)"
```

**複数人を一度に追加**:
```bash
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO staff (name, role, is_active) VALUES ('山田太郎', 'スタッフ', 1), ('佐藤花子', '相談員', 1), ('鈴木一郎', '上級スタッフ', 1)"
```

---

## スタッフの確認

### API経由で確認（ブラウザで確認可能）

開発環境: https://3000-iko5o0a9up8u6girs6d0a-2e77fc33.sandbox.novita.ai/api/staff

### コマンドで確認

```bash
cd /home/user/webapp
npx wrangler d1 execute sagamihara-darc-production --local --command="SELECT id, name, role FROM staff WHERE is_active = 1 ORDER BY id"
```

---

## スタッフの削除（無効化）

スタッフを完全に削除するのではなく、無効化することを推奨します：

```bash
cd /home/user/webapp
npx wrangler d1 execute sagamihara-darc-production --local --command="UPDATE staff SET is_active = 0 WHERE id = スタッフID"
```

**例**: ID=5のスタッフを無効化
```bash
npx wrangler d1 execute sagamihara-darc-production --local --command="UPDATE staff SET is_active = 0 WHERE id = 5"
```

---

## スタッフの役職一覧（例）

- **代表理事** - 組織のトップ
- **上級スタッフ** - ベテランスタッフ
- **スタッフ** - 一般スタッフ
- **相談員** - 電話相談担当
- **インターン** - 研修生

---

## 現在のスタッフ一覧

1. 田中秀泰（代表理事）
2. スタッフA
3. スタッフB
4. 佐藤花子（上級スタッフ）
5. 鈴木一郎（スタッフ）
6. 高橋美咲（スタッフ）
7. 伊藤健太（相談員）
8. 渡辺さゆり（相談員）

**合計: 8名**

---

## 本番環境（Cloudflare Pages）へのスタッフ追加

本番環境にスタッフを追加する場合は、`--local`を削除して`--remote`を使用します：

```bash
npx wrangler d1 execute sagamihara-darc-production --remote --command="INSERT INTO staff (name, role, is_active) VALUES ('スタッフ名', '役職', 1)"
```

**注意**: 本番環境への変更は慎重に行ってください。

---

## トラブルシューティング

### スタッフが新規相談受付画面に表示されない場合

1. ブラウザを完全リフレッシュ（Ctrl+Shift+R / Cmd+Shift+R）
2. PM2を再起動:
```bash
cd /home/user/webapp
npm run build
pm2 restart sagamihara-darc
```

### スタッフを元に戻したい場合

```bash
npx wrangler d1 execute sagamihara-darc-production --local --command="UPDATE staff SET is_active = 1 WHERE id = スタッフID"
```

---

最終更新: 2026年1月28日
