# API エンドポイント仕様

## 概要

フロントエンドディレクトリ再編成では、既存のAPIエンドポイントの動作に影響を与えない。ただし、移行プロセスの管理と品質保証のための新しいAPIエンドポイントを追加定義する。

## 既存APIエンドポイント（維持）

### 認証関連
- `POST /api/auth/login` - ユーザーログイン
- `POST /api/auth/logout` - ユーザーログアウト  
- `GET /api/auth/user` - 現在のユーザー情報取得

### ユーザー管理
- `GET /api/user-profiles` - ユーザープロフィール取得
- `PUT /api/user-profiles` - ユーザープロフィール更新
- `GET /api/user-settings` - ユーザー設定取得
- `PUT /api/user-settings` - ユーザー設定更新

### ルーティン管理
- `GET /api/routines` - ルーティン一覧取得
- `POST /api/routines` - ルーティン作成
- `GET /api/routines/:id` - ルーティン詳細取得
- `PUT /api/routines/:id` - ルーティン更新
- `DELETE /api/routines/:id` - ルーティン削除

### 実行記録
- `GET /api/execution-records` - 実行記録一覧取得
- `POST /api/execution-records` - 実行記録作成
- `PUT /api/execution-records/:id` - 実行記録更新
- `DELETE /api/execution-records/:id` - 実行記録削除

### チャレンジ・ミッション
- `GET /api/challenges` - チャレンジ一覧取得
- `POST /api/user-challenges` - チャレンジ参加
- `GET /api/missions` - ミッション一覧取得
- `GET /api/user-missions` - ユーザーミッション取得

### ゲーミフィケーション
- `GET /api/badges` - バッジ一覧取得
- `GET /api/user-badges` - ユーザーバッジ取得
- `GET /api/xp-transactions` - XP履歴取得
- `GET /api/statistics` - 統計情報取得

## 新規APIエンドポイント（移行管理用）

### 移行進捗管理

#### GET /api/migration/progress
移行全体の進捗状況を取得

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "overallProgress": 75.5,
    "phases": [
      {
        "phase": "structure-creation",
        "totalTasks": 3,
        "completedTasks": 3,
        "completionRate": 100.0,
        "status": "completed"
      },
      {
        "phase": "ui-component-migration", 
        "totalTasks": 8,
        "completedTasks": 6,
        "completionRate": 75.0,
        "status": "in_progress"
      }
    ],
    "currentPhase": "ui-component-migration",
    "estimatedCompletion": "2024-01-15T10:00:00Z"
  }
}
```

#### GET /api/migration/tasks
移行タスク一覧を取得

**クエリパラメータ:**
- `phase?: string` - フェーズフィルター
- `status?: string` - ステータスフィルター
- `limit?: number` - 取得件数制限
- `offset?: number` - オフセット

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "MIGRATION-001",
        "phase": "structure-creation",
        "title": "基本ディレクトリ構造作成",
        "status": "completed",
        "startedAt": "2024-01-10T09:00:00Z",
        "completedAt": "2024-01-10T09:15:00Z",
        "estimatedFiles": 0
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

#### POST /api/migration/tasks/:taskId/start
移行タスクを開始

**リクエストボディ:**
```json
{
  "phase": "ui-component-migration",
  "title": "UIコンポーネント移行",
  "estimatedFiles": 15
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "taskId": "MIGRATION-102",
    "status": "in_progress",
    "startedAt": "2024-01-10T10:30:00Z"
  }
}
```

#### PUT /api/migration/tasks/:taskId/complete
移行タスクを完了

**リクエストボディ:**
```json
{
  "success": true,
  "errorMessage": null,
  "filesProcessed": 15,
  "gitCommitHash": "abc123def"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "taskId": "MIGRATION-102",
    "status": "completed",
    "completedAt": "2024-01-10T11:45:00Z",
    "duration": "1h 15m"
  }
}
```

### ファイル移行管理

#### GET /api/migration/files
移行されたファイル一覧を取得

**クエリパラメータ:**
- `phase?: string` - 移行フェーズ
- `contextLevel?: string` - コンテキストレベル
- `domainModel?: string` - ドメインモデル
- `search?: string` - ファイルパス検索

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "uuid-here",
        "originalPath": "src/components/gamification/LevelProgressBar.tsx",
        "newPath": "src/model/gamification/components/level/LevelProgressBar.tsx",
        "contextLevel": "medium",
        "domainModel": "gamification",
        "fileType": "component",
        "migrationPhase": "domain-component-migration",
        "gitCommitHash": "def456abc",
        "migratedAt": "2024-01-10T14:20:00Z"
      }
    ],
    "summary": {
      "totalFiles": 142,
      "byContextLevel": {
        "low": 58,
        "medium": 67,
        "high": 17
      },
      "byDomainModel": {
        "user": 23,
        "routine": 34,
        "gamification": 28,
        "challenge": 15
      }
    }
  }
}
```

#### POST /api/migration/files
ファイル移行を記録

**リクエストボディ:**
```json
{
  "originalPath": "src/components/ui/Button.tsx",
  "newPath": "src/common/components/ui/Button.tsx",
  "contextLevel": "low",
  "domainModel": null,
  "fileType": "component",
  "migrationPhase": "ui-component-migration",
  "gitCommitHash": "ghi789jkl"
}
```

