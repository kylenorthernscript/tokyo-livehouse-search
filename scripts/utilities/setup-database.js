import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Create Supabase client with service role key
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

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...')
    
    // Read SQL migration file
    const migrationSQL = readFileSync(
      join(__dirname, '../supabase/migrations/20240613_create_tables.sql'),
      'utf8'
    )
    
    // Execute SQL directly
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    }).single()
    
    if (error) {
      // If RPC doesn't exist, try alternative method
      console.log('Direct SQL execution not available, using alternative method...')
      
      // Create tables one by one using Supabase client
      await createTablesManually()
    } else {
      console.log('✅ Database schema created successfully!')
    }
    
    // Insert sample data
    await insertSampleData()
    
    console.log('🎉 Database setup complete!')
    
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    process.exit(1)
  }
}

async function createTablesManually() {
  // Note: This is a workaround. For production, use Supabase CLI or dashboard
  console.log('⚠️  Please run the SQL migration manually in Supabase Dashboard:')
  console.log('1. Go to SQL Editor in your Supabase project')
  console.log('2. Copy and paste the contents of supabase/migrations/20240613_create_tables.sql')
  console.log('3. Click "Run"')
  console.log('')
  console.log('After running the migration, press Ctrl+C and run this script again with --skip-migration flag')
}

async function insertSampleData() {
  console.log('📝 Inserting sample data...')
  
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
  
  // Sample events for testing
  const today = new Date()
  const events = [
    {
      venue_id: insertedVenues[0].id, // Zepp Tokyo
      title: 'Rock Festival 2024',
      date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '18:00',
      artists: ['Band A', 'Band B', 'Band C'],
      ticket_info: { price: '¥6,500', available: true }
    },
    {
      venue_id: insertedVenues[1].id, // LIQUIDROOM
      title: 'Electronic Night',
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '19:00',
      artists: ['DJ Awesome', 'Electronic Duo'],
      ticket_info: { price: '¥4,500', available: true }
    },
    {
      venue_id: insertedVenues[2].id, // 下北沢SHELTER
      title: 'Indie Rock Show',
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: '19:30',
      artists: ['Indie Band 1', 'Indie Band 2'],
      ticket_info: { price: '¥3,000', available: true }
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
}

// Check if --skip-migration flag is passed
const skipMigration = process.argv.includes('--skip-migration')

if (skipMigration) {
  insertSampleData()
} else {
  setupDatabase()
}