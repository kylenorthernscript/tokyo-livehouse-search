import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VenueScrapingConfig {
  url: string
  selectors: {
    eventContainer: string
    title: string
    date: string
    time?: string
    artists?: string
    price?: string
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { venue_id } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get venue scraping configuration
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venue_id)
      .single()
      
    if (venueError || !venue) {
      throw new Error('Venue not found')
    }
    
    const config: VenueScrapingConfig = venue.scraping_config
    if (!config || !config.url) {
      throw new Error('Scraping configuration not found for venue')
    }
    
    // Fetch and parse the venue's website
    const response = await fetch(config.url)
    const html = await response.text()
    
    // Simple HTML parsing (in production, use a proper parser)
    const events = parseEvents(html, config.selectors)
    
    // Save events to database
    const eventsToInsert = events.map(event => ({
      venue_id,
      title: event.title,
      date: event.date,
      start_time: event.time,
      artists: event.artists || [],
      ticket_info: { price: event.price },
      source_url: config.url,
      raw_data: event,
    }))
    
    const { data: insertedEvents, error: insertError } = await supabase
      .from('events')
      .upsert(eventsToInsert, {
        onConflict: 'venue_id,date,title'
      })
      
    if (insertError) {
      throw insertError
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        eventsProcessed: eventsToInsert.length,
        events: insertedEvents
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function parseEvents(html: string, selectors: any): any[] {
  // Simplified parsing - in production use a proper HTML parser
  const events = []
  
  // This is a placeholder - implement actual parsing logic
  // based on the selectors configuration
  
  return events
}
