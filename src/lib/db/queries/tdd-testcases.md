# TASK-002: Mission Card データベースクエリ関数 - テストケース仕様

## テストケース一覧

### 1. getTodayMissions 関数のテストケース

#### 1.1 正常ケース

**TC-001: 基本的な今日のミッション取得**
- **入力**: 
  - userId: 'user-123'
  - date: '2024-01-15'
  - timezone: 'Asia/Tokyo'
- **事前条件**: 
  - ユーザーにアクティブなミッション3個
  - 1個は完了済み、2個は未完了
- **期待結果**: 
  - 3個のMissionWithDetailsオブジェクト
  - 各オブジェクトに正しいstatus, progress, categoryInfoが含まれる
  - isScheduledToday = trueのものが含まれる

**TC-002: 完了済みミッションを除外して取得**
- **入力**: 
  - userId: 'user-123'
  - date: '2024-01-15'
  - includeCompleted: false
- **事前条件**: 
  - ユーザーに完了済みミッション2個、未完了ミッション3個
- **期待結果**: 
  - 3個の未完了ミッションのみ返される
  - status が 'completed' のものは含まれない

**TC-003: スケジュールベースミッションの時間帯計算**
- **入力**: 
  - userId: 'user-123'
  - date: '2024-01-15'
- **事前条件**: 
  - スケジュールベースのミッション（毎日9:00-10:00実行予定）
- **期待結果**: 
  - timeSlotプロパティに正しい時間情報
  - 現在時刻に基づいたisActive, isPast, isFutureの設定

**TC-004: 頻度ベースミッションの進捗計算**
- **入力**: 
  - userId: 'user-123'
  - date: '2024-01-15'
- **事前条件**: 
  - 週3回の頻度ベースミッション
  - 今週既に1回実行済み
- **期待結果**: 
  - progress.current = 1
  - progress.target = 3
  - progress.percentage = 33.33

#### 1.2 エッジケース

**TC-005: データが存在しないケース**
- **入力**: 
  - userId: 'user-999' (存在しないユーザー)
  - date: '2024-01-15'
- **期待結果**: 
  - 空配列 [] が返される
  - エラーは発生しない

**TC-006: 過去の日付での取得**
- **入力**: 
  - userId: 'user-123'
  - date: '2023-12-01'
- **事前条件**: 
  - 指定日にアクティブだったミッション2個
- **期待結果**: 
  - 過去のミッション状態が正しく計算される
  - status が 'overdue' のものが含まれる可能性

**TC-007: 未来の日付での取得**
- **入力**: 
  - userId: 'user-123'
  - date: '2025-01-15'
- **期待結果**: 
  - 予定されているミッションが返される
  - status は全て 'pending'

#### 1.3 異常ケース

**TC-008: 不正な日付フォーマット**
- **入力**: 
  - userId: 'user-123'
  - date: 'invalid-date'
- **期待結果**: 
  - 適切なエラーメッセージと共に例外が発生
  - エラーコード: 'INVALID_DATE'

**TC-009: 不正なユーザーIDフォーマット**
- **入力**: 
  - userId: 'not-a-uuid'
  - date: '2024-01-15'
- **期待結果**: 
  - 適切なエラーメッセージと共に例外が発生
  - エラーコード: 'INVALID_USER_ID'

**TC-010: データベース接続エラー**
- **事前条件**: 
  - データベース接続が利用不可
- **期待結果**: 
  - データベースエラーが適切にハンドリングされる
  - 呼び出し元に分かりやすいエラーメッセージ

### 2. updateMissionStatus 関数のテストケース

#### 2.1 start アクション

**TC-011: ミッション開始成功**
- **入力**: 
  - missionId: 'mission-123'
  - userId: 'user-123'
  - action: 'start'
  - executedAt: '2024-01-15T09:00:00Z'
- **事前条件**: 
  - アクティブなミッション
  - まだ開始されていない
- **期待結果**: 
  - userMissionsテーブルに新しいレコード
  - executionRecordsテーブルに実行記録
  - success: true のレスポンス

**TC-012: 既に開始済みのミッション**
- **入力**: 
  - missionId: 'mission-123'
  - action: 'start'
- **事前条件**: 
  - 既に開始済みのミッション
- **期待結果**: 
  - エラーが発生
  - エラーメッセージ: 'このミッションは既に開始済みです'

#### 2.2 complete アクション

**TC-013: ミッション完了成功**
- **入力**: 
  - missionId: 'mission-123'
  - action: 'complete'
  - duration: 30
  - memo: 'よくできました'
- **事前条件**: 
  - 開始済みで未完了のミッション
- **期待結果**: 
  - userMissions.isCompleted = true
  - userMissions.completedAt が設定される
  - XP獲得情報が返される

**TC-014: 未開始ミッションの完了試行**
- **入力**: 
  - missionId: 'mission-123'
  - action: 'complete'
