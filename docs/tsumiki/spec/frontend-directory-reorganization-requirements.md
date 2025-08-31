# フロントエンドディレクトリ構成再編成要件定義書

## 概要

既存のフロントエンドディレクトリ構成を「app-common-model」パターンに基づく新しい構成に再編成し、コンテキスト依存度を下げ、新規メンバーにも理解しやすいプロジェクト構造を実現する。

## ユーザーストーリー

### ストーリー1: 新規メンバーの開発効率向上

- **である** 新規参加開発者 **として**
- **私は** コードベースの構造を直感的に理解し、新しいモジュールの配置場所を迷わずに決定 **したい**
- **そうすることで** プロジェクトへの貢献を迅速に開始でき、既存メンバーの負担を軽減できる

### ストーリー2: 関心による凝集度の向上

- **である** アプリケーション開発者 **として**
- **私は** 同じドメインモデルに関心のあるコードを一箇所にまとめて管理 **したい**
- **そうすることで** 機能拡張時の影響範囲を把握しやすく、保守性の高いコードベースを維持できる

### ストーリー3: コンテキスト依存度の可視化

- **である** コードレビュー担当者 **として**
- **私は** import文を見ることでモジュールのコンテキスト依存度を把握 **したい**
- **そうすることで** アーキテクチャの健全性を評価し、適切な設計指導を行える

## 機能要件（EARS記法）

### 通常要件

- REQ-001: システムは src ディレクトリ配下を app-common-model の3層構成で整理しなければならない
- REQ-002: システムは既存の server ディレクトリ配下のクリーンアーキテクチャ構造を維持しなければならない
- REQ-003: システムは各ドメインモデルに対応するディレクトリを model 配下に作成しなければならない
- REQ-004: システムは共通的に使用されるUIコンポーネントを common/components 配下に配置しなければならない
- REQ-005: システムは既存のMSWモックシステムの動作を維持しなければならない

### 条件付き要件

- REQ-101: ドメインモデルに直接関心があるモジュールを配置する場合、システムは該当モデルのディレクトリ配下に配置しなければならない
- REQ-102: 複数のページで使用されるコンポーネントの場合、システムは common/components 配下に配置しなければならない
- REQ-103: 特定のページでのみ使用されるモジュールの場合、システムは app/[page]/_components 配下に配置しなければならない
- REQ-104: ドメインモデルに関心がない汎用的なモジュールの場合、システムは common 配下の適切なカテゴリに配置しなければならない

### 状態要件

- REQ-201: import文が同一コンテキスト依存度レベル内にある場合、システムは適切にグループ化された順序で記述しなければならない
- REQ-202: 型定義がスキーマベースで統一されている場合、システムはその整合性を維持しなければならない

### オプション要件

- REQ-301: システムは各モデルディレクトリに README.md を配置してもよい
- REQ-302: システムは common/lib 配下でサードパーティライブラリの再エクスポートを行ってもよい

### 制約要件

- REQ-401: システムは common から model や app への依存を持ってはならない
- REQ-402: システムは app から app 内の他のページへの依存を持ってはならない  
- REQ-403: システムはモデル間の相互依存を避け、一方向依存のみを許可しなければならない
- REQ-404: システムは既存の API エンドポイントの動作に影響を与えてはならない

## 新ディレクトリ構成定義

### 第一階層設計
```
src/
├── app/                    # App Router（ページ固有のモジュール）
├── common/                 # 汎用モジュール（低コンテキスト依存度）
├── model/                  # ドメインモデル別モジュール（中コンテキスト依存度）
└── server/                 # 既存のサーバーサイドコード（維持）
```

### ドメインモデル識別結果

現在のシステムで識別されるドメインモデル：
- **user**: ユーザープロフィール、認証関連
- **routine**: ルーティン管理、実行記録
- **challenge**: チャレンジシステム
- **mission**: ミッションシステム、進捗管理
- **badge**: バッジシステム、実績
- **category**: カテゴリ管理
- **gamification**: XP、レベル、通知システム

### 詳細構成

