import axios from 'axios';
import * as cheerio from 'cheerio';

async function testShelterScraping() {
  try {
    console.log('=== 下北沢SHELTER スケジュール構造テスト ===\n');

    // スケジュールページからデータを取得
    const response = await axios.get('https://www.loft-prj.co.jp/schedule/shelter', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    console.log(`✅ ページ取得成功 (${response.status})`);
    console.log(`📄 コンテンツサイズ: ${response.data.length} bytes`);

    const $ = cheerio.load(response.data);
    
    // ページ構造を確認
    console.log('\n=== HTML構造解析 ===');
    
    // スケジュール要素を検索
    const scheduleElements = $('.schedule');
    console.log(`🔍 .schedule 要素: ${scheduleElements.length}個`);
    
    const scheduleList = $('.schedule-list');
    console.log(`🔍 .schedule-list 要素: ${scheduleList.length}個`);
    
    const scheduleItems = $('.schedule-item');
    console.log(`🔍 .schedule-item 要素: ${scheduleItems.length}個`);

    // 別のセレクターも試す
    const events = $('.event');
    console.log(`🔍 .event 要素: ${events.length}個`);
    
    const items = $('.item');
    console.log(`🔍 .item 要素: ${items.length}個`);
    
    // 日付らしい要素を探す
    const dates = $('[class*="date"], [class*="Date"]');
    console.log(`🔍 日付系クラス要素: ${dates.length}個`);
    
    // テーブル構造を確認
    const tables = $('table');
    console.log(`🔍 table 要素: ${tables.length}個`);
    
    const trs = $('tr');
    console.log(`🔍 tr 要素: ${trs.length}個`);

    // より具体的にHTMLの内容を確認
    console.log('\n=== ページ内容サンプル ===');
    
    // ヘッダー情報
    const title = $('title').text();
    console.log(`📋 ページタイトル: ${title}`);
    
    // bodyの最初の部分を確認
    const bodyText = $('body').text().slice(0, 500);
    console.log(`📝 body内容（最初の500文字）:\n${bodyText.replace(/\s+/g, ' ').trim()}`);

    // 実際のスケジュール情報を探索
    console.log('\n=== スケジュール情報探索 ===');
    
    // 年月日を含むテキストを探す
    const currentYear = new Date().getFullYear();
    const textWithDates = $('*').filter(function() {
      const text = $(this).text();
      return text.includes(currentYear.toString()) && 
             text.match(/\d{1,2}月|\d{1,2}\/\d{1,2}|\d{4}[\s\-\/]\d{1,2}[\s\-\/]\d{1,2}/);
    });
    
    console.log(`🔍 日付を含む要素: ${textWithDates.length}個`);
    
    if (textWithDates.length > 0) {
      textWithDates.slice(0, 5).each((i, el) => {
        const $el = $(el);
        const text = $el.text().replace(/\s+/g, ' ').trim();
        console.log(`  ${i + 1}. [${el.tagName}${$el.attr('class') ? '.' + $el.attr('class') : ''}] ${text.slice(0, 100)}`);
      });
    }

    return {
      success: true,
      contentLength: response.data.length,
      scheduleElements: scheduleElements.length,
      eventElements: events.length,
      dateElements: dates.length,
      tableElements: tables.length
    };

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.log('💡 ネットワーク接続を確認してください');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 タイムアウトしました。しばらく後に再試行してください');
    }
    return { success: false, error: error.message };
  }
}

testShelterScraping()
  .then(result => {
    if (result.success) {
      console.log('\n🎉 スクレイピングテスト完了');
    } else {
      console.log('\n💥 スクレイピングテスト失敗');
    }
  })
  .catch(error => {
    console.error('\n💥 スクリプト実行エラー:', error);
  });