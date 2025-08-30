# ルーチンレコード API仕様書（逆生成）

## 分析日時
2025年8月28日 JST

## ベースURL
`/api` (Next.js API Routes)

## 認証方式
**Supabase Auth** + **HTTP-Only Cookie**
- JWT トークン（自動管理）
- セッションクッキー: `sb-access-token`, `sb-refresh-token`
- Row Level Security (RLS) によるデータアクセス制御

## 共通レスポンス形式

### 成功レスポンス
```typescript
{
  success: true;
  data: T; // エンドポイント固有のデータ型
  message?: string; // オプショナルメッセージ
}
```

### エラーレスポンス
```typescript
{
  success: false;
  error: string; // エラーメッセージ
  data?: never;
}
```

## API エンドポイント一覧

### 認証関連 API

#### POST /api/auth/signin
**説明**: ユーザーサインイン

**リクエスト**:
```typescript
{
  email: string;
  password: string;
}
```

**レスポンス成功**:
```typescript
{
  success: true;
  message: "サインインが完了しました";
  user: {
    id: string;
    email: string;
  }
}
```

**エラーレスポンス**:
```typescript
{
  success: false;
  error: "メールアドレスまたはパスワードが正しくありません"
}
```

**ステータスコード**:
- `200`: 成功
- `400`: バリデーションエラー
- `401`: 認証失敗
- `500`: サーバーエラー

#### POST /api/auth/signup
**説明**: ユーザーサインアップ

**リクエスト**:
```typescript
{
  email: string;
  password: string;
}
```

**レスポンス**:
```typescript
{
  success: true;
  message: "サインアップが完了しました";
  user: {
    id: string;
    email: string;
  }
}
```

#### POST /api/auth/signout
**説明**: ユーザーサインアウト

**レスポンス**:
```typescript
{
  success: true;
  message: "サインアウトが完了しました"
}
```

### ルーチン管理 API

#### GET /api/routines
**説明**: ユーザーのルーチン一覧取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Routine[]
}

interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  category: string;
  goalType: 'frequency_based' | 'schedule_based';
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'custom';
  targetCount: number | null;
  targetPeriod: string | null;
  recurrenceInterval: number;
  monthlyType?: 'day_of_month' | 'day_of_week' | null;
  dayOfMonth?: number | null;
  weekOfMonth?: number | null;
  dayOfWeek?: number | null;
  daysOfWeek?: string | null;
  startDate?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
```

#### POST /api/routines
**説明**: ルーチン作成

**認証**: 必須

**リクエスト**:
```typescript
{
  name: string;
  description?: string | null;
  category: string;
  goalType: 'frequency_based' | 'schedule_based';
  targetCount?: number | null;
  targetPeriod?: string | null;
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrenceInterval?: number;
  monthlyType?: 'day_of_month' | 'day_of_week' | null;
  dayOfMonth?: number | null;
  weekOfMonth?: number | null;
  dayOfWeek?: number | null;
  daysOfWeek?: string | null;
  startDate?: Date | string | null;
}
```

**バリデーション**:
- `name`: 必須、1-100文字
- `category`: 必須、1-50文字
- `goalType`: 必須、enum値
- `recurrenceType`: 必須、enum値
- 頻度ベースの場合: `targetCount` と `targetPeriod` が必須

**レスポンス**:
```typescript
{
  success: true;
  message: "ルーチンが作成されました";
  data: Routine
}
```

#### GET /api/routines/[id]
**説明**: 個別ルーチン取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Routine
}
```

**エラー**:
- `404`: ルーチンが見つかりません
- `403`: アクセス権限がありません

#### PUT /api/routines/[id]
**説明**: ルーチン更新

**認証**: 必須

**リクエスト**: ルーチン作成と同じ形式（部分更新可能）

**レスポンス**:
```typescript
{
  success: true;
  message: "ルーチンが更新されました";
  data: Routine
}
```

