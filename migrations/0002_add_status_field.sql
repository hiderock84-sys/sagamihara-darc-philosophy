-- 相談記録にステータスフィールドを追加
ALTER TABLE consultations ADD COLUMN status TEXT CHECK(status IN ('対応中', '完了', '未完了')) DEFAULT '対応中';

-- 既存のデータを「完了」に更新
UPDATE consultations SET status = '完了' WHERE status IS NULL;
