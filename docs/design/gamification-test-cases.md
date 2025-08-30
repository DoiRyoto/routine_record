# ゲーミフィケーションAPI テストケース設計書
## TASK-106: ゲーミフィケーションAPI実装

### 1. テスト概要

本書は、ゲーミフィケーションAPI（残タスク）の包括的なテストケースを定義する。既存機能の90%は実装済みのため、追加実装部分とドメインロジックのテスト強化を重点的に行う。

### 2. テスト対象

#### 2.1 追加実装対象
- `GetGameNotificationsUseCase`
- `JoinChallengeUseCase`
- `CalculateXPUseCase`
- `ProcessLevelUpUseCase`

#### 2.2 ドメインエンティティ・値オブジェクト
- `GameNotification` エンティティ
- `XPAmount` 値オブジェクト
- `Level` 値オブジェクト
- `XPCalculationService` ドメインサービス
- `LevelUpService` ドメインサービス

### 3. GetGameNotificationsUseCase テストケース

#### 3.1 正常系テストケース

**TC001: 全通知の正常取得**
```typescript
// テスト内容: ユーザーの全ゲーム通知を正常に取得する
// 前提条件: ユーザーに複数の通知が存在
// 実行: GetGameNotificationsUseCase.execute({ userId, limit: 10 })
// 期待結果: 最新10件の通知が正しく返却される
```

**TC002: 未読通知のみの取得**
```typescript
// テスト内容: 未読通知のみをフィルターして取得する
// 前提条件: 既読・未読の通知が混在
// 実行: GetGameNotificationsUseCase.execute({ userId, unreadOnly: true })
// 期待結果: 未読通知のみが返却される
```

**TC003: ページネーション動作確認**
```typescript
// テスト内容: offset/limitによるページネーションが正常動作する
// 前提条件: 20件の通知が存在
// 実行: limit=5, offset=10 で実行
// 期待結果: 11-15番目の通知が返却される
```

#### 3.2 境界値テストケース

**TC004: 通知0件の場合**
```typescript
// テスト内容: 通知が存在しないユーザーの場合の処理
// 前提条件: 通知がない新規ユーザー
// 実行: GetGameNotificationsUseCase.execute({ userId })
// 期待結果: 空配列が返却される
```

**TC005: limit上限値テスト**
```typescript
// テスト内容: limit最大値での取得
// 実行: limit=100 で実行
// 期待結果: 最大100件まで取得される
```

#### 3.3 異常系テストケース

**TC006: 無効なユーザーID**
```typescript
// テスト内容: UUID形式ではないユーザーIDでエラーになる
// 実行: 無効なユーザーIDで実行
// 期待結果: ValidationErrorがスローされる
```

### 4. JoinChallengeUseCase テストケース

#### 4.1 正常系テストケース

**TC007: チャレンジ参加の正常処理**
```typescript
// テスト内容: アクティブなチャレンジに正常参加する
// 前提条件: 定員に余裕があるアクティブなチャレンジが存在
// 実行: JoinChallengeUseCase.execute({ challengeId, userId })
// 期待結果: 
//   - user_challenges レコードが作成される
//   - challenges.participants が +1 される
//   - 参加日時が記録される
```

#### 4.2 異常系テストケース

**TC008: 定員超過エラー**
```typescript
// テスト内容: 定員が満員のチャレンジで参加を拒否する
// 前提条件: participants = maxParticipants のチャレンジ
// 実行: JoinChallengeUseCase.execute({ challengeId, userId })
// 期待結果: ChallengeFullErrorがスローされる
```

**TC009: 重複参加エラー**
```typescript
// テスト内容: 既に参加済みのチャレンジで重複参加を拒否する
// 前提条件: ユーザーが既に参加済み
// 実行: JoinChallengeUseCase.execute({ challengeId, userId })
// 期待結果: DuplicateParticipationErrorがスローされる
```

