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

// Zepp新宿の会場データ
const venueData = {
  name: 'Zepp Shinjuku',
  name_kana: 'ゼップシンジュク',
  area: '新宿',
  address: '東京都新宿区歌舞伎町一丁目29番1号 東急歌舞伎町タワーB1F - B4F',
  capacity: 1500,
  official_url: 'https://www.zepp.co.jp/hall/shinjuku/',
  metadata: {
    genre: ['ロック', 'ポップス', 'アイドル', 'K-POP'],
    description: 'Zepp初の360度LEDビジョンを備えた没入型音楽体験ができるライブハウス',
    standing_capacity: 1500,
    seated_capacity: 693,
    floor_info: {
      'B4F': {
        standing: 1337,
        seated: 530
      },
      'B3F': {
        standing: 163,
        seated: 163
      }
    },
    access: [
      '西武新宿駅より徒歩1分',
      '新宿駅より徒歩7分',
      '新宿三丁目駅より徒歩8分'
    ],
    phone: '03-6380-3741'
  }
};

// 一時的に空のイベントデータを設定（後でスケジュールを取得）
const eventsData = [];

async function addZeppShinjuku() {
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
      console.log(`Venue ID: ${venueId}`);
    }

    return venueId;

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// スクリプトの実行
addZeppShinjuku()
  .then((venueId) => {
    console.log('Script completed successfully');
    console.log(`Zepp Shinjuku venue ID: ${venueId}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });