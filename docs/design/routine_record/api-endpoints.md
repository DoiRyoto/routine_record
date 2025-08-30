# API エンドポイント設計

## 設計概要

**設計日時**: 2025年8月29日  
**設計根拠**: 要件定義書に基づくRESTful API設計  
**フレームワーク**: Next.js 15.4.5 API Routes  
**認証方式**: Supabase Auth + HTTP-Only Cookie  

## 設計原則

### RESTful設計
- リソースベースのURL設計
- HTTP動詞の適切な使用（GET, POST, PUT, DELETE, PATCH）
- 一貫したレスポンス形式
- ステータスコードの統一使用

### セキュリティファースト
- 全てのエンドポイントで認証・認可チェック
- Row Level Security (RLS) による自動データフィルタリング
- CSRF保護（Next.js内蔵）
- 入力値検証の徹底

### 型安全性
- TypeScriptインターフェースによる完全な型定義
- Zodスキーマによるランタイムバリデーション
- 型付きAPIクライアント対応

## ベース設定

### ベースURL
```
/api
```

### 認証方式
- **JWT Token**: Supabase Auth管理
- **Cookie**: `sb-access-token`, `sb-refresh-token`（HTTPOnly）
- **Middleware**: 全APIルートで自動認証チェック

### 共通レスポンス形式

#### 成功レスポンス
```typescript
{
  success: true;
  data: T; // エンドポイント固有のデータ型
  message?: string; // オプショナルメッセージ
}
```

#### エラーレスポンス
```typescript
{
  success: false;
  error: string; // エラーメッセージ
  data?: never;
}
```

### 共通HTTPステータスコード

| コード | 意味 | 使用場面 |
|--------|------|----------|
| 200 | OK | 成功 |
| 201 | Created | 作成成功 |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 認可エラー |
| 404 | Not Found | リソースが存在しない |
| 500 | Internal Server Error | サーバーエラー |

## 認証関連API

### POST /api/auth/signin
**要件**: REQ-001（ユーザー認証）

**目的**: ユーザーサインイン

**リクエスト**:
```typescript
{
  email: string;
  password: string;
}
```

**バリデーション**:
- email: 必須、有効なメールアドレス形式
- password: 必須、6文字以上

**レスポンス成功例**:
```typescript
{
  success: true;
  message: "サインインが完了しました";
  data: {
    user: {
      id: string;
      email: string;
    }
  }
}
```

**エラー例**:
- 400: バリデーションエラー
- 401: 認証情報が正しくない
- 500: サーバーエラー

### POST /api/auth/signup
**要件**: REQ-001（ユーザー認証）

**目的**: ユーザー新規登録

**リクエスト**:
```typescript
{
  email: string;
  password: string;
}
```

**処理内容**:
1. Supabase Authでユーザー作成
2. usersテーブルに基本情報登録
3. user_profiles, user_settingsテーブル自動作成（トリガー）

**レスポンス成功例**:
```typescript
{
  success: true;
  message: "サインアップが完了しました。確認メールをお送りしました";
  data: {
    user: {
      id: string;
      email: string;
      emailVerified: false;
    }
  }
}
```

### POST /api/auth/signout
**要件**: REQ-001（ユーザー認証）

**目的**: ユーザーサインアウト

**認証**: 必須

**処理内容**:
1. Supabaseセッション無効化
2. HTTPOnlyクッキー削除

**レスポンス**:
```typescript
{
  success: true;
  message: "サインアウトが完了しました";
}
```

## ルーチン管理API

### GET /api/routines
**要件**: REQ-002（ルーチン作成）、REQ-201（ログイン状態でのアクセス制御）

**目的**: ユーザーのルーチン一覧取得

**認証**: 必須

**クエリパラメータ**:
```typescript
{
  category?: string; // カテゴリフィルター
  isActive?: boolean; // アクティブフィルター
  goalType?: 'frequency_based' | 'schedule_based'; // ゴールタイプフィルター
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: Routine[];
}
```

**RLSによる自動フィルタリング**: ログインユーザーのデータのみ返却

### POST /api/routines
**要件**: REQ-002（ルーチン作成）、REQ-101（頻度ベース検証）、REQ-402（入力検証）

**目的**: 新しいルーチン作成

**認証**: 必須