- **事前条件**: 
  - 未開始のミッション
- **期待結果**: 
  - エラーが発生
  - エラーメッセージ: 'ミッションが開始されていません'

#### 2.3 pause/resume アクション

**TC-015: ミッション一時停止**
- **入力**: 
  - missionId: 'mission-123'
  - action: 'pause'
- **事前条件**: 
  - 実行中のミッション
- **期待結果**: 
  - 実行記録に一時停止が記録される
  - ミッションの状態が更新される

#### 2.4 異常ケース

**TC-016: 存在しないミッション**
- **入力**: 
  - missionId: 'non-existent'
  - action: 'start'
- **期待結果**: 
  - エラーが発生
  - エラーメッセージ: 'ミッションが見つかりません'

**TC-017: 他のユーザーのミッション操作**
- **入力**: 
  - missionId: 'other-user-mission'
  - userId: 'user-123'
  - action: 'start'
- **期待結果**: 
  - エラーが発生
  - エラーメッセージ: 'アクセス権限がありません'

### 3. getMissionProgress 関数のテストケース

#### 3.1 正常ケース

**TC-018: 基本的な進捗情報取得**
- **入力**: 
  - userId: 'user-123'
  - missionId: 'mission-123'
  - period: 'today'
- **事前条件**: 
  - 進行中のミッション
  - 実行記録あり
- **期待結果**: 
  - 正確な進捗情報
  - 履歴データ
  - 統計情報

**TC-019: 週間進捗情報取得**
- **入力**: 
  - period: 'week'
- **期待結果**: 
  - 週間での集計データ
  - 日別の進捗状況

#### 3.2 エッジケース

**TC-020: 実行記録がないミッション**
- **事前条件**: 
  - ミッションは存在するが実行記録なし
- **期待結果**: 
  - progress.current = 0
  - 空の履歴配列
  - 基本的な統計情報

### 4. パフォーマンステスト

**TC-021: 大量データでの性能テスト**
- **事前条件**: 
  - 100個のミッション
  - 各ミッションに複数の実行記録
- **期待結果**: 
  - レスポンス時間 < 300ms
  - メモリ使用量が適切

**TC-022: 同時リクエスト処理**
- **条件**: 
  - 10個の同時リクエスト
- **期待結果**: 
  - 全てのリクエストが正常に処理される
  - デッドロックが発生しない

### 5. 統合テストケース

**TC-023: ミッション開始から完了までの一連の流れ**
- **手順**: 
  1. getTodayMissions で未開始ミッション確認
  2. updateMissionStatus で開始
  3. getTodayMissions で開始済み確認
  4. updateMissionStatus で完了
  5. getTodayMissions で完了済み確認
- **期待結果**: 
  - 各ステップで期待される状態変化
  - データの整合性が保たれる

**TC-024: 複数ユーザーでのデータ分離テスト**
- **条件**: 
  - user-123 と user-456 の2人のユーザー
  - それぞれに異なるミッション
- **期待結果**: 
  - 各ユーザーは自分のデータのみ取得
  - 他のユーザーのデータは含まれない

## テスト実装方針

### テストデータ準備
```typescript
const testData = {
  users: [
    { id: 'user-123', displayName: 'テストユーザー1' },
    { id: 'user-456', displayName: 'テストユーザー2' }
  ],
  missions: [
    { 
      id: 'mission-123', 
      title: 'モーニングルーティン',
      type: 'schedule_based'
    }
  ],
  categories: [
    {
      id: 'cat-health',
      name: 'health',
      color: 'bg-green-100 text-green-800'
    }
  ]
};
```

### モック戦略
- **データベース層**: 実際のテストDBを使用
- **外部API**: モック化
- **日時**: 固定された時刻でテスト

### テスト環境
- **データベース**: テスト専用のPostgreSQL
- **データクリーンアップ**: 各テスト後にデータリセット
- **並行実行**: テストケース間での干渉を避ける

### アサーション例
```typescript
// 基本的なアサーション
expect(result).toHaveLength(3);
expect(result[0]).toMatchObject({
  id: 'mission-123',
  status: 'pending',
  progress: {
    current: 0,
    target: 1,
    percentage: 0
  }
});

// 時間関連のアサーション
expect(result[0].timeSlot?.isActive).toBe(false);
expect(result[0].timeSlot?.duration).toBe(60);

// エラーケースのアサーション
expect(() => getTodayMissions('invalid', 'invalid-date')).toThrow();
expect(error.message).toContain('INVALID_DATE');
```

## 継続的テスト要件

### CI/CD統合
- プルリクエスト時に全テスト実行
- テストカバレッジ90%以上維持
- パフォーマンステストの定期実行

### テストメンテナンス
- データベーススキーマ変更時のテスト更新
- 新機能追加時の対応テストケース追加
- テストデータの定期的な見直し