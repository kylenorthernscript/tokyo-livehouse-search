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

const zeppDiverCityEvents = [
  {
    title: "ナオト・インティライミ FCインティライミ ファン感謝祭2025",
    date: "2025-06-18",
    start_time: "14:00",
    end_time: null,
    artists: ["ナオト・インティライミ"],
    ticket_info: { 
      price: "¥5,700",
      type: "全席指定"
    },
    description: "FCインティライミ ファン感謝祭2025 1st Show: OPEN 13:00 / START 14:00"
  },
  {
    title: "ナオト・インティライミ FCインティライミ ファン感謝祭2025 (2nd Show)",
    date: "2025-06-18",
    start_time: "18:00",
    end_time: null,
    artists: ["ナオト・インティライミ"],
    ticket_info: { 
      price: "¥5,700",
      type: "全席指定"
    },
    description: "FCインティライミ ファン感謝祭2025 2nd Show: OPEN 17:00 / START 18:00"
  },
  {
    title: "PSYCHIC FEVER LIVE TOUR 2025 'EVOLVE' in JAPAN",
    date: "2025-06-19",
    start_time: "18:30",
    end_time: null,
    artists: ["PSYCHIC FEVER"],
    ticket_info: { 
      price: "¥9,900",
      type: "全自由"
    },
    description: "OPEN 17:30 / START 18:30"
  },
  {
    title: "PUSHIM 25th Anniversary Tour 2025 with HOME GROWN",
    date: "2025-06-20",
    start_time: "19:00",
    end_time: null,
    artists: ["PUSHIM", "HOME GROWN"],
    ticket_info: { 
      price: "¥4,000-¥25,000",
      type: "複数券種あり"
    },
    description: "OPEN 18:00 / START 19:00"
  },
  {
    title: "2025 EVNNE CONCERT [SET N GO] JAPAN (昼の部)",
    date: "2025-06-21",
    start_time: "15:00",
    end_time: null,
    artists: ["EVNNE"],
    ticket_info: { 
      price: "¥12,000-¥18,000",
      type: "複数券種あり"
    },
    description: "昼の部 OPEN 14:00 / START 15:00"
  },
  {
    title: "2025 EVNNE CONCERT [SET N GO] JAPAN (夜の部)",
    date: "2025-06-21",
    start_time: "19:00",
    end_time: null,
    artists: ["EVNNE"],
    ticket_info: { 
      price: "¥12,000-¥18,000",
      type: "複数券種あり"
    },
    description: "夜の部 OPEN 18:00 / START 19:00"
  },
  {
    title: "Chevon Zepp ONE MAN TOUR .25『DUA･RHYTHM』",
    date: "2025-06-22",
    start_time: "18:00",
    end_time: null,
    artists: ["Chevon"],
    ticket_info: { 
      price: "¥5,800",
      type: "一般"
    },
    description: "OPEN 17:00 / START 18:00"
  }
];

async function addZeppDiverCityEvents() {
  try {
    console.log('=== Zepp DiverCity (TOKYO) イベント追加 ===\n');

    // Zepp DiverCityの会場IDを取得
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id, name')
      .eq('name', 'Zepp DiverCity (TOKYO)')
      .single();

    if (venueError) throw venueError;

    console.log('1. 会場情報確認:');
    console.log(`   ID: ${venue.id}`);
    console.log(`   名前: ${venue.name}\n`);

    // 既存イベントの確認
    const { data: existingEvents, error: existingError } = await supabase
      .from('events')
      .select('date, title')
      .eq('venue_id', venue.id);

    if (existingError) throw existingError;

    const existingEventKeys = new Set(
      (existingEvents || []).map(e => `${e.date}_${e.title}`)
    );

    // 新規イベントのフィルタリング
    const newEvents = zeppDiverCityEvents.filter(event => 
      !existingEventKeys.has(`${event.date}_${event.title}`)
    );

    if (newEvents.length === 0) {
      console.log('すべてのイベントが既に登録されています。');
      return [];
    }

    console.log(`2. 新規イベント: ${newEvents.length}件\n`);

    // イベントの追加
    const eventsToInsert = newEvents.map(event => ({
      venue_id: venue.id,
      title: event.title,
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time,
      artists: event.artists,
      ticket_info: event.ticket_info,
      description: event.description,
      source_url: 'https://www.zepp.co.jp/hall/divercity/',
      status: 'active',
      raw_data: event
    }));

    const { data: insertedEvents, error: insertError } = await supabase
      .from('events')
      .insert(eventsToInsert)
      .select();

    if (insertError) throw insertError;

    console.log('3. 追加されたイベント:');
    insertedEvents.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.date} ${event.start_time} - ${event.title}`);
    });

    console.log(`\n🎉 Zepp DiverCity (TOKYO)に${insertedEvents.length}件のイベントを追加しました！`);
    return insertedEvents;

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

addZeppDiverCityEvents();