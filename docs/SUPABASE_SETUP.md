# Supabase セットアップガイド

## Service Role Keyの取得方法

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. プロジェクトを選択
3. 左サイドバーの「Settings」をクリック
4. 「API」セクションを選択
5. 「Service Role Key」をコピー（`service_role` secret）

## 環境変数の設定

`nuxt-app/.env`ファイルに以下を追加：

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## RLSポリシーの更新（推奨）

セキュリティを保ちながら、スクリプトからのデータ挿入を可能にする方法：

### 方法1: Supabase Dashboard でポリシーを更新

1. Supabase Dashboardにログイン
2. 「Authentication」→「Policies」を選択
3. 各テーブルのINSERTポリシーを編集
4. 以下のSQLを実行：

```sql
-- RLSポリシーの更新SQLを実行
-- ファイル: supabase/migrations/20240618_update_rls_policies.sql
```

### 方法2: SQLエディタで直接実行

1. Supabase DashboardのSQL Editorを開く
2. `supabase/migrations/20240618_update_rls_policies.sql`の内容をコピー
3. 実行

## セキュリティの考慮事項

- Service Role Keyは**絶対に**フロントエンドコードに含めない
- バックエンドスクリプトやサーバーサイドでのみ使用
- 本番環境では、より厳格なRLSポリシーを設定することを推奨