# フロントエンド実装ルール遵守リファクタリング アーキテクチャ設計

## システム概要

現在のRoutineRecordアプリケーションのコードベースを、フロントエンド実装ルールに完全準拠するようリファクタリングする。Next.js 15 + TypeScript環境における型安全性、スタイリング一貫性、アーキテクチャ分離を実現し、保守性と品質を大幅に向上させる。

## アーキテクチャパターン

### パターン: Layered Architecture + Feature-based Organization
- **理由**: 関心の分離を明確にし、フロントエンド・バックエンドの責任境界を確立
- **利点**: 
  - 型安全性の向上
  - 開発効率の向上
  - テスタビリティの向上
  - 将来的な拡張性の確保

### アーキテクチャ原則

1. **Single Responsibility Principle**: 各レイヤーは単一の責任を持つ
2. **Dependency Inversion**: 高レベルモジュールは低レベルモジュールに依存しない
3. **Interface Segregation**: クライアントは使用しないインターフェースに依存しない
4. **Colocation**: 関連するファイルは近くに配置する

## コンポーネント構成

### Frontend Layer (フロントエンド層)

#### Next.js App Router + React
```typescript
// Page Components
src/app/
├── (authenticated)/
│   ├── dashboard/page.tsx          # SSR + データフェッチ
│   ├── routines/page.tsx           # ルーチン管理
│   └── statistics/page.tsx         # 統計表示
└── (public)/
    ├── auth/signin/page.tsx        # サインイン
    └── auth/signup/page.tsx        # サインアップ
```

#### UI Components + Design System
```typescript
// Shared UI Components
src/components/
├── ui/                             # 基本UIコンポーネント
│   ├── Button/                     # text-text-*, bg-bg-*パターン
│   ├── Form/                       # 統一されたフォーム
│   └── Toast/                      # エラー・成功通知
├── gamification/                   # ゲーミフィケーション
│   ├── ExperiencePoints/           # XPシステム
│   └── UserAvatar/                 # ユーザーアバター
└── Layout/                         # レイアウト関連
    ├── Header/                     # ヘッダー
    └── Navigation/                 # ナビゲーション
```

#### 状態管理
- **React Context**: グローバル状態（ユーザー情報、設定）
- **Local State**: コンポーネント固有の状態
- **Server State**: API経由データ取得

### Backend Layer (バックエンド層)

#### API Routes (Next.js)
```typescript
src/app/api/
├── auth/                           # 認証関連API
├── routines/                       # ルーチンCRUD
├── user-profiles/                  # ユーザープロフィール
└── gamification/                   # ゲーミフィケーション
```

#### Business Logic
```typescript
// Domain-Driven Design
src/
├── domain/                         # ドメイン層
│   ├── entities/                   # エンティティ
│   ├── repositories/               # リポジトリインターフェース
│   └── services/                   # ドメインサービス
├── application/                    # アプリケーション層
│   └── usecases/                   # ユースケース
└── lib/db/                         # インフラ層
    ├── schema.ts                   # スキーマ定義
    └── queries/                    # データベースクエリ
```

### データベース

#### DBMS: PostgreSQL + Drizzle ORM
- **型安全性**: Drizzle ORMによる完全な型推論
- **スキーマファースト**: `@/lib/db/schema.ts`を唯一の型定義源とする
- **Migration**: Drizzle Migrationによる安全なスキーマ変更

#### キャッシュ戦略
- **Application Level**: React Query / SWR
- **Database Level**: PostgreSQL connection pooling
- **CDN**: 静的アセット配信

## レイヤー分離とデータフロー

### データフロー原則

1. **Frontend → API Routes → Database Queries → Database**
2. Page Componentsから直接Database Queriesを呼び出すことを禁止
3. 全てのデータアクセスはAPI Routes経由で実行

### 責任分離

#### Frontend Layer責任
- UIレンダリング
- ユーザーインタラクション
- クライアントサイド状態管理
- API Client経由のデータ取得

#### Backend Layer責任
- 認証・認可
- ビジネスロジック
- データベース操作
- API仕様の提供

