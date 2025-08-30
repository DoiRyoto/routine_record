# プロジェクト構造

## ルートディレクトリ構成
```
routine_record/
├── .serena/               # Serena設定ファイル
├── .storybook/            # Storybook設定
├── .claude/               # Claude設定
├── .github/               # GitHub Actions等
├── .vscode/               # VS Code設定
├── docs/                  # ドキュメント
│   ├── design/            # 設計書
│   ├── tasks/             # タスク管理
│   ├── reverse/           # リバースエンジニアリング
│   └── rules/             # ルール・規約
├── drizzle/               # Drizzleマイグレーション
├── e2e/                   # E2Eテスト
├── public/                # 静的ファイル
├── scripts/               # スクリプト
├── src/                   # ソースコード
└── supabase/              # Supabase設定
```

## src/ ディレクトリ詳細

### Clean Architecture構成
```
src/
├── app/                   # Next.js App Router
│   ├── api/               # APIルート
│   ├── auth/              # 認証ページ
│   ├── dashboard/         # ダッシュボード
│   └── globals.css        # グローバルスタイル
├── components/            # UIコンポーネント
│   ├── ui/                # 基本UIコンポーネント
│   └── Layout/            # レイアウトコンポーネント
├── context/               # React Context
├── hooks/                 # カスタムフック
├── lib/                   # ユーティリティ・設定
│   ├── auth/              # 認証関連
│   ├── db/                # データベース関連
│   ├── utils/             # ユーティリティ
│   └── validation/        # バリデーション
├── mocks/                 # モックデータ
├── shared/                # 共有型・定数
├── types/                 # 型定義
└── __tests__/             # テストファイル
```

### Clean Architectureレイヤー
```
├── domain/                # ドメインレイヤー
│   ├── entities/          # エンティティ
│   │   ├── Routine.ts
│   │   ├── ExecutionRecord.ts
│   │   └── __tests__/
│   ├── valueObjects/      # 値オブジェクト
│   │   ├── RoutineId.ts
│   │   ├── UserId.ts
│   │   └── __tests__/
│   ├── repositories/      # リポジトリインターフェース
│   ├── services/          # ドメインサービス
│   └── exceptions/        # ドメイン例外
├── application/           # アプリケーションレイヤー
│   ├── usecases/          # ユースケース
│   ├── dtos/              # データ転送オブジェクト
│   └── __tests__/
├── infrastructure/        # インフラストラクチャレイヤー
│   └── repositories/      # リポジトリ実装
└── presentation/          # プレゼンテーションレイヤー
    └── controllers/       # コントローラー
```

## 重要ファイル

### 設定ファイル
- `package.json`: 依存関係・スクリプト定義
- `tsconfig.json`: TypeScript設定
- `eslint.config.mjs`: ESLint設定
- `.prettierrc.json`: Prettier設定
- `jest.config.js`: Jest設定
- `playwright.config.ts`: Playwright設定
- `drizzle.config.ts`: Drizzle設定
- `next.config.ts`: Next.js設定

### TDDファイル
- `tdd-requirements.md`: 要件定義
- `tdd-testcases.md`: テストケース
- `tdd-refactor.md`: リファクタリング記録
- `tdd-verify-complete.md`: 完了確認