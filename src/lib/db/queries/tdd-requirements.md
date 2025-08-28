# TASK-002: Mission Card データベースクエリ関数 - 要件定義

## 概要
Mission Card & Today View コンポーネントで使用するデータベースクエリ関数を実装する。
既存のmissionsクエリを拡張し、UI表示に必要な詳細情報を含んだデータを効率的に取得する。

## 対象機能

### 1. 今日のミッション取得 (`getTodayMissions`)
- **目的**: 指定された日付のユーザーのミッション一覧を、UI表示に必要な全ての関連情報と共に取得
- **入力**: 
  - `userId: string` - ユーザーID
  - `date: string` - 対象日（ISO 8601 format）
  - `timezone?: string` - タイムゾーン（デフォルト: 'Asia/Tokyo'）
  - `includeCompleted?: boolean` - 完了済みを含むか（デフォルト: true）
- **出力**: `MissionWithDetails[]`
- **関連テーブル**:
  - `missions` (メインデータ)
  - `userMissions` (ユーザーの進捗状況)
  - `categories` (カテゴリ情報)
  - `executionRecords` (実行記録)
  - `users` (参加者情報)

### 2. ミッション状態更新 (`updateMissionStatus`)
- **目的**: ミッションの実行状態を更新し、必要に応じて実行記録を作成
- **入力**:
  - `params: UpdateMissionStatusRequest`
- **出力**: `MissionActionResult`
- **対応アクション**:
  - `start` - ミッション開始
  - `complete` - ミッション完了
  - `pause` - 一時停止
  - `resume` - 再開
  - `cancel` - キャンセル

### 3. ミッション詳細進捗取得 (`getMissionProgress`)
- **目的**: 特定ミッションの詳細な進捗情報を取得
- **入力**:
  - `userId: string`
  - `missionId: string`
  - `period?: 'today' | 'week' | 'month' | 'all'`
- **出力**: 進捗データ、履歴、統計情報

## データ変換仕様

### MissionWithDetails の構築
```typescript
interface MissionWithDetails {
  // 基本ミッション情報
  id: string;
  userId: string;
  name: string; // missions.title にマップ
  description?: string;
  category: string;
  goalType: 'frequency_based' | 'schedule_based';
  
  // 関連データ
  userMission?: UserMissionExtended;
  categoryInfo: CategoryDisplay; // categories テーブルから構築
  participants: ParticipantDisplay[]; // 参加者情報（将来拡張）
  
  // 計算済み情報
  timeSlot?: TimeSlot; // スケジュールベースの場合
  progress: ProgressData; // 進捗計算結果
  status: MissionStatus; // 現在の状態
  isScheduledToday: boolean; // 今日実行予定かどうか
}
```

### CategoryDisplay の構築
```typescript
interface CategoryDisplay {
  id: string;
  name: string;
  backgroundColor: string; // categories.color から取得
  textColor: string; // categories.color に基づいて計算
  icon?: string; // カテゴリ名から推定
}
```

### 進捗計算ロジック
- **頻度ベース**: `executionRecords`から対象期間の実行回数をカウント
- **スケジュールベース**: 今日の実行状況（完了/未完了）を確認
- **パーセンテージ**: `(現在進捗 / 目標値) * 100`

### 時間帯計算
- スケジュールベースのミッションの場合、`routines`の繰り返し設定から今日の実行予定時間を計算
- 現在時刻と比較して`isActive`, `isPast`, `isFuture`を設定

## パフォーマンス要件

### クエリ最適化
- **JOIN最適化**: 必要な関連テーブルのみを効率的にJOIN
- **インデックス活用**: `userId`, `date`, `isActive`にインデックスが必要
- **データ量制限**: 一日分のデータに限定（大量データの取得を避ける）

### キャッシュ戦略
- **メモリキャッシュ**: 計算済みの時間帯情報（5分間）
- **データベース**: 適切なインデックスによる高速クエリ

## エラーハンドリング要件

### バリデーション
- ユーザーIDの形式チェック（UUID）
- 日付形式の検証（ISO 8601）
- タイムゾーンの妥当性チェック

### エラーケース
- **データベース接続エラー**: 適切なエラーメッセージとリトライ機能
- **データ不整合**: 不正なデータ状態の検出と修復提案
- **権限エラー**: ユーザーが他人のデータにアクセスしようとした場合

### ログ記録
- **クエリパフォーマンス**: 実行時間の記録
- **エラー詳細**: スタックトレース付きのエラーログ
- **ユーザー行動**: データアクセスパターンの記録

## テストケース要件

### 単体テスト
- 各関数の基本的な動作確認
- エラーケースの処理確認
- エッジケース（データなし、不正な値等）の処理

### 統合テスト
- 実際のデータベースを使った結合テスト
- 複数テーブル間のデータ整合性確認
- パフォーマンステスト（大量データでの動作確認）

### モックテスト
- データベース接続エラーのシミュレーション
- 各種異常ケースのテスト

## セキュリティ要件

### データアクセス制御
- ユーザーは自分のミッションデータのみアクセス可能
- 他のユーザーのプライベートデータは除外

### SQLインジェクション対策
- Drizzle ORMのパラメータ化クエリを使用
- ユーザー入力の適切なエスケープ

### ログ記録での機密情報保護
- パスワードや個人識別情報をログに記録しない
- 必要最小限の情報のみをログに残す

## 実装詳細

### ファイル構成
```
src/lib/db/queries/
├── missions.ts (拡張)
├── mission-card.ts (新規)
├── __tests__/
│   └── mission-card.test.ts (新規)
```

### 外部依存関係
- `drizzle-orm` - データベースアクセス
- `date-fns` - 日時計算
- 既存のスキーマ定義

### 実装スケジュール
1. **基本クエリ実装** - 基本的なデータ取得機能
2. **データ変換ロジック** - UI用データ構造への変換
3. **進捗計算ロジック** - 複雑な進捗計算処理
4. **エラーハンドリング** - 堅牢なエラー処理
5. **パフォーマンス最適化** - クエリ最適化とキャッシュ

## 成功基準

### 機能面
- [ ] 指定日のミッション一覧を正確に取得できる
- [ ] ミッション状態の更新が正しく動作する
- [ ] 進捗計算が期待通りの値を返す
- [ ] エラーケースで適切な例外が発生する

### パフォーマンス面
- [ ] 単一ユーザーの一日分データ取得が100ms以内
- [ ] 大量データ（100ミッション）でも300ms以内
- [ ] メモリ使用量が適切な範囲内

### 品質面
- [ ] テストカバレッジ90%以上
- [ ] TypeScriptエラー0個
- [ ] ESLintエラー0個
- [ ] コードレビューパス