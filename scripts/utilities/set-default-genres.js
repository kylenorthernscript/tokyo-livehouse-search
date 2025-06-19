import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', 'nuxt-app', '.env') });

const supabase = createClient(
  process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
);

function playNotification() {
  try {
    const { execSync } = require('child_process');
    execSync('osascript -e "say \\"確認が必要です\\""');
  } catch (error) {
    console.log('🔔');
  }
}

function playCompletion() {
  // 完了音を無効化
}

const defaultGenres = {
  'Crawfish': ['jazz'],
  'LIQUIDROOM': ['electronic', 'rock'],
  'SHIBUYA VIDENT': ['rock', 'pop'],
  'Twinbox AKIHABARA': ['pop', 'electronic'],
  'Zepp DiverCity (TOKYO)': ['rock', 'pop'],
  '下北沢SHELTER': ['rock', 'world']
};

async function confirmAction(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    playNotification();
    rl.question(`${message} (Y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer === '');
    });
  });
}

async function setDefaultGenres() {
  try {
    console.log('=== ライブハウス デフォルトジャンル設定 ===\n');

    const { data: venues, error } = await supabase
      .from('venues')
      .select('*')
      .order('name');

    if (error) throw error;

    console.log('現在の登録会場とジャンル:');
    venues.forEach((venue, index) => {
      const currentGenres = venue.metadata?.genre || [];
      const proposedGenres = defaultGenres[venue.name] || [];
      console.log(`${index + 1}. ${venue.name}`);
      console.log(`   現在: ${currentGenres.length > 0 ? currentGenres.join(', ') : 'なし'}`);
      console.log(`   設定予定: ${proposedGenres.join(', ')}`);
      console.log('');
    });

    const proceed = await confirmAction('デフォルトジャンルを設定しますか？');
    if (!proceed) {
      console.log('キャンセルしました。');
      return;
    }

    console.log('\n=== ジャンル設定開始 ===\n');

    for (const venue of venues) {
      const proposedGenres = defaultGenres[venue.name];
      
      if (!proposedGenres) {
        console.log(`⚠️  ${venue.name} のデフォルトジャンルが定義されていません。スキップします。`);
        continue;
      }

      const currentMetadata = venue.metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        genre: proposedGenres
      };

      const { error: updateError } = await supabase
        .from('venues')
        .update({ metadata: updatedMetadata })
        .eq('id', venue.id);

      if (updateError) {
        console.error(`❌ ${venue.name} の更新に失敗:`, updateError);
        continue;
      }

      console.log(`✅ ${venue.name}: ${proposedGenres.join(', ')}`);
    }

    console.log('\n=== 更新後の確認 ===\n');

    const { data: updatedVenues, error: checkError } = await supabase
      .from('venues')
      .select('*')
      .order('name');

    if (checkError) throw checkError;

    updatedVenues.forEach((venue, index) => {
      const genres = venue.metadata?.genre || [];
      console.log(`${index + 1}. ${venue.name}: ${genres.join(', ')}`);
    });

    console.log('\n🎉 デフォルトジャンル設定完了！');
    playCompletion();

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

setDefaultGenres();