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

// Zepp新宿のVenue ID
const ZEPP_SHINJUKU_VENUE_ID = 'b6ec7fa5-5349-4c58-901a-bc2b72694a72';

// 2025年6月のイベントデータ
const eventsData = [
  {
    title: 'かかかぶぶぶききき!!! - ラララライブ!!! - 4TH ONEMAN LIVE',
    date: '2025-06-19',
    start_time: '19:00',
    description: 'かかかぶぶぶききき!!!の4thワンマンライブ OPEN 18:00 / START 19:00',
    ticket_info: {
      price: 'S ¥15,000, Camera ¥20,000, General ¥4,000',
      type: '複数券種あり'
    },
    source_url: 'https://www.zepp.co.jp/hall/shinjuku/'
  },
  {
    title: 'スプスラッシュ - Spslash STADIUM 2025 ~MAX BOOST!!~',
    date: '2025-06-20',
    start_time: '19:00',
    description: 'スプスラッシュのスタジアムライブ OPEN 18:00 / START 19:00',
    ticket_info: {
      price: 'VIP ¥30,000, SS ¥15,000, S ¥5,000, A ¥0',
      type: '複数券種あり'
    },
    source_url: 'https://www.zepp.co.jp/hall/shinjuku/'
  },
  {
    title: '浅香唯 - 40周年記念コンサート',
    date: '2025-06-21',
    start_time: '17:00',
    description: '浅香唯デビュー40周年記念コンサート OPEN 16:15 / START 17:00',
    ticket_info: {
      price: 'S席・A席完売',
      type: '全席指定'
    },
    source_url: 'https://www.zepp.co.jp/hall/shinjuku/'
  },
  {
    title: 'パピプペポは難しい - ワンマンライブ2025',
    date: '2025-06-23',
    start_time: '18:45',
    description: 'パピプペポは難しいのワンマンライブ OPEN 17:45 / START 18:45',
    ticket_info: {
      price: '¥1,500-¥100,000',
      type: '複数券種あり'
    },
    source_url: 'https://www.zepp.co.jp/hall/shinjuku/'
  },
  {
    title: 'STAiNY - 6秒超えても君が好き',
    date: '2025-06-24',
    start_time: '19:00',
    description: 'STAiNYのライブ OPEN 18:15 / START 19:00',
    ticket_info: {
      price: 'SS ¥25,000, A ¥5,000, B ¥1,000',
      type: '複数券種あり'
    },
    source_url: 'https://www.zepp.co.jp/hall/shinjuku/'
  },
  {
    title: '詩羽/PEDRO - SHINJUKU LOFT PRESENTS『ATTACK FROM LIVEHOUSE』',
    date: '2025-06-25',
    start_time: '19:00',
    description: 'SHINJUKU LOFT PRESENTS、詩羽とPEDROの共演 OPEN 18:00 / START 19:00',
    ticket_info: {
      price: '¥6,200',
      type: 'オールスタンディング'
    },
    source_url: 'https://www.zepp.co.jp/hall/shinjuku/'
  }
];

async function addZeppShinjukuEvents() {
  try {
    // 1. 会場の存在確認
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id, name')
      .eq('id', ZEPP_SHINJUKU_VENUE_ID)
      .single();

    if (venueError || !venue) {
      throw new Error('Zepp Shinjuku venue not found');
    }

    console.log(`Found venue: ${venue.name}`);

    // 2. 既存イベントの確認
    const { data: existingEvents } = await supabase
      .from('events')
      .select('date, title')
      .eq('venue_id', ZEPP_SHINJUKU_VENUE_ID);

    const existingEventKeys = new Set(
      (existingEvents || []).map(e => `${e.date}_${e.title}`)
    );

    // 3. 新規イベントのフィルタリング
    const newEvents = eventsData.filter(event => 
      !existingEventKeys.has(`${event.date}_${event.title}`)
    );

    if (newEvents.length === 0) {
      console.log('All events already exist in the database');
      return [];
    }

    // 4. イベントの追加
    const eventsToInsert = newEvents.map(event => ({
      venue_id: ZEPP_SHINJUKU_VENUE_ID,
      ...event,
      status: 'active',
      raw_data: event
    }));

    const { data: insertedEvents, error: eventError } = await supabase
      .from('events')
      .insert(eventsToInsert)
      .select();

    if (eventError) throw eventError;

    console.log(`Successfully added ${insertedEvents.length} events for Zepp Shinjuku`);
    
    // 各イベントの詳細を表示
    insertedEvents.forEach(event => {
      console.log(`- ${event.date}: ${event.title}`);
    });

    return insertedEvents;

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// スクリプトの実行
addZeppShinjukuEvents()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });