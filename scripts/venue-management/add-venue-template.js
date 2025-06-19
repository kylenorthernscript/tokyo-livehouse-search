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

/**
 * 汎用的な会場とイベントの追加テンプレート
 * 
 * 使用方法:
 * 1. venueDataとeventsDataを適切に設定
 * 2. node scripts/add-venue-template.js で実行
 */

// 会場データの例
const venueData = {
  name: '会場名',
  name_kana: 'カイジョウメイ',
  area: 'エリア名',
  address: '住所',
  capacity: 100,
  official_url: 'https://example.com',
  metadata: {
    genre: ['ジャンル1', 'ジャンル2'],
    description: '会場の説明'
  }
};

// イベントデータの例
const eventsData = [
  {
    title: 'イベント名',
    date: '2025-07-01',
    start_time: '19:00',
    description: 'イベントの説明',
    ticket_info: { price: '3000円' },
    source_url: 'https://example.com/events/1'
  }
];

async function addVenueAndEvents() {
  try {
    // 1. 会場の存在確認
    const { data: existingVenue } = await supabase
      .from('venues')
      .select('id')
      .eq('name', venueData.name)
      .single();

    let venueId;

    if (existingVenue) {
      venueId = existingVenue.id;
      console.log(`${venueData.name} already exists, using existing venue`);
    } else {
      // 2. 新規会場の追加
      const { data: newVenue, error: venueError } = await supabase
        .from('venues')
        .insert([venueData])
        .select()
        .single();

      if (venueError) throw venueError;

      venueId = newVenue.id;
      console.log(`${venueData.name} added successfully`);
    }

    // 3. 既存イベントの確認
    const { data: existingEvents } = await supabase
      .from('events')
      .select('date, title')
      .eq('venue_id', venueId);

    const existingEventKeys = new Set(
      (existingEvents || []).map(e => `${e.date}_${e.title}`)
    );

    // 4. 新規イベントのフィルタリング
    const newEvents = eventsData.filter(event => 
      !existingEventKeys.has(`${event.date}_${event.title}`)
    );

    if (newEvents.length === 0) {
      console.log('All events already exist in the database');
      return [];
    }

    // 5. イベントの追加
    const eventsToInsert = newEvents.map(event => ({
      venue_id: venueId,
      ...event,
      status: 'active',
      raw_data: event
    }));

    const { data: insertedEvents, error: eventError } = await supabase
      .from('events')
      .insert(eventsToInsert)
      .select();

    if (eventError) throw eventError;

    console.log(`Successfully added ${insertedEvents.length} events for ${venueData.name}`);
    return insertedEvents;

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// スクリプトの実行
addVenueAndEvents()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });