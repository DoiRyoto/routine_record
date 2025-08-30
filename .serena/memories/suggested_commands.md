# 推奨コマンド一覧

## 開発サーバー
```bash
npm run dev                 # 開発サーバー起動 (localhost:3000)
npm run build              # プロダクションビルド
npm start                  # プロダクションサーバー起動
```

## コード品質管理
```bash
npm run lint               # ESLint実行
npm run lint:fix           # ESLint自動修正
npm run lint:strict        # 警告0で厳密チェック
npm run format             # Prettier実行
npm run format:check       # Prettier チェックのみ
npm run type-check         # TypeScriptタイプチェック
npm run quality            # 全品質チェック統合
```

## データベース操作
```bash
npm run db:generate        # Drizzleスキーマ生成
npm run db:migrate         # マイグレーション実行
npm run db:push            # スキーマをDBにプッシュ
npm run db:studio          # Drizzle Studio起動
npm run db:seed            # 初期データ投入
```

## テスト
```bash
npm test                   # Jest全テスト実行
npm run test:watch         # Jest ウォッチモード
npm run test:coverage      # カバレッジ付きテスト
npm run test:unit          # ユニットテストのみ
npm run test:e2e           # E2Eテスト実行
npm run test:e2e:ui        # E2EテストUI表示
npm run test:e2e:debug     # E2Eテストデバッグ
```

## Storybook
```bash
npm run storybook          # Storybook開発サーバー
npm run build-storybook    # Storybookビルド
```

## 一般的なシステムコマンド (macOS)
```bash
ls -la                     # ファイル一覧表示
find . -name "*.ts"        # TypeScriptファイル検索
grep -r "検索文字列"        # ファイル内容検索
git status                 # Git状態確認
git add .                  # 全変更をステージング
git commit -m "メッセージ"  # コミット
```

## タスク完了時に実行すべきコマンド
1. `npm run type-check` - TypeScript型チェック
2. `npm run lint:strict` - 厳密なリント
3. `npm run format:check` - フォーマットチェック
4. `npm test` - ユニットテスト実行
5. `npm run test:e2e` - E2Eテスト実行（必要に応じて）