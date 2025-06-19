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

async function replaceZeppVenue() {
  try {
    console.log('=== Zepp Tokyo削除とZepp DiverCity追加 ===\n');

    // 1. 古いZepp Tokyoを削除
    const { data: deletedVenue, error: deleteError } = await supabase
      .from('venues')
      .delete()
      .eq('id', 'd40eff2a-c028-404d-b813-9c115040d18d')
      .select();

    if (deleteError) throw deleteError;

    console.log('✅ Zepp Tokyo (閉館済み) を削除しました');
    console.log('削除された会場:', deletedVenue);

    // 2. Zepp DiverCityを追加
    const zeppDiverCityData = {
      name: 'Zepp DiverCity (TOKYO)',
      name_kana: 'ゼップダイバーシティトウキョウ',
      area: 'お台場',
      address: '東京都江東区青海1-1-10 ダイバーシティ東京プラザ2F',
      capacity: 2473,
      official_url: 'https://www.zepp.co.jp/hall/divercity/',
      metadata: {
        genre: ['ロック', 'ポップス', 'アニメ', 'アイドル'],
        description: '大型ライブハウスチェーンZeppの東京拠点。スタンディング最大2,473人収容。',
        floor_info: {
          '1F': 'スタンディング 2,107人',
          '2F': 'スタンディング 366人',
          'seated': '着席時 1,102人'
        }
      }
    };

    const { data: newVenue, error: insertError } = await supabase
      .from('venues')
      .insert([zeppDiverCityData])
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('\n✅ Zepp DiverCity (TOKYO) を追加しました');
    console.log('新しい会場ID:', newVenue.id);
    console.log('会場名:', newVenue.name);
    console.log('住所:', newVenue.address);
    console.log('キャパシティ:', newVenue.capacity);

    console.log('\n🎉 Zeppライブハウスの差し替えが完了しました！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

replaceZeppVenue();