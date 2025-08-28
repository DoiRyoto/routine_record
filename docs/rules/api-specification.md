# routine_record API完全仕様書

## 概要
本ドキュメントはroutine_recordプロジェクトの全APIエンドポイントの詳細仕様を記載したものです。  
OpenAPI 3.0形式に準拠した詳細情報を提供します。

## 認証方式
- **方式**: Supabase Auth (Cookie-based Session)  
- **認証要件**: ほぼ全エンドポイントで認証が必要  
- **例外**: `/api/cleanup`（API Key認証）

## 共通レスポンス形式

### 成功レスポンス
```json
{
  "success": true,
  "data": {},
  "message": "string (optional)"
}
```

### エラーレスポンス
```json
{
  "error": "string",
  "success": false
}
```

---

## 1. 認証API

### POST /api/auth/signin
**概要**: ユーザーサインイン

**認証**: 不要

**リクエストボディ**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**レスポンス**: 200
```json
{
  "success": true,
  "message": "サインインが完了しました",
  "user": {
    "id": "string",
    "email": "string"
  }
}
```

**エラーレスポンス**:
- 400: メールアドレスとパスワードが必要です
- 401: メールアドレスまたはパスワードが正しくありません
- 500: サーバーエラーが発生しました

---

### POST /api/auth/signup
**概要**: ユーザー登録（データベース初期設定含む）

**認証**: 不要

**リクエストボディ**:
```json
{
  "email": "string (required)",
  "password": "string (required, min: 6)"
}
```

**自動作成データ**:
- ユーザープロフィール（ゲーミフィケーション）
- ユーザー設定（デフォルト値）
- デフォルトカテゴリ4種類
- ウェルカム通知

**レスポンス**: 200
```json
{
  "success": true,
  "message": "ユーザー登録が完了しました",
  "user": {
    "id": "string",
    "email": "string"
  }
}
```

**エラーレスポンス**:
- 400: パスワードは6文字以上で入力してください
- 400: このメールアドレスは既に登録されています
- 500: ユーザー情報の作成に失敗しました

---

### POST /api/auth/signout
**概要**: ユーザーサインアウト

**認証**: 不要（Cookie削除）

**リクエストボディ**: 不要

**レスポンス**: 200
```json
{
  "success": true,
  "message": "サインアウトが完了しました"
}
```

---

## 2. 基本CRUD API

### GET /api/routines
**概要**: ユーザーのルーチン一覧取得

**認証**: 必要

**クエリパラメータ**: なし