```
src/
├── app/
│   ├── (authenticated)/
│   │   ├── dashboard/
│   │   │   ├── _components/        # ダッシュボード専用コンポーネント
│   │   │   ├── DashboardPage.tsx
│   │   │   └── page.tsx
│   │   ├── routines/
│   │   └── [other-pages]/
│   ├── (public)/
│   ├── api/                        # API Routes（維持）
│   └── layout.tsx
│
├── common/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui系コンポーネント
│   │   ├── layout/                 # Header, Layout等
│   │   ├── filters/                # 汎用フィルター
│   │   └── charts/                 # 汎用チャート
│   ├── hooks/                      # 汎用カスタムフック
│   ├── lib/                        # 汎用ライブラリ
│   │   ├── date.ts                 # date-fns再エクスポート
│   │   ├── guard.ts                # remeda再エクスポート
│   │   └── validation.ts           # バリデーションユーティリティ
│   ├── types/                      # 汎用型定義
│   └── utils/                      # 汎用ユーティリティ
│
├── model/
│   ├── user/
│   │   ├── components/
│   │   │   ├── avatar/             # UserAvatarコンポーネント群
│   │   │   └── profile/            # プロフィール関連コンポーネント
│   │   ├── hooks/                  # ユーザー関連カスタムフック
│   │   └── types.ts                # ユーザー関連型定義
│   │
│   ├── routine/
│   │   ├── components/
│   │   │   ├── form/               # RoutineFormコンポーネント群
│   │   │   ├── list/               # RoutineListコンポーネント群
│   │   │   └── item/               # RoutineItemコンポーネント群
│   │   ├── hooks/
│   │   │   ├── useCompleteRoutine.ts
│   │   │   └── useRoutines.ts
│   │   └── lib/                    # ルーティン固有ロジック
│   │
│   ├── challenge/
│   │   ├── components/
│   │   │   └── item/               # ChallengeItemコンポーネント群
│   │   └── hooks/
│   │
│   ├── mission/
│   │   ├── components/
│   │   └── lib/                    # ミッション計算ロジック
│   │
│   ├── badge/
│   │   ├── components/
│   │   │   └── collection/         # BadgeCollectionコンポーネント群
│   │   └── types.ts
│   │
│   ├── gamification/
│   │   ├── components/
│   │   │   ├── level/              # LevelProgressBarコンポーネント群
│   │   │   ├── xp/                 # XP関連コンポーネント群
│   │   │   ├── streak/             # StreakDisplayコンポーネント群
│   │   │   └── leaderboard/        # Leaderboardコンポーネント群
│   │   ├── hooks/
│   │   └── lib/                    # ゲーミフィケーション計算ロジック
│   │
│   └── category/
│       ├── components/
│       └── hooks/
│
├── server/                         # 既存構造維持
│   ├── application/
│   ├── domain/
│   └── lib/
│
├── shared/                         # 既存維持（フロント・バック共通）
└── mocks/                          # 既存MSWシステム維持
```

## 移行要件

### 段階的移行戦略

#### フェーズ1: ディレクトリ構造作成
- MIGRATION-001: app-common-model の基本ディレクトリ構造を作成する
- MIGRATION-002: 各ドメインモデルディレクトリを model 配下に作成する
- MIGRATION-003: common 配下の基本カテゴリディレクトリを作成する

#### フェーズ2: UIコンポーネント移行
- MIGRATION-101: src/components/ui 配下を common/components/ui に移行する
- MIGRATION-102: src/components/Layout 配下を common/components/layout に移行する
- MIGRATION-103: src/components/filters 配下を common/components/filters に移行する
- MIGRATION-104: src/components/charts 配下を common/components/charts に移行する

#### フェーズ3: ドメイン固有コンポーネント移行
- MIGRATION-201: src/components/gamification 配下を model/gamification/components に移行する
- MIGRATION-202: src/components/settings 配下を適切なモデルディレクトリまたは common に移行する
- MIGRATION-203: src/components/execution-records 配下を model/routine/components に移行する
- MIGRATION-204: src/components/mobile 配下を common/components/mobile に移行する

#### フェーズ4: フック・ユーティリティ移行
- MIGRATION-301: src/hooks 配下を適切なモデルまたは common/hooks に移行する
- MIGRATION-302: src/utils 配下を common/lib または適切なモデルに移行する
- MIGRATION-303: src/context 配下を common/context に移行する