**リクエスト**:
```typescript
{
  name: string;
  description?: string | null;
  category: string;
  goalType: 'frequency_based' | 'schedule_based';
  targetCount?: number | null; // 頻度ベース時必須
  targetPeriod?: string | null; // 頻度ベース時必須
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
- name: 必須、1-255文字（REQ-404）
- category: 必須、1-50文字
- goalType: 必須、enum値
- REQ-101: 頻度ベース時はtargetCount、targetPeriodが必須

**ビジネスルール**:
```typescript
// REQ-101: 頻度ベースの検証
if (goalType === 'frequency_based') {
  if (!targetCount || !targetPeriod) {
    throw new ValidationError('頻度ベースの場合、目標回数と期間は必須です');
  }
}
```

**レスポンス**:
```typescript
{
  success: true;
  message: "ルーチンが作成されました";
  data: Routine;
}
```

### GET /api/routines/[id]
**要件**: REQ-002（ルーチン作成）、REQ-201（アクセス制御）

**目的**: 個別ルーチン詳細取得

**認証**: 必須

**パスパラメータ**:
- id: ルーチンID（UUID）

**レスポンス**:
```typescript
{
  success: true;
  data: Routine;
}
```

**エラー**:
- 404: ルーチンが見つからない、またはアクセス権限なし

### PUT /api/routines/[id]
**要件**: REQ-002（ルーチン作成）、REQ-101（頻度ベース検証）

**目的**: ルーチン更新

**認証**: 必須

**リクエスト**: 作成時と同じ形式（部分更新可能）

**レスポンス**:
```typescript
{
  success: true;
  message: "ルーチンが更新されました";
  data: Routine;
}
```

### DELETE /api/routines/[id]
**要件**: REQ-002（ルーチン作成）

**目的**: ルーチン削除（論理削除）

**認証**: 必須

**処理内容**:
1. deleted_atタイムスタンプを設定
2. 関連する実行記録は保持
3. is_activeをfalseに設定

**レスポンス**:
```typescript
{
  success: true;
  message: "ルーチンが削除されました";
}
```

### PATCH /api/routines/[id]
**要件**: ルーチン復元機能

**目的**: 削除されたルーチンの復元

**認証**: 必須

**処理内容**:
1. deleted_atをNULLに設定
2. is_activeをtrueに設定

**レスポンス**:
```typescript
{
  success: true;
  message: "ルーチンが復元されました";
  data: Routine;
}
```

## 実行記録API

### GET /api/execution-records
**要件**: REQ-003（実行記録）

**目的**: 実行記録一覧取得

**認証**: 必須

**クエリパラメータ**:
```typescript
{
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  routineId?: string; // 特定ルーチンの記録
  isCompleted?: boolean; // 完了フィルター
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: ExecutionRecord[];
}
```

### POST /api/execution-records
**要件**: REQ-003（実行記録）、REQ-102（非アクティブルーチンの実行制限）

**目的**: 実行記録作成

**認証**: 必須

**リクエスト**:
```typescript
{
  routineId: string;
  executedAt?: string | Date;
  duration?: number | null; // 分単位
  memo?: string | null;
  isCompleted?: boolean;
}
```

**ビジネスルール**:
```typescript
// REQ-102: アクティブなルーチンのみ実行可能
const routine = await getRoutineById(routineId);
if (!routine.isActive || routine.deletedAt) {
  throw new BusinessRuleViolationError('非アクティブなルーチンは実行できません');
}
```

**副作用**:
1. XP計算・付与（XPCalculationService）
2. ミッション進捗更新
3. チャレンジ進捗更新
4. 通知生成

**レスポンス**:
```typescript
{
  success: true;
  message: "実行記録が作成されました";
  data: ExecutionRecord & {
    xpGained?: number;
    levelUp?: boolean;
    badgesUnlocked?: string[];
  };
}
```

### PUT /api/execution-records/[id]
**要件**: REQ-003（実行記録）

**目的**: 実行記録更新

**認証**: 必須

**リクエスト**: 作成時と同じ形式（部分更新可能）

### DELETE /api/execution-records/[id]
**要件**: REQ-003（実行記録）

**目的**: 実行記録削除

**認証**: 必須

**処理内容**:
1. XP調整（取り消し）
2. ミッション進捗調整
3. 統計情報更新

## カテゴリ管理API

### GET /api/categories
**要件**: REQ-009（カテゴリ管理）

**目的**: ユーザーのカテゴリ一覧取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Category[];
}
```

### POST /api/categories
**要件**: REQ-009（カテゴリ管理）

**目的**: カテゴリ作成

**認証**: 必須

**リクエスト**:
```typescript
{
  name: string;
  color?: string; // Tailwind CSSクラス
  isDefault?: boolean;
}
```

**バリデーション**:
- name: 必須、1-50文字、ユーザー内で一意

### PUT /api/categories/[id]
### DELETE /api/categories/[id]
**要件**: REQ-009（カテゴリ管理）

## ユーザー設定API

### GET /api/user-settings
**要件**: REQ-010（設定管理）

