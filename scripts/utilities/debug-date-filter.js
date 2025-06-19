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

async function debugDateFilter() {
  try {
    console.log('=== 日付フィルターのデバッグ ===\n');

    // 1. Crawfishの会場IDを取得
    const { data: crawfishVenue } = await supabase
      .from('venues')
      .select('id, name')
      .eq('name', 'Crawfish')
      .single();

    console.log('1. Crawfish会場情報:');
    console.log(crawfishVenue);
    console.log('');

    // 2. Crawfishのイベントを直接取得
    const { data: crawfishEvents } = await supabase
      .from('events')
      .select('id, title, date, status')
      .eq('venue_id', crawfishVenue.id)
      .order('date');

    console.log('2. Crawfishの全イベント:');
    crawfishEvents.forEach(event => {
      console.log(`  ${event.date} - ${event.title} (status: ${event.status})`);
    });
    console.log('');

    // 3. 現在の日付
    const today = new Date().toISOString().split('T')[0];
    console.log('3. 今日の日付:', today);
    console.log('');

    // 4. 未来のactiveイベントをフィルタリング
    const futureActiveEvents = crawfishEvents.filter(event => 
      event.date >= today && event.status === 'active'
    );

    console.log('4. 未来のactiveイベント:');
    futureActiveEvents.forEach(event => {
      console.log(`  ${event.date} - ${event.title}`);
    });
    console.log('');

    // 5. 特定の日付でテスト (例: 2025-06-18)
    const testDate = '2025-06-18';
    const eventsOnTestDate = futureActiveEvents.filter(event => event.date === testDate);
    
    console.log(`5. ${testDate} のイベント:`, eventsOnTestDate.length, '件');
    eventsOnTestDate.forEach(event => {
      console.log(`  ${event.title}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

debugDateFilter();