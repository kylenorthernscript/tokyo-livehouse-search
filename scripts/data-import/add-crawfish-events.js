import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', 'nuxt-app', '.env') });

if (!process.env.NUXT_PUBLIC_SUPABASE_URL || !process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  console.error('NUXT_PUBLIC_SUPABASE_URL:', process.env.NUXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
  console.error('NUXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(
  process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const crawfishEvents = [
  {
    date: "2025-06-18",
    time: "13:36",
    name: "Paul McCartney Birthday Event",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-06-19",
    time: "19:00",
    name: "辺見トリオ",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-06-20",
    time: "19:30",
    name: "Steve Bernstein",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-06-21",
    time: "13:00",
    name: "佐藤紀男 企画",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-06-22",
    time: "19:30",
    name: "444",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-06-25",
    time: "19:30",
    name: "中田ワン",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-06-26",
    time: "19:30",
    name: "Akasaka Jam",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-06-28",
    time: "13:00",
    name: "【昼の部】グリオ3 vol.4",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-06-30",
    time: "19:30",
    name: "新・ピアノの日",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-01",
    time: "19:30",
    name: "Soundscape vol.2",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-03",
    time: "19:30",
    name: "The Beatles Night",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-06",
    time: "19:30",
    name: "2oz vol.6",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-11",
    time: "19:30",
    name: "The Grasshoppers vol.2",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-13",
    time: "19:30",
    name: "崔企画",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-16",
    time: "19:30",
    name: "Felix and Steve Event",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-20",
    time: "19:30",
    name: "宮小竹 vol.6",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-21",
    time: "19:30",
    name: "Hidenobu \"KALTA\" Ohtsuki Drum Solo",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-22",
    time: "19:30",
    name: "吉岡大典バンド6",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-24",
    time: "19:30",
    name: "辺見トリオ",
    details: null,
    ticketPrice: null
  },
  {
    date: "2025-07-25",
    time: "19:30",
    name: "MiMi Live",
    details: null,
    ticketPrice: null
  }
];

async function addCrawfishVenue() {
  try {
    // First, check if Crawfish venue already exists
    const { data: existingVenue, error: venueCheckError } = await supabase
      .from('venues')
      .select('id')
      .eq('name', 'Crawfish')
      .single();

    if (venueCheckError && venueCheckError.code !== 'PGRST116') {
      throw venueCheckError;
    }

    let venueId;

    if (existingVenue) {
      venueId = existingVenue.id;
      console.log('Crawfish venue already exists, using existing venue');
    } else {
      // Add Crawfish venue
      const { data: venueData, error: venueError } = await supabase
        .from('venues')
        .insert([
          {
            name: 'Crawfish',
            name_kana: 'クロウフィッシュ',
            area: '赤坂',
            address: '東京都港区赤坂3-15-5 フォーチュンビル B1F',
            capacity: 80,
            official_url: 'https://crawfish.jp',
            metadata: {
              genre: ['ジャズ', 'ライブ'],
              description: '赤坂のジャズライブハウス'
            }
          }
        ])
        .select()
        .single();

      if (venueError) {
        throw venueError;
      }

      venueId = venueData.id;
      console.log('Crawfish venue added successfully');
    }

    // Check for existing events to avoid duplicates
    const { data: existingEvents, error: existingEventsError } = await supabase
      .from('events')
      .select('date, title')
      .eq('venue_id', venueId);

    if (existingEventsError) {
      throw existingEventsError;
    }

    const existingEventKeys = new Set(
      existingEvents.map(e => `${e.date}_${e.title}`)
    );

    // Filter out events that already exist
    const newEvents = crawfishEvents.filter(event => 
      !existingEventKeys.has(`${event.date}_${event.name}`)
    );

    if (newEvents.length === 0) {
      console.log('All Crawfish events already exist in the database');
      return [];
    }

    // Add events with RLS bypass using service role or upsert
    const eventsToInsert = newEvents.map(event => ({
      venue_id: venueId,
      title: event.name,
      date: event.date,
      start_time: event.time,
      description: event.details,
      ticket_info: event.ticketPrice ? { price: event.ticketPrice } : {},
      source_url: 'https://crawfish.jp',
      raw_data: event
    }));

    // Temporarily disable RLS for insertion
    await supabase.rpc('set_config', {
      setting_name: 'row_security',
      setting_value: 'off',
      is_local: true
    }).then(() => console.log('RLS temporarily disabled'));

    // Use upsert to handle conflicts gracefully
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .upsert(eventsToInsert, { 
        onConflict: 'venue_id,date,title',
        ignoreDuplicates: false 
      })
      .select();

    // Re-enable RLS
    await supabase.rpc('set_config', {
      setting_name: 'row_security', 
      setting_value: 'on',
      is_local: true
    }).then(() => console.log('RLS re-enabled'));

    if (eventError) {
      throw eventError;
    }

    console.log(`Successfully added ${eventData.length} events for Crawfish`);
    return eventData;

  } catch (error) {
    console.error('Error adding Crawfish events:', error);
    throw error;
  }
}

// Run the script
addCrawfishVenue()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });