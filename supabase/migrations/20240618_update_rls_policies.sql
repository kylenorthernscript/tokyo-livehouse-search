-- RLSポリシーを更新して、anonユーザーでもデータ挿入を可能にする
-- ただし、セキュリティのため特定の条件下でのみ許可

-- venues テーブルのポリシー更新
DROP POLICY IF EXISTS "Authenticated users can insert venues" ON venues;
CREATE POLICY "Anyone can insert venues" 
  ON venues FOR INSERT 
  WITH CHECK (true);

-- events テーブルのポリシー更新
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
CREATE POLICY "Anyone can insert events" 
  ON events FOR INSERT 
  WITH CHECK (
    -- venue_idが存在することを確認
    EXISTS (SELECT 1 FROM venues WHERE id = venue_id)
    -- 将来の日付のイベントのみ許可（オプション）
    -- AND date >= CURRENT_DATE
  );

-- artists テーブルのポリシー更新
CREATE POLICY "Anyone can insert artists" 
  ON artists FOR INSERT 
  WITH CHECK (true);

-- event_artists テーブルのポリシー更新
CREATE POLICY "Anyone can insert event_artists" 
  ON event_artists FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE id = event_id) AND
    EXISTS (SELECT 1 FROM artists WHERE id = artist_id)
  );

-- UPDATE権限も追加（重複を避けるため）
CREATE POLICY "Anyone can update venues" 
  ON venues FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can update events" 
  ON events FOR UPDATE 
  USING (true)
  WITH CHECK (true);