**目的**: ユーザー設定取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: UserSetting;
}
```

### PUT /api/user-settings
**要件**: REQ-010（設定管理）

**目的**: ユーザー設定更新

**認証**: 必須

**リクエスト**:
```typescript
{
  theme?: 'light' | 'dark' | 'auto';
  language?: 'ja' | 'en';
  timeFormat?: '12h' | '24h';
}
```

## ゲーミフィケーションAPI

### GET /api/user-profiles
**要件**: REQ-004（XP・レベルシステム）、REQ-008（ユーザープロフィール）

**目的**: ユーザープロフィール取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: UserProfile;
}
```

### GET /api/missions
**要件**: REQ-006（ミッションシステム）

**目的**: アクティブミッション一覧取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Mission[];
}
```

### POST /api/missions
**要件**: REQ-006（ミッションシステム）

**目的**: ミッション作成（管理者用）

**認証**: 必須（管理者権限）

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

### GET /api/user-missions
**要件**: REQ-006（ミッションシステム）

**目的**: ユーザーミッション進捗取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: UserMission[];
}
```

### GET /api/challenges
**要件**: REQ-007（チャレンジシステム）

**目的**: アクティブチャレンジ一覧取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Challenge[];
}
```

### GET /api/challenges/[id]
**要件**: REQ-007（チャレンジシステム）

**目的**: チャレンジ詳細取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Challenge & {
    requirements?: any[];
    rewards?: any[];
    currentParticipants: number;
    userParticipation?: UserChallenge;
  };
}
```

### POST /api/challenges/[id]/join
**要件**: REQ-007（チャレンジシステム）

**目的**: チャレンジ参加

**認証**: 必須

**処理内容**:
1. 参加条件チェック（定員、期限）
2. user_challengesレコード作成
3. challenges.participants インクリメント

**レスポンス**:
```typescript
{
  success: true;
  message: "チャレンジに参加しました";
  data: UserChallenge;
}
```

### DELETE /api/challenges/[id]/join
**要件**: REQ-007（チャレンジシステム）

**目的**: チャレンジ離脱

**認証**: 必須

### GET /api/user-challenges
**要件**: REQ-007（チャレンジシステム）

**目的**: ユーザーチャレンジ参加状況取得

**認証**: 必須

### GET /api/badges
**要件**: REQ-005（バッジシステム）

**目的**: 全バッジ一覧取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: Badge[];
}
```

### GET /api/user-badges
**要件**: REQ-005（バッジシステム）

**目的**: ユーザー獲得バッジ取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: (UserBadge & { badge: Badge })[];
}
```

### PATCH /api/user-badges/[id]/read
**要件**: REQ-005（バッジシステム）

**目的**: バッジの新着フラグ解除

**認証**: 必須

**処理内容**:
- is_newをfalseに更新

### GET /api/xp-transactions
**要件**: REQ-004（XP・レベルシステム）、REQ-103（XP獲得時の通知）

**目的**: XP獲得履歴取得

**認証**: 必須

**クエリパラメータ**:
```typescript
{
  startDate?: string;
  endDate?: string;
  sourceType?: XPSourceType;
  limit?: number;
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: XPTransaction[];
}
```

### GET /api/game-notifications
**要件**: REQ-103（XP獲得時の通知）、REQ-104（レベルアップ時の特別通知）

**目的**: ゲーム通知取得

**認証**: 必須

**クエリパラメータ**:
```typescript
{
  isRead?: boolean;
  type?: NotificationType;
  limit?: number;
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: GameNotification[];
}
```

### PATCH /api/game-notifications/[id]/read
**要件**: REQ-103（通知管理）

**目的**: 通知既読化

**認証**: 必須

### DELETE /api/game-notifications/[id]
**要件**: REQ-103（通知管理）

**目的**: 通知削除

**認証**: 必須

## 統計・分析API

### GET /api/statistics/dashboard
**要件**: 統計機能（ダッシュボード用）

