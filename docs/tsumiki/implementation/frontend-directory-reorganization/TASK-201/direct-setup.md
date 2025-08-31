# TASK-201: ゲーミフィケーションコンポーネント移行 - 直接実装

## 実装概要

`src/components/gamification/*` の11個のコンポーネントを適切なドメインモデル（gamification, user, badge, challenge, mission）およびcommon層に分散配置しました。フェーズ3（ドメイン固有コンポーネント移行）の開始タスクです。

## 実装内容

### 1. ゲーミフィケーションコンポーネント分析・分類

**既存構造**: `src/components/gamification/` (11コンポーネント)

#### ドメイン関心による分類結果:

**1. Gamification ドメイン（ゲーミフィケーション核心機能）**:
- `LevelProgressBar.tsx` - レベル進捗表示
- `ExperiencePoints.tsx` - XP表示  
- `XPNotification.tsx` - XP獲得通知
- `StreakDisplay.tsx` - 連続実行表示
- `Leaderboard.tsx` - リーダーボード
- `LevelUpModal.tsx` - レベルアップモーダル

**2. User ドメイン（ユーザー表現）**:
- `UserAvatar.tsx` - ユーザーアバター

**3. Badge ドメイン（バッジ・実績）**:
- `BadgeCollection.tsx` - バッジコレクション表示

**4. Challenge ドメイン（チャレンジ）**:
- `ChallengeItem.tsx` - チャレンジアイテム表示

**5. Mission ドメイン（ミッション・タスク）**:
- `TaskCard.tsx` - タスクカード表示

**6. Common 層（汎用統計）**:
- `StatsCard.tsx` - 統計情報カード（汎用性が高い）

### 2. ドメイン別コンポーネント移行実行

#### 2.1 Gamification Domain 移行

**移行コマンド**:
```bash
# サブディレクトリ作成
mkdir -p src/model/gamification/components/{level,xp,streak,leaderboard,modal}

# コンポーネント移行
cp src/components/gamification/LevelProgressBar.tsx src/model/gamification/components/level/
cp src/components/gamification/ExperiencePoints.tsx src/model/gamification/components/xp/
cp src/components/gamification/XPNotification.tsx src/model/gamification/components/xp/
cp src/components/gamification/StreakDisplay.tsx src/model/gamification/components/streak/
cp src/components/gamification/Leaderboard.tsx src/model/gamification/components/leaderboard/
cp src/components/gamification/LevelUpModal.tsx src/model/gamification/components/modal/
```

**移行結果**: 6コンポーネントがgamificationドメインに配置

#### 2.2 Other Domains 移行

**移行コマンド**:
```bash
# サブディレクトリ作成
mkdir -p src/model/badge/components/collection
mkdir -p src/model/challenge/components/item
mkdir -p src/model/user/components/avatar
mkdir -p src/model/mission/components

# ドメイン別コンポーネント移行
cp src/components/gamification/BadgeCollection.tsx src/model/badge/components/collection/
cp src/components/gamification/ChallengeItem.tsx src/model/challenge/components/item/
cp src/components/gamification/UserAvatar.tsx src/model/user/components/avatar/
cp src/components/gamification/TaskCard.tsx src/model/mission/components/
```

**移行結果**: 4コンポーネントが適切なドメインに配置

#### 2.3 Common Layer 移行

**移行コマンド**:
```bash
# 汎用性の高いコンポーネント
cp src/components/gamification/StatsCard.tsx src/common/components/charts/
```

**移行結果**: 1コンポーネントがcommon層に配置

### 3. Import パス更新実行

#### 3.1 Dashboard Page 更新
**ファイル**: `src/app/(authenticated)/dashboard/DashboardPage.tsx`

**更新内容**:
```typescript
// Before（index.ts経由の一括import）
import { ExperiencePoints, LevelProgressBar, StreakDisplay, UserAvatar } from '@/components/gamification';

// After（ドメイン別の個別import）
import { ExperiencePoints } from '@/model/gamification/components/xp/ExperiencePoints';
import { LevelProgressBar } from '@/model/gamification/components/level/LevelProgressBar';
import { StreakDisplay } from '@/model/gamification/components/streak/StreakDisplay';
import { UserAvatar } from '@/model/user/components/avatar/UserAvatar';
```

#### 3.2 Challenges Page 更新
**ファイル**: `src/app/(authenticated)/challenges/ChallengesPage.tsx`

**更新内容**:
```typescript
// Before
import { ChallengeItem } from '@/components/gamification';

// After  
import { ChallengeItem } from '@/model/challenge/components/item/ChallengeItem';
```

#### 3.3 Missions Page 更新
**ファイル**: `src/app/(authenticated)/missions/MissionsPage.tsx`

**更新内容**:
```typescript
// Before
import { TaskCard, StatsCard } from '@/components/gamification';

// After
import { TaskCard } from '@/model/mission/components/TaskCard';
import { StatsCard } from '@/common/components/charts/StatsCard';
```

#### 3.4 Profile Page 更新
**ファイル**: `src/app/(authenticated)/profile/ProfilePage.tsx`

**更新内容**:
```typescript
// Before（index.ts経由の一括import）
import {
  UserAvatar,
  LevelProgressBar, 
  BadgeCollection,
  StreakDisplay,
  StatsCard
} from '@/components/gamification';

// After（ドメイン別の個別import）
import { UserAvatar } from '@/model/user/components/avatar/UserAvatar';
import { LevelProgressBar } from '@/model/gamification/components/level/LevelProgressBar';
import { BadgeCollection } from '@/model/badge/components/collection/BadgeCollection';
import { StreakDisplay } from '@/model/gamification/components/streak/StreakDisplay';
import { StatsCard } from '@/common/components/charts/StatsCard';
```

