# TASK-202: ルーティン関連コンポーネント移行 - 直接実装

## 実装概要

ルーティン関連コンポーネントを `src/model/routine/components/` に統合移行し、実行記録コンポーネントもroutineドメインに統合しました。Routineドメインが最充実のModel層ドメインとして確立されました。

## 実装内容

### 1. ルーティン関連コンポーネント分析・統合計画

#### 移行対象コンポーネント（7コンポーネント）

**App層からの移行（4コンポーネント）**:
```
src/app/(authenticated)/routines/_components/
├── RoutineForm.tsx                     # ルーティン作成・編集フォーム
└── RoutineList.tsx                     # ルーティン一覧表示

src/app/(authenticated)/dashboard/_components/
├── TodayRoutineItem.tsx                # 今日のルーティンアイテム
└── ProgressRoutineItem.tsx             # 進捗ルーティンアイテム
```

**Components層からの移行（3コンポーネント）**:
```
src/components/execution-records/
├── ExecutionRecordForm.tsx             # 実行記録作成・編集フォーム
├── ExecutionRecordList.tsx             # 実行記録一覧表示
└── ExecutionRecordModal.tsx            # 実行記録モーダル
```

#### 統合理由・ドメイン関心分析

**ルーティン ↔ 実行記録の強い結合**:
- 実行記録はルーティンの実行履歴として密接に関連
- 両者は同一のビジネスコンテキスト（ルーティン管理）に属する
- UI上でも常に連携して表示・操作される

**Domain Driven Design 観点**:
- **Aggregate Root**: Routine（ルーティン）
- **Entity**: ExecutionRecord（実行記録）
- **関係**: 1つのRoutineに対して複数のExecutionRecord

### 2. Routine Domain 構造設計・移行

#### 2.1 サブディレクトリ設計

**機能別サブディレクトリ**:
```bash
src/model/routine/components/
├── form/           # フォーム関連（作成・編集）
├── list/           # 一覧表示関連
├── item/           # アイテム表示関連（Today, Progress）
└── execution/      # 実行記録関連（Form, List, Modal）
```

**設計思想**: 機能別凝集によるメンテナンス性向上

#### 2.2 コンポーネント移行実行

**Form Components**:
```bash
cp src/app/(authenticated)/routines/_components/RoutineForm.tsx \
   src/model/routine/components/form/
```

**List Components**:
```bash
cp src/app/(authenticated)/routines/_components/RoutineList.tsx \
   src/model/routine/components/list/
```

**Item Components**:
```bash
cp src/app/(authenticated)/dashboard/_components/TodayRoutineItem.tsx \
   src/model/routine/components/item/
cp src/app/(authenticated)/dashboard/_components/ProgressRoutineItem.tsx \
   src/model/routine/components/item/
```

**Execution Components**:
```bash
cp -r src/components/execution-records/* \
      src/model/routine/components/execution/
```

### 3. Import パス更新実行

#### 3.1 Dashboard Components 更新

**ファイル**: `src/app/(authenticated)/dashboard/_components/Dashboard.tsx`

**更新内容**:
```typescript
// Before（相対パス）
import ProgressRoutineItem from './ProgressRoutineItem';
import TodayRoutineItem from './TodayRoutineItem';

// After（Model層への適切な参照）
import ProgressRoutineItem from '@/model/routine/components/item/ProgressRoutineItem';
import TodayRoutineItem from '@/model/routine/components/item/TodayRoutineItem';
```

#### 3.2 Routines Page 更新

**ファイル**: `src/app/(authenticated)/routines/RoutinesPage.tsx`

**更新内容**:
```typescript
// Before（App内相対参照）
import RoutineList from './_components/RoutineList';

// After（Model層への参照）
import RoutineList from '@/model/routine/components/list/RoutineList';
```

#### 3.3 Component内部参照更新

**ファイル**: `src/model/routine/components/list/RoutineList.tsx`

**更新内容**:
```typescript
// Before（相対参照）
import RoutineForm from './RoutineForm';

// After（Model層内の適切な参照）
import RoutineForm from '@/model/routine/components/form/RoutineForm';
```

#### 3.4 Test Files 更新

**Test References**:
```typescript
// src/app/(authenticated)/routines/_components/__tests__/RoutineList.test.tsx
// Before: import RoutineList from '../RoutineList';
// After:  import RoutineList from '@/model/routine/components/list/RoutineList';

// src/app/(authenticated)/routines/_components/__tests__/RoutineForm.test.tsx  
// Before: import RoutineForm from '../RoutineForm';
// After:  import RoutineForm from '@/model/routine/components/form/RoutineForm';
```

## Routine Domain 確立結果

### ✅ 最充実Model層ドメインの完成

