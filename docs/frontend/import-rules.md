# Import ルール・グループ化

## Import文の標準化

### グループ化ルール

Import文は以下の5つのグループに分けて記述し、各グループ間は空行で区切ります：

```typescript
// Group 1: 外部ライブラリ
import React from 'react';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';

// Group 2: Common層 (低コンテキスト)
import { Button } from '@/common/components/ui/Button';
import { Card } from '@/common/components/ui/Card';
import { useTheme } from '@/common/hooks/useTheme';
import { apiClient } from '@/common/lib/api-client';

// Group 3: Model層 (中コンテキスト)  
import { UserAvatar } from '@/model/user/components/avatar/UserAvatar';
import { RoutineForm } from '@/model/routine/components/form/RoutineForm';
import { useCompleteRoutine } from '@/model/routine/hooks/useCompleteRoutine';

// Group 4: App層 (高コンテキスト・同一app内のみ)
import { DashboardStats } from '../_components/DashboardStats';
import { useDashboardData } from '../_hooks/useDashboardData';

// Group 5: 相対パス・アセット
import './Component.css';
import logo from '../assets/logo.png';
```

### ESLint設定による自動化

```javascript
// eslint.config.mjs
{
  'import/order': [
    'error',
    {
      groups: [
        'builtin',     // Node.js built-in modules
        'external',    // npm packages  
        'internal',    // absolute imports with @/
        'parent',      // relative imports ../
        'sibling',     // relative imports ./
        'index'        // ./index imports
      ],
      pathGroups: [
        // Common層
        {
          pattern: '@/common/**',
          group: 'internal',
          position: 'before'
        },
        // Model層
        {
          pattern: '@/model/**', 
          group: 'internal',
          position: 'after'
        },
        // App層
        {
          pattern: '@/app/**',
          group: 'internal', 
          position: 'after'
        }
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }
  ]
}
```

## 依存関係制約ルール

### 基本原則: 上位層から下位層への一方向依存のみ

```
App層 (高コンテキスト)
  ↓ 参照可能
Model層 (中コンテキスト)  
  ↓ 参照可能
Common層 (低コンテキスト)
```

### 禁止されている依存関係

#### 1. 下位層から上位層への依存 ❌
```typescript
// ❌ Common層からModel層への依存
// src/common/components/ui/Button.tsx
import { useCompleteRoutine } from '@/model/routine/hooks/useCompleteRoutine';

// ❌ Model層からApp層への依存  
// src/model/user/components/avatar/UserAvatar.tsx
import { DashboardStats } from '@/app/(authenticated)/dashboard/_components/DashboardStats';
```

#### 2. 同一層間での相互依存 ❌
```typescript
// ❌ App層間での相互依存
// src/app/(authenticated)/dashboard/DashboardPage.tsx
import { RoutineFilter } from '@/app/(authenticated)/routines/_components/RoutineFilter';

// ❌ Model層間での相互依存
// src/model/routine/components/form/RoutineForm.tsx
import { ChallengeProgress } from '@/model/challenge/components/ChallengeProgress';
```

### 許可されている依存関係

#### 1. 上位層から下位層への依存 ✅
```typescript
// ✅ App層からModel層・Common層への依存
// src/app/(authenticated)/dashboard/DashboardPage.tsx
import { Button } from '@/common/components/ui/Button';
import { UserAvatar } from '@/model/user/components/avatar/UserAvatar';

// ✅ Model層からCommon層への依存
// src/model/routine/components/form/RoutineForm.tsx
import { Card } from '@/common/components/ui/Card';
import { Input } from '@/common/components/ui/Input';
```

#### 2. 同一層内での依存 ✅
```typescript
// ✅ 同一App内での依存
// src/app/(authenticated)/dashboard/DashboardPage.tsx
import { DashboardStats } from './_components/DashboardStats';

// ✅ 同一Model内での依存
// src/model/routine/components/list/RoutineList.tsx  
import { RoutineItem } from '../item/TodayRoutineItem';
```

## TypeScript Path Mapping活用

### 推奨パターン
```typescript
// ✅ 絶対パス使用（推奨）
import { Button } from '@/common/components/ui/Button';
import { UserAvatar } from '@/model/user/components/avatar/UserAvatar';

// ✅ 相対パス使用（同一ディレクトリ・近い場所）
import { RoutineItem } from './RoutineItem';
import { FormValidation } from '../utils/validation';
```

### 避けるべきパターン
```typescript
// ❌ 長い相対パス
import { Button } from '../../../../common/components/ui/Button';

// ❌ 存在しないパス
import { SomeComponent } from '@/components/SomeComponent'; // 旧構造
```

## Import文チェックリスト

### 新規ファイル作成時
- [ ] Import文が5つのグループに適切に分けられている
- [ ] 各グループ間に空行が入っている
- [ ] アルファベット順に並んでいる
- [ ] 絶対パス（@/）を適切に使用している
- [ ] 依存関係ルールに違反していない

### 既存ファイル更新時
- [ ] 新しいimportが適切なグループに配置されている
- [ ] 不要なimportが削除されている
- [ ] importのグループ化が維持されている
- [ ] ESLintエラーが発生していない

## トラブルシューティング

### よくあるエラーと対処法

#### 循環参照エラー
```
Error: Dependency cycle detected
```
**対処法**: 共通部分をCommon層に抽出するか、依存関係を見直す

#### 依存関係ルール違反
```
ESLint: Architecture rule violation - Common layer cannot import from Model layer
```
**対処法**: import文を適切な層からの依存に変更する

#### パス解決エラー
```
Module not found: Can't resolve '@/model/...'
```
**対処法**: tsconfig.jsonのpathマッピング設定を確認し、ファイルの存在を確認

### デバッグコマンド
```bash
# 依存関係の確認
npm run lint:architecture

# TypeScript パス解決の確認  
npm run type-check

# 全体的な品質チェック
npm run quality
```

## パフォーマンスへの影響

### Tree Shaking最適化
```typescript
// ✅ 良い例 - 個別import
import { Button } from '@/common/components/ui/Button';

// ❌ 悪い例 - barrel importで全体を読み込み
import { Button } from '@/common/components/ui';
```

### Dynamic Import活用
```typescript
// 重いコンポーネントの遅延読み込み
const HeavyChart = dynamic(() => import('@/common/components/charts/HeavyChart'));

// Model層コンポーネントの条件付き読み込み
const GameNotification = dynamic(() => import('@/model/gamification/components/GameNotification'));
```

## コードレビュー時のチェックポイント

### Import文のレビュー観点
1. **グループ化**: 5つのグループに適切に分けられているか
2. **依存関係**: アーキテクチャルールに従っているか
3. **パフォーマンス**: 不要な全量importがないか
4. **一貫性**: プロジェクト全体で統一されているか

### 自動化されたチェック
- ESLint（import順序・依存関係ルール）
- TypeScript（型安全性・パス解決）
- Prettier（フォーマット統一）

これらのルールに従うことで、保守性が高く、パフォーマンスに優れたコードベースを維持できます。