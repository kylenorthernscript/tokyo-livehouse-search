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

async function verifyZeppDiverCityData() {
  try {
    console.log('=== Zepp DiverCity (TOKYO) データ確認 ===\n');

    // Zepp DiverCityのイベントを取得
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        venues!inner(
          name,
          area,
          address
        )
      `)
      .eq('venues.name', 'Zepp DiverCity (TOKYO)')
      .gte('date', '2025-06-01')
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      throw error;
    }

    console.log(`Found ${events.length} Zepp DiverCity (TOKYO) events:`);
    console.log('==================================================');
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.date} ${event.start_time || 'N/A'} - ${event.title}`);
      if (event.artists && event.artists.length > 0) {
        console.log(`   アーティスト: ${event.artists.join(', ')}`);
      }
      if (event.ticket_info?.price) {
        console.log(`   チケット: ${event.ticket_info.price} (${event.ticket_info.type || ''})`);
      }
      console.log('');
    });

    return events;

  } catch (error) {
    console.error('Error verifying data:', error);
    throw error;
  }
}

verifyZeppDiverCityData();