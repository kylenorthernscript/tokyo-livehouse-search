import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const URL_FILE_PATH = join(__dirname, '..', 'data', 'venue-schedule-urls.json');

export class VenueURLManager {
  constructor() {
    this.data = null;
  }

  async loadData() {
    try {
      const fileContent = await fs.readFile(URL_FILE_PATH, 'utf-8');
      this.data = JSON.parse(fileContent);
      return this.data;
    } catch (error) {
      console.warn('URL管理ファイルの読み込みに失敗:', error.message);
      this.data = { venues: {}, metadata: {} };
      return this.data;
    }
  }

  async saveData() {
    try {
      this.data.metadata.updated_at = new Date().toISOString();
      const jsonString = JSON.stringify(this.data, null, 2);
      await fs.writeFile(URL_FILE_PATH, jsonString, 'utf-8');
      console.log('✅ URL管理ファイルを保存しました');
    } catch (error) {
      console.error('❌ URL管理ファイルの保存に失敗:', error);
      throw error;
    }
  }

  async addVenue(venueName, scheduleUrl, officialUrl, notes = '') {
    await this.loadData();
    
    this.data.venues[venueName] = {
      name: venueName,
      schedule_url: scheduleUrl,
      official_url: officialUrl,
      last_updated: new Date().toISOString(),
      notes: notes
    };

    await this.saveData();
    console.log(`✅ ${venueName} のURLを追加しました`);
  }

  async getVenue(venueName) {
    await this.loadData();
    return this.data.venues[venueName] || null;
  }

  async getAllVenues() {
    await this.loadData();
    return this.data.venues;
  }

  async updateVenue(venueName, updates) {
    await this.loadData();
    
    if (this.data.venues[venueName]) {
      this.data.venues[venueName] = {
        ...this.data.venues[venueName],
        ...updates,
        last_updated: new Date().toISOString()
      };
      await this.saveData();
      console.log(`✅ ${venueName} の情報を更新しました`);
    } else {
      throw new Error(`会場 ${venueName} が見つかりません`);
    }
  }

  async removeVenue(venueName) {
    await this.loadData();
    
    if (this.data.venues[venueName]) {
      delete this.data.venues[venueName];
      await this.saveData();
      console.log(`✅ ${venueName} を削除しました`);
    } else {
      throw new Error(`会場 ${venueName} が見つかりません`);
    }
  }

  async listVenues() {
    await this.loadData();
    
    console.log('=== 登録済み会場一覧 ===');
    Object.values(this.data.venues).forEach((venue, index) => {
      console.log(`${index + 1}. ${venue.name}`);
      console.log(`   スケジュールURL: ${venue.schedule_url}`);
      console.log(`   公式URL: ${venue.official_url}`);
      console.log(`   最終更新: ${venue.last_updated}`);
      if (venue.notes) {
        console.log(`   備考: ${venue.notes}`);
      }
      console.log('');
    });
  }
}

// 使用例
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new VenueURLManager();
  await manager.listVenues();
}