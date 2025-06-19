import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function clearDuplicateData() {
  try {
    console.log('🧹 Clearing duplicate data...')
    
    // Delete all events first (due to foreign key constraints)
    const { error: eventsError } = await supabase
      .from('events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (eventsError) {
      console.error('Error deleting events:', eventsError)
      return
    }
    
    // Delete all venues
    const { error: venuesError } = await supabase
      .from('venues')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (venuesError) {
      console.error('Error deleting venues:', venuesError)
      return
    }
    
    console.log('✅ All duplicate data cleared!')
    console.log('📝 Now inserting fresh sample data...')
    
    // Insert fresh sample data
    await insertFreshData()
    
  } catch (error) {
    console.error('❌ Error clearing data:', error)
    process.exit(1)
  }
}

async function insertFreshData() {
  // Sample venues
  const venues = [
    {
      name: 'Zepp Tokyo',
      name_kana: 'ゼップトウキョウ',
      area: 'お台場',
      address: '東京都江東区青海1-3-11',
      capacity: 2709,
      official_url: 'https://www.zepp.co.jp/hall/tokyo/',
      metadata: { type: 'large-venue' }
    },
    {
      name: 'LIQUIDROOM',
      name_kana: 'リキッドルーム',
      area: '恵比寿',
      address: '東京都渋谷区東3-16-6',
      capacity: 900,
      official_url: 'https://www.liquidroom.net/',
      metadata: { type: 'medium-venue' }
    },
    {
      name: '下北沢SHELTER',
      name_kana: 'シモキタザワシェルター',
      area: '下北沢',
      address: '東京都世田谷区北沢2-6-10',
      capacity: 250,
      official_url: 'http://www.loft-prj.co.jp/SHELTER/',
      metadata: { type: 'small-venue' }
    }
  ]
  
  const { data: insertedVenues, error: venueError } = await supabase
    .from('venues')
    .insert(venues)
    .select()
  
  if (venueError) {
    console.error('Error inserting venues:', venueError)
    return
  }
  
  console.log(`✅ Inserted ${insertedVenues.length} venues`)
  
  // Sample events
  const today = new Date()
  const events = [
    {
      venue_id: insertedVenues[0].id, // Zepp Tokyo
      title: 'Rock Festival 2024',
      date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '18:00',
      artists: ['Band A', 'Band B', 'Band C'],
      ticket_info: { price: '¥6,500', available: true },
      status: 'active'
    },
    {
      venue_id: insertedVenues[1].id, // LIQUIDROOM
      title: 'Electronic Night',
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '19:00',
      artists: ['DJ Awesome', 'Electronic Duo'],
      ticket_info: { price: '¥4,500', available: true },
      status: 'active'
    },
    {
      venue_id: insertedVenues[2].id, // 下北沢SHELTER
      title: 'Indie Rock Show',
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '19:30',
      artists: ['Indie Band 1', 'Indie Band 2'],
      ticket_info: { price: '¥3,000', available: true },
      status: 'active'
    }
  ]
  
  const { error: eventError } = await supabase
    .from('events')
    .insert(events)
  
  if (eventError) {
    console.error('Error inserting events:', eventError)
    return
  }
  
  console.log('✅ Sample events created')
  console.log('🎉 Fresh data setup complete!')
}

clearDuplicateData()