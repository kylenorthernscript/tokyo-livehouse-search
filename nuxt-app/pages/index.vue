<template>
  <div>
    <!-- Hero Section -->
    <section class="hero is-primary is-bold">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-2">
            <span class="icon is-large">
              <i class="fas fa-music"></i>
            </span>
            東京ライブハウス検索
          </h1>
          <h2 class="subtitle is-4">
            東京のライブハウスとイベント情報を一括検索
          </h2>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="section">
      <div class="container">
        <!-- Search Filters -->
        <div class="box mb-6">
          <h3 class="title is-5 mb-4">
            <span class="icon">
              <i class="fas fa-filter"></i>
            </span>
            検索フィルター
          </h3>
          
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">エリア</label>
                <div class="control has-icons-left">
                  <div class="select is-fullwidth">
                    <select v-model="selectedArea">
                      <option value="">すべてのエリア</option>
                      <option v-for="area in areas" :key="area" :value="area">{{ area }}</option>
                    </select>
                  </div>
                  <span class="icon is-small is-left">
                    <i class="fas fa-map-marker-alt"></i>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="column">
              <div class="field">
                <label class="label">ジャンル</label>
                <div class="control has-icons-left">
                  <div class="select is-fullwidth">
                    <select v-model="selectedGenre">
                      <option value="">すべてのジャンル</option>
                      <option value="jazz">Jazz & Blues</option>
                      <option value="electronic">Electronic & Techno</option>
                      <option value="rock">J-Rock & Visual Kei</option>
                      <option value="pop">J-Pop & Idol</option>
                      <option value="classical">Classical & Traditional</option>
                      <option value="hiphop">Hip-Hop & Underground</option>
                      <option value="world">World & Experimental</option>
                    </select>
                  </div>
                  <span class="icon is-small is-left">
                    <i class="fas fa-music"></i>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="column">
              <div class="field">
                <label class="label">日付</label>
                <div class="control has-icons-left">
                  <input class="input" type="date" v-model="selectedDate">
                  <span class="icon is-small is-left">
                    <i class="fas fa-calendar-alt"></i>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="column">
              <div class="field">
                <label class="label">キャパシティ</label>
                <div class="control has-icons-left">
                  <div class="select is-fullwidth">
                    <select v-model="selectedCapacity">
                      <option value="">すべて</option>
                      <option value="small">〜300人</option>
                      <option value="medium">300〜1000人</option>
                      <option value="large">1000人〜</option>
                    </select>
                  </div>
                  <span class="icon is-small is-left">
                    <i class="fas fa-users"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div class="box">
          <h3 class="title is-5 mb-4">
            <span class="icon">
              <i class="fas fa-building"></i>
            </span>
            ライブハウス一覧
            <span class="tag is-primary is-light ml-2">{{ filteredVenues.length }}件</span>
          </h3>

          <!-- Loading State -->
          <div v-if="pending" class="has-text-centered loading-spinner">
            <button class="button is-loading is-large is-white"></button>
            <p class="mt-4">読み込み中...</p>
          </div>
          
          <!-- Error State -->
          <div v-else-if="error || initError" class="notification is-danger">
            <strong>エラーが発生しました:</strong> 
            <p>{{ error?.message || initError?.message || 'Unknown error' }}</p>
            <p v-if="initError" class="mt-2">
              <small>環境変数が正しく設定されているか確認してください。</small>
            </p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="filteredVenues.length === 0" class="has-text-centered">
            <div class="content">
              <span class="icon is-large has-text-grey-light">
                <i class="fas fa-search fa-3x"></i>
              </span>
              <p class="title is-5 has-text-grey">該当するライブハウスが見つかりませんでした</p>
              <p class="has-text-grey">検索条件を変更してお試しください</p>
            </div>
          </div>
          
          <!-- Venues Grid -->
          <div v-else class="columns is-multiline">
            <div v-for="venue in filteredVenues" :key="venue.id" class="column is-12-mobile is-6-tablet is-4-desktop is-3-widescreen">
              <div class="card venue-card" @click="navigateToVenue(venue.id)">
                <div class="card-content">
                  <div class="media">
                    <div class="media-left">
                      <figure class="image is-48x48">
                        <span class="icon is-large has-text-primary">
                          <i class="fas fa-music fa-2x"></i>
                        </span>
                      </figure>
                    </div>
                    <div class="media-content">
                      <p class="title is-5">{{ venue.name }}</p>
                      <p class="subtitle is-6">
                        <span class="tag is-info is-light">{{ venue.area }}</span>
                        <span class="tag is-success is-light ml-1">{{ venue.capacity }}人</span>
                      </p>
                    </div>
                  </div>

                  <div class="content">
                    <p class="has-text-grey-dark mb-3" v-if="venue.address">
                      <span class="icon is-small">
                        <i class="fas fa-map-marker-alt"></i>
                      </span>
                      {{ venue.address }}
                    </p>
                    
                    <!-- Upcoming Events -->
                    <div v-if="venue.events && venue.events.length > 0" class="mt-4">
                      <p class="has-text-weight-semibold mb-2">
                        <span class="icon is-small">
                          <i class="fas fa-calendar-alt"></i>
                        </span>
                        今後の公演
                      </p>
                      <div class="event-list">
                        <div v-for="event in venue.events.slice(0, 3)" :key="event.id" class="event-item">
                          <p class="has-text-weight-medium">{{ event.title }}</p>
                          <p class="is-size-7 has-text-grey">
                            {{ formatDate(event.date) }}
                            <span v-if="event.start_time" class="ml-1">{{ event.start_time }}〜</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="venue-card-actions">
                  <button class="button is-primary is-light is-fullwidth mb-2" @click.stop="navigateToVenue(venue.id)">
                    <span class="icon is-small">
                      <i class="fas fa-calendar-alt"></i>
                    </span>
                    <span class="button-text">スケジュール</span>
                  </button>
                  <a v-if="venue.official_url" 
                     :href="venue.official_url" 
                     target="_blank" 
                     class="button is-link is-light is-fullwidth"
                     @click.stop>
                    <span class="icon is-small">
                      <i class="fas fa-external-link-alt"></i>
                    </span>
                    <span class="button-text">公式サイト</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Supabaseクライアントの初期化（エラーハンドリング付き）
