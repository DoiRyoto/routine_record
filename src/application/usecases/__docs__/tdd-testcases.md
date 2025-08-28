# TASK-002: テストケース定義

## テスト戦略

### テストピラミッド構成
```
E2E Tests (5%)
├── API統合テスト
└── 既存機能動作確認

Integration Tests (15%)  
├── Repository統合テスト
├── UseCase統合テスト
└── Controller統合テスト

Unit Tests (80%)
├── Domain Services
├── Use Cases  
├── Repositories
└── Controllers
```

## 単体テストケース

### 1. DrizzleRoutineRepository

#### 1.1 findById()
```typescript
describe('DrizzleRoutineRepository.findById', () => {
  it('should return routine when found', async () => {
    // Arrange: リポジトリとモックデータ準備
    // Act: findById実行
    // Assert: 正しいRoutineエンティティが返される
  });

  it('should return null when not found', async () => {
    // Arrange: 存在しないID
    // Act: findById実行  
    // Assert: nullが返される
  });

  it('should filter deleted routines', async () => {
    // Arrange: deletedAtが設定されたレコード
    // Act: findById実行
    // Assert: nullが返される
  });

  it('should throw error for invalid UUID', async () => {
    // Arrange: 無効なUUID形式ID
    // Act: findById実行
    // Assert: 適切なエラーがスローされる
  });
});
```

#### 1.2 findByUserId()
```typescript
describe('DrizzleRoutineRepository.findByUserId', () => {
  it('should return user routines sorted by createdAt desc', async () => {
    // Arrange: 複数のルーティン（異なる作成日時）
    // Act: findByUserId実行
    // Assert: 作成日時降順で返される
  });

  it('should return empty array when no routines', async () => {
    // Arrange: ルーティンが存在しないユーザー
    // Act: findByUserId実行
    // Assert: 空配列が返される
  });

  it('should filter other users routines', async () => {
    // Arrange: 他ユーザーのルーティン
    // Act: findByUserId実行
    // Assert: 自分のルーティンのみ返される
  });

  it('should exclude deleted routines', async () => {
    // Arrange: 削除済みルーティン含む
    // Act: findByUserId実行
    // Assert: アクティブなルーティンのみ返される
  });
});
```

#### 1.3 save()
```typescript
describe('DrizzleRoutineRepository.save', () => {
  it('should insert new routine', async () => {
    // Arrange: 新規Routineエンティティ
    // Act: save実行
    // Assert: データベースに保存される
  });

  it('should update existing routine', async () => {
    // Arrange: 既存のRoutineエンティティ（更新）
    // Act: save実行
    // Assert: データベースが更新される
  });

  it('should handle frequency-based routine', async () => {
    // Arrange: 頻度ベースルーティン
    // Act: save実行
    // Assert: targetCount, targetPeriodが保存される
  });

  it('should handle schedule-based routine', async () => {
    // Arrange: スケジュールベースルーティン
    // Act: save実行
    // Assert: recurrence設定が保存される
  });
});
```

### 2. CreateRoutineUseCase

#### 2.1 execute()
```typescript
describe('CreateRoutineUseCase.execute', () => {
  it('should create routine with valid data', async () => {
    // Arrange: 有効なCreateRoutineDto
    // Act: execute実行
    // Assert: ルーティンが作成される
  });

  it('should validate required fields', async () => {
    // Arrange: 必須項目欠如のDto
    // Act: execute実行
    // Assert: ValidationErrorがスローされる
  });

  it('should validate frequency-based requirements', async () => {
    // Arrange: 頻度ベース、targetCount未設定
    // Act: execute実行  
    // Assert: BusinessRuleViolationErrorがスローされる
  });

  it('should generate unique routine ID', async () => {
    // Arrange: 同一データで複数作成
    // Act: execute実行（複数回）
    // Assert: 異なるIDが生成される
  });

  it('should set default values correctly', async () => {
    // Arrange: オプション項目未設定のDto
    // Act: execute実行
    // Assert: デフォルト値が設定される
  });
});
```

### 3. RoutineValidationService

#### 3.1 validateBusinessRules()
```typescript
describe('RoutineValidationService.validateBusinessRules', () => {
  it('should pass valid schedule-based routine', async () => {
    // Arrange: 有効なスケジュールベースルーティン
    // Act: validateBusinessRules実行
    // Assert: エラーなしで完了
  });

  it('should pass valid frequency-based routine', async () => {
    // Arrange: 有効な頻度ベースルーティン
    // Act: validateBusinessRules実行
    // Assert: エラーなしで完了
  });

  it('should reject empty name', async () => {
    // Arrange: 空のname
    // Act: validateBusinessRules実行
    // Assert: ValidationErrorがスローされる
  });

  it('should reject invalid goal type combination', async () => {
    // Arrange: frequency_based + targetCount未設定
    // Act: validateBusinessRules実行
    // Assert: BusinessRuleViolationErrorがスローされる
  });

  it('should reject invalid recurrence interval', async () => {
    // Arrange: recurrenceInterval = 0
    // Act: validateBusinessRules実行
    // Assert: ValidationErrorがスローされる
  });
});
```

### 4. RoutineController

