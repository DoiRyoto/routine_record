# コンポーネント配置ガイド

## 新規コンポーネント作成時の判断フローチャート

```mermaid
flowchart TD
    A[新しいコンポーネントを作成] --> B{そのコンポーネントは<br/>どこで使用される？}
    
    B -->|1つのページのみ| C[App層に配置]
    B -->|複数のページ| D{どのドメインに関連？}
    B -->|全てのページ| E[Common層に配置]
    
    D -->|ユーザー関連| F[model/user/に配置]
    D -->|ルーティン関連| G[model/routine/に配置] 
    D -->|チャレンジ関連| H[model/challenge/に配置]
    D -->|ミッション関連| I[model/mission/に配置]
    D -->|バッジ関連| J[model/badge/に配置]
    D -->|ゲーミフィケーション| K[model/gamification/に配置]
    D -->|カテゴリ関連| L[model/category/に配置]
    D -->|複数ドメインに関連| M{汎用的か？}
    
    M -->|Yes| E
    M -->|No| N[最も関連の深い<br/>ドメインに配置]
    
    C --> O[app/[page]/_components/]
    E --> P[common/components/]
    F --> Q[model/user/components/]
    G --> R[model/routine/components/]
    H --> S[model/challenge/components/]
    I --> T[model/mission/components/]
    J --> U[model/badge/components/]
    K --> V[model/gamification/components/]
    L --> W[model/category/components/]
    N --> X[適切なmodel/[domain]/]
```

## 具体的な配置例

### App層 (`src/app/`) に配置するもの

#### Page固有コンポーネント
```typescript
// ダッシュボード専用の統計表示
src/app/(authenticated)/dashboard/_components/DashboardStats.tsx

// ルーティンページ専用のフィルター
src/app/(authenticated)/routines/_components/RoutineFilter.tsx

// プロフィールページ専用の編集フォーム
src/app/(authenticated)/profile/_components/ProfileEditForm.tsx
```

#### 判断基準
- ✅ 特定のページでのみ使用される
- ✅ そのページの業務ロジックに密結合
- ✅ 他のページでの再利用が想定されない

### Common層 (`src/common/`) に配置するもの

#### UI基盤コンポーネント
```typescript
// shadcn/ui系コンポーネント
src/common/components/ui/Button/Button.tsx
src/common/components/ui/Card/Card.tsx
src/common/components/ui/Dialog/Dialog.tsx

// レイアウト・ナビゲーション
src/common/components/layout/Header.tsx
src/common/components/layout/Footer.tsx

// 汎用フィルター・チャート
src/common/components/filters/DateRangePicker.tsx
src/common/components/charts/LineChart.tsx
```

#### 汎用ユーティリティ
```typescript
// API クライアント
src/common/lib/api-client/

// 汎用ヘルパー関数
src/common/lib/date.ts
src/common/lib/errors.ts
src/common/lib/validation.ts

// 汎用カスタムフック
src/common/hooks/useTheme.ts
src/common/hooks/useLocalStorage.ts
```

#### 判断基準
- ✅ プロジェクト全体で使用される
- ✅ ドメインに依存しない汎用的な機能
- ✅ 3つ以上の異なるドメインで使用される

### Model層 (`src/model/`) に配置するもの

#### ドメイン固有コンポーネント
```typescript
// ユーザードメイン
src/model/user/components/avatar/UserAvatar.tsx
src/model/user/components/profile/ProfileSettings.tsx

// ルーティンドメイン  
src/model/routine/components/form/RoutineForm.tsx
src/model/routine/components/list/RoutineList.tsx
src/model/routine/components/item/TodayRoutineItem.tsx

// ゲーミフィケーションドメイン
src/model/gamification/components/level/LevelProgressBar.tsx
src/model/gamification/components/xp/ExperiencePoints.tsx
```

#### ドメイン固有ロジック
```typescript
// ルーティン関連ロジック
src/model/routine/lib/recurrence.ts
src/model/routine/lib/catchup.ts

// ゲーミフィケーション関連
src/model/gamification/lib/levelCalculation.ts
src/model/gamification/lib/xpCalculation.ts
```

#### 判断基準
- ✅ 特定のドメインに関連する機能
- ✅ 複数のページで使用される
- ✅ そのドメインの専門知識が必要

## サブディレクトリ構成ルール

### コンポーネントのサブディレクトリ
```
model/[domain]/components/
├── [feature]/         # 機能別サブディレクトリ
│   ├── ComponentName.tsx
│   ├── ComponentName.stories.tsx
│   └── __tests__/
│       └── ComponentName.test.tsx
└── index.ts          # barrel export（オプション）
```

### 機能別サブディレクトリの例
```typescript
// ユーザードメイン
model/user/components/
├── avatar/            # アバター関連
├── profile/           # プロフィール関連
└── settings/          # 設定関連

// ルーティンドメイン
model/routine/components/
├── form/              # フォーム関連
├── list/              # 一覧表示関連
├── item/              # 個別アイテム関連
└── execution/         # 実行記録関連
```

## よくある配置の質問と回答

### Q: ModalやDialogなどの汎用UIコンポーネントはどこに配置する？
**A:** `src/common/components/ui/` に配置
- 理由: プロジェクト全体で使用される基盤UIコンポーネントのため

### Q: ユーザーの設定を編集するフォームコンポーネントはどこに配置する？
**A:** `src/model/user/components/settings/` に配置
- 理由: ユーザードメインに特化し、複数ページで使用される可能性があるため

### Q: ダッシュボード専用の要約表示コンポーネントはどこに配置する？
**A:** `src/app/(authenticated)/dashboard/_components/` に配置
- 理由: ダッシュボードページでのみ使用される特化コンポーネントのため

### Q: ルーティンとチャレンジの両方で使用されるタイマーコンポーネントはどこに配置する？
**A:** `src/common/components/` に配置（汎用性が高い場合）または `src/model/gamification/components/` に配置（ゲーミフィケーション要素の場合）
- 理由: 複数ドメインで使用される場合は用途に応じて判断

### Q: API Response の型定義はどこに配置する？
**A:** `src/lib/db/schema.ts` を使用
- 理由: データベーススキーマから推論される型を統一的に使用

## リファクタリング指針

### 配置を見直すべきタイミング
1. **使用箇所の変化**: 1つのページ専用だったコンポーネントが複数ページで使用されるようになった
2. **ドメインの変化**: 汎用的だったコンポーネントが特定のドメインに特化した
3. **依存関係の複雑化**: 循環参照や不適切な依存が発生した

### リファクタリング手順
1. **影響範囲の調査**: `find_referencing_symbols` で使用箇所を確認
2. **新しい配置先の決定**: 判断フローチャートに従って決定
3. **段階的な移行**: import文の更新 → ファイル移動 → テスト確認
4. **ESLint確認**: アーキテクチャルール違反がないことを確認

## ベストプラクティス

### ファイル命名
- **PascalCase**: コンポーネントファイル名
- **camelCase**: ユーティリティファイル名  
- **kebab-case**: data-testid属性名
- **snake_case**: データベースフィールド名

### Export パターン
```typescript
// 個別export推奨（tree shaking効果）
export { Button } from './Button';
export { Card } from './Card';

// barrel export は避ける（全体がbundleされるリスク）
// export * from './Button'; ← 避ける
```

### コンポーネント設計
- **Single Responsibility**: 1つのコンポーネントは1つの責任
- **Props Minimization**: 必要最小限のPropsを定義
- **Type Safety**: TypeScriptで型安全性を確保
- **Accessibility**: data-testid属性の追加を忘れずに