#### フェーズ5: import文修正・検証
- MIGRATION-401: 全ファイルの import パス修正を実行する
- MIGRATION-402: TypeScript 型チェック実行で整合性確認する
- MIGRATION-403: MSW モックシステムの動作確認を実行する
- MIGRATION-404: E2E テストの動作確認を実行する

### 依存関係ルール違反検出

- VIOLATION-001: common から model/app への import を検出し修正する
- VIOLATION-002: app 間の相互 import を検出し修正する
- VIOLATION-003: model 間の相互依存を検出し一方向依存に修正する

## Edgeケース

### エラー処理

- EDGE-001: import パス変更によるビルドエラーが発生した場合
  - 段階的に import パス修正を実行し、都度 TypeScript 型チェックで確認
  - エラー発生時は該当ファイルのみロールバックし、問題を分析

- EDGE-002: MSW モックシステムが動作しなくなった場合
  - mocks ディレクトリの移行は最後に実施
  - 既存のパス参照を維持し、段階的に新構造への移行を実行

- EDGE-003: Storybook の動作に影響した場合
  - .storybook/main.ts の path mapping 設定を更新
  - コンポーネント移行時に対応する Story ファイルも同時移行

### 境界値

- EDGE-101: コンポーネントが複数モデルに跨がる場合
  - 主要な関心モデルを特定し、そのモデル配下に配置
  - 他モデルからの参照は import で対応

- EDGE-102: 汎用性が曖昧なモジュールの場合
  - 一旦 common 配下に配置
  - 使用状況の観察後、適切なモデルへの移行を検討

### パフォーマンス

- EDGE-201: import パス変更による bundle size への影響
  - Tree shaking が適切に動作することを確認
  - 必要に応じて dynamic import の使用を検討

## 受け入れ基準

### 機能テスト

- [ ] 全ページが正常に表示される
- [ ] API エンドポイントが正常に動作する
- [ ] MSW モックシステムが正常に動作する
- [ ] Storybook が正常に表示される
- [ ] 認証機能が正常に動作する
- [ ] ルーティン作成・編集機能が正常に動作する
- [ ] チャレンジ参加機能が正常に動作する
- [ ] ゲーミフィケーション要素（XP、レベルアップ等）が正常に動作する

### 非機能テスト

- [ ] TypeScript 型チェックでエラーが0個である
- [ ] ESLint でエラー・警告が0個である
- [ ] E2E テストが全て pass する
- [ ] ビルド時間が移行前と同等またはそれ以下である
- [ ] バンドルサイズが移行前と同等またはそれ以下である

### アーキテクチャテスト

- [ ] common から model/app への依存が存在しない
- [ ] app 間の相互依存が存在しない
- [ ] model 間の相互依存が存在しない（一方向依存のみ）
- [ ] import文が コンテキスト依存度順にグループ化されている
- [ ] 各モデルディレクトリに適切な責任範囲のモジュールのみが配置されている

### ドキュメンテーション

- [ ] 新ディレクトリ構成の説明ドキュメントが作成されている
- [ ] 移行手順書が作成されている
- [ ] import パス規則が docs/rules/frontend.md に記載されている
- [ ] 依存関係ルールが明文化されている

## 移行後の期待効果

### 開発効率向上

1. **新規メンバーのオンボーディング時間短縮**
   - ディレクトリ構造から責任範囲が直感的に理解できる
   - 新しいモジュールの配置場所が明確

2. **機能拡張時の影響範囲把握容易**
   - モデル単位での影響範囲分析が可能
   - 関連コンポーネントが一箇所に集約

3. **コードレビュー効率向上**
   - import文でコンテキスト依存度が可視化
   - アーキテクチャ違反の早期発見

### 保守性向上

1. **関心による高凝集の実現**
   - 同一ドメインモデル関連コードの一元化
   - 機能追加時の散在防止

2. **低結合の促進**
   - 明確な依存関係ルール
   - インターフェイス設計の意識向上

3. **技術負債の抑制**
   - 一貫したディレクトリ構成ルール
   - リファクタリング方針の明確化

### 品質向上

1. **型安全性の向上**
   - スキーマベース型定義の徹底
   - TypeScript エラーの組織的解決

2. **テスタビリティ向上**
   - モデル単位でのテスト構造化
   - モックデータの一元管理

3. **パフォーマンス最適化**
   - Tree shaking の効果最大化
   - 不要な依存関係の削減