**目的**: ダッシュボード統計取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: {
    todayProgress: {
      completed: number;
      total: number;
      percentage: number;
    };
    weeklyProgress: number[];
    currentStreak: number;
    totalXP: number;
    level: number;
    recentAchievements: UserBadge[];
  };
}
```

### GET /api/statistics/routines
**要件**: 統計機能（ルーチン分析）

**目的**: ルーチン統計取得

**認証**: 必須

**クエリパラメータ**:
```typescript
{
  period: 'week' | 'month' | 'year';
  routineId?: string; // 特定ルーチンの統計
}
```

**レスポンス**:
```typescript
{
  success: true;
  data: {
    completionRate: number;
    totalExecutions: number;
    averageDuration: number;
    categoryDistribution: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    dailyProgress: Array<{
      date: string;
      completed: number;
      total: number;
    }>;
  };
}
```

## その他のAPI

### GET /api/catchup-plans
**要件**: REQ-301（挽回プランの提案）

**目的**: キャッチアッププラン取得

**認証**: 必須

**レスポンス**:
```typescript
{
  success: true;
  data: CatchupPlan[];
}
```

### POST /api/catchup-plans
**要件**: REQ-301（挽回プランの提案）

**目的**: キャッチアッププラン生成

**認証**: 必須

**リクエスト**:
```typescript
{
  routineId: string;
  targetPeriodEnd: string; // ISO date
}
```

**処理内容**:
1. 現在の進捗分析
2. 残り期間計算
3. 提案する日次目標計算

### POST /api/cleanup
**目的**: データクリーンアップ（管理者用）

**認証**: 必須（管理者権限）

**処理内容**:
1. 古い通知の削除（30日以上前の既読通知）
2. 期限切れチャレンジの非アクティブ化
3. 統計情報の再計算

## エラーハンドリング

### エラーレスポンス統一形式

```typescript
{
  success: false;
  error: string;
  code?: string; // エラーコード
  details?: any; // 詳細情報（開発時のみ）
}
```

### カスタムエラー種別

```typescript
// バリデーションエラー
{
  success: false;
  error: "バリデーションエラーが発生しました";
  code: "VALIDATION_ERROR";
  details: {
    fields: {
      name: ["名前は必須です", "名前は255文字以内で入力してください"];
      email: ["有効なメールアドレスを入力してください"];
    }
  }
}

// ビジネスルール違反
{
  success: false;
  error: "非アクティブなルーチンは実行できません";
  code: "BUSINESS_RULE_VIOLATION";
}

// 認証エラー
{
  success: false;
  error: "認証が必要です";
  code: "AUTHENTICATION_REQUIRED";
}

// 認可エラー
{
  success: false;
  error: "このリソースにアクセスする権限がありません";
  code: "AUTHORIZATION_FAILED";
}
```

## API使用例

### TypeScriptクライアント例

```typescript
import { typedPost, typedGet } from '@/lib/api-client/fetch-client';
import { z } from 'zod';

// ルーチン作成
const RoutineResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    name: z.string(),
    // ... 他のフィールド
  })
});

const createRoutine = async (routineData: RoutineCreateRequest) => {
  return typedPost('/api/routines', RoutineResponseSchema, routineData);
};

// ルーチン一覧取得
const RoutinesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.object({
    id: z.string(),
    name: z.string(),
    // ... 他のフィールド
  }))
});

const getRoutines = async () => {
  return typedGet('/api/routines', RoutinesResponseSchema);
};
```

### エラーハンドリング例

```typescript
try {
  const result = await createRoutine(routineData);
  if (result.success) {
    console.log('ルーチン作成成功:', result.data);
  }
} catch (error) {
  if (error.status === 400) {
    // バリデーションエラー
    console.error('入力値エラー:', error.details);
  } else if (error.status === 401) {
    // 認証エラー
    router.push('/auth/signin');
  } else {
    // その他のエラー
    showSnackbar('エラーが発生しました', 'error');
  }
}
```

## パフォーマンス最適化

### レスポンス最適化
- 必要なデータのみ返却
- JOIN クエリの最適化
- ページネーション実装（将来）
- キャッシュヘッダーの適切な設定

### セキュリティ最適化
- Rate Limiting（将来実装）
- Request Body サイズ制限
- SQL Injection対策（ORMによる自動対策）
- XSS対策（Next.js内蔵）

## 将来の拡張予定

### v2.0予定
- GraphQL API追加
- WebSocket接続（リアルタイム通知）
- バッチ処理API
- ファイルアップロード機能

### v2.1予定
- 外部API連携（フィットネストラッカー等）
- 高度な分析API
- ソーシャル機能API
- モバイルアプリ専用API

---

## 設計の特徴と利点

### 強み
1. **要件完全対応**: 要件定義書のすべての機能要件に対応
2. **型安全性**: TypeScriptによる完全な型定義
3. **セキュリティ**: RLSとミドルウェアによる多層防御
4. **拡張性**: Clean Architectureによる保守しやすい設計
5. **一貫性**: 統一されたレスポンス形式とエラーハンドリング

### 設計判断の理由
1. **RESTful設計採用**: 標準的で理解しやすい、ツール対応が豊富
2. **Next.js API Routes**: フルスタック開発による効率性
3. **Supabase Auth**: セキュアで管理不要な認証システム
4. **TypeScript + Zod**: 開発時とランタイムの両方での型安全性

この設計により、要件定義書で定義されたすべての機能を安全で効率的に実装可能な、企業レベルのAPI基盤が構築できます。