### 依存関係検証

#### GET /api/migration/dependencies/violations
依存関係違反を取得

**クエリパラメータ:**
- `type?: string` - 違反タイプ
- `severity?: string` - 重要度
- `resolved?: boolean` - 解決済みフラグ
- `filePath?: string` - ファイルパス検索

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "violations": [
      {
        "id": "uuid-here",
        "type": "prohibited-import",
        "filePath": "src/common/components/UserProfile.tsx",
        "violatingImport": "@/model/user/types",
        "ruleViolated": "common → model dependency prohibited",
        "severity": "error",
        "resolved": false,
        "detectedAt": "2024-01-10T15:30:00Z"
      }
    ],
    "summary": {
      "total": 12,
      "byType": {
        "prohibited-import": 8,
        "circular-dependency": 3,
        "cross-layer-violation": 1
      },
      "bySeverity": {
        "error": 9,
        "warning": 3
      },
      "resolved": 4,
      "unresolved": 8
    }
  }
}
```

#### PUT /api/migration/dependencies/violations/:violationId/resolve
依存関係違反を解決済みとマーク

**リクエストボディ:**
```json
{
  "resolution": "Moved component to appropriate layer",
  "gitCommitHash": "mno012pqr"
}
```

#### POST /api/migration/dependencies/check
依存関係チェックを実行

**リクエストボディ:**
```json
{
  "checkType": "full", // "full" | "incremental" | "file-specific"
  "targetFiles": ["src/model/user/components/UserAvatar.tsx"], // file-specific用
  "rules": ["prohibited-import", "circular-dependency"]
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "checkId": "check-uuid",
    "startedAt": "2024-01-10T16:00:00Z",
    "status": "in_progress", // "in_progress" | "completed" | "failed"
    "filesChecked": 0,
    "totalFiles": 245,
    "violationsFound": 0
  }
}
```

### 品質メトリクス

#### GET /api/migration/metrics/quality
移行品質メトリクスを取得

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-10T16:30:00Z",
    "typeScriptErrors": 0,
    "eslintErrors": 0,
    "eslintWarnings": 2,
    "e2eTestResults": {
      "total": 24,
      "passed": 22,
      "failed": 0,
      "skipped": 2
    },
    "buildMetrics": {
      "buildTime": 45000,
      "bundleSize": {
        "total": 2548000,
        "javascript": 1950000,
        "css": 598000
      }
    },
    "dependencyHealth": {
      "totalViolations": 8,
      "resolvedViolations": 4,
      "criticalViolations": 1
    }
  }
}
```

#### POST /api/migration/metrics/collect
メトリクス収集を実行

**リクエストボディ:**
```json
{
  "metrics": ["typescript", "eslint", "e2e", "build", "dependencies"],
  "includeHistory": true
}
```

## エラーハンドリング

### 標準エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "MIGRATION_TASK_NOT_FOUND",
    "message": "指定されたMigration taskが見つかりません",
    "details": {
      "taskId": "MIGRATION-999",
      "availableTasks": ["MIGRATION-001", "MIGRATION-002"]
    }
  },
  "timestamp": "2024-01-10T16:45:00Z"
}
```

### エラーコード一覧

- `MIGRATION_IN_PROGRESS` - 既に移行が実行中
- `MIGRATION_TASK_NOT_FOUND` - タスクが見つからない
- `DEPENDENCY_CHECK_FAILED` - 依存関係チェック失敗
- `INVALID_MIGRATION_PHASE` - 無効な移行フェーズ
- `FILE_MIGRATION_CONFLICT` - ファイル移行の競合
- `VALIDATION_FAILED` - バリデーション失敗

## 認証・認可

### 移行管理API
- **認証**: 必須（管理者権限）
- **スコープ**: `admin:migration`
- **レート制限**: 100 requests/hour

### 読み取り専用API
- **認証**: 必須（開発者権限以上）
- **スコープ**: `read:migration`
- **レート制限**: 500 requests/hour

## WebSocket 接続（リアルタイム更新）

### /api/migration/ws
移行進捗のリアルタイム更新

**接続時認証:**
```json
{
  "type": "auth",
  "token": "bearer-token-here"
}
```

**進捗更新イベント:**
```json
{
  "type": "progress_update",
  "data": {
    "taskId": "MIGRATION-102",
    "status": "in_progress",
    "progress": 65,
    "filesProcessed": 10,
    "totalFiles": 15,
    "currentFile": "src/components/UserProfile.tsx"
  }
}
```

**エラーイベント:**
```json
{
  "type": "error",
  "data": {
    "taskId": "MIGRATION-102",
    "error": "TypeScript compilation failed",
    "details": {
      "file": "src/model/user/types.ts",
      "line": 15,
      "message": "Property 'id' does not exist"
    }
  }
}
```

## 開発・デバッグ用エンドポイント

### GET /api/migration/debug/structure
現在のディレクトリ構造を取得（開発環境のみ）

### POST /api/migration/debug/reset
移行状態をリセット（開発環境のみ）

### GET /api/migration/debug/logs
移行ログを取得（開発環境のみ）