**TC010: 期間外参加エラー**
```typescript
// テスト内容: 開催期間外のチャレンジで参加を拒否する
// 前提条件: startDate > 現在日時 または endDate < 現在日時
// 実行: JoinChallengeUseCase.execute({ challengeId, userId })
// 期待結果: ChallengeNotActiveErrorがスローされる
```

**TC011: 非アクティブチャレンジ参加エラー**
```typescript
// テスト内容: isActive=false のチャレンジで参加を拒否する
// 前提条件: isActive=false のチャレンジ
// 実行: JoinChallengeUseCase.execute({ challengeId, userId })
// 期待結果: ChallengeNotActiveErrorがスローされる
```

### 5. CalculateXPUseCase テストケース

#### 5.1 正常系テストケース

**TC012: 基本XP計算**
```typescript
// テスト内容: ルーチン実行によるベースXPが正しく計算される
// 実行: CalculateXPUseCase.execute({ sourceType: 'routine_completion', baseAmount: 10 })
// 期待結果: 10XP が正しく計算される
```

**TC013: ストリークボーナス計算**
```typescript
// テスト内容: ストリークによるボーナスXPが正しく計算される
// 前提条件: ユーザーの現在ストリークが7
// 実行: CalculateXPUseCase.execute({ sourceType: 'streak_bonus', streak: 7 })
// 期待結果: ベースXP + ストリークボーナス が計算される
```

**TC014: ミッション完了ボーナス**
```typescript
// テスト内容: ミッション完了時のXP計算が正しく動作する
// 前提条件: 報酬XP=50のミッション
// 実行: CalculateXPUseCase.execute({ sourceType: 'mission_completion', missionReward: 50 })
// 期待結果: 50XP が正しく返却される
```

#### 5.2 境界値テストケース

**TC015: 最大XP制限**
```typescript
// テスト内容: 一度に獲得できるXPの上限値制限
// 実行: 非常に大きなXP値で計算実行
// 期待結果: 上限値でクランプされる
```

#### 5.3 異常系テストケース

**TC016: 無効なXP値**
```typescript
// テスト内容: 負のXP値で計算エラーになる
// 実行: amount = -10 で計算実行
// 期待結果: InvalidXPAmountErrorがスローされる
```

**TC017: 無効なソースタイプ**
```typescript
// テスト内容: 不正なXPソースタイプでエラーになる
// 実行: sourceType = 'invalid_source' で計算実行
// 期待結果: InvalidXPSourceErrorがスローされる
```

### 6. ProcessLevelUpUseCase テストケース

#### 6.1 正常系テストケース

**TC018: レベル1→2の正常なレベルアップ**
```typescript
// テスト内容: レベル1のユーザーが100XPでレベル2になる
// 前提条件: level=1, currentXP=90 のユーザー
// 実行: ProcessLevelUpUseCase.execute({ userId, additionalXP: 20 })
// 期待結果:
//   - level=2 に更新
//   - currentXP=10, nextLevelXP=200 に更新
//   - レベルアップ通知が生成
```

**TC019: 複数レベル一気にアップ**
```typescript
// テスト内容: 大量XP獲得で複数レベル上がる処理
// 前提条件: level=1, currentXP=0 のユーザー
// 実行: ProcessLevelUpUseCase.execute({ userId, additionalXP: 350 })
// 期待結果:
//   - level=3 に更新（100+200=300XP消費、50XP余り）
//   - currentXP=50, nextLevelXP=400 に更新
//   - 複数レベル分のレベルアップ通知が生成
```

**TC020: レベルアップ通知生成**
```typescript
// テスト内容: レベルアップ時に適切な通知が生成される
// 実行: レベルアップ処理実行
// 期待結果: 
//   - type='level_up' の通知が生成
//   - 新しいレベル情報が通知に含まれる
```

#### 6.2 境界値テストケース

**TC021: レベルアップギリギリのXP**
```typescript
// テスト内容: 次レベルちょうどのXPでレベルアップ
// 前提条件: level=1, currentXP=99 のユーザー
// 実行: ProcessLevelUpUseCase.execute({ userId, additionalXP: 1 })
// 期待結果: level=2, currentXP=0 に更新
```

