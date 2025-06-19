import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { VenueURLManager } from './url-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', 'nuxt-app', '.env') });

const supabase = createClient(
  process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
);

// アーティスト名からジャンルを推定する関数
function inferGenreFromArtist(artistName, eventTitle) {
  const artist = artistName.toLowerCase();
  const title = eventTitle.toLowerCase();
  
  // ジャンル判定のキーワードマッピング
  const genreKeywords = {
    'ジャズ': ['jazz', 'ジャズ', 'swing', 'bebop'],
    'ロック': ['rock', 'ロック', 'band', 'バンド', 'guitar', 'ギター'],
    'ポップス': ['pop', 'ポップ', 'idol', 'アイドル'],
    'パンク': ['punk', 'パンク', 'hardcore', 'ハードコア'],
    'メタル': ['metal', 'メタル', 'death', 'black', 'doom'],
    'エレクトロニック': ['electronic', 'エレクトロ', 'techno', 'テクノ', 'edm'],
    'フォーク': ['folk', 'フォーク', 'acoustic', 'アコースティック'],
    'ヒップホップ': ['hip', 'hop', 'ヒップホップ', 'rap', 'ラップ'],
    'オルタナティブ': ['alternative', 'オルタナ', 'indie', 'インディー'],
    'アニメ': ['アニメ', 'anime', 'ボカロ', 'vocaloid']
  };

  const searchText = `${artist} ${title}`;
  
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return genre;
    }
  }
  
  // 特定のアーティスト名での判定
  if (artist.includes('dopeness') || artist.includes('石野卓球')) return 'ヒップホップ';
  if (artist.includes('czecho') || artist.includes('チェコ')) return 'ロック';
  if (artist.includes('scoobie')) return 'ロック';
  
  return 'その他';
}

async function addShelterWithSchedule() {
  try {
    console.log('=== 下北沢SHELTER 登録処理開始 ===\n');

    const urlManager = new VenueURLManager();

    // 1. URL管理ファイルに追加
    await urlManager.addVenue(
      '下北沢SHELTER',
      'https://www.loft-prj.co.jp/schedule/shelter/schedule',
      'https://www.loft-prj.co.jp/SHELTER/',
      'ロフト系列のライブハウス'
    );

    // 2. 会場情報をSupabaseに追加
    const shelterVenueData = {
      name: '下北沢SHELTER',
      name_kana: 'シモキタザワシェルター',
      area: '下北沢',
      address: '東京都世田谷区北沢2-6-10 仙田ビルB1F',
      capacity: 250,
      official_url: 'https://www.loft-prj.co.jp/SHELTER/',
      metadata: {
        genre: ['ロック', 'ポップス', 'フォーク', 'パンク', 'その他'],
        description: '1991年オープンのロフト系列ライブハウス。市松模様のステージと赤い大きな時計が特徴。',
        phone: '03-3466-7430',
        access: '小田急線・京王井の頭線下北沢駅南口より徒歩2分',
        drink_charge: '600円',
        features: ['フリーWi-Fi', 'ソファー席', 'ボックス席'],
        established: '1991年10月'
      }
    };

    // 既存会場の確認
    const { data: existingVenue, error: checkError } = await supabase
      .from('venues')
      .select('id, name')
      .eq('name', '下北沢SHELTER')
      .single();

    let venueId;

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingVenue) {
      console.log('✅ 下北沢SHELTERは既に登録されています');
      venueId = existingVenue.id;
    } else {
      // 新規会場の追加
      const { data: newVenue, error: insertError } = await supabase
        .from('venues')
        .insert([shelterVenueData])
        .select()
        .single();

      if (insertError) throw insertError;

      venueId = newVenue.id;
      console.log('✅ 下北沢SHELTERを新規追加しました');
    }

    // 3. サンプルイベントデータ（6月の主要イベント）
    const shelterEvents = [
      {
        title: 'mouse trap vol.1',
        date: '2025-06-01',
        start_time: '18:30',
        artists: ['arko lemming', 'Czecho No Republic'],
        ticket_info: { price: '前売¥3,500 / 当日¥4,000' },
        description: 'mouse trap vol.1'
      },
      {
        title: 'KOGA RECORDS 30th Anniversary',
        date: '2025-06-08',
        start_time: '18:00',
        artists: ['デキシード・ザ・エモンズ', 'SCOOBIE DO'],
        ticket_info: { price: '前売¥4,000' },
        description: 'KOGA RECORDS 30周年記念公演'
      },
      {
        title: 'SHINJUKU LOFT PRESENTS "ATTACK FROM LIVEHOUSE"',
        date: '2025-06-20',
        start_time: '19:00',
        artists: ['鎮座DOPENESS', '石野卓球'],
        ticket_info: { price: '前売¥5,000' },
        description: 'SHINJUKU LOFT PRESENTS "ATTACK FROM LIVEHOUSE"'
      },
      {
        title: 'ACODISCO 3rd "acovicious" Release Bash',
        date: '2025-06-29',
        start_time: '18:30',
        artists: ['ACODISCO', 'The STRUMMERS', 'THE DEAD NEXT DOOR'],
        ticket_info: { price: '前売¥3,500' },
        description: 'ACODISCO 3rdアルバム"acovicious"リリース記念'
      }
    ];

    // 4. イベントにジャンルを割り当てて登録
    const eventsToInsert = shelterEvents.map(event => {
      const primaryArtist = event.artists[0];
      const inferredGenre = inferGenreFromArtist(primaryArtist, event.title);
      
      return {
        venue_id: venueId,
        title: event.title,
        date: event.date,
        start_time: event.start_time,
        artists: event.artists,
        ticket_info: event.ticket_info,
        description: event.description,
        source_url: 'https://www.loft-prj.co.jp/schedule/shelter/schedule',
        status: 'active',
        raw_data: {
          ...event,
          inferred_genre: inferredGenre
        }
      };
    });

    const { data: insertedEvents, error: eventError } = await supabase
      .from('events')
      .insert(eventsToInsert)
      .select();

    if (eventError) throw eventError;

    console.log('\n✅ イベント登録完了:');
    insertedEvents.forEach((event, index) => {
      const genre = event.raw_data?.inferred_genre || 'その他';
      console.log(`   ${index + 1}. ${event.date} - ${event.title} [${genre}]`);
    });

    console.log(`\n🎉 下北沢SHELTERに${insertedEvents.length}件のイベントを追加しました！`);

    // 5. URL管理ファイルの確認
    console.log('\n=== URL管理ファイル確認 ===');
    await urlManager.listVenues();

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

addShelterWithSchedule();