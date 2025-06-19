import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '..', 'nuxt-app', '.env') });

const supabase = createClient(
  process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
);

// 月の名前を数字に変換するマップ
const monthMap = {
  'January': '01', 'February': '02', 'March': '03', 'April': '04',
  'May': '05', 'June': '06', 'July': '07', 'August': '08',
  'September': '09', 'October': '10', 'November': '11', 'December': '12'
};

async function fetchShelterSchedule() {
  try {
    console.log('=== 下北沢SHELTER スケジュール取得開始 ===\n');

    // 下北沢SHELTERの会場IDを取得
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id, name')
      .eq('name', '下北沢SHELTER')
      .single();

    if (venueError || !venue) {
      throw new Error('下北沢SHELTER会場が見つかりません');
    }

    console.log(`✅ 会場ID取得: ${venue.id} (${venue.name})`);

    // スケジュールページからデータを取得
    const response = await axios.get('https://www.loft-prj.co.jp/schedule/shelter', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const events = [];

    // スケジュール情報を解析
    $('.schedule-list .schedule-item').each((index, element) => {
      try {
        const $item = $(element);
        
        // 日付情報を取得
        const dateText = $item.find('.date').text().trim();
        const dayText = $item.find('.day').text().trim();
        
        // イベント名を取得
        const eventTitle = $item.find('.event-title').text().trim();
        
        // 時間情報を取得
        const timeText = $item.find('.time').text().trim();
        
        // アーティスト情報を取得
        const artists = [];
        $item.find('.artist').each((i, artistEl) => {
          const artistName = $(artistEl).text().trim();
          if (artistName) {
            artists.push(artistName);
          }
        });

        // 日付を解析してISO形式に変換
        let eventDate = null;
        if (dateText) {
          const dateMatch = dateText.match(/(\d{4})\s+(\d{2})\s+(\d{2})/);
          if (dateMatch) {
            const [, year, month, day] = dateMatch;
            eventDate = `${year}-${month}-${day}`;
          }
        }

        // 開場・開演時間を解析
        let startTime = null;
        let openTime = null;
        if (timeText) {
          const openMatch = timeText.match(/OPEN\s+(\d{2}):(\d{2})/);
          const startMatch = timeText.match(/START\s+(\d{2}):(\d{2})/);
          
          if (openMatch) {
            openTime = `${openMatch[1]}:${openMatch[2]}:00`;
          }
          if (startMatch) {
            startTime = `${startMatch[1]}:${startMatch[2]}:00`;
          }
        }

        if (eventTitle && eventDate) {
          const eventData = {
            venue_id: venue.id,
            title: eventTitle,
            date: eventDate,
            start_time: startTime,
            artists: artists,
            ticket_info: {
              open_time: openTime,
              start_time: startTime
            },
            description: `${dayText} ${timeText}`.trim(),
            source_url: 'https://www.loft-prj.co.jp/schedule/shelter',
            raw_data: {
              date_text: dateText,
              day_text: dayText,
              time_text: timeText,
              artists: artists,
              scraped_at: new Date().toISOString()
            },
            status: 'active'
          };

          events.push(eventData);
        }
      } catch (error) {
        console.error(`❌ イベント解析エラー (${index}):`, error.message);
      }
    });

    console.log(`✅ ${events.length}件のイベントを取得しました`);

    // 既存イベントとの重複チェック&挿入
    let insertedCount = 0;
    let skippedCount = 0;

    for (const eventData of events) {
      try {
        // 既存イベントをチェック
        const { data: existingEvent, error: checkError } = await supabase
          .from('events')
          .select('id')
          .eq('venue_id', venue.id)
          .eq('date', eventData.date)
          .eq('title', eventData.title)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingEvent) {
          console.log(`⏭️  スキップ: ${eventData.date} - ${eventData.title} (既存)`);
          skippedCount++;
          continue;
        }

        // 新規イベントを挿入
        const { error: insertError } = await supabase
          .from('events')
          .insert([eventData]);

        if (insertError) {
          console.error(`❌ 挿入エラー: ${eventData.date} - ${eventData.title}`, insertError);
          continue;
        }

        console.log(`✅ 追加: ${eventData.date} - ${eventData.title}`);
        if (eventData.artists.length > 0) {
          console.log(`   アーティスト: ${eventData.artists.join(', ')}`);
        }
        insertedCount++;

      } catch (error) {
        console.error(`❌ イベント処理エラー: ${eventData.title}`, error);
      }
    }

    // 会場のスケジュール更新日時を更新
    await supabase
      .from('venues')
      .update({ schedule_updated_at: new Date().toISOString() })
      .eq('id', venue.id);

    console.log('\n=== 処理完了 ===');
    console.log(`✅ 新規追加:     ${insertedCount}件`);
    console.log(`⏭️  既存スキップ: ${skippedCount}件`);
    console.log(`📅 合計取得:     ${events.length}件`);

    return {
      total: events.length,
      inserted: insertedCount,
      skipped: skippedCount
    };

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

// スクリプト実行
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchShelterSchedule()
    .then(result => {
      console.log('\n🎉 下北沢SHELTERのスケジュール取得が完了しました');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 スクリプト実行に失敗しました:', error);
      process.exit(1);
    });
}

export { fetchShelterSchedule };