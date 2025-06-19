<template>
  <div class="container py-6">
    <!-- Loading State -->
    <div v-if="pending" class="has-text-centered py-6">
      <div class="is-loading"></div>
      <p class="mt-4">会場情報を読み込み中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="notification is-danger">
      <p>エラーが発生しました: {{ error }}</p>
      <NuxtLink to="/" class="button is-light mt-3">
        <i class="fas fa-arrow-left mr-2"></i>
        戻る
      </NuxtLink>
    </div>

    <!-- Venue Details -->
    <div v-else-if="venue" class="columns is-variable is-8">
      <!-- Left Column: Venue Info -->
      <div class="column is-12-mobile is-5-tablet is-4-desktop">
        <div class="card venue-info-card">
          <div class="card-content">
            <!-- Venue Header -->
            <div class="media">
              <div class="media-content">
                <h1 class="title is-4 mb-2">{{ venue.name }}</h1>
                <p v-if="venue.name_kana" class="subtitle is-6 has-text-grey">{{ venue.name_kana }}</p>
                <div class="tags">
                  <span class="tag is-primary">{{ venue.area }}</span>
                  <span v-if="venue.capacity" class="tag is-info">
                    <i class="fas fa-users mr-1"></i>
                    {{ venue.capacity }}人
                  </span>
                </div>
              </div>
            </div>

            <!-- Venue Details -->
            <div class="content">
              <div v-if="venue.address" class="field">
                <label class="label is-small">住所</label>
                <div class="control">
                  <span class="icon-text">
                    <span class="icon has-text-grey">
                      <i class="fas fa-map-marker-alt"></i>
                    </span>
                    <span>{{ venue.address }}</span>
                  </span>
                </div>
              </div>

              <div v-if="venue.metadata?.genre" class="field">
                <label class="label is-small">ジャンル</label>
                <div class="tags">
                  <span v-for="genre in venue.metadata.genre" :key="genre" class="tag is-light">
                    {{ genre }}
                  </span>
                </div>
              </div>

              <div v-if="venue.metadata?.description" class="field">
                <label class="label is-small">説明</label>
                <p class="is-size-7">{{ venue.metadata.description }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="venue-actions">
              <NuxtLink to="/" class="button is-light is-fullwidth mb-3">
                <i class="fas fa-arrow-left mr-2"></i>
                一覧に戻る
              </NuxtLink>
              <a v-if="venue.official_url" 
                 :href="venue.official_url" 
                 target="_blank" 
                 class="button is-link is-fullwidth">
                <i class="fas fa-external-link-alt mr-2"></i>
                公式サイト
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Events Schedule -->
      <div class="column is-12-mobile is-7-tablet is-8-desktop">
        <div class="card events-card">
          <div class="card-header">
            <h2 class="card-header-title">
              <i class="fas fa-calendar-alt mr-2"></i>
              イベントスケジュール
            </h2>
          </div>
          <div class="card-content">
            <!-- No Events Message -->
            <div v-if="!events || events.length === 0" class="has-text-centered py-6">
              <i class="fas fa-calendar-times is-size-1 has-text-grey-light mb-4"></i>
              <p class="has-text-grey">現在予定されているイベントはありません</p>
            </div>

            <!-- Events List -->
            <div v-else class="events-list">
              <div 
                v-for="event in events" 
                :key="event.id" 
                class="event-item box mb-4"
              >
                <div class="columns is-mobile is-vcentered">
                  <!-- Date Column -->
                  <div class="column is-narrow">
                    <div class="date-badge">
                      <div class="month">{{ formatMonth(event.date) }}</div>
                      <div class="day">{{ formatDay(event.date) }}</div>
                      <div class="weekday">{{ formatWeekday(event.date) }}</div>
                    </div>
                  </div>

                  <!-- Event Details Column -->
                  <div class="column event-details">
                    <h3 class="title is-5 mb-2 event-title">{{ event.title }}</h3>
                    <div class="event-meta">
                      <div v-if="event.start_time" class="meta-item">
                        <span class="icon has-text-info">
                          <i class="fas fa-clock"></i>
                        </span>
                        <span>{{ formatTime(event.start_time) }}</span>
                      </div>
                      <div v-if="event.ticket_info?.price" class="meta-item">
                        <span class="icon has-text-success">
                          <i class="fas fa-ticket-alt"></i>
                        </span>
                        <span>{{ event.ticket_info.price }}</span>
                      </div>
                    </div>
                    <div v-if="event.artists && event.artists.length > 0" class="artists mt-2">
                      <span class="icon-text">
                        <span class="icon has-text-primary">
                          <i class="fas fa-music"></i>
                        </span>
                        <span class="artist-names">{{ event.artists.join(', ') }}</span>
                      </span>
                    </div>
                    <p v-if="event.description" class="content is-small mt-2 event-description">
                      {{ event.description }}
                    </p>
                  </div>

                  <!-- Status Column -->
                  <div class="column is-narrow">
                    <span 
                      class="tag" 
                      :class="{
                        'is-success': event.status === 'active',
                        'is-warning': event.status === 'postponed',
                        'is-danger': event.status === 'cancelled'
                      }"
                    >
                      {{ getStatusText(event.status) }}
                    </span>
                  </div>
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
// Meta
definePageMeta({
  layout: 'default'
})

