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

async function addVident() {
  try {
    console.log('🎭 Adding SHIBUYA VIDENT...')
    
    // Add VIDENT venue
    const newVenue = {
      name: 'SHIBUYA VIDENT',
      name_kana: 'シブヤビデント',
      area: '渋谷',
      address: '東京都渋谷区宇田川町29-4 ゼンモール渋谷ビルB2F',
      capacity: 275,
      official_url: 'https://vident.jp/',
      metadata: { 
        type: 'small-venue',
        concept: 'アイドル専用ライブハウス',
        stage_size: {
          width: '6,740mm',
          depth: '4,000mm',
          height: '500mm'
        }
      }
    }
    
    const { data: insertedVenue, error: venueError } = await supabase
      .from('venues')
      .insert([newVenue])
      .select()
      .single()
    
    if (venueError) {
      console.error('Error inserting VIDENT:', venueError)
      return
    }
    
    console.log('✅ SHIBUYA VIDENT added successfully!')
    
    // Add sample events for VIDENT
    const today = new Date()
    const sampleEvents = [
      {
        venue_id: insertedVenue.id,
        title: 'アイドルライブフェス 2024',
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '18:30',
        artists: ['アイドルグループA', 'アイドルグループB', 'ソロアイドルC'],
        ticket_info: { price: '¥3,500', available: true },
        status: 'active',
        description: 'アイドル専用ライブハウスでの特別公演'
      },
      {
        venue_id: insertedVenue.id,
        title: '新人アイドル発表会',
        date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '19:00',
        artists: ['新人アイドルX', '新人アイドルY'],
        ticket_info: { price: '¥2,800', available: true },
        status: 'active',
        description: '次世代アイドルのデビューステージ'
      }
    ]
    
    const { error: eventError } = await supabase
      .from('events')
      .insert(sampleEvents)
    
    if (eventError) {
      console.error('Error inserting VIDENT events:', eventError)
      return
    }
    
    console.log('✅ VIDENT sample events created')
    console.log('🎉 SHIBUYA VIDENT setup complete!')
    
  } catch (error) {
    console.error('❌ Error adding VIDENT:', error)
    process.exit(1)
  }
}

addVident()