#### DELETE /api/routines/[id]
**説明**: ルーチン削除（論理削除）

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  message: "ルーチンが削除されました"
}
```

#### PATCH /api/routines/[id]
**説明**: ルーチン復元

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  message: "ルーチンが復元されました";
  data: Routine
}
```

### 実行記録 API

#### GET /api/execution-records
**説明**: 実行記録一覧取得

**認証**: 必須

**クエリパラメータ**:
- `startDate?: string` - 開始日 (ISO string)
- `endDate?: string` - 終了日 (ISO string)

**レスポンス**:
```typescript
{
  success: true;
  data: ExecutionRecord[]
}

interface ExecutionRecord {
  id: string;
  routineId: string;
  userId: string;
  executedAt: Date;
  duration: number | null; // 分単位
  memo: string | null;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### POST /api/execution-records
**説明**: 実行記録作成

**認証**: 必須

**リクエスト**:
```typescript
{
  routineId: string;
  executedAt?: string | Date;
  duration?: number | null;
  memo?: string | null;
  isCompleted?: boolean;
}
```

**バリデーション**:
- `routineId`: 必須

**レスポンス**:
```typescript
{
  success: true;
  message: "実行記録が作成されました";
  data: ExecutionRecord
}
```

#### GET /api/execution-records/[id]
**説明**: 個別実行記録取得

**認証**: 必須

#### PUT /api/execution-records/[id]
**説明**: 実行記録更新

**認証**: 必須

#### DELETE /api/execution-records/[id]
**説明**: 実行記録削除

**認証**: 必須

### カテゴリ管理 API

#### GET /api/categories
**説明**: カテゴリ一覧取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Category[]
}

interface Category {
  id: string;
  userId: string;
  name: string;
  color: string; // Tailwind CSS classes
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### POST /api/categories
**説明**: カテゴリ作成

**認証**: 必須

#### GET /api/categories/[id]
**説明**: 個別カテゴリ取得

**認証**: 必須

#### PUT /api/categories/[id]
**説明**: カテゴリ更新

**認証**: 必須

#### DELETE /api/categories/[id]
**説明**: カテゴリ削除

**認証**: 必須

### ユーザー設定 API

#### GET /api/user-settings
**説明**: ユーザー設定取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: UserSetting
}

interface UserSetting {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'ja' | 'en';
  timeFormat: '12h' | '24h';
  createdAt: Date;
  updatedAt: Date;
}
```

#### PUT /api/user-settings
**説明**: ユーザー設定更新

**認証**: 必須

**リクエスト**:
```typescript
{
  theme?: 'light' | 'dark' | 'auto';
  language?: 'ja' | 'en';
  timeFormat?: '12h' | '24h';
}
```

### ゲーミフィケーション API

#### GET /api/user-profiles
**説明**: ユーザープロフィール取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: UserProfile
}

interface UserProfile {
  userId: string;
  level: number;
  totalXP: number;
  currentXP: number;
  nextLevelXP: number;
  streak: number;
  longestStreak: number;
  totalRoutines: number;
  totalExecutions: number;
  joinedAt: Date;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### GET /api/missions
**説明**: アクティブミッション取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Mission[]
}

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'count' | 'variety' | 'consistency';
  targetValue: number;
  xpReward: number;
  badgeId?: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### POST /api/missions
**説明**: ミッション作成（管理者用）

**認証**: 必須

**リクエスト**:
```typescript
{
  action: 'create';
  title: string;
  description: string;
  type: 'streak' | 'count' | 'variety' | 'consistency';
  targetValue: number;
  xpReward?: number;
  badgeId?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
}
```

#### GET /api/user-missions
**説明**: ユーザーミッション進捗取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: UserMission[]
}

interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  progress: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date | null;
  claimedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### GET /api/challenges
**説明**: アクティブチャレンジ取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Challenge[]
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  type: 'weekly' | 'monthly' | 'seasonal' | 'special';
  participants: number;
  maxParticipants?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### GET /api/challenges/[id]