#### 3.5 Dashboard Component 更新
**ファイル**: `src/app/(authenticated)/dashboard/_components/Dashboard.tsx`

**更新内容**:
```typescript
// Before
import { StatsCard } from '@/components/gamification';

// After
import { StatsCard } from '@/common/components/charts/StatsCard';
```

## Model層ドメイン構造確立

### ✅ Gamification Domain 完成

```
src/model/gamification/components/
├── level/
│   └── LevelProgressBar.tsx     # レベル進捗バー
├── xp/
│   ├── ExperiencePoints.tsx     # XP表示
│   └── XPNotification.tsx       # XP獲得通知
├── streak/
│   └── StreakDisplay.tsx        # 連続実行表示
├── leaderboard/
│   └── Leaderboard.tsx          # リーダーボード
└── modal/
    └── LevelUpModal.tsx         # レベルアップモーダル
```

### ✅ Other Domains 開始

```
src/model/user/components/avatar/
└── UserAvatar.tsx               # ユーザーアバター

src/model/badge/components/collection/
└── BadgeCollection.tsx          # バッジコレクション

src/model/challenge/components/item/
└── ChallengeItem.tsx           # チャレンジアイテム

src/model/mission/components/
└── TaskCard.tsx                # タスクカード
```

### ✅ Common Layer 統合

```
src/common/components/charts/
└── StatsCard.tsx               # 統計カード（汎用）
```

## data-testid 属性確認

### ✅ 要件準拠確認

**要求されていた属性**:
```typescript
'gamification-header'    # ✅ DashboardPage.tsx で設定済み
'profile-avatar'         # ✅ UserAvatar.tsx で設定済み
'user-level'            # ✅ UserAvatar.tsx で設定済み
'level-indicator'       # ✅ LevelProgressBar.tsx で設定済み
'xp-counter'            # ✅ ExperiencePoints.tsx で設定済み
'streak-counter'        # ✅ StreakDisplay.tsx で設定済み
```

**確認結果**: ✅ 全ての要求されたdata-testid属性が既に実装済み

## アーキテクチャ効果の実現

### ✅ 関心による凝集度向上

**ドメイン別の責任分離**:
- **Gamification**: XP、レベル、ストリーク等の核心ゲーミフィケーション機能
- **User**: ユーザー表現・アバター機能
- **Badge**: バッジ・実績機能
- **Challenge**: チャレンジ関連機能
- **Mission**: ミッション・タスク機能

### ✅ 依存関係の健全性

**Model層の依存関係**:
```typescript
// 全Modelコンポーネントの健全な依存パターン
✅ 外部ライブラリ: React, アイコンライブラリ等
✅ Common/UI: @/common/components/ui/* (Button, Card等)
✅ Common/Lib: @/common/lib/ui-utils (cn function等) 
❌ 他Model・App層依存: なし（適切な分離）
```

### ✅ Import文の可視性向上

**新しいimport構造の効果**:
```typescript
// src/app/(authenticated)/dashboard/DashboardPage.tsx
import { ExperiencePoints } from '@/model/gamification/components/xp/ExperiencePoints';
import { LevelProgressBar } from '@/model/gamification/components/level/LevelProgressBar';
import { StreakDisplay } from '@/model/gamification/components/streak/StreakDisplay';
import { UserAvatar } from '@/model/user/components/avatar/UserAvatar';

// 効果: import文を見るだけで以下が理解できる
// 1. どのドメインに関心があるか（gamification, user）
// 2. 各ドメインのどの機能を使用しているか（xp, level, streak, avatar）
// 3. コンテキスト依存度（Model層 = 中コンテキスト依存）
```

## 移行統計・成果

### 移行コンポーネント統計
- **Gamification Domain**: 6コンポーネント
- **User Domain**: 1コンポーネント  
- **Badge Domain**: 1コンポーネント
- **Challenge Domain**: 1コンポーネント
- **Mission Domain**: 1コンポーネント
- **Common Layer**: 1コンポーネント
- **Total**: 11コンポーネント移行完了

### Model層の初期確立
```
src/model/ (ドメインコンポーネント開始)
├── user/          # ✅ 1コンポーネント配置開始
├── routine/       # 🔄 TASK-202で追加予定
├── challenge/     # ✅ 1コンポーネント配置開始
├── mission/       # ✅ 1コンポーネント配置開始
├── badge/         # ✅ 1コンポーネント配置開始
├── gamification/  # ✅ 6コンポーネント配置開始（最充実）
└── category/      # 🔄 今後のタスクで追加予定
```

### アーキテクチャ品質向上

**新規メンバー理解容易性**:
- ✅ ドメイン別ディレクトリでの直感的な配置
- ✅ import文での依存関係可視化
- ✅ 機能別サブディレクトリでの整理

**保守性向上**:
- ✅ 関連機能の一元化（例: XP関連は全てxp/配下）
- ✅ 影響範囲の局所化（例: バッジ機能修正時はbadge/配下のみ）
- ✅ 技術負債の抑制（明確なアーキテクチャルール）

## 次のステップ

### TASK-202 準備完了
**ルーティン関連コンポーネント移行** への基盤:
- ✅ Model層でのドメイン別配置プロセス確立
- ✅ App層からModel層への適切な依存関係確立
- ✅ 複雑なドメイン分散配置の成功実績

### フェーズ3 本格開始
- ✅ **Gamification**: Model層最大規模ドメインとして確立
- ✅ **Multi-Domain**: 5つのドメインでのコンポーネント配置開始
- ✅ **関心による凝集**: DDD思想の実装による保守性向上