import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Service roleでSupabaseクライアントを作成（RLSをバイパス）
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false,
        } 
      }
    )

    // Crawfish会場を挿入
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .upsert({
        name: 'Crawfish',
        name_kana: 'クロウフィッシュ',
        area: '赤坂',
        address: '東京都港区赤坂3-15-5 フォーチュンビル B1F',
        capacity: 80,
        official_url: 'https://crawfish.jp',
        metadata: { 
          genre: ['ジャズ', 'ライブ'], 
          description: '赤坂のジャズライブハウス' 
        }
      }, { onConflict: 'name' })
      .select()
      .single()

    if (venueError) throw venueError

    const venueId = venueData.id

    // イベントデータ
    const events = [
      { title: 'Paul McCartney Birthday Event', date: '2025-06-18', time: '13:36' },
      { title: '辺見トリオ', date: '2025-06-19', time: '19:00' },
      { title: 'Steve Bernstein', date: '2025-06-20', time: '19:30' },
      { title: '佐藤紀男 企画', date: '2025-06-21', time: '13:00' },
      { title: '444', date: '2025-06-22', time: '19:30' },
      { title: '中田ワン', date: '2025-06-25', time: '19:30' },
      { title: 'Akasaka Jam', date: '2025-06-26', time: '19:30' },
      { title: '【昼の部】グリオ3 vol.4', date: '2025-06-28', time: '13:00' },
      { title: '新・ピアノの日', date: '2025-06-30', time: '19:30' },
      { title: 'Soundscape vol.2', date: '2025-07-01', time: '19:30' },
      { title: 'The Beatles Night', date: '2025-07-03', time: '19:30' },
      { title: '2oz vol.6', date: '2025-07-06', time: '19:30' },
      { title: 'The Grasshoppers vol.2', date: '2025-07-11', time: '19:30' },
      { title: '崔企画', date: '2025-07-13', time: '19:30' },
      { title: 'Felix and Steve Event', date: '2025-07-16', time: '19:30' },
      { title: '宮小竹 vol.6', date: '2025-07-20', time: '19:30' },
      { title: 'Hidenobu "KALTA" Ohtsuki Drum Solo', date: '2025-07-21', time: '19:30' },
      { title: '吉岡大典バンド6', date: '2025-07-22', time: '19:30' },
      { title: '辺見トリオ', date: '2025-07-24', time: '19:30' },
      { title: 'MiMi Live', date: '2025-07-25', time: '19:30' }
    ]

    // イベントを挿入
    const eventsToInsert = events.map(event => ({
      venue_id: venueId,
      title: event.title,
      date: event.date,
      start_time: event.time,
      source_url: 'https://crawfish.jp',
      status: 'active'
    }))

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .upsert(eventsToInsert, { 
        onConflict: 'venue_id,date,title',
        ignoreDuplicates: true 
      })

    if (eventError) throw eventError

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully inserted venue and ${events.length} events`,
        venueId,
        eventsInserted: eventData?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})