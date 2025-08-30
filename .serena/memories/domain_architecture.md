# ドメインアーキテクチャ

## Clean Architecture レイヤー構成

### Domain Layer (ドメインレイヤー)
最も内側のレイヤーで、ビジネスロジックとルールを含む

#### Entities (エンティティ)
- `Routine`: ルーティンのコアエンティティ
  - ID、ユーザーID、名前、説明、カテゴリ
  - 目標タイプ、繰り返しタイプ
  - バリデーション、ビジネスロジック
  - ドメインイベント

#### Value Objects (値オブジェクト)  
- `RoutineId`: ルーティン識別子
- `UserId`: ユーザー識別子
- `ExecutionRecordId`: 実行記録識別子
- `GoalType`: 目標タイプ (頻度ベース/スケジュールベース)
- `RecurrenceType`: 繰り返しタイプ (毎日/毎週/毎月)

#### Repository Interfaces (リポジトリインターフェース)
- `IRoutineRepository`: ルーティンデータアクセス
- `IExecutionRecordRepository`: 実行記録データアクセス
- 依存関係逆転の原則に従いインターフェースのみ定義

### Application Layer (アプリケーションレイヤー)
ユースケースとアプリケーションサービスを含む

#### Use Cases (ユースケース)
- `CreateRoutineUseCase`: ルーティン作成
- `UpdateRoutineUseCase`: ルーティン更新  
- `DeleteRoutineUseCase`: ルーティン削除
- `GetRoutineListUseCase`: ルーティン一覧取得

#### DTOs (データ転送オブジェクト)
- `CreateRoutineDto`: ルーティン作成用DTO
- `UpdateRoutineDto`: ルーティン更新用DTO
- バリデーションルールを含む

### Infrastructure Layer (インフラストラクチャレイヤー)
外部システムとの接続を担当

#### Repository Implementations
- `DrizzleRoutineRepository`: Drizzle ORM実装
- `SupabaseAuthRepository`: Supabase認証実装

### Presentation Layer (プレゼンテーションレイヤー)
UIとコントローラーを含む

#### Controllers
- `RoutineController`: ルーティン関連API制御
- Next.js API Routesとの統合

## 依存関係の流れ

```
Presentation -> Application -> Domain
     ↓              ↓
Infrastructure -> Domain (interfaces only)
```

## 依存性注入 (DI)

### Inversify.js使用
```typescript
// コンテナ設定例
container.bind<IRoutineRepository>(TYPES.RoutineRepository)
  .to(DrizzleRoutineRepository);
```

## ドメインイベント

### イベント駆動アーキテクチャ
- ルーティン実行時のXP計算
- レベルアップ通知
- バッジ取得イベント

## アーキテクチャルール

### 依存関係ルール
1. 内側のレイヤーは外側のレイヤーを知らない
2. 依存関係は内向きのみ
3. インターフェースを通じた疎結合

### ドメインの保護
- ドメインロジックはエンティティ内に配置
- プリミティブな型ではなく値オブジェクトを使用
- 不正な状態を作れない設計