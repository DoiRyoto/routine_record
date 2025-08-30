# レイヤー分離アーキテクチャ定義

## Frontend Layer (フロントエンド層)

### 責任範囲
- UIレンダリング
- ユーザーインタラクション
- クライアントサイド状態管理  
- API Client経由のデータ取得

### 対象ディレクトリ
```
src/
├── app/**/page.tsx                    # Page Components
├── app/**/_components/                # Route固有コンポーネント
├── components/                        # 共有UIコンポーネント
├── hooks/                            # React Hooks
├── context/                          # React Context
└── lib/api-client/                   # API Client
```

### 制約
- ❌ 直接データベースクエリの呼び出し禁止
- ❌ Business Logic層への直接アクセス禁止
- ✅ API Routes経由のデータアクセスのみ許可

## Backend Layer (バックエンド層)

### 責任範囲
- 認証・認可
- ビジネスロジック
- データベース操作
- API仕様の提供

### 対象ディレクトリ
```
src/
├── app/api/                          # API Routes
├── lib/db/                           # Database層
├── domain/                           # Domain層
└── application/                      # Application層
```

### 制約
- ❌ UIコンポーネントへの直接依存禁止
- ❌ React固有ライブラリの使用禁止
- ✅ 純粋なビジネスロジック実装のみ

## Shared Layer (共有層)

### 責任範囲
- 共通ユーティリティ
- 型定義（スキーマ由来）
- 開発時Mock（MSW）

### 対象ディレクトリ
```
src/
├── lib/utils/                        # 共通ユーティリティ
├── lib/db/schema.ts                  # 型定義の唯一の情報源
└── mocks/                            # 開発時Mock
```

### 制約
- ✅ Frontend/Backend両レイヤーからアクセス可能
- ✅ 型安全性確保のための基盤提供

## データフロー制約

### 許可されたデータフロー
```
Frontend Layer → API Client → API Routes → Business Logic → Database
```

### 禁止されたデータフロー
```
Frontend Layer → Database (直接アクセス)
Frontend Layer → Business Logic (直接アクセス)
Page Components → DB Queries (直接import)
```

## 実装ガイドライン

### Frontend Layer実装時
1. 必ずAPI Client経由でデータアクセス
2. 型安全性確保のためschema由来型使用
3. エラーハンドリングの適切な実装
4. UI/UX一貫性の確保

### Backend Layer実装時
1. 認証・認可の適切な実装
2. ビジネスロジックの純粋性確保
3. データベース操作の型安全性
4. API仕様の明確な定義

### Shared Layer実装時
1. 共通性・再利用性の確保
2. 依存関係の最小化
3. 型定義の一元管理
4. 開発効率向上のサポート

---

**定義日**: 2025-01-30
**適用対象**: RoutineRecord Application  
**レイヤー設計者**: Claude Code Assistant