#### Shared Layer責任
- 共通ユーティリティ
- 型定義（スキーマ由来）
- 開発時Mock（MSW）

## 型システム統一設計

### スキーマベース型定義
```typescript
// ❌ 従来の分散型定義
import type { Routine } from '@/types/routine';
import type { UserProfile } from '@/types/user';

// ✅ 統一されたスキーマベース型定義
import type { 
  Routine, 
  UserProfile, 
  ExecutionRecord,
  InsertRoutine,
  UpdateRoutine
} from '@/lib/db/schema';
```

### 型安全性確保戦略
1. **Schema First**: 全型定義はスキーマから自動生成
2. **Strict TypeScript**: `@ts-ignore`の完全排除
3. **Mock Consistency**: MockデータとSchemaの完全一致
4. **API Type Safety**: Request/Response型の厳密定義

## スタイリング統一設計

### Tailwind Design System
```typescript
// ✅ 統一されたカラーパターン
const colorSystem = {
  text: {
    primary: 'text-text-primary',      // メインテキスト
    secondary: 'text-text-secondary',  // サブテキスト
    muted: 'text-text-muted',         // 薄いテキスト
  },
  background: {
    primary: 'bg-bg-primary',         // メイン背景
    secondary: 'bg-bg-secondary',     // サブ背景
    accent: 'bg-bg-accent',           // アクセント背景
  }
};

// ❌ 直接的なカラー指定（禁止）
'text-black bg-white text-gray-800'
```

### ダークモード対応
- 統一されたカラーパターンによる自動対応
- カラートークンベースの実装
- デザインシステム一貫性の保証

## Next.js 15対応設計

### Promise型Params対応
```typescript
// API Routes
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // 処理...
}

// Page Components
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  // 処理...
}
```

### App Router最適化
- Route Groupsによる論理的分離
- Colocation原則によるファイル配置
- Private Folders（`_`prefix）による実装詳細隠蔽

## MSW Mock設計

### 開発時限定使用原則
```typescript
// 開発環境のみ有効
if (process.env.NODE_ENV === 'development') {
  import('@/mocks/browser').then(({ startWorker }) => {
    startWorker();
  });
}

// ❌ エラー時Mockデータ返却禁止
// ✅ 適切なエラーハンドリング
if (!data) {
  throw new Error('データの取得に失敗しました');
}
```

### Mock-Schema同期
- Mockデータは必ずスキーマ型に準拠
- 1対1ハンドラー対応（`lib/db/queries` ⟷ `mocks/handlers`）
- 型安全性の完全保証

## パフォーマンス設計

### バンドル最適化
- Tree Shaking対応
- Dynamic Import活用
- Code Splitting戦略

### レンダリング最適化
- SSR/SSG適切な使い分け
- React Suspense境界
- Lazy Loading実装

## セキュリティ設計

### 認証・認可
- Supabase Auth統合
- Server Actions活用
- Cookie-based Session管理

### データ保護
- 機密情報のフロントエンド露出防止
- API Routes層での適切な検証
- CSRF/XSS対策

## 移行戦略

### フェーズ別実装

#### フェーズ1: アーキテクチャ基盤
- ディレクトリ構成変更
- レイヤー分離実装
- Colocation適用

#### フェーズ2: 型システム統一
- Schema-first型定義移行
- `@/types/*` 完全排除
- Mock整合性確保

#### フェーズ3: スタイリング統一
- Tailwindパターン適用
- Design System確立
- ダークモード対応

#### フェーズ4: 品質保証
- TypeScript厳格化
- Lint警告ゼロ達成
- E2Eテスト通過

## 品質保証戦略

### 自動化チェック
```bash
# 必須チェック項目
npm run type-check     # TypeScript型検証
npm run lint          # コード品質検証
npm run test:e2e      # 機能検証
npm run build         # ビルド検証
```

### 継続的品質維持
- Pre-commit Hook設定
- CI/CDパイプライン統合
- 品質ゲート設定
- 自動化テスト拡充

---

**設計完了日**: 2025-01-30  
**対象システム**: RoutineRecord (Next.js 15 + TypeScript)  
**アーキテクト**: Claude Code Assistant