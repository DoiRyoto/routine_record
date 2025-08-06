# Supabase + Drizzle セットアップガイド

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト設定から以下の情報を取得：
   - Project URL
   - Project API Key (anon key)
   - Service Role Key
   - Database URL

## 2. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database
DATABASE_URL=your_supabase_database_url_here
```

## 3. データベーススキーマの適用

### 方法1: Drizzle Push (開発用)

```bash
npm run db:push
```

### 方法2: マイグレーション生成 (本番用)

```bash
# マイグレーションファイル生成
npm run db:generate

# マイグレーション実行
npm run db:migrate
```

## 4. Drizzle Studio でデータベース確認

```bash
npm run db:studio
```

ブラウザで `https://local.drizzle.studio` が開きます。

## 5. セットアップ確認

1. Supabaseダッシュボードでテーブルが作成されているか確認
2. 以下のテーブルが存在することを確認：
   - `routines`
   - `execution_records`
   - `user_settings`

## 6. 利用可能なスクリプト

- `npm run db:generate` - マイグレーションファイル生成
- `npm run db:migrate` - マイグレーション実行
- `npm run db:push` - スキーマをデータベースに直接適用
- `npm run db:studio` - Drizzle Studio起動

## 注意事項

- 開発時は `npm run db:push` を使用
- 本番環境では必ずマイグレーションを使用
- `.env.local` ファイルはGitにコミットしない
- サービスロールキーは厳重に管理する
