-- 会場テーブルにスケジュールURL保存フィールドを追加

ALTER TABLE venues 
ADD COLUMN schedule_url TEXT,
ADD COLUMN schedule_updated_at TIMESTAMPTZ;

-- スケジュールURL用のインデックスを追加
CREATE INDEX idx_venues_schedule_url ON venues(schedule_url);

-- コメントを追加
COMMENT ON COLUMN venues.schedule_url IS 'ライブハウスのスケジュール確認用URL';
COMMENT ON COLUMN venues.schedule_updated_at IS 'スケジュール情報の最終更新日時';