**TC022: 最大レベル到達時の処理**
```typescript
// テスト内容: 最大レベル（仮に100）到達時の処理
// 前提条件: level=99, currentXP=9900 のユーザー
// 実行: 大量XP付与
// 期待結果: level=100で固定、余剰XPは無視
```

### 7. ドメインエンティティ・値オブジェクト テストケース

#### 7.1 GameNotification エンティティ

**TC023: 通知インスタンス正常作成**
```typescript
// テスト内容: 有効なパラメータでGameNotificationが作成される
// 実行: new GameNotification(validParameters)
// 期待結果: インスタンスが正常に作成される
```

**TC024: 通知既読処理**
```typescript
// テスト内容: markAsRead()メソッドが正常動作する
// 実行: notification.markAsRead()
// 期待結果: isRead=true に更新される
```

#### 7.2 XPAmount 値オブジェクト

**TC025: 有効なXP値でのインスタンス作成**
```typescript
// テスト内容: 正のXP値でXPAmountが作成される
// 実行: new XPAmount(100)
// 期待結果: インスタンスが正常に作成される
```

**TC026: 無効なXP値での作成拒否**
```typescript
// テスト内容: 負のXP値でインスタンス作成が拒否される
// 実行: new XPAmount(-10)
// 期待結果: エラーがスローされる
```

#### 7.3 Level 値オブジェクト

**TC027: 有効なレベル値でのインスタンス作成**
```typescript
// テスト内容: 1以上のレベル値でLevelが作成される
// 実行: new Level(5)
// 期待結果: インスタンスが正常に作成される
```

**TC028: レベル計算メソッド**
```typescript
// テスト内容: calculateNextLevelXP()が正しく動作する
// 実行: level.calculateNextLevelXP()
// 期待結果: レベル × 100 が返却される
```

### 8. ドメインサービス テストケース

#### 8.1 XPCalculationService

**TC029: ストリークボーナス計算**
```typescript
// テスト内容: ストリーク数に基づくボーナス計算が正確
// 実行: XPCalculationService.calculateStreakBonus(7)
// 期待結果: 適切なボーナス値が返却される
```

**TC030: 複合ボーナス計算**
```typescript
// テスト内容: 複数のボーナスが重複適用される
// 実行: 基本XP + ストリークボーナス + 難易度ボーナス
// 期待結果: 全てのボーナスが正しく合算される
```

#### 8.2 LevelUpService

**TC031: レベルアップ判定**
```typescript
// テスト内容: XP追加後のレベルアップ判定が正確
// 実行: LevelUpService.checkLevelUp(currentLevel, currentXP, additionalXP)
// 期待結果: レベルアップの可否と新レベルが正しく判定される
```

**TC032: 新レベル必要XP計算**
```typescript
// テスト内容: 新しいレベルの必要XPが正しく計算される
// 実行: LevelUpService.calculateNextLevelRequirement(5)
// 期待結果: レベル5→6に必要なXP（600）が返却される
```

### 9. 統合テスト

#### 9.1 ゲーミフィケーション統合フロー

**TC033: ルーチン実行→XP獲得→レベルアップ→通知生成**
```typescript
// テスト内容: ルーチン実行からレベルアップまでの完全なフロー
// 実行: ルーチン実行API → XP計算 → レベルアップ処理 → 通知生成
// 期待結果: 全てのステップが正しく連携される
```

**TC034: ミッション完了→バッジ解除→通知生成**
```typescript
// テスト内容: ミッション完了時の報酬処理フロー
// 実行: ミッション進捗更新 → 完了判定 → バッジ付与 → 通知生成
// 期待結果: ミッション報酬が正しく付与される
```

**TC035: チャレンジ参加→進捗更新→ランキング算出**
```typescript
// テスト内容: チャレンジシステム全体の動作確認
// 実行: チャレンジ参加 → 活動記録 → 進捗更新 → ランキング算出
// 期待結果: チャレンジシステムが正しく機能する
```

