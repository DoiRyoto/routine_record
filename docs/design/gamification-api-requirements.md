# ゲーミフィケーションAPI 要件定義書
## TASK-106: ゲーミフィケーションAPI実装

### 1. 概要

本仕様書は、Routine Record アプリケーションにおけるゲーミフィケーション機能APIの要件を定義する。XP・レベル、バッジ、ミッション、チャレンジシステムの包括的な実装とテストを行い、Clean Architecture + DDD パターンに基づいて品質保証する。

### 2. 要件リンク

- **REQ-004**: XP・レベルシステム
- **REQ-005**: バッジシステム
- **REQ-006**: ミッションシステム 
- **REQ-007**: チャレンジシステム
- **REQ-103**: XP獲得通知
- **REQ-104**: レベルアップ通知

### 3. 実装状況分析

#### 3.1 既存実装（約90%完了）

**実装済みエンドポイント**:
- ✅ GET /api/user-profiles - ユーザープロフィール取得
- ✅ GET/POST /api/badges - バッジ管理
- ✅ GET/POST /api/user-badges - ユーザーバッジ管理
- ✅ GET/POST /api/missions - ミッション管理
- ✅ GET/POST /api/user-missions - ユーザーミッション進捗
- ✅ GET/POST /api/challenges - チャレンジ管理
- ✅ GET/POST/DELETE/PATCH /api/challenges/[id] - チャレンジ詳細操作
- ✅ GET /api/user-challenges - ユーザーチャレンジ状況
- ✅ GET /api/xp-transactions - XP取引履歴

#### 3.2 追加実装が必要

**未実装エンドポイント**:
- ❌ GET /api/game-notifications - ゲーム通知API
- ❌ POST /api/challenges/[id]/join - 専用チャレンジ参加エンドポイント

### 4. データモデル

#### 4.1 UserProfile エンティティ

```typescript
interface UserProfile {
  userId: string;              // UUID - ユーザーID (主キー)
  level: number;               // 現在レベル (初期値: 1)
  totalXP: number;             // 総獲得XP (初期値: 0)
  currentXP: number;           // 現在レベルでのXP (初期値: 0)
  nextLevelXP: number;         // 次レベルまでのXP (初期値: 100)
  streak: number;              // 現在のストリーク (初期値: 0)
  longestStreak: number;       // 最長ストリーク (初期値: 0)
  totalRoutines: number;       // 総ルーチン数
  totalExecutions: number;     // 総実行回数
  joinedAt: Date;              // 参加日時
  lastActiveAt: Date;          // 最終アクティブ日時
}
```

#### 4.2 Badge エンティティ

```typescript
interface Badge {
  id: string;                  // UUID - バッジID
  name: string;                // バッジ名
  description: string;         // バッジ説明
  iconUrl?: string;            // アイコンURL
  rarity: BadgeRarity;         // レア度 ('common' | 'rare' | 'epic' | 'legendary')
  category: string;            // カテゴリ
}
```

#### 4.3 Mission エンティティ

```typescript
interface Mission {
  id: string;                  // UUID - ミッションID
  title: string;               // ミッション名
  description: string;         // ミッション説明
  type: MissionType;           // タイプ ('streak' | 'count' | 'variety' | 'consistency')
  targetValue: number;         // 目標値
  xpReward: number;            // XP報酬
  badgeId?: string;           // 報酬バッジID
  difficulty: MissionDifficulty; // 難易度 ('easy' | 'medium' | 'hard' | 'extreme')
  isActive: boolean;           // アクティブ状態
}
```

#### 4.4 Challenge エンティティ

```typescript
interface Challenge {
  id: string;                  // UUID - チャレンジID
  title: string;               // チャレンジ名
  description: string;         // チャレンジ説明
  startDate: Date;             // 開始日時
  endDate: Date;               // 終了日時
  type: ChallengeType;         // タイプ ('weekly' | 'monthly' | 'seasonal' | 'special')
  participants: number;        // 参加者数
  maxParticipants?: number;    // 最大参加者数
  isActive: boolean;           // アクティブ状態
}
```

#### 4.5 GameNotification エンティティ

```typescript
interface GameNotification {
  id: string;                  // UUID - 通知ID
  userId: string;              // ユーザーID
  type: NotificationType;      // 通知タイプ ('level_up' | 'badge_unlocked' | 'mission_completed' | 'challenge_completed' | 'streak_milestone' | 'xp_milestone')
  title: string;               // タイトル
  message: string;             // メッセージ
  data?: string;               // 追加データ（JSON）
  isRead: boolean;             // 既読状態
  createdAt: Date;             // 作成日時
}
```

