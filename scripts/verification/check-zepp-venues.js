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

async function checkZeppVenues() {
  try {
    console.log('=== Zeppライブハウスの確認 ===\n');

    // Zeppが名前に含まれる会場を検索
    const { data: zeppVenues, error } = await supabase
      .from('venues')
      .select('*')
      .ilike('name', '%zepp%');

    if (error) throw error;

    if (zeppVenues.length === 0) {
      console.log('Zeppライブハウスは登録されていません。');
      return;
    }

    console.log(`${zeppVenues.length}件のZeppライブハウスが見つかりました:\n`);

    for (const venue of zeppVenues) {
      console.log(`ID: ${venue.id}`);
      console.log(`名前: ${venue.name}`);
      console.log(`エリア: ${venue.area}`);
      console.log(`住所: ${venue.address}`);
      console.log(`キャパシティ: ${venue.capacity}`);
      console.log(`公式URL: ${venue.official_url}`);
      console.log(`作成日: ${venue.created_at}`);

      // 関連するイベントも確認
      const { data: events } = await supabase
        .from('events')
        .select('id, title, date')
        .eq('venue_id', venue.id);

      console.log(`関連イベント: ${events?.length || 0}件`);
      if (events && events.length > 0) {
        events.forEach(event => {
          console.log(`  - ${event.date}: ${event.title}`);
        });
      }
      console.log('---');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkZeppVenues();