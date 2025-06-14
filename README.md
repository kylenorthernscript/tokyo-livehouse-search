# Tokyo Livehouse Search

東京のライブハウスとそこで行われる公演を一括検索できるWebアプリケーション

## プロジェクト構成

```
tokyo-livehouse-search/
├── supabase/              # Supabaseバックエンド
│   ├── migrations/        # データベーススキーマ
│   └── functions/         # Edge Functions（スクレイピング機能）
└── client/                # Next.jsフロントエンド（要作成）
```

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトURLとAPIキーを取得

### 2. データベースの初期化

```bash
# Supabase CLIでリモートプロジェクトにリンク
npx supabase link --project-ref your-project-ref

# マイグレーションを実行
npx supabase db push
```

### 3. 環境変数の設定

`.env.example`を`.env.local`にコピーして、Supabaseの認証情報を設定：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. クライアントアプリの作成

```bash
# Next.jsアプリケーションを作成
npx create-next-app@latest client --typescript --tailwind --app

# 依存関係をインストール
cd client
npm install @supabase/supabase-js
```

## 使用方法

### サンプルデータの投入

```javascript
// サンプルのライブハウスデータ
const sampleVenue = {
  name: "LIQUIDROOM",
  name_kana: "リキッドルーム",
  area: "恵比寿",
  address: "東京都渋谷区東3-16-6",
  capacity: 900,
  official_url: "https://www.liquidroom.net/",
  scraping_config: {
    url: "https://www.liquidroom.net/schedule",
    selectors: {
      eventContainer: ".schedule-list",
      title: ".event-title",
      date: ".event-date",
      artists: ".artist-name"
    }
  }
}
```

### Edge Functionの呼び出し

```javascript
// スクレイピング関数を実行
const { data, error } = await supabase.functions.invoke('scrape-venue', {
  body: { venue_id: 'venue-uuid' }
})
```

## 今後の実装予定

- [ ] クライアントUIの実装
- [ ] 検索・フィルタリング機能
- [ ] ユーザー投稿機能
- [ ] スクレイピングの自動実行（cron）
- [ ] より多くのライブハウス対応