### 5. API エンドポイント仕様

#### 5.1 ゲーム通知取得 (GET /api/game-notifications)

**概要**: ユーザーのゲーミフィケーション通知を取得する

**認証**: 必要

**クエリパラメータ**:
- `userId`: string (必須) - ユーザーID
- `unreadOnly`: boolean (オプション) - 未読通知のみ取得
- `limit`: number (オプション) - 取得件数制限 (デフォルト: 50)
- `offset`: number (オプション) - オフセット (デフォルト: 0)

**レスポンス**:
```typescript
{
  success: true,
  data: {
    notifications: GameNotification[],
    unreadCount: number,
    totalCount: number
  }
}
```

#### 5.2 チャレンジ参加 (POST /api/challenges/[id]/join)

**概要**: 特定のチャレンジに参加する

**認証**: 必要

**パラメータ**:
- `id`: string - チャレンジID (URL パラメータ)

**リクエストボディ**:
```typescript
{
  userId: string
}
```

**レスポンス**:
```typescript
{
  success: true,
  data: {
    challengeId: string,
    userId: string,
    joinedAt: string,
    progress: number,
    rank?: number
  }
}
```

### 6. ビジネスルール

#### 6.1 XP・レベルシステム

- **レベルアップ計算**: 次レベル必要XP = レベル × 100
- **XP獲得源**: routine_completion, streak_bonus, mission_completion, challenge_completion, daily_bonus, achievement_unlock
- **レベルアップ時**: 自動で next_level_xp を再計算

#### 6.2 ストリークシステム

- **ストリーク継続条件**: 毎日のルーチン実行
- **ストリークボーナス**: 7日ごとにボーナスXP付与
- **最長ストリーク更新**: 現在ストリークが最長ストリークを上回った場合に更新

#### 6.3 ミッションシステム

- **4つのタイプ**: streak(連続), count(回数), variety(多様性), consistency(一貫性)
- **進捗更新**: ルーチン実行時に自動更新
- **完了処理**: 目標値到達時にXP付与・バッジ解除

#### 6.4 チャレンジシステム

- **参加制限**: maxParticipants が設定されている場合の定員制限
- **期間制限**: startDate - endDate の期間内のみ参加可能
- **重複参加防止**: 同一ユーザーの重複参加を禁止

#### 6.5 通知システム

- **自動生成**: レベルアップ・バッジ解除・ミッション完了時に自動生成
- **既読管理**: 通知読み取り時に isRead = true に更新
- **保存期間**: 作成から30日後に自動削除

### 7. エラーハンドリング

#### 7.1 ゲーム通知API

- **400**: 無効なクエリパラメータ
- **401**: 認証エラー
- **404**: ユーザーが存在しない
- **500**: サーバーエラー

#### 7.2 チャレンジ参加API

- **400**: 無効なリクエストボディ
- **401**: 認証エラー
- **404**: チャレンジが存在しない
- **409**: 定員超過・重複参加・期間外参加
- **500**: サーバーエラー

### 8. パフォーマンス要件

#### 8.1 応答時間

- ユーザープロフィール取得: 200ms以下
- ミッション進捗更新: 300ms以下
- チャレンジ参加処理: 400ms以下
- 通知取得: 150ms以下

#### 8.2 スケーラビリティ

- 同時接続ユーザー数: 1,000ユーザー
- 1日あたりXP取引処理: 100万件まで対応
- チャレンジ最大参加者数: 10,000名まで

### 9. Clean Architecture 設計

#### 9.1 レイヤー構成

```
Domain Layer:
├── entities/UserProfile.ts              # ユーザープロフィールエンティティ
├── entities/GameNotification.ts         # ゲーム通知エンティティ
├── valueObjects/XPAmount.ts             # XP値オブジェクト
├── valueObjects/Level.ts                # レベル値オブジェクト
├── services/XPCalculationService.ts     # XP計算ドメインサービス
├── services/LevelUpService.ts           # レベルアップドメインサービス
└── repositories/IGameNotificationRepository.ts # 通知リポジトリインターフェース

Application Layer:
├── dtos/GetGameNotificationsDto.ts      # 通知取得DTO
├── dtos/JoinChallengeDto.ts             # チャレンジ参加DTO
├── usecases/GetGameNotificationsUseCase.ts  # 通知取得ユースケース
├── usecases/JoinChallengeUseCase.ts     # チャレンジ参加ユースケース
├── usecases/CalculateXPUseCase.ts       # XP計算ユースケース
└── usecases/ProcessLevelUpUseCase.ts    # レベルアップ処理ユースケース

Infrastructure Layer:
├── repositories/DrizzleGameNotificationRepository.ts # 通知リポジトリ実装
└── services/XPCalculationService.ts     # XP計算サービス実装
```