**レスポンス**: 200
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "name": "string",
      "description": "string?",
      "category": "string",
      "goalType": "frequency_based | schedule_based",
      "targetCount": "number?",
      "targetPeriod": "string?",
      "recurrenceType": "daily | weekly | monthly | custom",
      "recurrenceInterval": "number",
      "monthlyType": "day_of_month | day_of_week | null",
      "dayOfMonth": "number?",
      "weekOfMonth": "number?",
      "dayOfWeek": "number?",
      "daysOfWeek": "string?",
      "startDate": "string?",
      "isActive": "boolean",
      "createdAt": "string",
      "updatedAt": "string",
      "deletedAt": "string?"
    }
  ]
}
```

---

### POST /api/routines
**概要**: ルーチン作成

**認証**: 必要

**リクエストボディ**:
```json
{
  "name": "string (required)",
  "description": "string?",
  "category": "string (required)",
  "goalType": "frequency_based | schedule_based (required)",
  "targetCount": "number? (頻度ベース時必須)",
  "targetPeriod": "string? (頻度ベース時必須)",
  "recurrenceType": "daily | weekly | monthly | custom (required)",
  "recurrenceInterval": "number?",
  "monthlyType": "day_of_month | day_of_week?",
  "dayOfMonth": "number?",
  "weekOfMonth": "number?",
  "dayOfWeek": "number?",
  "daysOfWeek": "string?",
  "startDate": "string?"
}
```

**レスポンス**: 200
```json
{
  "success": true,
  "message": "ルーチンが作成されました",
  "data": { /* Routine object */ }
}
```

**エラーレスポンス**:
- 400: 必須項目が不足しています
- 400: 頻度ベースミッションには目標回数と期間が必要です

---

### GET /api/routines/[id]
**概要**: 個別ルーチン取得

**認証**: 必要（所有者チェック）

**パスパラメータ**:
- `id`: ルーチンID (string)

**レスポンス**: 200
```json
{
  "success": true,
  "data": { /* Routine object */ }
}
```

**エラーレスポンス**:
- 401: 認証に失敗しました
- 403: アクセス権限がありません
- 404: ルーチンが見つかりません

---

### PUT /api/routines/[id]
**概要**: ルーチン更新

**認証**: 必要（所有者チェック）

**パスパラメータ**:
- `id`: ルーチンID (string)

**リクエストボディ**: 更新可能フィールドの任意の組み合わせ
```json
{
  "name": "string?",
  "description": "string?",
  "category": "string?",
  "goalType": "frequency_based | schedule_based?",
  "targetCount": "number?",
  "targetPeriod": "string?",
  "recurrenceType": "daily | weekly | monthly | custom?",
  "recurrenceInterval": "number?",
  "monthlyType": "day_of_month | day_of_week?",
  "dayOfMonth": "number?",
  "weekOfMonth": "number?",
  "dayOfWeek": "number?",
  "daysOfWeek": "string?",
  "startDate": "string?",
  "isActive": "boolean?"
}
```

**レスポンス**: 200
```json
{
  "success": true,
  "message": "ルーチンが更新されました",
  "data": { /* Updated Routine object */ }
}
```

---

### DELETE /api/routines/[id]
**概要**: ルーチンソフトデリート

**認証**: 必要（所有者チェック）

**パスパラメータ**:
- `id`: ルーチンID (string)

**レスポンス**: 200
```json
{
  "success": true,
  "message": "ルーチンが削除されました"
}
```

---

### PATCH /api/routines/[id]
**概要**: ルーチン復元

**認証**: 必要

**パスパラメータ**:
- `id`: ルーチンID (string)

**レスポンス**: 200
```json
{
  "success": true,
  "message": "ルーチンが復元されました",
  "data": { /* Restored Routine object */ }
}
```

---

### GET /api/execution-records
**概要**: 実行記録一覧取得

**認証**: 必要

**クエリパラメータ**:
- `startDate`: 開始日 (string, YYYY-MM-DD)
- `endDate`: 終了日 (string, YYYY-MM-DD)

**レスポンス**: 200
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "routineId": "string",
      "userId": "string",
      "executedAt": "string",
      "duration": "number?",
      "memo": "string?",
      "isCompleted": "boolean",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

---

### POST /api/execution-records
**概要**: 実行記録作成

**認証**: 必要

**リクエストボディ**:
```json
{
  "routineId": "string (required)",
  "executedAt": "string? (default: now)",
  "duration": "number?",
  "memo": "string?",
  "isCompleted": "boolean? (default: false)"
}
```

**レスポンス**: 200
```json
{
  "success": true,
  "message": "実行記録が作成されました",
  "data": { /* ExecutionRecord object */ }
}
```

**エラーレスポンス**:
- 400: ルーチンIDが必要です

---

### PUT /api/execution-records/[id]
**概要**: 実行記録更新

**認証**: 必要（所有者チェック）

**パスパラメータ**:
- `id`: 実行記録ID (string)

**リクエストボディ**: 更新可能フィールドの任意の組み合わせ
```json
{
  "executedAt": "string?",
  "duration": "number?",
  "memo": "string?",
  "isCompleted": "boolean?"
}
```

**レスポンス**: 200
```json
{
  "success": true,
  "message": "実行記録が更新されました",
  "data": { /* Updated ExecutionRecord object */ }
}
```

---

### DELETE /api/execution-records/[id]
**概要**: 実行記録削除

**認証**: 必要（所有者チェック）

**パスパラメータ**:
- `id`: 実行記録ID (string)

**レスポンス**: 200
```json
{
  "success": true,
  "message": "実行記録が削除されました"
}
```

---

### GET /api/categories
**概要**: ユーザーのカテゴリ一覧取得

**認証**: 必要

**クエリパラメータ**:
- `names`: カテゴリ名のみ取得 (boolean, "true")

**レスポンス**: 200
```json
{
  "categories": [
    {
      "id": "string",
      "userId": "string",
      "name": "string",
      "color": "string",
      "isDefault": "boolean",
      "isActive": "boolean",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

**names=true時のレスポンス**:
```json
{
  "categories": ["string"]
}
```

---

### POST /api/categories
**概要**: カテゴリ作成

**認証**: 必要

**リクエストボディ**:
```json
{
  "name": "string (required)",
  "color": "string? (default: グレー)"
}
```

**レスポンス**: 201
```json
{
  "id": "string",
  "userId": "string",
  "name": "string",
  "color": "string",
  "isDefault": false,
  "isActive": true,
  "createdAt": "string",
  "updatedAt": "string"
}
```

**エラーレスポンス**:
- 400: Category name is required

---

### PUT /api/categories/[id]
**概要**: カテゴリ更新

**認証**: 必要

**パスパラメータ**:
- `id`: カテゴリID (string)

**リクエストボディ**: 更新可能フィールドの任意の組み合わせ
```json
{
  "name": "string?",
  "color": "string?",
  "isActive": "boolean?"
}
```

**レスポンス**: 200
```json
{
  /* Updated Category object */
}
```

**エラーレスポンス**:
- 400: No valid fields to update
- 404: Category not found

---

### DELETE /api/categories/[id]
**概要**: カテゴリ削除

**認証**: 必要

**パスパラメータ**:
- `id`: カテゴリID (string)

**クエリパラメータ**:
- `hard`: 物理削除実行 (boolean, "true")

**レスポンス**: 200
```json
{
  "success": true
}
```

---

### GET /api/user-settings
**概要**: ユーザー設定取得

**認証**: 必要

**レスポンス**: 200
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "theme": "light | dark | auto",
    "language": "ja | en",
    "timeFormat": "12h | 24h",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

### PUT /api/user-settings
**概要**: ユーザー設定更新

**認証**: 必要

**リクエストボディ**: 更新可能フィールドの任意の組み合わせ
```json
{
  "theme": "light | dark | auto?",
  "language": "ja | en?",
  "timeFormat": "12h | 24h?",
  "dailyGoal": "number?",
  "weeklyGoal": "number?",
  "monthlyGoal": "number?"
}
```

**レスポンス**: 200
```json
{
  "success": true,
  "message": "ユーザー設定が更新されました",
  "data": { /* Updated UserSetting object */ }
}
```

**エラーレスポンス**:
- 400: 更新可能なフィールドが指定されていません

---

## 3. ゲーミフィケーションAPI

### GET /api/user-profiles
**概要**: ユーザープロフィール取得

**認証**: 不要（userIdパラメータで指定）

**クエリパラメータ**:
- `userId`: ユーザーID (string, required)
- `includeDetails`: バッジ情報含む詳細取得 (boolean)

**レスポンス**: 200
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "level": "number",
    "totalXP": "number",
    "currentXP": "number",
    "nextLevelXP": "number",
    "streak": "number",
    "longestStreak": "number",
    "totalRoutines": "number",
    "totalExecutions": "number",
    "joinedAt": "string",
    "lastActiveAt": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "badges": "array? (includeDetails=true時)"
  }
}
```

**エラーレスポンス**:
- 400: userIdが必要です
- 404: ユーザープロフィールが見つかりません

---

### POST /api/user-profiles
**概要**: ユーザープロフィール操作

**認証**: 不要（userIdパラメータで指定）

**リクエストボディ（action別）**:

**create**: プロフィール作成
```json
{
  "action": "create",
  "userId": "string (required)",
  "level": "number?",
  "totalXP": "number?",
  /* その他初期値 */
}
```

**update**: プロフィール更新
```json
{
  "action": "update",
  "userId": "string (required)",
  /* 更新フィールド */
}
```

**addXP**: XP追加
```json
{
  "action": "addXP",
  "userId": "string (required)",
  "amount": "number (required)",
  "reason": "string (required)",
  "sourceType": "routine_completion | streak_bonus | mission_completion | challenge_completion | daily_bonus | achievement_unlock (required)",
  "sourceId": "string?"
}
```

**updateStreak**: ストリーク更新
```json
{
  "action": "updateStreak",
  "userId": "string (required)",
  "streak": "number (required)"
}
```

**updateStats**: 統計更新
```json
{
  "action": "updateStats",
  "userId": "string (required)",
  /* 統計フィールド */
}
```

**レスポンス**: 200
```json
{
  "success": true,
  "data": { /* 結果オブジェクト */ }
}
```

**エラーレスポンス**:
- 400: 不正なアクションです
- 400: amount, reason, sourceTypeが必要です

---

### GET /api/xp-transactions
**概要**: XP取得履歴

**認証**: 不要（userIdパラメータで指定）

**クエリパラメータ**:
- `userId`: ユーザーID (string, required)
- `type`: 取得種別 (string, default: "history")
  - `history`: 履歴取得
  - `dateRange`: 日付範囲指定
  - `source`: ソース別取得
  - `dailyStats`: 日別統計
  - `total`: 総XP
- `limit`: 取得件数 (number, default: 50)
- `offset`: オフセット (number, default: 0)
- `startDate`: 開始日 (string, type=dateRange時)
- `endDate`: 終了日 (string, type=dateRange時)
- `sourceType`: ソース種別 (string, type=source時)
- `days`: 日数 (number, type=dailyStats時, default: 30)

**レスポンス**: 200
```json
[
  {
    "id": "string",
    "userId": "string",
    "amount": "number",
    "reason": "string",
    "sourceType": "routine_completion | streak_bonus | mission_completion | challenge_completion | daily_bonus | achievement_unlock",
    "sourceId": "string?",
    "createdAt": "string"
  }
]
```

**type=total時のレスポンス**:
```json
{
  "totalXP": "number"
}
```

**エラーレスポンス**:
- 400: userIdが必要です
- 400: startDateとendDateが必要です
- 400: sourceTypeが必要です
- 400: 不正なtypeです

---

### GET /api/badges
**概要**: バッジ一覧取得

**認証**: 不要

**クエリパラメータ**:
- `category`: カテゴリ別取得 (string)

**レスポンス**: 200
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "iconUrl": "string?",
    "rarity": "common | rare | epic | legendary",
    "category": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

---

### POST /api/badges
**概要**: バッジ操作

**認証**: 不要

**リクエストボディ（action別）**:

**create**: バッジ作成
```json
{
  "action": "create",
  "name": "string",
  "description": "string",
  "iconUrl": "string?",
  "rarity": "common | rare | epic | legendary",
  "category": "string"
}
```

**update**: バッジ更新
```json
{
  "action": "update",
  "badgeId": "string (required)",
  /* 更新フィールド */
}
```

**delete**: バッジ削除
```json
{
  "action": "delete",
  "badgeId": "string (required)"
}
```

**レスポンス**: 200
```json
{
  /* Badge object or success message */
}
```

**エラーレスポンス**:
- 400: badgeIdが必要です
- 400: 不正なアクションです

---

### GET /api/user-badges
**概要**: ユーザーバッジ取得

**認証**: 不要（userIdパラメータで指定）

**クエリパラメータ**:
- `userId`: ユーザーID (string, required)

**レスポンス**: 200
```json
[
  {
    "id": "string",
    "userId": "string",
    "badgeId": "string",
    "unlockedAt": "string",
    "isNew": "boolean",
    "createdAt": "string"
  }
]
```

---

### POST /api/user-badges
**概要**: ユーザーバッジ操作

**認証**: 不要

**リクエストボディ（action別）**:

**award**: バッジ授与
```json
{
  "action": "award",
  "userId": "string (required)",
  "badgeId": "string (required)"
}
```

**markViewed**: 新着フラグ解除
```json
{
  "action": "markViewed",
  "userId": "string (required)",
  "badgeId": "string (required)"
}
```

**レスポンス**: 200
```json
{
  /* UserBadge object or success message */
}
```

---

### GET /api/challenges
**概要**: アクティブチャレンジ一覧

**認証**: 不要

**レスポンス**: 200
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "startDate": "string",
    "endDate": "string",
    "type": "weekly | monthly | seasonal | special",
    "participants": "number",
    "maxParticipants": "number?",
    "isActive": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

---

### POST /api/challenges
**概要**: チャレンジ操作

**認証**: 不要

**リクエストボディ（action別）**:

**join**: チャレンジ参加
```json
{
  "action": "join",
  "userId": "string (required)",
  "challengeId": "string (required)"
}
```

**create**: チャレンジ作成
```json
{
  "action": "create",
  "challengeData": {
    "title": "string",
    "description": "string",
    "startDate": "string",
    "endDate": "string",
    "type": "weekly | monthly | seasonal | special",
    "maxParticipants": "number?",
    "requirements": "array?",
    "rewards": "array?"
  }
}
```

**レスポンス**: 200
```json
{
  /* Challenge or UserChallenge object */
}
```

**エラーレスポンス**:
- 400: userIdとchallengeIdが必要です
- 400: challengeDataが必要です
- 400: 不正なアクションです

---

### DELETE /api/challenges/[id]
**概要**: チャレンジ脱退

**認証**: 不要

**パスパラメータ**:
- `id`: チャレンジID (string)

**リクエストボディ**:
```json
{
  "userId": "string (required)"
}
```

**レスポンス**: 200
```json
{
  "success": true
}
```

---

### PATCH /api/challenges/[id]
**概要**: チャレンジ進捗更新

**認証**: 不要

**パスパラメータ**:
- `id`: チャレンジID (string)

**リクエストボディ**:
```json
{
  "userId": "string (required)",
  "progress": "number (required)"
}
```

**レスポンス**: 200
```json
{
  /* Updated UserChallenge object */
}
```

**エラーレスポンス**:
- 400: userIdとprogressが必要です

---

### GET /api/user-challenges
**概要**: ユーザーチャレンジ取得

**認証**: 不要（userIdパラメータで指定）

**クエリパラメータ**:
- `userId`: ユーザーID (string, required)

**レスポンス**: 200
```json
[
  {
    "id": "string",
    "userId": "string",
    "challengeId": "string",
    "joinedAt": "string",
    "progress": "number",
    "isCompleted": "boolean",
    "completedAt": "string?",
    "rank": "number?",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

---

### GET /api/missions
**概要**: アクティブミッション一覧

**認証**: 不要

**レスポンス**: 200
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "streak | count | variety | consistency",
    "targetValue": "number",
    "xpReward": "number",
    "badgeId": "string?",
    "difficulty": "easy | medium | hard | extreme",
    "isActive": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

---

### POST /api/missions
**概要**: ミッション操作

**認証**: 不要

**リクエストボディ（action別）**:

**create**: ミッション作成
```json
{
  "action": "create",
  "title": "string",
  "description": "string",
  "type": "streak | count | variety | consistency",
  "targetValue": "number",
  "xpReward": "number?",
  "badgeId": "string?",
  "difficulty": "easy | medium | hard | extreme?"
}
```

**レスポンス**: 200
```json
{
  /* Mission object */
}
```

**エラーレスポンス**:
- 400: 不正なアクションです

---

### GET /api/user-missions
**概要**: ユーザーミッション取得

**認証**: 不要（userIdパラメータで指定）

**クエリパラメータ**:
- `userId`: ユーザーID (string, required)

**レスポンス**: 200
```json
[
  {
    "id": "string",
    "userId": "string",
    "missionId": "string",
    "progress": "number",
    "isCompleted": "boolean",
    "startedAt": "string",
    "completedAt": "string?",
    "claimedAt": "string?",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

---

### POST /api/user-missions
**概要**: ユーザーミッション操作

**認証**: 不要

**リクエストボディ（action別）**:

**start**: ミッション開始
```json
{
  "action": "start",
  "userId": "string (required)",
  "missionId": "string (required)"
}
```

**updateProgress**: 進捗更新
```json
{
  "action": "updateProgress",
  "userId": "string (required)",
  "missionId": "string (required)",
  "progress": "number (required)"
}
```

**complete**: ミッション完了
```json
{
  "action": "complete",
  "userId": "string (required)",
  "missionId": "string (required)"
}
```

**レスポンス**: 200
```json
{
  /* UserMission object + XP情報（complete時） */
}
```

**エラーレスポンス**:
- 400: userIdとmissionIdが必要です
- 400: progressが必要です
- 400: 不正なアクションです

---

### GET /api/game-notifications
**概要**: ゲーム通知取得

**認証**: 不要（userIdパラメータで指定）

**クエリパラメータ**:
- `userId`: ユーザーID (string, required)
- `unreadOnly`: 未読のみ (boolean)
- `notificationType`: 通知種別 (string)
- `limit`: 取得件数 (number, default: 50)
- `offset`: オフセット (number, default: 0)

**レスポンス**: 200
```json
[
  {
    "id": "string",
    "userId": "string",
    "type": "level_up | badge_unlocked | mission_completed | challenge_completed | streak_milestone | xp_milestone",
    "title": "string",
    "message": "string",
    "data": "string?",
    "isRead": "boolean",
    "createdAt": "string"
  }
]
```

---

### POST /api/game-notifications
**概要**: ゲーム通知操作

**認証**: 不要

**リクエストボディ（action別）**:

**markAsRead**: 既読化
```json
{
  "action": "markAsRead",
  "userId": "string (required)",
  "notificationId": "string (required)"
}
```

**markAllAsRead**: 全既読化
```json
{
  "action": "markAllAsRead",
  "userId": "string (required)"
}
```

**delete**: 通知削除
```json
{
  "action": "delete",
  "userId": "string (required)",
  "notificationId": "string (required)"
}
```

**レスポンス**: 200
```json
{
  /* Updated notification or success message */
}
```

---

### GET /api/catchup-plans
**概要**: 挽回プラン取得

**認証**: 不要（userIdパラメータで指定）

**クエリパラメータ**:
- `userId`: ユーザーID (string, required)
- `routineId`: ルーチン別取得 (string)
- `activeOnly`: アクティブのみ (boolean)

**レスポンス**: 200
```json
[
  {
    "id": "string",
    "routineId": "string",
    "userId": "string",
    "targetPeriodStart": "string",
    "targetPeriodEnd": "string",
    "originalTarget": "number",
    "currentProgress": "number",
    "remainingTarget": "number",
    "suggestedDailyTarget": "number",
    "isActive": "boolean",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

---

### POST /api/catchup-plans
**概要**: 挽回プラン操作

**認証**: 不要

**リクエストボディ（action別）**:

**create**: プラン作成
```json
{
  "action": "create",
  "userId": "string (required)",
  "routineId": "string",
  "targetPeriodStart": "string",
  "targetPeriodEnd": "string",
  "originalTarget": "number",
  "currentProgress": "number",
  "remainingTarget": "number",
  "suggestedDailyTarget": "number"
}
```

**update**: プラン更新
```json
{
  "action": "update",
  "userId": "string (required)",
  "planId": "string (required)",
  /* 更新フィールド */
}
```

**updateProgress**: 進捗更新
```json
{
  "action": "updateProgress",
  "userId": "string (required)",
  "planId": "string (required)",
  "currentProgress": "number (required)"
}
```

**deactivate**: プラン非活性化
```json
{
  "action": "deactivate",
  "userId": "string (required)",
  "planId": "string (required)"
}
```

**レスポンス**: 200
```json
{
  /* CatchupPlan object or success message */
}
```

---

## 4. その他API

### POST /api/cleanup
**概要**: 削除済みルーチンの物理削除（cronジョブ用）

**認証**: API Key（Bearer Token）
- Header: `Authorization: Bearer ${CLEANUP_API_KEY}`

**機能**:
- 24時間以上前にソフトデリートされたルーチンを物理削除

**レスポンス**: 200
```json
{
  "success": true,
  "message": "X件のルーチンを物理削除しました",
  "deleted": "number"
}
```

**エラーレスポンス**:
- 401: 認証が必要です
- 500: クリーンアップに失敗しました

---

## 5. データベーススキーマ型定義

### 基本テーブル型

**User**:
```typescript
{
  id: string,
  email: string,
  displayName?: string,
  firstName?: string,
  lastName?: string,
  avatarUrl?: string,
  bio?: string,
  timezone: string,
  status: 'active' | 'inactive' | 'suspended',
  emailVerified: boolean,
  lastLoginAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Routine**:
```typescript
{
  id: string,
  userId: string,
  name: string,
  description?: string,
  category: string,
  goalType: 'frequency_based' | 'schedule_based',
  targetCount?: number,
  targetPeriod?: string,
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'custom',
  recurrenceInterval: number,
  monthlyType?: 'day_of_month' | 'day_of_week',
  dayOfMonth?: number,
  weekOfMonth?: number,
  dayOfWeek?: number,
  daysOfWeek?: string,
  startDate?: Date,
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean,
  deletedAt?: Date
}
```

**ExecutionRecord**:
```typescript
{
  id: string,
  routineId: string,
  userId: string,
  executedAt: Date,
  duration?: number,
  memo?: string,
  isCompleted: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### ゲーミフィケーション型

**UserProfile**:
```typescript
{
  userId: string,
  level: number,
  totalXP: number,
  currentXP: number,
  nextLevelXP: number,
  streak: number,
  longestStreak: number,
  totalRoutines: number,
  totalExecutions: number,
  joinedAt: Date,
  lastActiveAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 6. エラーハンドリング標準

### HTTPステータスコード
- **200**: 成功
- **201**: 作成成功
- **400**: バリデーションエラー
- **401**: 認証エラー
- **403**: 認可エラー
- **404**: リソース未発見
- **500**: サーバー内部エラー

### エラーメッセージ形式
```json
{
  "error": "具体的なエラーメッセージ（日本語）",
  "success": false
}
```

### 一般的なエラーパターン
1. **認証エラー**: 認証に失敗しました / 認証が必要です
2. **認可エラー**: アクセス権限がありません
3. **バリデーションエラー**: XXXが必要です / 必須項目が不足しています
4. **リソースエラー**: XXXが見つかりません
5. **サーバーエラー**: XXXの処理に失敗しました / サーバーエラーが発生しました

## 7. API使用例

### ルーチン作成から実行記録まで
```bash
# 1. サインイン
curl -X POST /api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 2. ルーチン作成
curl -X POST /api/routines \
  -H "Content-Type: application/json" \
  -d '{"name":"朝の運動","category":"健康","goalType":"schedule_based","recurrenceType":"daily"}'

# 3. 実行記録作成
curl -X POST /api/execution-records \
  -H "Content-Type: application/json" \
  -d '{"routineId":"routine-id","isCompleted":true,"duration":30}'

# 4. XP追加
curl -X POST /api/user-profiles \
  -H "Content-Type: application/json" \
  -d '{"action":"addXP","userId":"user-id","amount":10,"reason":"朝の運動完了","sourceType":"routine_completion"}'
```

このAPI仕様書は実際のコードベースから逆生成されており、2025年1月時点の実装状況を正確に反映しています。