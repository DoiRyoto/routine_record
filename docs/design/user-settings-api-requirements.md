# ユーザー設定管理API 要件定義書
## TASK-105: ユーザー設定API実装

### 1. 概要

本仕様書は、Routine Record アプリケーションにおけるユーザー設定管理APIの詳細要件を定義する。ユーザーの個人設定（テーマ、言語、時刻フォーマット）の取得・更新機能を提供し、Clean Architecture + DDD パターンに基づいて実装する。

### 2. 要件リンク

- **REQ-010**: 設定管理機能
- **NFR-101**: データプライバシー（ユーザー毎のデータ分離）
- **NFR-102**: セキュリティ（認証・認可）

### 3. データモデル

#### 3.1 UserSettings エンティティ

```typescript
interface UserSettings {
  id: string;              // UUID - 主キー
  userId: string;          // UUID - ユーザーID (外部キー、UNIQUE制約)
  theme: Theme;            // テーマ設定 ('light' | 'dark' | 'auto')
  language: Language;      // 言語設定 ('ja' | 'en')
  timeFormat: TimeFormat;  // 時刻表示形式 ('12h' | '24h')
  createdAt: Date;         // 作成日時
  updatedAt: Date;         // 更新日時
}
```

#### 3.2 制約条件

- **一意制約**: 1ユーザーにつき1つの設定レコードのみ
- **デフォルト値**:
  - theme: 'auto'
  - language: 'ja'
  - timeFormat: '24h'
- **カスケード削除**: ユーザー削除時に設定も削除

### 4. API エンドポイント

#### 4.1 設定取得 (GET /api/user-settings)

**概要**: 現在ログイン中ユーザーの設定を取得する。設定が存在しない場合、デフォルト値で自動作成する。

**認証**: 必須（JWTトークン）

**レスポンス**:
```typescript
{
  success: true,
  data: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    theme: "auto",
    language: "ja", 
    timeFormat: "24h",
    timezone: "Asia/Tokyo",  // サーバーサイドで計算
    createdAt: "2025-08-30T00:00:00Z",
    updatedAt: "2025-08-30T00:00:00Z"
  }
}
```

**エラーケース**:
- 401: 認証エラー
- 500: サーバーエラー

#### 4.2 設定更新 (PUT /api/user-settings)

**概要**: ユーザー設定を更新する。部分更新対応。

**認証**: 必須（JWTトークン）

**リクエスト**:
```typescript
{
  theme?: 'light' | 'dark' | 'auto',
  language?: 'ja' | 'en', 
  timeFormat?: '12h' | '24h'
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    userId: "550e8400-e29b-41d4-a716-446655440000",
    theme: "dark",
    language: "en",
    timeFormat: "12h", 
    timezone: "Asia/Tokyo",
    createdAt: "2025-08-30T00:00:00Z",
    updatedAt: "2025-08-30T01:00:00Z"
  }
}
```

**エラーケース**:
- 400: バリデーションエラー（無効な値）
- 401: 認証エラー
- 500: サーバーエラー

### 5. ビジネスルール

#### 5.1 自動作成機能

- ユーザー初回設定取得時、設定が存在しない場合はデフォルト値で自動作成
- デフォルト値: theme='auto', language='ja', timeFormat='24h'

#### 5.2 更新タイムスタンプ

- 設定更新時、updatedAtを現在時刻に自動更新
- 変更がない場合でもタイムスタンプは更新する

#### 5.3 部分更新

- PUTリクエストで未指定のフィールドは現在値を維持
- 最低1つのフィールドが指定されている必要がある

### 6. バリデーション

#### 6.1 入力値検証

- **theme**: 'light', 'dark', 'auto' のいずれか
- **language**: 'ja', 'en' のいずれか
- **timeFormat**: '12h', '24h' のいずれか
- **空リクエスト**: 全フィールドが未指定の場合はエラー

#### 6.2 型安全性

- TypeScript strictモードでの完全な型チェック
- Zodスキーマによるランタイムバリデーション

### 7. セキュリティ

#### 7.1 認証・認可

- JWTトークンによる認証必須
- ユーザーは自分の設定のみアクセス可能
- Supabase RLS によるデータベースレベルの保護

#### 7.2 データ保護

- HTTPS通信必須
- 機密データは含まれないが、個人設定情報として適切に保護

### 8. パフォーマンス

#### 8.1 応答時間

- GET: 100ms以下
- PUT: 200ms以下

#### 8.2 キャッシング

- クライアントサイドでの設定キャッシュ推奨
- 更新後の即座反映

### 9. Clean Architecture 設計

#### 9.1 レイヤー構成

```
Domain Layer:
├── entities/UserSettings.ts          # エンティティ
├── valueObjects/UserSettingsId.ts    # 値オブジェクト
└── repositories/IUserSettingsRepository.ts # リポジトリインターフェース

Application Layer:
├── dtos/GetUserSettingsDto.ts         # 取得DTO
├── dtos/UpdateUserSettingsDto.ts      # 更新DTO
├── usecases/GetUserSettingsUseCase.ts # 取得ユースケース
└── usecases/UpdateUserSettingsUseCase.ts # 更新ユースケース

Infrastructure Layer:
└── repositories/DrizzleUserSettingsRepository.ts # リポジトリ実装
```

#### 9.2 ドメインサービス

- 設定の自動作成ロジック
- デフォルト値管理
- タイムゾーン計算（将来拡張）

### 10. テスト要件

#### 10.1 単体テスト

**GetUserSettingsUseCase**:
- TC001: 設定が存在する場合の正常取得
- TC002: 設定が存在しない場合の自動作成
- TC003: 認証エラーの適切な処理

**UpdateUserSettingsUseCase**:
- TC004: theme更新の正常処理
- TC005: language更新の正常処理
- TC006: timeFormat更新の正常処理
- TC007: 複数フィールド同時更新
- TC008: 無効な値での更新拒否
- TC009: 空リクエストでの更新拒否

#### 10.2 統合テスト

- TC010: データベース連携の正常動作
- TC011: トランザクション整合性
- TC012: RLSポリシー動作確認

#### 10.3 エラーシナリオテスト

- TC013: 無効なtheme値
- TC014: 無効なlanguage値
- TC015: 無効なtimeFormat値
- TC016: 認証なしアクセス

### 11. 実装チェックリスト

#### 11.1 Domain Layer
- [ ] UserSettings エンティティ実装
- [ ] UserSettingsId 値オブジェクト実装
- [ ] IUserSettingsRepository インターフェース実装
- [ ] バリデーションロジック実装

#### 11.2 Application Layer
- [ ] GetUserSettingsDto 実装
- [ ] UpdateUserSettingsDto 実装
- [ ] GetUserSettingsUseCase 実装
- [ ] UpdateUserSettingsUseCase 実装

#### 11.3 Infrastructure Layer
- [ ] DrizzleUserSettingsRepository 実装

#### 11.4 Test Implementation
- [ ] 単体テスト全14ケース実装
- [ ] テストデータ・モック実装
- [ ] エッジケーステスト実装

### 12. 完了条件

- [ ] 全APIエンドポイントが正常動作
- [ ] 自動作成機能が正常動作
- [ ] バリデーションが適切に機能
- [ ] セキュリティ要件を満たす
- [ ] 全テストが合格（カバレッジ100%）
- [ ] TypeScript型エラーゼロ
- [ ] パフォーマンス要件クリア

---

**実装予定時間**: 4-6時間
**テスト実装時間**: 2-3時間
**総所要時間**: 6-9時間