### 10. テスト要件

#### 10.1 単体テスト (28ケース)

**XP計算ロジック**:
- TC001: 基本XP計算の正常動作
- TC002: ボーナスXP計算の正常動作
- TC003: 無効なXP値でのエラー
- TC004: XP計算オーバーフローの処理

**レベルアップ処理**:
- TC005: レベル1→2の正常なレベルアップ
- TC006: 複数レベル一気にアップの処理
- TC007: 最大レベル到達時の処理
- TC008: レベルアップ通知生成の確認

**ミッション進捗更新**:
- TC009: streak ミッション進捗更新
- TC010: count ミッション進捗更新  
- TC011: variety ミッション進捗更新
- TC012: consistency ミッション進捗更新
- TC013: ミッション完了時の報酬付与
- TC014: 無効なミッション進捗値での処理

**バッジ解除処理**:
- TC015: バッジ解除の正常処理
- TC016: 重複バッジ解除の防止
- TC017: バッジ解除通知生成の確認

**チャレンジ参加処理**:
- TC018: チャレンジ参加の正常処理
- TC019: 定員超過時のエラー
- TC020: 重複参加時のエラー
- TC021: 期間外参加時のエラー
- TC022: 非アクティブチャレンジ参加エラー

**ゲーム通知**:
- TC023: 通知取得の正常処理
- TC024: 未読通知フィルターの動作
- TC025: 通知ページネーションの動作
- TC026: 無効なユーザーIDでのエラー

**エラーハンドリング**:
- TC027: データベース接続エラーの処理
- TC028: 不正なリクエストパラメータでのエラー

#### 10.2 統合テスト (12ケース)

- TC029: ルーチン実行→XP獲得→レベルアップ→通知生成の統合フロー
- TC030: ミッション完了→バッジ解除→通知生成の統合フロー  
- TC031: チャレンジ参加→進捗更新→ランキング算出の統合フロー
- TC032: ストリーク更新→ボーナスXP→レベルアップの統合フロー
- TC033: 複数ミッション同時完了の処理
- TC034: チャレンジ完了→報酬付与→ランキング確定の統合フロー
- TC035: 通知大量生成時のパフォーマンス
- TC036: XPトランザクション整合性の確認
- TC037: バッジ付与の冪等性確認
- TC038: レベルアップ時の統計更新確認
- TC039: ゲーム通知の既読処理確認
- TC040: チャレンジ脱退時のデータ整合性確認

### 11. 実装チェックリスト

#### 11.1 追加実装項目

**API実装**:
- [ ] GET /api/game-notifications エンドポイント実装
- [ ] POST /api/challenges/[id]/join エンドポイント実装

**Domain Layer**:
- [ ] GameNotification エンティティ実装
- [ ] XPAmount 値オブジェクト実装
- [ ] Level 値オブジェクト実装
- [ ] XPCalculationService ドメインサービス実装
- [ ] LevelUpService ドメインサービス実装
- [ ] IGameNotificationRepository インターフェース実装

**Application Layer**:
- [ ] GetGameNotificationsUseCase 実装
- [ ] JoinChallengeUseCase 実装
- [ ] CalculateXPUseCase 実装
- [ ] ProcessLevelUpUseCase 実装
- [ ] 各種DTO実装

**Infrastructure Layer**:
- [ ] DrizzleGameNotificationRepository 実装

#### 11.2 テスト実装

- [ ] 単体テスト28ケース実装
- [ ] 統合テスト12ケース実装
- [ ] パフォーマンステスト実装
- [ ] エラーシナリオテスト実装

#### 11.3 品質確認

- [ ] 全APIエンドポイントが正常動作
- [ ] XP計算・レベルアップロジックが正確
- [ ] ミッション・チャレンジシステムが完全動作
- [ ] 通知システムが適切に動作
- [ ] 全テストが合格（カバレッジ100%）
- [ ] TypeScript型エラーゼロ
- [ ] パフォーマンス要件クリア

### 12. 完了条件

- [ ] 全ゲーミフィケーション機能が完全動作
- [ ] XP・レベル・ストリークが正確に計算
- [ ] ミッション・チャレンジ・バッジが正常動作
- [ ] 通知システムが適切に機能
- [ ] セキュリティ要件を満たす
- [ ] 全テストが合格（カバレッジ100%）
- [ ] パフォーマンス要件を満たす

---

**実装予定時間**: 12-16時間
**テスト実装時間**: 6-8時間  
**総所要時間**: 18-24時間