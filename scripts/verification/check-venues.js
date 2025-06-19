import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: './nuxt-app/.env' })

const supabase = createClient(
  process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkVenues() {
  try {
    console.log('📍 Checking existing venues...')
    
    const { data: venues, error } = await supabase
      .from('venues')
      .select('*')
      .order('area')
    
    if (error) {
      console.error('Error fetching venues:', error)
      return
    }
    
    console.log(`\nFound ${venues.length} venues:\n`)
    venues.forEach(venue => {
      console.log(`- ${venue.name} (${venue.area}) - Capacity: ${venue.capacity}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkVenues()