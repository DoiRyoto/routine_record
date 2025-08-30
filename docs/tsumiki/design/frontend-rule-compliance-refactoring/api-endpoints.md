# API エンドポイント仕様

## 設計原則

### RESTful API設計
- **リソース指向**: エンドポイントはリソースを表現
- **HTTPメソッド活用**: GET, POST, PATCH, DELETE を適切に使用
- **ステータスコード**: 標準HTTPステータスコードを使用
- **統一レスポンス**: 全エンドポイントで統一されたレスポンス形式

### 認証・認可
- **認証方式**: Supabase Auth + Cookie Session
- **認可チェック**: Server Actions内で実装
- **CSRF対策**: Next.js標準のCSRF保護を活用

### Next.js 15 対応
- **Promise型params**: 全エンドポイントでPromise型パラメータ対応
- **App Router**: `/app/api/` 構造に準拠

---

## 認証 API

### POST /api/auth/signin
ユーザーサインイン

**リクエスト**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**レスポンス（成功）**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "displayName": "John Doe",
      "avatarUrl": "https://example.com/avatar.jpg"
    },
    "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-01-31T12:00:00.000Z"
  },
  "metadata": {
    "requestId": "req_123456789",
    "timestamp": "2025-01-30T12:00:00.000Z",
    "version": "1.0"
  }
}
```

**レスポンス（エラー）**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "メールアドレスまたはパスワードが間違っています",
    "timestamp": "2025-01-30T12:00:00.000Z"
  }
}
```

### POST /api/auth/signup
ユーザー新規登録

**リクエスト**:
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123",
  "displayName": "New User"
}
```

**レスポンス（成功）**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "email": "newuser@example.com",
      "displayName": "New User",
      "emailVerified": false
    },
    "emailVerificationRequired": true
  }
}
```

### POST /api/auth/signout
ユーザーサインアウト

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "signedOut": true
  }
}
```

---

## ルーチン管理 API

### GET /api/routines
ルーチン一覧取得

**クエリパラメータ**:
- `category` (optional): カテゴリ名でフィルタ
- `isActive` (optional): アクティブ状態でフィルタ（true/false）
- `page` (optional): ページ番号（デフォルト: 1）
- `limit` (optional): 1ページあたりの件数（デフォルト: 20）

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "routine-123",
      "userId": "user-123",
      "name": "朝の散歩",
      "description": "健康のための朝の散歩習慣",
      "category": "Health",
      "goalType": "schedule_based",
      "recurrenceType": "daily",
      "reminderTime": "07:00",
      "estimatedDuration": 30,
      "isActive": true,
      "xpReward": 10,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "metadata": {
    "totalCount": 15,
    "currentPage": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

### GET /api/routines/[id]
特定ルーチン取得

**パラメータ**:
- `id`: ルーチンID（UUID）

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "routine-123",
    "userId": "user-123",
    "name": "朝の散歩",
    "description": "健康のための朝の散歩習慣",
    "category": "Health",
    "goalType": "schedule_based",
    "recurrenceType": "daily",
    "specificDays": [1, 2, 3, 4, 5],
    "reminderTime": "07:00",
    "estimatedDuration": 30,
    "isActive": true,
    "xpReward": 10,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### POST /api/routines
新規ルーチン作成

**リクエスト**:
```json
{
  "name": "夜の読書",
  "description": "就寝前の読書習慣",
  "category": "Learning",
  "goalType": "schedule_based",
  "recurrenceType": "daily",
  "reminderTime": "21:00",
  "estimatedDuration": 45,
  "xpReward": 15
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "routine-456",
    "userId": "user-123",
    "name": "夜の読書",
    "description": "就寝前の読書習慣",
    "category": "Learning",
    "goalType": "schedule_based",
    "recurrenceType": "daily",
    "reminderTime": "21:00",
    "estimatedDuration": 45,
    "isActive": true,
    "xpReward": 15,
    "createdAt": "2025-01-30T12:00:00.000Z",
    "updatedAt": "2025-01-30T12:00:00.000Z"
  }
}
```

### PATCH /api/routines/[id]
ルーチン更新

**リクエスト**:
```json
{
  "name": "朝の散歩（更新版）",
  "estimatedDuration": 40,
  "isActive": false
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "routine-123",
    "userId": "user-123",
    "name": "朝の散歩（更新版）",
    "description": "健康のための朝の散歩習慣",
    "category": "Health",
    "goalType": "schedule_based",
    "recurrenceType": "daily",
    "reminderTime": "07:00",
    "estimatedDuration": 40,
    "isActive": false,
    "xpReward": 10,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-30T12:00:00.000Z"
  }
}
```

### DELETE /api/routines/[id]
ルーチン削除

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "deletedId": "routine-123"
  }
}
```

---

## 実行記録 API

### GET /api/execution-records
実行記録一覧取得

