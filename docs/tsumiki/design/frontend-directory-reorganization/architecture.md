# フロントエンドディレクトリ再編成 アーキテクチャ設計

## システム概要

既存のフロントエンド構造を「app-common-model」パターンに基づく3層アーキテクチャに再編成し、コンテキスト依存度の可視化と関心による凝集度の向上を実現する。新規メンバーの理解容易性と保守性の向上を目指す。

## アーキテクチャパターン

- **パターン**: App-Common-Model 3層アーキテクチャ
- **理由**: 
  - コンテキスト依存度の段階的分離により、モジュール間の責任を明確化
  - ドメイン駆動設計（DDD）の考え方を取り入れた関心による凝集
  - Next.js App Router の構造と自然に統合

## コンテキスト依存度レベル定義

### 高コンテキスト依存度: app/
- **責任**: ページ固有のロジックとコンポーネント
- **特徴**: 特定のページやルートに強く結合
- **依存方向**: common ← model ← app

### 中コンテキスト依存度: model/
- **責任**: ドメインモデル固有のコンポーネント、フック、ロジック
- **特徴**: 特定のビジネスドメインに関心があるモジュール
- **依存方向**: common ← model

### 低コンテキスト依存度: common/
- **責任**: 汎用的なUI、ユーティリティ、共通ライブラリ
- **特徴**: ドメイン知識を持たない再利用可能なモジュール
- **依存方向**: 他層への依存禁止

## コンポーネント構成

### アプリケーション層 (app/)
```
app/
├── (authenticated)/          # 認証が必要なページ群
│   ├── dashboard/
│   │   ├── _components/     # ダッシュボード専用コンポーネント
│   │   ├── DashboardPage.tsx
│   │   └── page.tsx        # Next.js Page（SSR）
│   ├── routines/
│   │   ├── _components/
│   │   ├── RoutinesPage.tsx
│   │   └── page.tsx
│   └── settings/
├── (public)/               # 認証不要のページ群
│   ├── auth/
│   └── landing/
└── api/                   # API Routes（現行維持）
```

### 共通層 (common/)
```
common/
├── components/
│   ├── ui/                # shadcn/ui系基本コンポーネント
│   ├── layout/            # Header, Navigation, Layout
│   ├── filters/           # 汎用フィルタリングコンポーネント
│   ├── charts/            # 汎用チャート・可視化
│   └── mobile/            # モバイル対応共通コンポーネント
├── hooks/                 # 汎用カスタムフック
├── lib/                   # 汎用ライブラリ・ユーティリティ
├── types/                 # 汎用型定義
└── context/               # 汎用React Context
```

### モデル層 (model/)
```
model/
├── user/                  # ユーザードメイン
│   ├── components/        # ユーザー関連コンポーネント
│   ├── hooks/            # ユーザー関連カスタムフック
│   └── types.ts          # ユーザー型定義
├── routine/              # ルーティンドメイン
├── challenge/            # チャレンジドメイン
├── mission/              # ミッションドメイン
├── badge/                # バッジドメイン
├── gamification/         # ゲーミフィケーションドメイン
└── category/             # カテゴリドメイン
```

## ドメインモデル識別

### 特定されたドメインモデル
1. **user**: プロフィール、認証、設定
2. **routine**: ルーティン管理、実行記録
3. **challenge**: チャレンジシステム、参加管理
4. **mission**: ミッション進捗、目標管理
5. **badge**: バッジシステム、実績
6. **category**: カテゴリ管理
7. **gamification**: XP、レベル、通知、リーダーボード

### モデル間関係
- **user** → 他全モデルの基盤
- **routine** → **category**, **gamification**
- **challenge** → **gamification**
- **mission** → **gamification**
- **badge** → **gamification**

## フレームワーク・ライブラリ構成

### フロントエンド
- **フレームワーク**: Next.js 15 (App Router)
- **状態管理**: React Server Components + Client Components
- **UI**: shadcn/ui + Tailwind CSS
- **型システム**: TypeScript + Drizzle ORM Schema

### バックエンド
- **フレームワーク**: Next.js API Routes
- **認証方式**: Supabase Auth
- **データベース**: Supabase PostgreSQL
- **ORM**: Drizzle ORM

### 開発・テスト
- **Mock**: MSW (Mock Service Worker)
- **テスト**: Playwright E2E
- **ストーリー**: Storybook
- **バリデーション**: Zod + TypeScript

## 移行戦略

### 段階的移行アプローチ
1. **Phase 1**: ディレクトリ構造作成
2. **Phase 2**: 共通UIコンポーネント移行
3. **Phase 3**: ドメイン固有コンポーネント移行
4. **Phase 4**: フック・ユーティリティ移行
5. **Phase 5**: Import パス修正・検証

### 依存関係制約
- **禁止**: common → model, common → app
- **禁止**: app ↔ app (ページ間相互依存)
- **推奨**: model → common (一方向依存のみ)
- **必須**: 型定義はスキーマベース統一

## 品質保証

### 静的解析
- TypeScript strict mode
- ESLint アーキテクチャルール
- Import 順序・グループ化ルール

### テスト戦略
- Unit: 各モデルのロジック
- Integration: コンポーネント結合
- E2E: ページ全体の動作確認

### パフォーマンス
- Tree shaking 最適化
- Dynamic import 活用
- Bundle size モニタリング