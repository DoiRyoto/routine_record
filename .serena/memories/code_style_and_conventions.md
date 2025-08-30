# コードスタイル・規約

## TypeScript設定
- **厳密モード**: strict: true
- **デコレータサポート**: experimentalDecorators, emitDecoratorMetadata有効
- **パスエイリアス**: `@/*` → `./src/*`
- **ターゲット**: ES2017

## ESLint規約

### TypeScript
- `@typescript-eslint/no-unused-vars`: warn (アンダースコア始まりは無視)
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-non-null-assertion`: off (開発時は許可)
- `@typescript-eslint/ban-ts-comment`: warn

### React
- `react/react-in-jsx-scope`: off (Next.js 13+では不要)
- `react/prop-types`: off (TypeScriptを使用)
- `react/display-name`: warn
- `react/jsx-key`: warn

## Prettier設定
- **セミコロン**: あり
- **シングルクォート**: 使用
- **印刷幅**: 100文字
- **タブ幅**: 2スペース
- **末尾カンマ**: ES5準拠
- **改行コード**: LF

## ファイル構成規約

### ディレクトリ構造
```
src/
├── app/                 # Next.js App Router
├── components/          # UIコンポーネント
├── domain/             # ドメインレイヤー
│   ├── entities/       # エンティティ
│   ├── valueObjects/   # 値オブジェクト
│   └── repositories/   # リポジトリインターフェース
├── application/        # アプリケーションレイヤー
│   ├── usecases/       # ユースケース
│   └── dtos/          # データ転送オブジェクト
├── infrastructure/     # インフラストラクチャレイヤー
├── presentation/       # プレゼンテーションレイヤー
└── lib/               # ユーティリティ・設定
```

## 命名規約
- **コンポーネント**: PascalCase (`UserProfile.tsx`)
- **ファイル**: kebab-case (`user-profile.ts`)
- **変数・関数**: camelCase
- **定数**: UPPER_SNAKE_CASE
- **型・インターフェース**: PascalCase

## コメント規約
- 日本語コメント使用
- ビジネスロジックの説明を重視
- 型情報で自明な内容はコメント不要