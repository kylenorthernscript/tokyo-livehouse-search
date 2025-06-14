# Netlifyデプロイ手順

## 1. Netlifyアカウントでのセットアップ

### 方法1: Netlify CLIを使用（推奨）
```bash
# Netlify CLIをインストール
npm install -g netlify-cli

# Netlifyにログイン
netlify login

# プロジェクトをNetlifyにリンク
netlify init

# デプロイ
netlify deploy --prod
```

### 方法2: Netlifyダッシュボードから

1. [Netlify](https://app.netlify.com)にログイン
2. "Add new site" → "Import an existing project"
3. GitHubを選択して認証
4. `tokyo-livehouse-search`リポジトリを選択

## 2. ビルド設定

以下の設定が自動的に適用されます（netlify.tomlから）：

- **Base directory**: `nuxt-app/`
- **Build command**: `npm run build`
- **Publish directory**: `nuxt-app/.output/public`
- **Node version**: 18

## 3. 環境変数の設定

Netlifyダッシュボード → Site settings → Environment variables で以下を追加：

```
NUXT_PUBLIC_SUPABASE_URL=https://lvjwqlqdcbjegudoknnk.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

⚠️ **重要**: service_role_keyは公開サイトには設定しないでください（セキュリティリスク）

## 4. デプロイの確認

1. デプロイログを確認
2. サイトURLにアクセス（例: https://your-site.netlify.app）
3. 環境変数が正しく読み込まれているか確認

## トラブルシューティング

### ビルドエラーの場合
- Node.jsバージョンを確認（18以上が必要）
- 依存関係のインストールエラーを確認

### 404エラーの場合
- netlify.tomlのリダイレクト設定を確認
- SPAモードが正しく設定されているか確認

### 環境変数が読み込まれない場合
- 環境変数名が正しいか確認（NUXT_PUBLIC_プレフィックスが必要）
- デプロイ後に環境変数を変更した場合は再デプロイが必要

## カスタムドメイン設定（オプション）

1. Netlifyダッシュボード → Domain settings
2. "Add custom domain"をクリック
3. ドメインを入力してDNS設定を更新

## 継続的デプロイ

GitHubのmainブランチにプッシュすると自動的にデプロイされます。

### プレビューデプロイ
- プルリクエストを作成すると自動的にプレビューURLが生成されます
- ブランチごとに異なるプレビューURLが提供されます