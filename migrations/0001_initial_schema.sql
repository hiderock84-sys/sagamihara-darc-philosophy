-- 相談記録テーブル
CREATE TABLE IF NOT EXISTS consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 受付情報
  reception_datetime TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  
  -- 基本情報
  caller_name TEXT,
  caller_age INTEGER,
  caller_gender TEXT CHECK(caller_gender IN ('男性', '女性', 'その他')),
  caller_phone TEXT,
  caller_relationship TEXT CHECK(caller_relationship IN ('本人', '家族', '医療機関', '行政', 'その他')),
  caller_relationship_detail TEXT,
  
  -- 依存症情報
  addiction_types TEXT, -- JSON形式で複数保存
  addiction_period TEXT,
  addiction_frequency TEXT,
  addiction_severity TEXT,
  
  -- 医療・治療歴
  hospitalization_history TEXT CHECK(hospitalization_history IN ('あり', 'なし')),
  hospitalization_facility TEXT,
  outpatient_history TEXT CHECK(outpatient_history IN ('あり', 'なし')),
  outpatient_facility TEXT,
  medication_status TEXT CHECK(medication_status IN ('あり', 'なし')),
  medication_name TEXT,
  other_facility_use TEXT CHECK(other_facility_use IN ('あり', 'なし')),
  other_facility_name TEXT,
  
  -- 緊急度評価
  emergency_use_24h BOOLEAN DEFAULT 0,
  emergency_withdrawal BOOLEAN DEFAULT 0,
  emergency_self_harm BOOLEAN DEFAULT 0,
  emergency_medical_needed BOOLEAN DEFAULT 0,
  emergency_level TEXT CHECK(emergency_level IN ('高', '中', '低')),
  
  -- 相談内容
  consultation_content TEXT,
  notes TEXT,
  
  -- 次のアクション
  interview_scheduled BOOLEAN DEFAULT 0,
  interview_datetime TEXT,
  followup_scheduled BOOLEAN DEFAULT 0,
  followup_datetime TEXT,
  coordination_needed TEXT, -- JSON形式
  report_completed BOOLEAN DEFAULT 0,
  report_to TEXT,
  
  -- チェックリスト
  check_name_contact BOOLEAN DEFAULT 0,
  check_addiction_type BOOLEAN DEFAULT 0,
  check_emergency_level BOOLEAN DEFAULT 0,
  check_next_action BOOLEAN DEFAULT 0,
  check_followup_date BOOLEAN DEFAULT 0,
  check_record_completed BOOLEAN DEFAULT 0,
  
  -- メタデータ
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 対応フレーズテーブル
CREATE TABLE IF NOT EXISTS response_phrases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL, -- 'opening', 'listening', 'information', 'closing', 'emergency'
  phase TEXT NOT NULL, -- '第1段階', '第2段階', '第3段階', '第4段階'
  situation TEXT, -- 状況説明
  phrase_type TEXT CHECK(phrase_type IN ('OK例', 'NG例', 'ルール', '注意')),
  phrase_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- スタッフテーブル
CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT, -- '代表', '上級スタッフ', 'スタッフ'
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_consultations_datetime ON consultations(reception_datetime);
CREATE INDEX IF NOT EXISTS idx_consultations_emergency ON consultations(emergency_level);
CREATE INDEX IF NOT EXISTS idx_consultations_staff ON consultations(staff_name);
CREATE INDEX IF NOT EXISTS idx_consultations_created ON consultations(created_at);
CREATE INDEX IF NOT EXISTS idx_response_phrases_category ON response_phrases(category);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active);