**クエリパラメータ**:
- `routineId` (optional): 特定ルーチンの記録のみ取得
- `startDate` (optional): 開始日（YYYY-MM-DD）
- `endDate` (optional): 終了日（YYYY-MM-DD）
- `page` (optional): ページ番号
- `limit` (optional): 1ページあたりの件数

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "record-123",
      "userId": "user-123",
      "routineId": "routine-123",
      "executedAt": "2025-01-30T07:30:00.000Z",
      "durationMinutes": 25,
      "notes": "今日は少し疲れていたが完了",
      "metadata": {
        "weather": "sunny",
        "mood": "tired"
      },
      "createdAt": "2025-01-30T07:30:00.000Z",
      "updatedAt": "2025-01-30T07:30:00.000Z"
    }
  ],
  "metadata": {
    "totalCount": 150,
    "currentPage": 1,
    "totalPages": 8
  }
}
```

### POST /api/execution-records
実行記録作成

**リクエスト**:
```json
{
  "routineId": "routine-123",
  "executedAt": "2025-01-30T07:30:00.000Z",
  "durationMinutes": 25,
  "notes": "今日は少し疲れていたが完了",
  "metadata": {
    "weather": "sunny",
    "mood": "tired"
  }
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "record-456",
    "userId": "user-123",
    "routineId": "routine-123",
    "executedAt": "2025-01-30T07:30:00.000Z",
    "durationMinutes": 25,
    "notes": "今日は少し疲れていたが完了",
    "metadata": {
      "weather": "sunny",
      "mood": "tired"
    },
    "createdAt": "2025-01-30T07:30:00.000Z",
    "updatedAt": "2025-01-30T07:30:00.000Z"
  }
}
```

### DELETE /api/execution-records/[id]
実行記録削除

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "deletedId": "record-123"
  }
}
```

---

## ユーザープロフィール API

### GET /api/user-profiles
ユーザープロフィール取得

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "profile-123",
    "userId": "user-123",
    "level": 8,
    "currentXp": 450,
    "totalXp": 2150,
    "nextLevelXp": 800,
    "streak": 7,
    "longestStreak": 23,
    "lastActiveAt": "2025-01-30T07:30:00.000Z",
    "routinesCompleted": 89,
    "totalMinutesLogged": 2670,
    "badgesEarned": 5,
    "challengesCompleted": 2,
    "currentTitle": "Consistency Master",
    "availableTitles": ["Beginner", "Consistent", "Consistency Master"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-30T07:30:00.000Z"
  }
}
```

### PATCH /api/user-profiles
ユーザープロフィール更新

**リクエスト**:
```json
{
  "currentTitle": "Beginner"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "profile-123",
    "userId": "user-123",
    "level": 8,
    "currentXp": 450,
    "totalXp": 2150,
    "nextLevelXp": 800,
    "streak": 7,
    "longestStreak": 23,
    "lastActiveAt": "2025-01-30T07:30:00.000Z",
    "routinesCompleted": 89,
    "totalMinutesLogged": 2670,
    "badgesEarned": 5,
    "challengesCompleted": 2,
    "currentTitle": "Beginner",
    "availableTitles": ["Beginner", "Consistent", "Consistency Master"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-30T12:00:00.000Z"
  }
}
```

---

## ゲーミフィケーション API

### GET /api/xp-transactions
XP取得履歴取得

**クエリパラメータ**:
- `sourceType` (optional): XPソース種別でフィルタ
- `startDate` (optional): 開始日
- `endDate` (optional): 終了日
- `page` (optional): ページ番号
- `limit` (optional): 1ページあたりの件数

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "xp-123",
      "userId": "user-123",
      "amount": 15,
      "sourceType": "routine_completion",
      "sourceId": "routine-123",
      "description": "朝の散歩を完了",
      "metadata": {
        "routineName": "朝の散歩",
        "streak": 7
      },
      "createdAt": "2025-01-30T07:30:00.000Z"
    }
  ],
  "metadata": {
    "totalCount": 89,
    "currentPage": 1,
    "totalPages": 5
  }
}
```

### GET /api/badges
バッジ一覧取得

**クエリパラメータ**:
- `rarity` (optional): レアリティでフィルタ（common, rare, epic, legendary）
- `isUnlocked` (optional): 解除状態でフィルタ（true/false）

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "badge-123",
      "name": "First Step",
      "description": "初回ルーチン完了",
      "icon": "🥇",
      "rarity": "common",
      "category": "beginner",
      "xpReward": 50,
      "isActive": true,
      "userBadge": {
        "id": "user-badge-123",
        "unlockedAt": "2025-01-01T08:00:00.000Z"
      },
      "createdAt": "2024-12-01T00:00:00.000Z",
      "updatedAt": "2024-12-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/challenges
チャレンジ一覧取得

**クエリパラメータ**:
- `type` (optional): チャレンジタイプでフィルタ
- `isActive` (optional): アクティブ状態でフィルタ

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "challenge-123",
      "name": "New Year Resolution",
      "description": "1月中に20個のルーチンを完了",
      "type": "monthly",
      "difficulty": "medium",
      "startDate": "2025-01-01",
      "endDate": "2025-01-31",
      "targetValue": 20,
      "targetUnit": "routines",
      "xpReward": 500,
      "badgeReward": null,
      "isActive": true,
      "userChallenge": {
        "id": "user-challenge-123",
        "currentProgress": 15,
        "isCompleted": false,
        "joinedAt": "2025-01-01T00:00:00.000Z"
      },
      "createdAt": "2024-12-15T00:00:00.000Z",
      "updatedAt": "2024-12-15T00:00:00.000Z"
    }
  ]
}
```

### POST /api/challenges/[id]/join
チャレンジ参加

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "user-challenge-456",
    "userId": "user-123",
    "challengeId": "challenge-123",
    "currentProgress": 0,
    "isCompleted": false,
    "joinedAt": "2025-01-30T12:00:00.000Z"
  }
}
```

