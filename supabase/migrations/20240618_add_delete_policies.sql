-- DELETE操作を可能にするRLSポリシーを追加

-- venues テーブルのDELETEポリシー
CREATE POLICY "Anon can delete venues" 
  ON venues FOR DELETE 
  TO anon
  USING (true);

-- events テーブルのDELETEポリシー  
CREATE POLICY "Anon can delete events" 
  ON events FOR DELETE 
  TO anon
  USING (true);

-- artists テーブルのDELETEポリシー
CREATE POLICY "Anon can delete artists" 
  ON artists FOR DELETE 
  TO anon
  USING (true);

-- event_artists テーブルのDELETEポリシー
CREATE POLICY "Anon can delete event_artists" 
  ON event_artists FOR DELETE 
  TO anon
  USING (true);