let supabase = null
let initError = null

try {
  supabase = useSupabase()
} catch (error) {
  initError = error
  console.error('Failed to initialize Supabase:', error)
}

// State
const selectedArea = ref('')
const selectedDate = ref('')
const selectedCapacity = ref('')
const selectedGenre = ref('')

// Fetch venues with events
const { data: venues, pending, error, refresh } = await useAsyncData('venues-with-events', async () => {
  // Supabaseが初期化されていない場合は空配列を返す
  if (!supabase || initError) {
    console.error('Supabase not initialized:', initError)
    return []
  }
  
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        events(
          id,
          title,
          date,
          start_time,
          artists,
          status
        )
      `)
      .order('name')
      
    if (error) throw error
    
    // Filter events on the client side
    return data?.map(venue => ({
      ...venue,
      events: venue.events?.filter(event => 
        event.date >= today && event.status === 'active'
      ) || []
    })) || []
  } catch (err) {
    console.error('Error fetching venues:', err)
    return []
  }
})

// Computed properties
const areas = computed(() => {
  if (!venues.value) return []
  return [...new Set(venues.value.map(v => v.area))].sort()
})

const filteredVenues = computed(() => {
  if (!venues.value) return []
  
  return venues.value.map(venue => {
    // First, filter events based on selected date
    let filteredEvents = venue.events || []
    
    if (selectedDate.value) {
      filteredEvents = filteredEvents.filter(event => event.date === selectedDate.value)
    }
    
    // Create venue with filtered events
    const venueWithFilteredEvents = {
      ...venue,
      events: filteredEvents
    }
    
    return venueWithFilteredEvents
  }).filter(venue => {
    // Area filter
    if (selectedArea.value && venue.area !== selectedArea.value) return false
    
    // Genre filter
    if (selectedGenre.value) {
      const venueGenres = venue.metadata?.genre || []
      const hasMatchingGenre = venueGenres.some(genre => 
        genre.includes(selectedGenre.value) || selectedGenre.value.includes(genre)
      )
      if (!hasMatchingGenre) return false
    }
    
    // Capacity filter
    if (selectedCapacity.value) {
      if (selectedCapacity.value === 'small' && venue.capacity > 300) return false
      if (selectedCapacity.value === 'medium' && (venue.capacity <= 300 || venue.capacity > 1000)) return false
      if (selectedCapacity.value === 'large' && venue.capacity <= 1000) return false
    }
    
    // If date is selected, only show venues that have events on that date
    if (selectedDate.value) {
      return venue.events && venue.events.length > 0
    }
    
    return true
  })
})

// Navigation
const navigateToVenue = (venueId) => {
  navigateTo(`/venues/${venueId}`)
}

// Utilities
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ja-JP', { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric' 
  }).format(date)
}
</script>

<style scoped>
.venue-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
}

.venue-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.venue-card .card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.event-item {
  padding: 0.5rem 0;
  border-left: 3px solid #3273dc;
  padding-left: 0.75rem;
  margin-bottom: 0.5rem;
}

.event-item:last-child {
  margin-bottom: 0;
}

.loading-spinner {
  padding: 3rem 0;
}

/* 会場カードアクション */
.venue-card-actions {
  padding: 1rem;
  margin-top: auto;
}

.venue-card-actions .button {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.25rem;
}

.venue-card-actions .button-text {
  display: inline;
}

/* レスポンシブ調整 */
@media (max-width: 1216px) and (min-width: 1024px) {
  /* デスクトップサイズでのボタン調整 */
  .venue-card-actions .button {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    min-height: 2rem;
  }
  
  .venue-card-actions .button .icon {
    margin-right: 0.25rem !important;
  }
}

@media (max-width: 1023px) and (min-width: 769px) {
  /* タブレットサイズでの調整 */
  .venue-card-actions .button {
    font-size: 0.8rem;
    padding: 0.5rem 0.5rem;
    min-height: 1.875rem;
  }
  
  .venue-card-actions .button .icon {
    margin-right: 0.25rem !important;
  }
}

@media (max-width: 768px) {
  /* モバイルサイズ */
  .venue-card-actions {
    padding: 0.75rem;
  }
  
  .venue-card-actions .button {
    font-size: 0.875rem;
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  /* 小画面での更なる調整 */
  .venue-card-actions .button {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
  
  .venue-card-actions .button-text {
    display: none;
  }
  
  .venue-card-actions .button .icon {
    margin-right: 0 !important;
  }
}
</style>