// Route params
const route = useRoute()
const venueId = route.params.id

// Supabase
const supabase = useSupabase()

// Fetch venue data
const { data: venue, pending: venuePending, error: venueError } = await useAsyncData(`venue-${venueId}`, async () => {
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', venueId)
    .single()
  
  if (error) throw error
  return data
})

// Fetch events data
const { data: events, pending: eventsPending, error: eventsError } = await useAsyncData(`events-${venueId}`, async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('venue_id', venueId)
    .eq('status', 'active')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })
  
  if (error) throw error
  return data || []
})

// Computed
const pending = computed(() => venuePending.value || eventsPending.value)
const error = computed(() => venueError.value || eventsError.value)

// SEO
useHead({
  title: computed(() => venue.value ? `${venue.value.name} - 東京ライブハウス検索` : '読み込み中... - 東京ライブハウス検索'),
  meta: [
    {
      name: 'description',
      content: computed(() => venue.value ? `${venue.value.name}のイベントスケジュールと詳細情報。${venue.value.area}エリアのライブハウス情報。` : '')
    }
  ]
})

// Helper functions
const formatMonth = (dateStr) => {
  const date = new Date(dateStr)
  return (date.getMonth() + 1).toString().padStart(2, '0')
}

const formatDay = (dateStr) => {
  const date = new Date(dateStr)
  return date.getDate().toString().padStart(2, '0')
}

const formatWeekday = (dateStr) => {
  const date = new Date(dateStr)
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  return weekdays[date.getDay()]
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.slice(0, 5)
}

const getStatusText = (status) => {
  const statusMap = {
    'active': '開催予定',
    'postponed': '延期',
    'cancelled': '中止'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.date-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  border-radius: 8px;
  padding: 12px;
  min-width: 70px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.date-badge .month {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.9;
}

.date-badge .day {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.date-badge .weekday {
  font-size: 0.75rem;
  opacity: 0.9;
}

.event-item {
  border-left: 4px solid #667eea;
  transition: all 0.2s ease;
}

.event-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.event-title {
  word-break: break-word;
  line-height: 1.3;
}

.artist-names {
  word-break: break-word;
}

.event-description {
  word-break: break-word;
}

/* イベントカードのレスポンシブ調整 */
@media (max-width: 768px) {
  .event-item .columns.is-mobile {
    display: block;
  }
  
  .date-badge {
    margin-bottom: 1rem;
    display: inline-block;
  }
  
  .event-details {
    width: 100%;
  }
  
  .event-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

.artists {
  margin-top: 0.5rem;
}

/* レスポンシブ対応 */
.venue-info-card {
  height: fit-content;
  margin-bottom: 1.5rem;
}

.venue-actions {
  padding: 1rem;
}

.venue-actions .button {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* タブレット サイズ調整 */
@media (max-width: 1023px) and (min-width: 769px) {
  .columns.is-variable.is-8 {
    --columnGap: 1rem;
  }
  
  .venue-actions .button {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }
}

/* モバイル対応 */
@media (max-width: 768px) {
  .venue-info-card,
  .events-card {
    margin-bottom: 1rem;
  }
  
  .venue-actions {
    padding: 0.75rem;
  }
  
  .venue-actions .button {
    padding: 0.75rem 1rem;
  }
}

/* 小画面での調整 */
@media (max-width: 480px) {
  .venue-actions .button {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }
  
  .venue-actions .button .icon {
    margin-right: 0.25rem !important;
  }
}
</style>