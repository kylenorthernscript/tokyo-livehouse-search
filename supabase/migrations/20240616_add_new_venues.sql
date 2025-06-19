-- Add new venues: Crawfish, Crocodile, and Twinbox

-- Insert Crawfish (赤坂見附)
INSERT INTO venues (name, name_kana, area, address, capacity, official_url, metadata)
VALUES (
  'Crawfish',
  'クローフィッシュ',
  '赤坂見附',
  '東京都港区赤坂3-18-7 赤坂ロイヤルビルB1F',
  150,
  'https://www.crawfish.jp/',
  '{"type": "small-venue", "concept": "ロック・ポップス系ライブハウス"}'::jsonb
);

-- Insert Crocodile (原宿)
INSERT INTO venues (name, name_kana, area, address, capacity, official_url, metadata)
VALUES (
  'Crocodile',
  'クロコダイル',
  '原宿',
  '東京都渋谷区神宮前1-13-18 原宿クロスビルB1F',
  100,
  'https://crocodile-live.jp/',
  '{"type": "small-venue", "concept": "インディーズバンド中心のライブハウス"}'::jsonb
);

-- Insert Twinbox AKIHABARA (秋葉原)
INSERT INTO venues (name, name_kana, area, address, capacity, official_url, metadata)
VALUES (
  'Twinbox AKIHABARA',
  'ツインボックスアキハバラ',
  '秋葉原',
  '東京都千代田区外神田3-2-12 Box''R AKIHABARA 8F/9F',
  200,
  'https://twinbox.info/',
  '{"type": "small-venue", "concept": "アイドル・声優イベント専門ライブハウス"}'::jsonb
);

-- Add sample events for the new venues
DO $$
DECLARE
  crawfish_id UUID;
  crocodile_id UUID;
  twinbox_id UUID;
  base_date DATE := CURRENT_DATE;
BEGIN
  -- Get venue IDs
  SELECT id INTO crawfish_id FROM venues WHERE name = 'Crawfish';
  SELECT id INTO crocodile_id FROM venues WHERE name = 'Crocodile';
  SELECT id INTO twinbox_id FROM venues WHERE name = 'Twinbox AKIHABARA';
  
  -- Add events for Crawfish
  INSERT INTO events (venue_id, title, date, start_time, artists, ticket_info, status, description)
  VALUES 
  (
    crawfish_id,
    'Rock Night Special',
    base_date + INTERVAL '3 days',
    '19:00',
    '["ロックバンドA", "インディーズバンドB"]'::jsonb,
    '{"price": "¥3,000", "available": true}'::jsonb,
    'active',
    '赤坂の夜を熱くするロックナイト'
  ),
  (
    crawfish_id,
    'Acoustic Session',
    base_date + INTERVAL '7 days',
    '18:00',
    '["シンガーソングライターX", "アコースティックユニットY"]'::jsonb,
    '{"price": "¥2,500", "available": true}'::jsonb,
    'active',
    'アコースティックの温かい音色をお届け'
  );
  
  -- Add events for Crocodile
  INSERT INTO events (venue_id, title, date, start_time, artists, ticket_info, status, description)
  VALUES 
  (
    crocodile_id,
    'Indies Band Showcase',
    base_date + INTERVAL '5 days',
    '18:30',
    '["新人バンドA", "新人バンドB", "新人バンドC"]'::jsonb,
    '{"price": "¥2,000", "available": true}'::jsonb,
    'active',
    '原宿発の新しい音楽シーン'
  ),
  (
    crocodile_id,
    'Alternative Rock Night',
    base_date + INTERVAL '12 days',
    '19:30',
    '["オルタナバンドX", "ポストロックバンドY"]'::jsonb,
    '{"price": "¥2,800", "available": true}'::jsonb,
    'active',
    'オルタナティブロックの夜'
  );
  
  -- Add events for Twinbox
  INSERT INTO events (venue_id, title, date, start_time, artists, ticket_info, status, description)
  VALUES 
  (
    twinbox_id,
    'アイドルフェスティバル2024',
    base_date + INTERVAL '4 days',
    '17:00',
    '["アイドルグループ1", "アイドルグループ2", "アイドルグループ3"]'::jsonb,
    '{"price": "¥4,000", "available": true}'::jsonb,
    'active',
    '秋葉原を熱くするアイドルの祭典'
  ),
  (
    twinbox_id,
    '声優トークイベント',
    base_date + INTERVAL '8 days',
    '14:00',
    '["声優A", "声優B"]'::jsonb,
    '{"price": "¥5,000", "available": true}'::jsonb,
    'active',
    '人気声優によるスペシャルトークショー'
  );
END $$;