import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', 'nuxt-app', '.env') });

const supabase = createClient(
  process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addShelterVenue() {
  try {
    console.log('=== 下北沢SHELTER 会場情報追加 ===\n');

    // 下北沢SHELTERの会場データ
    const shelterVenueData = {
      name: '下北沢SHELTER',
      name_kana: 'シモキタザワシェルター',
      area: '下北沢',
      address: '東京都世田谷区北沢2-6-10 仙田ビルB1F',
      capacity: 250,
      official_url: 'https://www.loft-prj.co.jp/SHELTER/',
      schedule_url: 'https://www.loft-prj.co.jp/schedule/shelter/schedule',
      schedule_updated_at: new Date().toISOString(),
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

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingVenue) {
      console.log('✅ 下北沢SHELTERは既に登録されています');
      console.log(`   ID: ${existingVenue.id}`);
      
      // スケジュールURLを更新
      const { error: updateError } = await supabase
        .from('venues')
        .update({
          schedule_url: shelterVenueData.schedule_url,
          schedule_updated_at: shelterVenueData.schedule_updated_at
        })
        .eq('id', existingVenue.id);

      if (updateError) throw updateError;

      console.log('✅ スケジュールURLを更新しました');
      return existingVenue;
    }

    // 新規会場の追加
    const { data: newVenue, error: insertError } = await supabase
      .from('venues')
      .insert([shelterVenueData])
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('✅ 下北沢SHELTERを新規追加しました');
    console.log(`   ID: ${newVenue.id}`);
    console.log(`   名前: ${newVenue.name}`);
    console.log(`   住所: ${newVenue.address}`);
    console.log(`   キャパシティ: ${newVenue.capacity}人`);
    console.log(`   スケジュールURL: ${newVenue.schedule_url}`);

    return newVenue;

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

addShelterVenue();