#### 4.1 create()
```typescript
describe('RoutineController.create', () => {
  it('should return 201 with created routine', async () => {
    // Arrange: 有効なリクエスト
    // Act: create実行
    // Assert: 201ステータス、作成されたルーティンデータ
  });

  it('should return 400 for validation errors', async () => {
    // Arrange: 無効なリクエストデータ
    // Act: create実行
    // Assert: 400ステータス、エラーメッセージ
  });

  it('should return 401 for unauthorized user', async () => {
    // Arrange: 認証なしリクエスト
    // Act: create実行
    // Assert: 401ステータス
  });

  it('should return 500 for server errors', async () => {
    // Arrange: リポジトリでエラー発生
    // Act: create実行
    // Assert: 500ステータス、統一エラーメッセージ
  });
});
```

#### 4.2 getAll()
```typescript
describe('RoutineController.getAll', () => {
  it('should return 200 with user routines', async () => {
    // Arrange: 認証済みユーザー、複数ルーティン
    // Act: getAll実行
    // Assert: 200ステータス、ルーティン配列
  });

  it('should return empty array when no routines', async () => {
    // Arrange: 認証済みユーザー、ルーティンなし
    // Act: getAll実行
    // Assert: 200ステータス、空配列
  });

  it('should filter by user ID', async () => {
    // Arrange: 複数ユーザーのルーティン
    // Act: getAll実行
    // Assert: リクエストユーザーのルーティンのみ
  });
});
```

## 統合テストケース

### 1. Repository統合テスト

#### 1.1 DrizzleRoutineRepository + Database
```typescript
describe('DrizzleRoutineRepository Integration', () => {
  it('should persist and retrieve routine correctly', async () => {
    // Arrange: 実際のDBコネクション、Routineエンティティ
    // Act: save→findById
    // Assert: 保存したデータが正しく取得される
  });

  it('should handle concurrent access', async () => {
    // Arrange: 同じルーティンへの同時アクセス
    // Act: 並行してsave実行
    // Assert: データ整合性が保たれる
  });

  it('should handle transaction rollback', async () => {
    // Arrange: 保存中にエラーが発生する状況
    // Act: save実行（エラー発生）
    // Assert: データが保存されていない
  });
});
```

### 2. UseCase統合テスト

#### 2.1 CreateRoutineUseCase + Repository + Service
```typescript
describe('CreateRoutineUseCase Integration', () => {
  it('should create routine with all dependencies', async () => {
    // Arrange: 実際のRepository、ValidationService
    // Act: CreateRoutineUseCase.execute
    // Assert: エンドツーエンドでルーティン作成
  });

  it('should handle validation service errors', async () => {
    // Arrange: ValidationServiceでエラー発生
    // Act: execute実行
    // Assert: 適切なエラーハンドリング
  });

  it('should handle repository errors', async () => {
    // Arrange: Repositoryでエラー発生
    // Act: execute実行
    // Assert: 適切なエラーハンドリング
  });
});
```

### 3. API統合テスト

#### 3.1 Full API Flow
```typescript
describe('API Integration', () => {
  it('should complete full routine creation flow', async () => {
    // Arrange: HTTPリクエスト、認証付き
    // Act: POST /api/routines
    // Assert: データベースに保存、正しいレスポンス
  });

  it('should handle authentication flow', async () => {
    // Arrange: Supabase認証トークン
    // Act: 認証必要APIコール
    // Assert: 認証が正しく動作
  });

  it('should maintain API compatibility', async () => {
    // Arrange: 既存フロントエンドのリクエスト形式
    // Act: API実行
    // Assert: 既存レスポンス形式を維持
  });
});
```

## E2Eテストケース

### 1. 既存機能互換性テスト
```typescript
describe('Existing Feature Compatibility', () => {
  it('should not break existing E2E tests', async () => {
    // Arrange: 既存のE2Eテストスイート
    // Act: E2Eテスト実行
    // Assert: 全てパス
  });

  it('should maintain frontend integration', async () => {
    // Arrange: フロントエンドアプリ
    // Act: ルーティンCRUD操作
    // Assert: 正常に動作
  });
});
```

## パフォーマンステストケース

### 1. API応答時間テスト
```typescript
describe('Performance Tests', () => {
  it('should respond within acceptable time', async () => {
    // Arrange: 大量データ
    // Act: API実行
    // Assert: 応答時間 < 500ms
  });

  it('should handle concurrent requests', async () => {
    // Arrange: 同時リクエスト100件
    // Act: 並行API実行
    // Assert: 全て正常応答、スループット維持
  });
});
```

## テスト実行順序

### フェーズ1: 単体テスト
1. Domain Services → Use Cases → Repositories → Controllers
2. 各コンポーネント独立実行
3. モック使用による分離テスト

### フェーズ2: 統合テスト  
1. Repository + Database
2. UseCase + Services + Repository
3. Controller + Middleware + UseCase

### フェーズ3: E2E/パフォーマンステスト
1. 既存E2E実行
2. API互換性確認
3. パフォーマンス測定

## カバレッジ目標

- **単体テスト**: 90%以上
- **統合テスト**: 主要フロー100%
- **E2E**: 既存機能100%パス
- **全体**: 85%以上

## モック戦略

### 単体テスト
- Repository → モック
- External Services → モック
- Database → モック

### 統合テスト
- Database → 実際のテスト用DB
- External Services → モック
- HTTP → SuperTest

### E2E
- All Real Components
- Test Database
- Real Authentication

次のステップで、これらのテストケースを実装していきます。