### 10. パフォーマンステスト

**TC036: 通知大量取得時のパフォーマンス**
```typescript
// テスト内容: 1000件の通知がある状態での取得性能
// 実行: limit=50での通知取得
// 期待結果: 200ms以内で応答が返る
```

**TC037: XP計算の高負荷処理**
```typescript
// テスト内容: 同時に多数のXP計算が実行される
// 実行: 100ユーザー分のXP計算を同時実行
// 期待結果: デッドロックやエラーが発生しない
```

### 11. エラーシナリオテスト

**TC038: データベース接続エラー**
```typescript
// テスト内容: DB接続失敗時のエラーハンドリング
// 実行: DB接続を無効化した状態でAPI実行
// 期待結果: 適切なエラーレスポンスが返る
```

**TC039: 不正なリクエストパラメータ**
```typescript
// テスト内容: 無効なパラメータでのAPI呼び出し
// 実行: 各種無効なパラメータでAPI実行
// 期待結果: 400エラーと適切なエラーメッセージが返る
```

### 12. テストデータ定義

#### 12.1 正常テストデータ

```typescript
export const validUserId = '550e8400-e29b-41d4-a716-446655440000';
export const validChallengeId = '550e8400-e29b-41d4-a716-446655440001';
export const validNotificationId = '550e8400-e29b-41d4-a716-446655440002';

export const defaultUserProfile = {
  userId: validUserId,
  level: 1,
  totalXP: 0,
  currentXP: 0,
  nextLevelXP: 100,
  streak: 0,
  longestStreak: 0,
  totalRoutines: 0,
  totalExecutions: 0
};

export const sampleNotifications = [
  {
    id: validNotificationId,
    userId: validUserId,
    type: 'level_up' as const,
    title: 'レベルアップ！',
    message: 'レベル2になりました！',
    isRead: false,
    createdAt: new Date()
  }
];
```

#### 12.2 異常テストデータ

```typescript
export const invalidUserIds = [
  'invalid-uuid',
  '12345',
  '',
  null,
  undefined
];

export const invalidXPAmounts = [
  -10,
  -1,
  null,
  undefined,
  'invalid',
  Infinity
];
```

### 13. モック設定

#### 13.1 Repository Mocks

```typescript
export const mockGameNotificationRepository: IGameNotificationRepository = {
  findByUserId: jest.fn(),
  save: jest.fn(),
  markAsRead: jest.fn(),
  create: jest.fn()
};

export const mockChallengeRepository: IChallengeRepository = {
  findById: jest.fn(),
  findActiveByUserId: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  updateParticipantCount: jest.fn()
};
```

### 14. 品質メトリクス

#### 14.1 カバレッジ目標
- **行カバレッジ**: 100%
- **分岐カバレッジ**: 100%
- **関数カバレッジ**: 100%

#### 14.2 テストケース分布
- **正常系**: 20ケース (51.3%)
- **境界値**: 8ケース (20.5%)
- **異常系**: 11ケース (28.2%)
- **合計**: 39ケース

### 15. 実装チェックリスト

#### 15.1 テストファイル作成
- [ ] `GameNotification.test.ts`
- [ ] `XPAmount.test.ts`
- [ ] `Level.test.ts`
- [ ] `XPCalculationService.test.ts`
- [ ] `LevelUpService.test.ts`
- [ ] `GetGameNotificationsUseCase.test.ts`
- [ ] `JoinChallengeUseCase.test.ts`
- [ ] `CalculateXPUseCase.test.ts`
- [ ] `ProcessLevelUpUseCase.test.ts`

#### 15.2 統合テストファイル
- [ ] `GamificationIntegration.test.ts`
- [ ] `GamificationPerformance.test.ts`

#### 15.3 テスト実行確認
- [ ] 全テストケース実装済み
- [ ] 全テスト実行でRED（失敗）確認
- [ ] テストカバレッジ計測設定

---

**総テストケース数**: 39ケース
**予想実装時間**: 6-8時間
**テスト実行時間**: < 10秒（全ケース）