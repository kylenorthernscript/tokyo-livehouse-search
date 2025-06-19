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

async function verifyCrawfishData() {
  try {
    // Crawfishのイベントを取得
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        venues!inner(
          name,
          area
        )
      `)
      .eq('venues.name', 'Crawfish')
      .gte('date', '2025-06-01')
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    console.log(`Found ${events.length} Crawfish events:`);
    console.log('=====================================');
    
    events.forEach(event => {
      console.log(`${event.date} ${event.start_time} - ${event.title}`);
    });

    return events;

  } catch (error) {
    console.error('Error verifying data:', error);
    throw error;
  }
}

verifyCrawfishData()
  .then(() => {
    console.log('\nVerification completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });