# フロントエンド実装ルール遵守リファクタリング 要件定義書

## 概要

現在のコードベースには多数のフロントエンド実装ルール違反が存在している。本要件は、すべてのコードを既定のルールに従って完全にリファクタリングし、品質基準を満たすことを目的とする。

## ユーザストーリー

### ストーリー1: 開発者としてのコード品質向上

- **である** 開発者 **として**
- **私は** 全てのコードがフロントエンド実装ルールに準拠していることを確認したい
- **そうすることで** 保守性が高く、一貫性のあるコードベースを維持できる

### ストーリー2: 品質チェック担当者としての基準遵守確認

- **である** 品質チェック担当者 **として**
- **私は** TypeScript型安全性、スタイリングルール、アーキテクチャ分離が正しく実装されていることを確認したい
- **そうすることで** プロダクトの品質と開発効率を向上させることができる

## 機能要件（EARS記法）

### 通常要件

- REQ-001: システムは全てのTailwindカラー指定を `text-text-*` および `bg-bg-*` パターンに変更しなければならない
- REQ-002: システムは `@/types/*` からのimportを `@/lib/db/schema` からのimportに置換しなければならない
- REQ-003: システムはPage Componentsから直接データベースクエリの呼び出しを除去しなければならない
- REQ-004: システムは全てのMockデータを対応するスキーマ型と完全一致させなければならない
- REQ-005: システムはNext.js 15のparams処理をPromise型に対応させなければならない
- REQ-006: システムはNext.js App Routerのコロケーション原則に従ったディレクトリ構成に変更しなければならない
- REQ-007: システムはフロントエンド層とバックエンド層を明確に分離しなければならない

### 条件付き要件

- REQ-101: 直接的なカラー指定（`text-black`, `bg-white` 等）が発見された場合、システムは統一されたカラーパターンに置換しなければならない
- REQ-102: `@ts-ignore` または `@ts-expect-error` コメントが存在する場合、システムは適切な型定義による根本的解決を実装しなければならない
- REQ-103: Page ComponentでDB queryの直接importが検出された場合、システムはAPI Routes経由のデータ取得に変更しなければならない
- REQ-104: TypeScriptエラーが発生した場合、システムは型アサーションではなく適切な型定義修正で解決しなければならない
- REQ-105: 関連するコンポーネント・スタイル・テストファイルが分散している場合、システムはコロケーション原則に従って再配置しなければならない
- REQ-106: フロントエンドとバックエンドのコードが混在している場合、システムは明確な境界を設けて分離しなければならない

### 状態要件

- REQ-201: 実装完了状態にある場合、システムは `npm run type-check` が全てパスしなければならない
- REQ-202: 実装完了状態にある場合、システムは `npm run lint` でエラー・警告が0個でなければならない
- REQ-203: MSW Mock使用状態にある場合、システムはエラー時にMockデータを返してはならない

### オプション要件

- REQ-301: システムは段階的な型エラー解決のため、主要エラーから順次修正してもよい
- REQ-302: システムは効率化のため、複数ファイルの同一パターン修正を並行実行してもよい

### 制約要件

- REQ-401: システムは既存の機能を破損させることなくリファクタリングしなければならない
- REQ-402: システムはMSWの使用を開発時のAPI interceptのみに制限しなければならない
- REQ-403: システムは型安全性を維持しながらリファクタリングを実行しなければならない

## 非機能要件

### パフォーマンス

- NFR-001: リファクタリング後もアプリケーションのパフォーマンスを維持すること
- NFR-002: 型チェック処理は合理的な時間内（5分以内）で完了すること

### セキュリティ

- NFR-101: 認証が必要な処理は適切にServer Actions経由で実行されること
- NFR-102: 機密情報がフロントエンドに露出しないこと

### ユーザビリティ

- NFR-201: 既存のUI/UX動作を変更せずにリファクタリングすること
- NFR-202: エラー表示とユーザーフレンドリーなメッセージを維持すること

### 保守性

- NFR-301: コードの一貫性と可読性を向上させること
- NFR-302: 将来的な変更に対する柔軟性を確保すること

## Edgeケース

### エラー処理

- EDGE-001: 型変換エラーが発生した場合の段階的解決手順
- EDGE-002: Mock データとスキーマの不整合が発生した場合の修正優先順位
- EDGE-003: API Routes変更時のフロントエンド影響範囲の特定と対応

### 境界値

- EDGE-101: 大量ファイルの一括変更時のメモリ使用量制限
- EDGE-102: 複雑な型定義ファイルでの段階的修正アプローチ

### 互換性

- EDGE-201: Next.js 15移行に伴う破壊的変更への対応
- EDGE-202: 既存コンポーネントの props 型変更時の影響範囲

## 実装手順

### フェーズ1: アーキテクチャ再設計
1. Next.js App Routerコロケーション原則に基づくディレクトリ構成変更
2. フロントエンド・バックエンド層の明確な分離
3. 関連ファイルの適切なコロケーション実施

### フェーズ2: 基盤修正
4. Tailwindカラーパターン統一
5. 型システム統一（`@/types/*` → `@/lib/db/schema`）
6. Page ComponentsからDB直接アクセス除去

### フェーズ3: 型安全性確保
7. Mock データ型整合性修正
8. Next.js 15 対応
9. TypeScript厳格ルール適用

### フェーズ4: 品質保証
10. 全 `@ts-ignore` 系コメント除去
11. type-check 完全パス
12. lint エラー・警告ゼロ達成

