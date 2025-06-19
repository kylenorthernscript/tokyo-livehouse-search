import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', 'nuxt-app', '.env') });

const supabase = createClient(
  process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addCrawfishDataDirectly() {
  try {
    // First add service role policies
    const addPoliciesSQL = `
      -- Add service role policies
      CREATE POLICY IF NOT EXISTS "Service role can insert venues" 
        ON venues FOR INSERT 
        TO service_role
        WITH CHECK (true);

      CREATE POLICY IF NOT EXISTS "Service role can insert events" 
        ON events FOR INSERT 
        TO service_role
        WITH CHECK (true);
    `;

    console.log('Adding service role policies...');
    const { error: policyError } = await supabase.rpc('exec_sql', { 
      sql: addPoliciesSQL 
    });

    if (policyError) {
      console.log('Policy creation failed (may already exist):', policyError.message);
    }

    // Add venue and events using raw SQL
    const insertDataSQL = `
      -- Insert Crawfish venue if not exists
      INSERT INTO venues (name, name_kana, area, address, capacity, official_url, metadata)
      VALUES (
        'Crawfish',
        'クロウフィッシュ',
        '赤坂',
        '東京都港区赤坂3-15-5 フォーチュンビル B1F',
        80,
        'https://crawfish.jp',
        '{"genre": ["ジャズ", "ライブ"], "description": "赤坂のジャズライブハウス"}'::jsonb
      )
      ON CONFLICT (name) DO NOTHING;

      -- Insert events
      INSERT INTO events (venue_id, title, date, start_time, source_url, raw_data)
      VALUES 
        ((SELECT id FROM venues WHERE name = 'Crawfish'), 'Paul McCartney Birthday Event', '2025-06-18', '13:36', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '辺見トリオ', '2025-06-19', '19:00', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), 'Steve Bernstein', '2025-06-20', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '佐藤紀男 企画', '2025-06-21', '13:00', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '444', '2025-06-22', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '中田ワン', '2025-06-25', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), 'Akasaka Jam', '2025-06-26', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '【昼の部】グリオ3 vol.4', '2025-06-28', '13:00', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '新・ピアノの日', '2025-06-30', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), 'Soundscape vol.2', '2025-07-01', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), 'The Beatles Night', '2025-07-03', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '2oz vol.6', '2025-07-06', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), 'The Grasshoppers vol.2', '2025-07-11', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '崔企画', '2025-07-13', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), 'Felix and Steve Event', '2025-07-16', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '宮小竹 vol.6', '2025-07-20', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), 'Hidenobu "KALTA" Ohtsuki Drum Solo', '2025-07-21', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '吉岡大典バンド6', '2025-07-22', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), '辺見トリオ', '2025-07-24', '19:30', 'https://crawfish.jp', '{}'::jsonb),
        ((SELECT id FROM venues WHERE name = 'Crawfish'), 'MiMi Live', '2025-07-25', '19:30', 'https://crawfish.jp', '{}'::jsonb)
      ON CONFLICT (venue_id, date, title) DO NOTHING;
    `;

    console.log('Inserting Crawfish data...');
    const { error: insertError } = await supabase.rpc('exec_sql', { 
      sql: insertDataSQL 
    });

    if (insertError) {
      throw insertError;
    }

    console.log('Successfully added Crawfish venue and events!');

  } catch (error) {
    console.error('Error:', error);
  }
}

addCrawfishDataDirectly();