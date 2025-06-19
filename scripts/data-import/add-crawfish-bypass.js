import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', 'nuxt-app', '.env') });

// Supabase URLからデータベース接続情報を抽出
const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL;
const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

// PostgreSQL直接接続の設定
const connectionString = `postgresql://postgres.${projectRef}:${process.env.DB_PASSWORD || 'your-db-password'}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`;

async function insertCrawfishData() {
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // トランザクション開始
    await client.query('BEGIN');

    // Crawfish会場を挿入
    const venueResult = await client.query(`
      INSERT INTO venues (name, name_kana, area, address, capacity, official_url, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
      ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
      RETURNING id
    `, [
      'Crawfish',
      'クロウフィッシュ',
      '赤坂',
      '東京都港区赤坂3-15-5 フォーチュンビル B1F',
      80,
      'https://crawfish.jp',
      JSON.stringify({ genre: ['ジャズ', 'ライブ'], description: '赤坂のジャズライブハウス' })
    ]);

    const venueId = venueResult.rows[0].id;
    console.log('Venue inserted/updated:', venueId);

    // イベントデータ
    const events = [
      { title: 'Paul McCartney Birthday Event', date: '2025-06-18', time: '13:36' },
      { title: '辺見トリオ', date: '2025-06-19', time: '19:00' },
      { title: 'Steve Bernstein', date: '2025-06-20', time: '19:30' },
      { title: '佐藤紀男 企画', date: '2025-06-21', time: '13:00' },
      { title: '444', date: '2025-06-22', time: '19:30' },
      { title: '中田ワン', date: '2025-06-25', time: '19:30' },
      { title: 'Akasaka Jam', date: '2025-06-26', time: '19:30' },
      { title: '【昼の部】グリオ3 vol.4', date: '2025-06-28', time: '13:00' },
      { title: '新・ピアノの日', date: '2025-06-30', time: '19:30' },
      { title: 'Soundscape vol.2', date: '2025-07-01', time: '19:30' },
      { title: 'The Beatles Night', date: '2025-07-03', time: '19:30' },
      { title: '2oz vol.6', date: '2025-07-06', time: '19:30' },
      { title: 'The Grasshoppers vol.2', date: '2025-07-11', time: '19:30' },
      { title: '崔企画', date: '2025-07-13', time: '19:30' },
      { title: 'Felix and Steve Event', date: '2025-07-16', time: '19:30' },
      { title: '宮小竹 vol.6', date: '2025-07-20', time: '19:30' },
      { title: 'Hidenobu "KALTA" Ohtsuki Drum Solo', date: '2025-07-21', time: '19:30' },
      { title: '吉岡大典バンド6', date: '2025-07-22', time: '19:30' },
      { title: '辺見トリオ', date: '2025-07-24', time: '19:30' },
      { title: 'MiMi Live', date: '2025-07-25', time: '19:30' }
    ];

    // イベントを挿入
    for (const event of events) {
      await client.query(`
        INSERT INTO events (venue_id, title, date, start_time, source_url, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (venue_id, date, title) DO NOTHING
      `, [venueId, event.title, event.date, event.time, 'https://crawfish.jp', 'active']);
    }

    // コミット
    await client.query('COMMIT');
    console.log(`Successfully inserted ${events.length} events`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// 実行
insertCrawfishData()
  .then(() => console.log('Done'))
  .catch(console.error);