## 受け入れ基準

### 機能テスト

- [ ] 全ページで既存機能が正常に動作する
- [ ] データ取得・更新処理が正常に実行される
- [ ] 認証フローが適切に機能する
- [ ] ルーティング・ナビゲーションが正常に動作する

### 非機能テスト

- [ ] `npm run type-check` がエラーなく完了する
- [ ] `npm run lint` でエラー・警告が0個である
- [ ] `npm run test:e2e` で基本シナリオがパスする
- [ ] ビルド処理 (`npm run build`) が成功する

### コード品質テスト

- [ ] 全てのTailwindカラー指定が `text-text-*` / `bg-bg-*` パターンである
- [ ] `@/types/*` からのimportが存在しない
- [ ] Page Componentsから直接DB queryのimportが存在しない
- [ ] `@ts-ignore` / `@ts-expect-error` コメントが存在しない
- [ ] Mock データが対応スキーマ型と一致している
- [ ] Next.js App Routerコロケーション原則に従ったディレクトリ構成になっている
- [ ] 関連ファイル（コンポーネント・テスト・型定義）が適切に配置されている
- [ ] フロントエンド・バックエンド層が明確に分離されている

### セキュリティテスト

- [ ] 認証が必要な処理がServer Actions経由で実行される
- [ ] API Routes経由でのデータ取得が正常に機能する
- [ ] 機密情報のフロントエンド露出がない

## 新しいディレクトリ構成

### Next.js App Routerコロケーション原則に基づく構成

```
src/
├── app/                           # Next.js App Router
│   ├── (authenticated)/           # Private Route Group
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Dashboard Page
│   │   │   ├── _components/       # Dashboard固有コンポーネント
│   │   │   ├── _hooks/            # Dashboard固有フック
│   │   │   └── _types/            # Dashboard固有型定義
│   │   ├── routines/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   │   ├── page.tsx
│   │   │   │   └── _components/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── edit/
│   │   │   │   └── _components/
│   │   │   └── _components/       # Routines共通コンポーネント
│   │   └── ...other routes
│   ├── (public)/                  # Public Route Group
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   └── landing/
│   ├── api/                       # API Routes (Backend Layer)
│   │   ├── auth/
│   │   ├── routines/
│   │   └── ...
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
├── components/                    # 共有UIコンポーネント (Frontend Layer)
│   ├── ui/                       # 基本UIコンポーネント
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   └── ...
│   ├── gamification/             # ゲーミフィケーション関連
│   └── Layout/                   # レイアウト関連
├── lib/                          # Backend/共通ライブラリ
│   ├── db/                       # Database層 (Backend)
│   │   ├── schema.ts
│   │   ├── queries/              # Database Query層
│   │   └── migrations/
│   ├── auth/                     # 認証層 (Backend)
│   ├── api-client/               # API Client層 (Frontend)
│   └── utils/                    # 共通ユーティリティ
├── domain/                       # Domain層 (Backend)
│   ├── entities/
│   ├── repositories/
│   └── services/
├── application/                  # Application層 (Backend)
│   └── usecases/
├── context/                      # React Context (Frontend)
├── hooks/                        # 共有React Hooks (Frontend)
└── mocks/                        # MSW Mock (Development)
    ├── handlers/
    └── data/
```

### レイヤー分離原則

#### Frontend Layer
- `src/app/**/page.tsx` - Page Components
- `src/app/**/_components/` - Route固有コンポーネント
- `src/components/` - 共有UIコンポーネント
- `src/hooks/` - React Hooks
- `src/context/` - React Context
- `src/lib/api-client/` - API Client

#### Backend Layer
- `src/app/api/` - API Routes
- `src/lib/db/` - Database層
- `src/domain/` - Domain層
- `src/application/` - Application層

#### Shared Layer
- `src/lib/utils/` - 共通ユーティリティ
- `src/mocks/` - 開発時Mock

## 影響範囲

### 修正対象ファイル種別
- ディレクトリ構成変更に伴う全ファイル移動・再配置
- Page Components (`src/app/**/*.tsx`)
- UI Components (`src/components/**/*.tsx`)  
- Mock システム (`src/mocks/**/*.ts`)
- API Routes (`src/app/api/**/*.ts`)
- 型定義ファイル (`src/types/**/*.ts` → 削除対象)

### 推定修正ファイル数
- 約200+ ファイルの修正・移動が必要
- 特に重要: DashboardPage.tsx, BadgesPage.tsx, RoutinesPage.tsx等

## リスク管理

### 高リスク
- 大規模な型システム変更による予期しないエラー
- Page Components修正時の機能破損

### 中リスク  
- Mock データ修正によるテスト影響
- Tailwind修正による見た目の変化

### 低リスク
- lint警告の修正
- コメント除去

## 完了基準

1. **技術基準**: 全品質チェックツールがエラーなく完了
2. **機能基準**: 既存機能の完全動作確認
3. **コード基準**: 全実装ルールへの完全準拠
4. **テスト基準**: E2Eテストの基本シナリオ通過

## 検証方法

```bash
# 型安全性検証
npm run type-check

# コード品質検証  
npm run lint

# 機能動作検証
npm run test:e2e

# ビルド検証
npm run build
```

---

**作成日**: 2025-01-30  
**対象バージョン**: Next.js 15 + TypeScript  
**優先度**: 高  
**推定工数**: 3-5日間