---

## ユーザー設定 API

### GET /api/user-settings
ユーザー設定取得

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "settings-123",
    "userId": "user-123",
    "theme": "auto",
    "language": "ja",
    "timeFormat": "24h",
    "emailNotifications": true,
    "pushNotifications": true,
    "reminderNotifications": true,
    "achievementNotifications": true,
    "profileVisibility": "public",
    "showStreak": true,
    "showLevel": true,
    "timezone": "Asia/Tokyo",
    "weeklyStartDay": 1,
    "dateFormat": "YYYY-MM-DD",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-30T12:00:00.000Z"
  }
}
```

### PATCH /api/user-settings
ユーザー設定更新

**リクエスト**:
```json
{
  "theme": "dark",
  "language": "en",
  "emailNotifications": false
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "settings-123",
    "userId": "user-123",
    "theme": "dark",
    "language": "en",
    "timeFormat": "24h",
    "emailNotifications": false,
    "pushNotifications": true,
    "reminderNotifications": true,
    "achievementNotifications": true,
    "profileVisibility": "public",
    "showStreak": true,
    "showLevel": true,
    "timezone": "Asia/Tokyo",
    "weeklyStartDay": 1,
    "dateFormat": "YYYY-MM-DD",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-30T12:00:00.000Z"
  }
}
```

---

## カテゴリ管理 API

### GET /api/categories
カテゴリ一覧取得

**レスポンス**:
```json
{
  "success": true,
  "data": [
    {
      "id": "category-123",
      "userId": null,
      "name": "Health",
      "description": "Health and fitness related routines",
      "color": "bg-green-100 dark:bg-green-900",
      "icon": "🏃",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2024-12-01T00:00:00.000Z",
      "updatedAt": "2024-12-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/categories
カスタムカテゴリ作成

**リクエスト**:
```json
{
  "name": "Custom Hobby",
  "description": "My custom hobby category",
  "color": "bg-indigo-100 dark:bg-indigo-900",
  "icon": "🎨"
}
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "id": "category-456",
    "userId": "user-123",
    "name": "Custom Hobby",
    "description": "My custom hobby category",
    "color": "bg-indigo-100 dark:bg-indigo-900",
    "icon": "🎨",
    "sortOrder": 0,
    "isActive": true,
    "createdAt": "2025-01-30T12:00:00.000Z",
    "updatedAt": "2025-01-30T12:00:00.000Z"
  }
}
```

---

## エラーレスポンス仕様

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": {
      "fields": {
        "email": ["有効なメールアドレスを入力してください"],
        "password": ["パスワードは8文字以上である必要があります"]
      }
    },
    "timestamp": "2025-01-30T12:00:00.000Z"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "認証が必要です",
    "timestamp": "2025-01-30T12:00:00.000Z"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "このリソースにアクセスする権限がありません",
    "timestamp": "2025-01-30T12:00:00.000Z"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたリソースが見つかりません",
    "timestamp": "2025-01-30T12:00:00.000Z"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "サーバー内部エラーが発生しました",
    "timestamp": "2025-01-30T12:00:00.000Z"
  }
}
```

---

## レート制限

### 制限仕様
- **一般API**: 1分あたり60リクエスト
- **認証API**: 1分あたり5リクエスト
- **作成・更新API**: 1分あたり30リクエスト

### レート制限超過時のレスポンス
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエスト制限を超過しました。しばらく時間をおいてから再試行してください",
    "timestamp": "2025-01-30T12:00:00.000Z"
  }
}
```

---

## Next.js 15 実装例

### API Route実装例（Promise型params対応）

```typescript
// app/api/routines/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const routine = await getRoutineById(id);
    
    return Response.json({
      success: true,
      data: routine,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        version: "1.0"
      }
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "ルーチンの取得に失敗しました",
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
```

### Page Component実装例（API Routes経由データ取得）

```typescript
// app/(authenticated)/routines/page.tsx
import { serverTypedGet } from '@/lib/api-client/server-fetch';
import { RoutinesGetResponseSchema } from '@/lib/schemas/api';

export default async function RoutinesPage() {
  try {
    const response = await serverTypedGet(
      '/api/routines',
      RoutinesGetResponseSchema
    );
    
    if (!response.success) {
      throw new Error(response.error?.message);
    }
    
    return <RoutinesPageComponent routines={response.data} />;
  } catch (error) {
    return <ErrorComponent message="ルーチンの読み込みに失敗しました" />;
  }
}
```

---

**API仕様設計完了日**: 2025-01-30  
**対象システム**: RoutineRecord (Next.js 15 + TypeScript)  
**API設計者**: Claude Code Assistant