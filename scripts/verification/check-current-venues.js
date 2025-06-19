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

async function checkCurrentVenues() {
  try {
    console.log('=== 現在登録されているライブハウス一覧 ===\n');

    const { data: venues, error } = await supabase
      .from('venues')
      .select('*')
      .order('name');

    if (error) throw error;

    console.log(`登録済み会場数: ${venues.length}件\n`);

    venues.forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.name}`);
      console.log(`   エリア: ${venue.area}`);
      console.log(`   住所: ${venue.address}`);
      console.log(`   キャパシティ: ${venue.capacity}人`);
      console.log(`   現在のジャンル: ${venue.metadata?.genre ? venue.metadata.genre.join(', ') : 'なし'}`);
      console.log(`   公式URL: ${venue.official_url}`);
      console.log(`   作成日: ${venue.created_at}`);
      console.log('   ---');
    });

    return venues;

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

checkCurrentVenues();