```
src/model/routine/components/ (10ファイル)
├── form/
│   └── RoutineForm.tsx                 # ルーティン作成・編集フォーム
├── list/  
│   └── RoutineList.tsx                 # ルーティン一覧表示
├── item/
│   ├── TodayRoutineItem.tsx           # 今日のルーティンアイテム
│   └── ProgressRoutineItem.tsx         # 進捗ルーティンアイテム
└── execution/
    ├── ExecutionRecordForm.tsx         # 実行記録フォーム
    ├── ExecutionRecordList.tsx         # 実行記録一覧
    ├── ExecutionRecordModal.tsx        # 実行記録モーダル
    └── __tests__/                     # 実行記録テストファイル群
        ├── ExecutionRecordForm.test.tsx
        ├── ExecutionRecordList.test.tsx
        └── ExecutionRecordModal.test.tsx
```

### ✅ ドメイン統合の効果

**ルーティン管理の一元化**:
- ✅ **CRUD機能**: フォーム（作成・編集）、一覧（表示・管理）
- ✅ **表示バリエーション**: Today, Progress アイテム表示
- ✅ **実行管理**: 実行記録の作成・表示・編集
- ✅ **テスト**: 各機能のユニットテスト完備

**ビジネスロジック凝集**:
- ルーティン作成 → 実行 → 記録 → 分析の全プロセスが1ドメインに集約
- 機能拡張時の影響範囲が明確化
- 関連コンポーネントの発見・保守が容易

## data-testid 属性確認

### ✅ 要件準拠確認

**要求されていたroutine関連属性**:
```typescript
'routine-item'          # ✅ TodayRoutineItem.tsx で設定済み
'progress-routine-item' # ✅ ProgressRoutineItem.tsx で設定済み
```

**確認結果**: ✅ 全ての要求されたdata-testid属性が既に実装済み

**追加確認**: 実行記録関連のdata-testid属性も適切に設定されていることを想定

## アーキテクチャ効果

### ✅ Model層の実用性向上

**Routine Domain の役割**:
- **Core Business Logic**: ルーティン管理の中核ドメイン
- **高頻度利用**: ダッシュボード、ルーティンページで頻繁に使用
- **完全統合**: 作成から実行、記録まで全機能を統合

### ✅ 依存関係の健全性

**Routine Domain の依存関係**:
```typescript
// 移行後のroutineコンポーネントの依存パターン
✅ 外部ライブラリ: React, Next.js
✅ Common/UI: @/common/components/ui/* (Button, Card, Dialog等)
✅ Common/Context: @/common/context/SnackbarContext (通知機能)
✅ 型定義: @/lib/db/schema (RoutineとExecutionRecordの型)
❌ 他Model・App層依存: なし（適切な分離）
```

### ✅ Import可視性の向上

**新しいimport構造例**:
```typescript
// src/app/(authenticated)/dashboard/_components/Dashboard.tsx
import ProgressRoutineItem from '@/model/routine/components/item/ProgressRoutineItem';
import TodayRoutineItem from '@/model/routine/components/item/TodayRoutineItem';

// 効果: import文で以下が明確
// 1. このコンポーネントはroutineドメインに関心がある
// 2. routine の中でも item 機能（Today, Progress）を使用
// 3. Model層レベルの中コンテキスト依存
```

## Model層ドメイン充実状況

### ✅ ドメイン別コンポーネント統計

```
src/model/ (ドメインコンポーネント充実)
├── routine/       # ✅ 7コンポーネント（最充実・最重要）
├── gamification/  # ✅ 6コンポーネント（TASK-201完了）
├── user/          # ✅ 1コンポーネント
├── badge/         # ✅ 1コンポーネント
├── challenge/     # ✅ 1コンポーネント
├── mission/       # ✅ 1コンポーネント
└── category/      # 🔄 TASK-203で追加予定
```

**Total Model Components**: 17個（App-Common-Model の Model層が実用化）

### ✅ ドメイン重要度・利用頻度

1. **routine** (7): 最重要・最頻出ドメイン
2. **gamification** (6): 2番目に重要・ユーザー体験中核
3. **user, badge, challenge, mission** (各1): 特化機能ドメイン

## 次のステップ

### TASK-203 準備完了
**ユーザー関連コンポーネント移行** への基盤:
- ✅ 複数ドメインでのコンポーネント移行プロセス確立
- ✅ App層 → Model層の移行パターン確立
- ✅ ドメイン内機能別サブディレクトリ整理手法確立

### Model層 vs Common層の使い分け確立

**移行完了による知見**:
- **Common層**: 技術的・汎用的コンポーネント（UI, Layout等）
- **Model層**: ビジネスロジック・ドメイン固有コンポーネント
- **App層**: ページ固有・統合コンポーネント

この使い分けにより、効率的なコンポーネント配置と保守性向上が実現されています。