import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: './nuxt-app/.env' })

const supabase = createClient(
  process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function addNewVenues() {
  try {
    console.log('🎸 Adding new live houses...')
    
    // Define the new venues
    const newVenues = [
      {
        name: 'Crawfish',
        name_kana: 'クローフィッシュ',
        area: '赤坂見附',
        address: '東京都港区赤坂3-18-7 赤坂ロイヤルビルB1F',
        capacity: 150,
        official_url: 'https://www.crawfish.jp/',
        metadata: { 
          type: 'small-venue',
          concept: 'ロック・ポップス系ライブハウス'
        }
      },
      {
        name: 'Crocodile',
        name_kana: 'クロコダイル',
        area: '原宿',
        address: '東京都渋谷区神宮前1-13-18 原宿クロスビルB1F',
        capacity: 100,
        official_url: 'https://crocodile-live.jp/',
        metadata: { 
          type: 'small-venue',
          concept: 'インディーズバンド中心のライブハウス'
        }
      },
      {
        name: 'Twinbox AKIHABARA',
        name_kana: 'ツインボックスアキハバラ',
        area: '秋葉原',
        address: '東京都千代田区外神田3-2-12 Box\'R AKIHABARA 8F/9F',
        capacity: 200,
        official_url: 'https://twinbox.info/',
        metadata: { 
          type: 'small-venue',
          concept: 'アイドル・声優イベント専門ライブハウス'
        }
      }
    ]
    
    // Insert all venues
    const { data: insertedVenues, error: venueError } = await supabase
      .from('venues')
      .insert(newVenues)
      .select()
    
    if (venueError) {
      console.error('Error inserting venues:', venueError)
      return
    }
    
    console.log('✅ New venues added successfully!')
    insertedVenues.forEach(venue => {
      console.log(`   - ${venue.name} (${venue.area})`)
    })
    
    // Add sample events for each venue
    const today = new Date()
    const sampleEvents = []
    
    // Crawfish events
    const crawfish = insertedVenues.find(v => v.name === 'Crawfish')
    if (crawfish) {
      sampleEvents.push(
        {
          venue_id: crawfish.id,
          title: 'Rock Night Special',
          date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '19:00',
          artists: ['ロックバンドA', 'インディーズバンドB'],
          ticket_info: { price: '¥3,000', available: true },
          status: 'active',
          description: '赤坂の夜を熱くするロックナイト'
        },
        {
          venue_id: crawfish.id,
          title: 'Acoustic Session',
          date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '18:00',
          artists: ['シンガーソングライターX', 'アコースティックユニットY'],
          ticket_info: { price: '¥2,500', available: true },
          status: 'active',
          description: 'アコースティックの温かい音色をお届け'
        }
      )
    }
    
    // Crocodile events
    const crocodile = insertedVenues.find(v => v.name === 'Crocodile')
    if (crocodile) {
      sampleEvents.push(
        {
          venue_id: crocodile.id,
          title: 'Indies Band Showcase',
          date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '18:30',
          artists: ['新人バンドA', '新人バンドB', '新人バンドC'],
          ticket_info: { price: '¥2,000', available: true },
          status: 'active',
          description: '原宿発の新しい音楽シーン'
        },
        {
          venue_id: crocodile.id,
          title: 'Alternative Rock Night',
          date: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '19:30',
          artists: ['オルタナバンドX', 'ポストロックバンドY'],
          ticket_info: { price: '¥2,800', available: true },
          status: 'active',
          description: 'オルタナティブロックの夜'
        }
      )
    }
    
    // Twinbox events
    const twinbox = insertedVenues.find(v => v.name === 'Twinbox AKIHABARA')
    if (twinbox) {
      sampleEvents.push(
        {
          venue_id: twinbox.id,
          title: 'アイドルフェスティバル2024',
          date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '17:00',
          artists: ['アイドルグループ1', 'アイドルグループ2', 'アイドルグループ3'],
          ticket_info: { price: '¥4,000', available: true },
          status: 'active',
          description: '秋葉原を熱くするアイドルの祭典'
        },
        {
          venue_id: twinbox.id,
          title: '声優トークイベント',
          date: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: '14:00',
          artists: ['声優A', '声優B'],
          ticket_info: { price: '¥5,000', available: true },
          status: 'active',
          description: '人気声優によるスペシャルトークショー'
        }
      )
    }
    
    if (sampleEvents.length > 0) {
      const { error: eventError } = await supabase
        .from('events')
        .insert(sampleEvents)
      
      if (eventError) {
        console.error('Error inserting events:', eventError)
        return
      }
      
      console.log('✅ Sample events created for all venues')
    }
    
    console.log('🎉 All new venues setup complete!')
    
  } catch (error) {
    console.error('❌ Error adding new venues:', error)
    process.exit(1)
  }
}

addNewVenues()