**説明**: 個別チャレンジ詳細取得

**認証**: 必須

#### GET /api/user-challenges
**説明**: ユーザーチャレンジ参加状況取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: UserChallenge[]
}

interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  joinedAt: Date;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date | null;
  rank?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### GET /api/badges
**説明**: バッジ一覧取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Badge[]
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### GET /api/user-badges
**説明**: ユーザー獲得バッジ取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: UserBadge[]
}

interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  unlockedAt: Date;
  isNew: boolean;
  createdAt: Date;
}
```

#### GET /api/xp-transactions
**説明**: XP獲得履歴取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: XPTransaction[]
}

interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  sourceType: 'routine_completion' | 'streak_bonus' | 'mission_completion' | 'challenge_completion' | 'daily_bonus' | 'achievement_unlock';
  sourceId?: string | null;
  createdAt: Date;
}
```

#### GET /api/game-notifications
**説明**: ゲーム通知取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: GameNotification[]
}

interface GameNotification {
  id: string;
  userId: string;
  type: 'level_up' | 'badge_unlocked' | 'mission_completed' | 'challenge_completed' | 'streak_milestone' | 'xp_milestone';
  title: string;
  message: string;
  data?: string | null; // JSON文字列
  isRead: boolean;
  createdAt: Date;
}
```

### その他のAPI

#### GET /api/catchup-plans
**説明**: キャッチアッププラン取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: CatchupPlan[]
}

interface CatchupPlan {
  id: string;
  routineId: string;
  userId: string;
  targetPeriodStart: Date;
  targetPeriodEnd: Date;
  originalTarget: number;
  currentProgress: number;
  remainingTarget: number;
  suggestedDailyTarget: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### POST /api/cleanup
**説明**: データクリーンアップ（管理者用）

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  message: "データクリーンアップが完了しました"
}
```

## エラーコード一覧

| HTTPステータス | エラーメッセージ | 説明 |
|---------------|-----------------|------|
| 400 | 必須項目が不足しています | リクエストの必須パラメータが不足 |
| 400 | バリデーションエラーが発生しました | 入力値検証エラー |
| 401 | 認証が必要です | 認証トークンが無効または期限切れ |
| 403 | アクセス権限がありません | リソースへのアクセス権限なし |
| 404 | リソースが見つかりません | 指定されたリソースが存在しない |
| 500 | サーバーエラーが発生しました | 予期しないサーバーエラー |

## レート制限
現在未実装（将来の拡張予定）

## CORS設定
Next.js デフォルト設定
- 同一オリジン: 許可
- クロスオリジン: 設定に応じて

## API使用例

### TypeScript クライアント例
```typescript
import { typedPost } from '@/lib/api-client/fetch-client';
import { z } from 'zod';

// ルーチン作成
const RoutineSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    name: z.string(),
    // ... 他のフィールド
  })
});

const createRoutine = async (routineData: RoutineCreateRequest) => {
  return typedPost('/api/routines', RoutineSchema, routineData);
};
```

### 認証付きリクエスト例
```typescript
// Cookieは自動的に送信されるため、明示的な認証ヘッダーは不要
const response = await fetch('/api/routines', {
  method: 'GET',
  credentials: 'include', // Cookieを含める
});
```

## API設計原則

### RESTful設計
- リソースベースのURL設計
- HTTP動詞の適切な使用
- ステータスコードの統一

### 型安全性
- TypeScriptインターフェース提供
- Zodスキーマによるバリデーション
- 型付きAPIクライアント

### セキュリティ
- Row Level Security (RLS)
- CSRF保護（Next.js内蔵）
- 入力値検証

### パフォーマンス
- 適切なインデックス設定
- ページネーション（将来実装予定）
- レスポンス圧縮

---

## 将来の拡張予定

### v2.0
- GraphQL API追加
- WebSocket接続（リアルタイム）
- レート制限実装

### v2.1
- バッチ処理API
- ファイルアップロード
- 外部API連携